package com.polus.fibicomp.coi.vo;

import lombok.Data;

@Data
public class CoiDashboardCountVO {

	private Integer travelDisclosureCount;
	private Integer consultDisclCount;
	private Integer disclosureHistoryCount;
	private Integer inProgressDisclosureCount;
	private Integer approvedDisclosureCount;
	private Integer declarationCount;
	private Integer cmpCount;
}
