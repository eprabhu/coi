package com.polus.fibicomp.coi.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
public class CoiEntityDto {

	private Integer entityId;
	private Integer entityNumber;
	private String entityName;
	private Integer versionNumber;
	private String versionStatus;
	private String entityStatusCode;
	private Boolean isActive;
	private String createUser;
	private Timestamp createTimestamp;
	private String updateUser;
	private Timestamp updateTimestamp;
	private String revisionReason;
	private String updatedUserFullName;
	private String riskCategoryCode;
	private String countryName;
	private String entityType;
}
