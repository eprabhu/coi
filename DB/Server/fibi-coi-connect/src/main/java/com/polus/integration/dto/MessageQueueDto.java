package com.polus.integration.dto;

import java.sql.Timestamp;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageQueueDto {

    private String actionType;
    private Integer moduleCode;
    private Integer subModuleCode;
    private Integer orginalModuleItemKey;
    private Integer copiedModuleItemKey;
    private Integer subModuleItemKey;
    private String publishedUserName;
    private String publishedUserId;
    private Map<String, String> additionalDetails;
    private Timestamp publishedTimestamp;
    private String sourceQueueName;
    private String sourceExchange;
    private String messageId;
    private String jsonMessage;
    private String eventType;
    private String triggerType;
}
