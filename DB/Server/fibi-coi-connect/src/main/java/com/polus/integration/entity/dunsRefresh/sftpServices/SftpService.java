package com.polus.integration.entity.dunsRefresh.sftpServices;

import com.jcraft.jsch.*;
import com.polus.integration.entity.dunsRefresh.dao.DunsRefreshDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Properties;
import java.util.Vector;

@Slf4j
@Service
public class SftpService {

    @Autowired
    private DunsRefreshDao dunsRefreshDao;

    /**
     *
     * @param localFilePath
     * @param remoteHost
     * @param port
     * @param username
     * @param password
     * @param remoteDir
     */
    public void transferFile(String localFilePath, String remoteHost, int port, String username, String password, String remoteDir) {
        Session session = null;
        ChannelSftp sftpChannel = null;

        try {
            JSch jsch = new JSch();
            session = jsch.getSession(username, remoteHost, port);
            session.setPassword(password);

            // Setup host key checking
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            session.connect();

            Channel channel = session.openChannel("sftp");
            channel.connect();

            sftpChannel = (ChannelSftp) channel;

            // Create remote directory if not exists
            try {
                sftpChannel.cd(remoteDir);
            } catch (SftpException e) {
                sftpChannel.mkdir(remoteDir);
                sftpChannel.cd(remoteDir);
            }

            // Transfer file
            File localFile = new File(localFilePath);
            try (FileInputStream fis = new FileInputStream(localFile)) {
                sftpChannel.put(fis, localFile.getName());
                log.info("File uploaded successfully to {}/{}", remoteHost, remoteDir);
            }

        } catch (JSchException | SftpException | java.io.IOException e) {
            log.error("File transfer failed", e);
            throw new RuntimeException("File transfer failed", e);
        } finally {
            if (sftpChannel != null && sftpChannel.isConnected()) {
                sftpChannel.exit();
            }
            if (session != null && session.isConnected()) {
                session.disconnect();
            }
        }
    }


    public void downloadFile(String remoteHost, int port, String username, String password,
                             String remoteFilePath, String localDownloadPath) {

        Session session = null;
        ChannelSftp sftpChannel = null;

        try {
            JSch jsch = new JSch();
            session = jsch.getSession(username, remoteHost, port);
            session.setPassword(password);

            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);
            session.connect();

            Channel channel = session.openChannel("sftp");
            channel.connect();
            sftpChannel = (ChannelSftp) channel;

            File targetDir = new File(localDownloadPath);
            if (!targetDir.exists()) {
                targetDir.mkdirs(); // create the directory
            }

            // List files in the remote directory
            Vector<ChannelSftp.LsEntry> files = sftpChannel.ls(remoteFilePath); // remoteDirectoryPath like "/remote/duns"

            for (ChannelSftp.LsEntry entry : files) {
                if (!entry.getAttrs().isDir()) {
                    String fileName = entry.getFilename();
                    if (!dunsRefreshDao.isFileAlreadyExists(fileName)) {
                        String remoteFileFullPath = remoteFilePath + "/" + fileName;
                        File localFile = new File(targetDir, fileName);

                        try (OutputStream outputStream = new FileOutputStream(localFile)) {
                            sftpChannel.get(remoteFileFullPath, outputStream);
                            log.info("Downloaded {} to {}", remoteFileFullPath, localFile.getAbsolutePath());
                        }
                    }
                }
            }


        } catch (JSchException | SftpException | java.io.IOException e) {
            log.error("Failed to download file", e);
            throw new RuntimeException("Failed to download file", e);
        } finally {
            if (sftpChannel != null && sftpChannel.isConnected()) {
                sftpChannel.exit();
            }
            if (session != null && session.isConnected()) {
                session.disconnect();
            }
        }
    }
}

