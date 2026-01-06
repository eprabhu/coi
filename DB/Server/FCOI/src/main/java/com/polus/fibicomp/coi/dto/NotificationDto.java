package com.polus.fibicomp.coi.dto;

import java.util.List;

import com.polus.core.notification.pojo.NotificationRecipient;

import lombok.Data;

@Data
public class NotificationDto {

	private Integer disclosureId;
	private String notificationTypeId;
	private Integer projectTypeCode;
	private Integer projectId;
	private List<NotificationRecipient> recipients;
	private String description;
	private String message;
	private String subject;
	private String messageId;
	private String actionType;
	private Integer moduleCode;
	private Integer subModuleCode;
	private String publishedUserId;
    private Integer moduleItemKey;
    private Integer subModuleItemKey;
}
