package com.polus.fibicomp.cmp.dto;

import com.polus.fibicomp.cmp.pojo.CoiManagementPlan;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CoiManagementPlanResponseDto {

	private CoiManagementPlan plan;
	private String initiator;

}
