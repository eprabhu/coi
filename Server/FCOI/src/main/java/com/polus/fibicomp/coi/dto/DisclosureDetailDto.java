package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisclosureDetailDto {

	private Integer moduleCode;

	private String moduleItemId;

	private String moduleItemKey;

	private String title;

	private String principalInvestigator;

	private String sponsor;

	private Timestamp startDate;

	private Timestamp endDate;

	private Boolean sfiCompleted;

	private String moduleStatus;

	private String unitName;

	private String unitNumber;

	private String primeSponsor;

	private List<Map<Object, Object>> disclosureStatusCount;

	private String reporterRole;

	private String reporterName;

	private String reporterPersonId;

	private String sponsorAwardNumber;

	private String accountNumber;

	private List<CoiDisclEntProjDetailsDto> coiDisclEntProjDetails;

	private String conflictStatus;

	private String conflictStatusCode;

	private Boolean isRelationShipExists;

}
