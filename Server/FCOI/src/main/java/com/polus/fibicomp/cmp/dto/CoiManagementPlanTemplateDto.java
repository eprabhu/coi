package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoiManagementPlanTemplateDto {

	private Integer templateId;
    private String templateName;
    private String description;
    private String updatedBy;
    private Timestamp updatedTimestamp;

}
