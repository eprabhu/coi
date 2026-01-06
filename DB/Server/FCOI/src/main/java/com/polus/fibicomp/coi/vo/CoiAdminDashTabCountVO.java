package com.polus.fibicomp.coi.vo;

import lombok.Data;

@Data
public class CoiAdminDashTabCountVO {

	private Integer newSubmissionTabCount;
	private Integer newSubmissionWithoutSfiTabCount;
	private Integer myReviewsTabCount;
	private Integer allReviewsTabCount;
}
