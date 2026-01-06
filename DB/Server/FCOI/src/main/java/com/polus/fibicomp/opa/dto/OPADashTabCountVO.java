package com.polus.fibicomp.opa.dto;

import java.sql.ResultSet;

import com.polus.fibicomp.coi.vo.CoiAdminDashTabCountVO;

import lombok.Data;

@Data
public class OPADashTabCountVO {
	private Integer myReviewsTabCount;
	private Integer allReviewsTabCount;
}
