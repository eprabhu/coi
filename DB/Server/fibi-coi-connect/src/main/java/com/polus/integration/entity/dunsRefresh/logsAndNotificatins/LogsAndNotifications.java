package com.polus.integration.entity.dunsRefresh.logsAndNotificatins;

import com.polus.integration.dao.IntegrationDao;
import com.polus.integration.entity.dunsRefresh.dao.DunsRefreshDao;
import com.polus.integration.entity.dunsRefresh.pojos.EntityDunsRefreshDetails;
import com.polus.integration.entity.dunsRefresh.pojos.Inbox;
import com.polus.integration.feedentity.dto.MessageQVO;
import com.polus.integration.messageq.service.RMQMessagingQueueService;
import com.polus.integration.messageq.vo.MessagingQueueProperties;
import com.polus.integration.common.CommonService;
import com.polus.integration.constant.Constant;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Log4j2
public class LogsAndNotifications {

	@Autowired
    private CommonService commonService;

    @Autowired
    private IntegrationDao integrationDao;

    @Autowired
    private MessagingQueueProperties messagingQueueProperties;

    @Autowired
    private RMQMessagingQueueService rmqMessagingQueueService;

    private static final String INBOX_ENTITY_REFRESH_UNVERIFIED = "8026";
    private static final String SUBJECT_TYPE_COI = "C";
    private static final Integer MODULE_CODE_GLOBAL_ENTITY = 26;

    @Autowired
    private DunsRefreshDao dunsRefreshDao;

    public void notifyUsers(List<EntityDunsRefreshDetails> dunsRefreshDetails) {
        if (dunsRefreshDetails == null || dunsRefreshDetails.isEmpty()) {
            return;
        }
        Map<String, List<EntityDunsRefreshDetails>> groupedDetails = dunsRefreshDetails.stream()
                .collect(Collectors.groupingBy(detail -> {
                    Boolean isVerified = detail.getIsVerified();
                    if (isVerified == null) return "unprocessed";
                    return isVerified ? "verified" : "unverified";
                }));
        List<EntityDunsRefreshDetails> unverifiedDetails = groupedDetails.getOrDefault("unverified", null);
        List<EntityDunsRefreshDetails> verifiedDetails = groupedDetails.getOrDefault("verified", null);
        List<EntityDunsRefreshDetails> unprocessedDetails = groupedDetails.getOrDefault("unprocessed", null);

        addToUnverifiedActionList(unverifiedDetails);
        StringBuilder mailContentPlaceholderValue = new StringBuilder();
        if (unverifiedDetails != null) {
            mailContentPlaceholderValue.append(buildUnverifiedNotificationBody(unverifiedDetails));
        }
        if (verifiedDetails != null) {
            mailContentPlaceholderValue.append(buildVerifiedNotificationBody(verifiedDetails));
        }
        if (unprocessedDetails != null) {
            mailContentPlaceholderValue.append(buildUnprocessedNotificationBody(unprocessedDetails));
        }
        sendMail(mailContentPlaceholderValue.toString());
    }

    private void addToUnverifiedActionList(List<EntityDunsRefreshDetails> unverifiedDetails) {
        if (unverifiedDetails == null) {
            return;
        }
        unverifiedDetails.forEach(refreshDetail -> unverifiedInboxActions(refreshDetail.getEntityId(), refreshDetail.getEntityName()));
    }

    private void unverifiedInboxActions(Integer entityId, String entityName) {
        StringBuilder userMessage = new StringBuilder();
        userMessage.append("The system automatically generated a new version for ")
                .append(entityName)
                .append(" on ").append(commonService.getDateFormat(new Date(), Constant.DEFAULT_DATE_FORMAT))
                .append(" as part of the D&B update. Kindly review and confirm the changes.");
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        dunsRefreshDao.getEntityAdmins().forEach(personId -> {
            Inbox inbox = new Inbox();
            inbox.setModuleCode(MODULE_CODE_GLOBAL_ENTITY);
            inbox.setSubModuleCode(0);
            inbox.setToPersonId(personId);
            inbox.setModuleItemKey(entityId.toString());
            inbox.setUserMessage(userMessage.toString());
            inbox.setMessageTypeCode(INBOX_ENTITY_REFRESH_UNVERIFIED);
            inbox.setSubModuleItemKey("0");
            inbox.setSubjectType(SUBJECT_TYPE_COI);
            inbox.setOpenedFlag("N");
            inbox.setArrivalDate(timestamp);
            inbox.setUpdateTimeStamp(timestamp);
            dunsRefreshDao.saveOrUpdate(inbox);
        });
    }

    private String buildUnverifiedNotificationBody(List<EntityDunsRefreshDetails> unverifiedDetails) {
        List<Map<String, String>> queryColumnValuesList = new ArrayList<>();
        unverifiedDetails.forEach(refreshData ->
                queryColumnValuesList.add(Map.of("Entity Name", refreshData.getEntityName() != null? refreshData.getEntityName() : "",
                        "Duns Number", refreshData.getDunsNumber() != null ? refreshData.getDunsNumber() : ""))
        );
        List<String> columnHeaderNames = new ArrayList<>();
        columnHeaderNames.add("Entity Name");
        columnHeaderNames.add("Duns Number");
        StringBuilder content = new StringBuilder("The following entities were updated from D&B and require your review. Please check the D&B Entity Updates tab <br>")
                .append(buildEntityNotificationContent(queryColumnValuesList, columnHeaderNames));
        return content.toString();
    }

    private String buildVerifiedNotificationBody(List<EntityDunsRefreshDetails> unverifiedDetails) {
        List<Map<String, String>> queryColumnValuesList = new ArrayList<>();
        unverifiedDetails.forEach(refreshData ->
                queryColumnValuesList.add(Map.of("Entity Name", refreshData.getEntityName() != null ? refreshData.getEntityName() : "",
                        "Duns Number", refreshData.getDunsNumber() != null ? refreshData.getDunsNumber() : ""))
        );
        List<String> columnHeaderNames = new ArrayList<>();
        columnHeaderNames.add("Entity Name");
        columnHeaderNames.add("Duns Number");
        StringBuilder content = new StringBuilder("The following entities were updated from D&B and successfully confirmed by the system. You can review them under the All Entities tab <br>")
                .append(buildEntityNotificationContent(queryColumnValuesList, columnHeaderNames));
        return content.toString();
    }

    private String buildUnprocessedNotificationBody(List<EntityDunsRefreshDetails> unverifiedDetails) {
        List<Map<String, String>> queryColumnValuesList = new ArrayList<>();
        unverifiedDetails.forEach(refreshData ->
                queryColumnValuesList.add(Map.of("Duns Number", refreshData.getDunsNumber() != null ? refreshData.getDunsNumber() : "",
                        "Refresh Type", refreshData.getEntityRefreshType() != null ? refreshData.getEntityRefreshType() : "",
                        "Exception", refreshData.getErrorMessage() != null ? refreshData.getErrorMessage() : ""))
        );
        List<String> columnHeaderNames = new ArrayList<>();
        columnHeaderNames.add("Duns Number");
        columnHeaderNames.add("Refresh Type");
        columnHeaderNames.add("Exception");
        StringBuilder content = new StringBuilder("<br>The following entities have updates in D&B but remain unprocessed due to various reasons. <br>")
                .append(buildEntityNotificationContent(queryColumnValuesList, columnHeaderNames));
        return content.toString();
    }


    private String buildEntityNotificationContent(List<Map<String, String>> queryColumnValuesList, List<String> columnHeaderNames) {
        StringBuilder tableContent = new StringBuilder();
        tableContent.append("<table style=\"border-collapse: collapse; width: 100%; border: 1px solid #dddddd;\">")
                .append("<thead><tr>");
        // Append header cells
        for (String header : columnHeaderNames) {
            tableContent.append("<th style=\"border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;\">")
                    .append(header)
                    .append("</th>");
        }
        tableContent.append("</tr></thead><tbody>");
        // Append rows
        for (Map<String, String> row : queryColumnValuesList) {
            tableContent.append("<tr>");
            for (String header : columnHeaderNames) {
                String value = row.getOrDefault(header, "");
                tableContent.append("<td style=\"border: 1px solid #dddddd; text-align: left; padding: 8px;\">")
                        .append(value)
                        .append("</td>");
            }
            tableContent.append("</tr>");
        }
        tableContent.append("</tbody></table>");
        return tableContent.toString();
    }

    private void sendMail(String mailContent) {
        Map<String, String> placeHolders = new HashMap<>();

        placeHolders.put("notificationTypeId", "8061");
        placeHolders.put("DUNS_REFRESH_DETAILS", mailContent);

        MessageQVO messageVO = new MessageQVO();
        messageVO.setOrginalModuleItemKey(0);
        messageVO.setTriggerType("NOTIFY_DUNS_REFRESH_REPORT");
        messageVO.setModuleCode(26);
        messageVO.setSubModuleCode(0);
        messageVO.setEventType("T");
        messageVO.setAdditionalDetails(placeHolders);
        messageVO.setPublishedUserName("System");
        messageVO.setPublishedTimestamp(integrationDao.getCurrentTimestamp());
        messageVO.setSourceExchange(messagingQueueProperties.getQueues().get("exchange"));
        messageVO.setSourceQueueName(messagingQueueProperties.getQueues().get("coi"));
        try {
            rmqMessagingQueueService.publishMessageToQueue(messageVO);
            log.info("Email sent for duns refresh report.");
        } catch (Exception ex) {
            log.error("Error sending email for duns refresh report: {}", ex.getMessage(), ex);
        }
    }
}
