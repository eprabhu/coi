package com.polus.integration.entity.dunsRefresh.processes;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polus.integration.client.FcoiFeignClient;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.dunsRefresh.constants.DunsRefreshConstants;
import com.polus.integration.entity.dunsRefresh.dao.DunsRefreshDao;
import com.polus.integration.entity.dunsRefresh.dto.DnBUpdateWrapper;
import com.polus.integration.entity.dunsRefresh.dto.EntityRefreshDto;
import com.polus.integration.entity.dunsRefresh.logsAndNotificatins.LogsAndNotifications;
import com.polus.integration.entity.dunsRefresh.pojos.EntityDunsRefreshDetails;
import com.polus.integration.entity.dunsRefresh.services.DunsRefreshComparisonService;
import com.polus.integration.entity.dunsRefresh.services.EntityRefreshService;
import com.polus.integration.entity.dunsRefresh.sftpServices.SftpService;
import com.polus.integration.entity.dunsRefresh.utils.MonitoringFileProcessUtils;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Log4j2
@Component
public class MonitoringFileProcess {

    @Autowired
    private MonitoringFileProcessUtils fileProcessUtils;

    @Autowired
    private MonitoringFileReader fileReader;

    @Autowired
    private FcoiFeignClient fcoiFeignClient;

    @Autowired
    private DunsRefreshDao dunsRefreshDao;

    @Autowired
    private EntityRefreshService entityRefreshService;

    @Autowired
    private DunsRefreshComparisonService comparisonService;

    @Autowired
    private SftpService sftpService;

    @Autowired
    private LogsAndNotifications logsAndNotifications;

    @Value("${entity.dnb.stp.sftp.host}")
    private String dunsSFTPHost;

    @Value("${entity.dnb.stp.sftp.username}")
    private String dunsSFTPUsername;

    @Value("${entity.dnb.stp.sftp.password}")
    private String dunsSFTPPassword;

    @Value("${entity.dnb.stp.sftp.port}")
    private Integer dunsSFTPPort;

    @Value("${entity.dnb.stp.directory}")
    private String dunsSTPDirectory;

    @Value("${duns.monitoring.file.location}")
    private String monitoringFileLocation;

    private static final String ENTITY_MONITORING_CONFIRMATION_REQUIRED = "ENTITY_MONITORING_CONFIRMATION_REQUIRED";
    private static final String ENABLE_ENTITY_MONITORING = "ENABLE_ENTITY_MONITORING";

    ObjectMapper objectMapper = new ObjectMapper();

    public void processFiles() throws IOException {
        if (!entityRefreshService.getParameterAsBoolean(ENABLE_ENTITY_MONITORING)) {
            return;
        }
        List<EntityDunsRefreshDetails> dunsRefreshDetails = new ArrayList<>();
        rerunUnprocessedChanges(dunsRefreshDetails);
        //Download files from duns SFP sftp
        try {
            sftpService.downloadFile(dunsSFTPHost, dunsSFTPPort, dunsSFTPUsername, dunsSFTPPassword, dunsSTPDirectory, monitoringFileLocation);
        } catch (Exception e) {
            log.error("Exception while downloading files from duns SFP sftp : {}", e.getMessage());
        }
        //Unzipping the zip files
        fileProcessUtils.findAndUnZipFiles();
        //Fetching all Notification files
        List<File> notificationFiles = fileProcessUtils.fetchAllNotificationFiles();
        //Processing the files
        notificationFiles.forEach(notificationFile -> {
            try {
                if (!dunsRefreshDao.isFileAlreadyExists(notificationFile.getName())) {
                    List<String> data = fileProcessUtils.readJsonLines(notificationFile);
                    data.forEach(dnbData -> {
                        EntityDunsRefreshDetails refreshDetail = EntityDunsRefreshDetails.builder()
                                .refreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_PENDING)
                                .monitoringSeedFileName(notificationFile.getName())
                                .monitoringSeedData(dnbData).build();
                        processDunsMonitoringData(dnbData, refreshDetail, dunsRefreshDetails);
                    });
                }
            } catch (Exception e) {
                log.warn("Exception while file reading for processing {}", e.getMessage());
                EntityDunsRefreshDetails dunsRefreshDetail = EntityDunsRefreshDetails.builder()
                        .refreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_ERROR)
                        .errorMessage(e.getMessage())
                        .monitoringSeedFileName(notificationFile.getName()).build();
                dunsRefreshDao.saveOrUpdate(dunsRefreshDetail);
                dunsRefreshDetails.add(dunsRefreshDetail);
            } finally {
                if (notificationFile != null && notificationFile.isFile()) {
                    notificationFile.delete();
                }
            }
        });
        logsAndNotifications.notifyUsers(dunsRefreshDetails);
    }

    private void rerunUnprocessedChanges(List<EntityDunsRefreshDetails> dunsRefreshDetails) {
        try {
            dunsRefreshDao.getByRefreshTypeAndStatusCodes().forEach(refreshDetail -> {
                processDunsMonitoringData(refreshDetail.getMonitoringSeedData(), refreshDetail, dunsRefreshDetails);
            });
        } catch (Exception e) {
            log.error("Exception while rerunUnprocessedChanges : {}", e.getMessage());
        }
    }

    private void processDunsMonitoringData(String dnbData, EntityDunsRefreshDetails refreshDetail, List<EntityDunsRefreshDetails> dunsRefreshDetails) {
        try {
            DnBUpdateWrapper updateWrapper = objectMapper.readValue(dnbData, DnBUpdateWrapper.class);
            refreshDetail.setDunsNumber(updateWrapper.getOrganization().getDuns());
            fileProcessUtils.setRefreshType(refreshDetail, updateWrapper.getType());
            refreshDetail.setEntityRefreshType(updateWrapper.getType());
            if (updateWrapper != null && updateWrapper.getType().equals(DunsRefreshConstants.REFRESH_TYPE_UPDATE)) {
                DnBOrganizationDetails orgDetails = fileReader.extractAndBuildOrgDetails(updateWrapper);
                if (orgDetails == null) {
                    log.info("No Duns changes are detected & Nothing to process!!");
                    refreshDetail.setRefreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_NO_CHANGE_DETECTED);
                    refreshDetail.setErrorMessage("No change detected");
                } else {
                    if (dunsRefreshDao.getEntityVersionByDunsNumber(updateWrapper.getOrganization().getDuns(), DunsRefreshConstants.PENDING) == null) {
                        EntityRefreshDto activeEntityInfo = dunsRefreshDao.getEntityVersionByDunsNumber(updateWrapper.getOrganization().getDuns(), DunsRefreshConstants.ACTIVE);
                        refreshDetail.setEntityNumber(activeEntityInfo.getEntityNumber());
                        ResponseEntity<Map<String, Object>> response = fcoiFeignClient.createDunsRefreshVersion(activeEntityInfo.getEntityId(), activeEntityInfo.getEntityNumber());
                        if (response.getStatusCode().is2xxSuccessful() && response.getBody().containsKey("copiedEntityId")) {
                            Integer entityId = (Integer) response.getBody().get("copiedEntityId");
                            refreshDetail.setEntityId(entityId);
                            entityRefreshService.updateEntityDetails(orgDetails, entityId);
                            Boolean verificationRequired = entityRefreshService.getParameterAsBoolean(ENTITY_MONITORING_CONFIRMATION_REQUIRED);
                            Boolean hasDifference = comparisonService.hasDifferenceBetweenVersions(activeEntityInfo.getEntityId(), entityId);
                            if (verificationRequired && !hasDifference) {
                                fcoiFeignClient.verifyEntityFromDunsMonitoring(entityId);
                                refreshDetail.setIsVerified(true);
                            } else if (!verificationRequired) {
                                fcoiFeignClient.verifyEntityFromDunsMonitoring(entityId);
                                refreshDetail.setIsVerified(true);
                            } else {
                                refreshDetail.setIsVerified(false);
                            }
                            refreshDetail.setRefreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_COMPLETED);
                            refreshDetail.setEntityName(dunsRefreshDao.getEntityNameByEntityId(entityId));
                        } else {
                            refreshDetail.setRefreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_ERROR);
                            refreshDetail.setErrorMessage("Refresh Entity version not created!!");
                        }
                    } else {
                        refreshDetail.setRefreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_ERROR);
                        refreshDetail.setErrorMessage("Entity has a modifying version, unable to create for duns refresh");
                    }

                }
            } else {
                refreshDetail.setRefreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_NO_CHANGE_DETECTED);
                refreshDetail.setErrorMessage("No change detected");
            }
        } catch (Exception e) {
            log.warn("Exception while file processing {}", e.getMessage());
            refreshDetail.setRefreshStatusTypeCode(DunsRefreshConstants.REFRESH_STATUS_ERROR);
            refreshDetail.setErrorMessage(e.getMessage());
        } finally {
            if (refreshDetail != null) {
                dunsRefreshDao.saveOrUpdate(refreshDetail);
                dunsRefreshDetails.add(refreshDetail);
            }
        }
    }

}
