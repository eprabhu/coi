package com.polus.integration.entity.dunsRefresh.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.entity.dunsRefresh.constants.DunsRefreshConstants;
import com.polus.integration.entity.dunsRefresh.pojos.EntityDunsRefreshDetails;
import lombok.extern.log4j.Log4j;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

@Slf4j
@Component
public class MonitoringFileProcessUtils {

    @Value("${duns.monitoring.file.location}")
    private String monitoringFileLocation;

    @Value("${duns.monitoring.file.location.archive}")
    private String monitoringFileArchiveLocation;

    private String archiveDirPath;

    private static final ObjectMapper objectMapper = new ObjectMapper();


    private static final Pattern ALL_FILE_PATTERN = Pattern.compile(
            ".*(?:EXCEPTIONS|NOTIFICATION|NOTIFICATION_HEADER|SEED_HEADER)\\S*\\.(json|txt|zip)$", Pattern.CASE_INSENSITIVE
    );

    private static final Pattern FILE_PATTERN_ZIP = Pattern.compile(
            ".*(?:EXCEPTIONS|NOTIFICATION|NOTIFICATION_HEADER|SEED_HEADER)\\S*\\.(zip|ZIP)$", Pattern.CASE_INSENSITIVE
    );

    private static final Pattern FILE_PATTERN_NOTIFICATION = Pattern.compile(
            ".*(?:NOTIFICATION)\\S*\\.(txt|TXT)$", Pattern.CASE_INSENSITIVE
    );


    public void findAndUnZipFiles() throws IOException {
        try (Stream<Path> paths = Files.walk(Paths.get(monitoringFileLocation))) {
            List<File> zipFiles = paths.filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .filter(file -> FILE_PATTERN_ZIP.matcher(file.getName()).matches())
                    .collect(Collectors.toList());
            if (zipFiles != null && !zipFiles.isEmpty()) {
                zipFiles.forEach(zipFile -> {
                    try {
                        unzip(zipFile.getAbsolutePath(), monitoringFileLocation);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
        }
    }

    public List<File> fetchAllNotificationFiles() throws IOException {
        try (Stream<Path> paths = Files.walk(Paths.get(monitoringFileLocation))) {
            return paths.filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .filter(file -> FILE_PATTERN_NOTIFICATION.matcher(file.getName()).matches())
                    .collect(Collectors.toList());
        }
    }

    private void unzip(String  zipFilePath, String destDir) throws IOException {
        boolean isFileExtracted = false;
        try (ZipFile zipFile = new ZipFile(zipFilePath)) {
            log.info("Preparing for file unzip | file name {}", zipFile.getName());
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                File file = new File(destDir, entry.getName());
                if (entry.isDirectory()) {
                    file.mkdirs();
                } else {
                    extractFile(zipFile, entry, file);
                    if (!isFileExtracted) {
                        isFileExtracted = true;
                    }
                }
            }
        } catch (IOException e) {
            log.error("Exception while unzipping", e);
            throw new RuntimeException(e);
        } finally {
            if (isFileExtracted)
                moveToArchiveFolder(monitoringFileArchiveLocation, new File(zipFilePath));
        }
    }

    private void moveToArchiveFolder(String monitoringFileArchiveLocation, File file) throws IOException {
        String dateFolder = new SimpleDateFormat("MMddyyyy").format(new Date());
        String archiveDirPath = monitoringFileArchiveLocation + File.separator + dateFolder;
        File archiveDir = new File(archiveDirPath);
        if (!archiveDir.exists()) {
            archiveDir.mkdirs();
        }
        // Archive location with subfolder support
        File archivedFile = new File(archiveDir, file.getName());
        archivedFile.getParentFile().mkdirs(); // ensure path exists

        // Move file to archive folder
        Files.move(file.toPath(), archivedFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        log.info("Moved to archive: {}", archivedFile.getAbsolutePath());
    }

    private static void extractFile(ZipFile zipFile, ZipEntry entry, File file) throws IOException {

        long fileSize = entry.getSize(); // Get file size (may return -1 if unknown)

        // Determine available memory (use 1/4th of free memory)
        long availableMemory = Runtime.getRuntime().freeMemory() / 4;
        log.info("Available Memory {}", availableMemory);

        // Dynamic buffer allocation: Minimum 4KB, Maximum 64MB
        int bufferSize = (int) Math.min(Math.max(4096, fileSize > 0 ? fileSize / 100 : 8192), 64 * 1024 * 1024);

        // Ensure buffer does not exceed available memory
        bufferSize = (int) Math.min(bufferSize, availableMemory);

       log.info("Extracting {} with buffer size: {} bytes", file.getName(), bufferSize);

        try (InputStream is = zipFile.getInputStream(entry);
             FileOutputStream fos = new FileOutputStream(file);
             BufferedOutputStream bos = new BufferedOutputStream(fos)) {

            byte[] buffer = new byte[bufferSize];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                bos.write(buffer, 0, bytesRead);
            }
        }
        log.info("File {} successfully extracted", file.getName());
    }

    public List<String> readJsonLines(File file) {
        List<String> jsonList = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (!line.trim().isEmpty()) { // Ignore empty lines
                    try {
                        // Parse JSON into a Map
                        jsonList.add(line);
                    } catch (Exception e) {
                        System.err.println("Invalid JSON: " + line);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
        }

        return jsonList;
    }

    public void setRefreshType(EntityDunsRefreshDetails refreshDetail, String refreshType) {
        switch (refreshType) {
            case "UPDATE":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_UPDATE);
                break;
            case "DELETE":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_DELETE);
                break;
            case "ENTER":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_ENTER);
                break;
            case "EXIT":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_EXIT);
                break;
            case "REVIEWED":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_REVIEWED);
                break;
            case "SEED":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_SEED);
                break;
            case "TRANSFER":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_TRANSFER);
                break;
            case "UNDELETE":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_UNDELETE);
                break;
            case "UNDER_REVIEW":
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_UNDER_REVIEW);
                break;
            default:
                refreshDetail.setRefreshTypeCode(DunsRefreshConstants.REFRESH_TYPE_CODE_UNIDENTIFIED);
        }
    }

    public boolean isAllFieldsNull(Object obj) {
        if (obj == null) return true;

        for (Field field : obj.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                if (field.get(obj) != null) {
                    return false;
                }
            } catch (IllegalAccessException e) {
                log.warn("Exception on isAllFieldsNull : {}", e.getMessage());
            }
        }
        return true;
    }
}
