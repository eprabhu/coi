package com.polus.fibicomp.mig.eng.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EngMigDashboardDto {

	private Integer engagementId;
	private String entityName;
	private String relationshipType;
	private String entityType;
	private String ownershipType;
	private String entityBusinessFocus;
	private String involvementOfStudents;
	private String involvementOfStaff;
	private String useOfMitResources;
	private String founder;
	private String migrationStatus;
	private String ownershipTypeCode;
	private Integer coiEngagementId;
	private Integer coiEntityId;
	private String initialReportDate;
}
