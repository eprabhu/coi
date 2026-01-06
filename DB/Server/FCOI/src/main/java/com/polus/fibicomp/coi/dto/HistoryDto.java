package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoryDto {

    private Timestamp updateTimestamp;
    private String updateUserFullName;
    private String actionTypeCode;
    private String message;
    private String comment;

}