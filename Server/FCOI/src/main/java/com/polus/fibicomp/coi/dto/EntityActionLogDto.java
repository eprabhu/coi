package com.polus.fibicomp.coi.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class EntityActionLogDto {

    private Integer actionLogId;
    private Integer entityId;
    private Integer entityNumber;
    private String actionTypeCode;
    private String description;
    private String comment;
    private String updateUser;
    private Timestamp updateTimestamp;
}
