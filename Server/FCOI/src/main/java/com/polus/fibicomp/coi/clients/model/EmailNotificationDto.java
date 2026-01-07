package com.polus.fibicomp.coi.clients.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmailNotificationDto {
    private String subject;
    private String body;
    private Integer notificationTypeId;
    private Integer moduleCode;
    private String moduleItemKey;
}
