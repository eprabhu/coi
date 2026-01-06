package com.polus.fibicomp.coi.hierarchy.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HierarchyProjResponseDto {

	private String projectId;

	private String projectNumber;

	private String documentNumber;

	private String accountNumber;

	private String sponsorCode;

	private String primeSponsorCode;

	private String sponsorName;

	private String homeUnitName;

	private String homeUnitNumber;

	private String primeSponsorName;

	private String projectStatus;

	private String piName;

	private Timestamp projectStartDate;

	private Timestamp projectEndDate;

	private String projectBadgeColour;

	private String projectIcon;

	private String projectType;

	private String projectTypeCode;

	private String projectTitle;

	private List<ProjectPersonDto> projectPersons;

}
