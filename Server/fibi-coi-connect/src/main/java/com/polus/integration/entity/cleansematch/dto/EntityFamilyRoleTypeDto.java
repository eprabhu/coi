package com.polus.integration.entity.cleansematch.dto;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class EntityFamilyRoleTypeDto {

	private String familyRoleTypeCode;
	private String description;
	private Timestamp updateTimestamp;
	private String updatedBy;
	private Boolean isActive;

}
