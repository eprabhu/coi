package com.polus.fibicomp.compliance.declaration.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeclDashboardResponse {

	private Integer declarationId;
	private String declarationNumber;
	private String personId;
	private String personFullName;
	private String homeUnitNumber;
	private String homeUnitName;
	private String declarationType;
	private String declarationStatus;
	private Timestamp submissionDate;
	private Timestamp expirationDate;
	private Timestamp updateTimeStamp;
	private String updateUserFullName;
	private String unitDisplayName;
	private String badgeColor;
	private String declarationStatusCode;
	private String declarationTypeCode;
	private String versionStatus;
	private String reviewStatusCode;
	private String reviewStatus;
	private Integer versionNumber;
	private String adminGroupName;
	private String adminPersonName;
	private Integer adminGroupId;
	private String adminPersonId;
	private Boolean isHomeUnitSubmission;
	private Boolean isViewAllowed;

}
