package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoiAssignTravelDisclosureAdminDto {

	private Integer travelDisclosureId;
	private String adminPersonId;
	private Integer adminGroupId;
	private String adminPersonName;
	private String adminGroupName;
	private String travelDisclosureStatus;
	private String travelDisclosureStatusCode;
	private String reviewStatus;
	private String reviewStatusCode;
	private String dispositionStatus;
	private String dispositionStatusCode;
	private String documentStatusCode;
	private String documentStatus;
	private String versionStatus;
	private String disclosureStatusCode;
	private String disclosureStatus;
	private Timestamp updateTimestamp;
	private String actionType;

}
