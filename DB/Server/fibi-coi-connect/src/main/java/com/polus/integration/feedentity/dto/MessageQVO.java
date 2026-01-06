package com.polus.integration.feedentity.dto;

import java.sql.Timestamp;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageQVO {

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
	private String messageId;
	private String jsonMessage;
	private String sourceQueueName;
	private String sourceExchange;
	private String eventType;
	private String triggerType;

}
