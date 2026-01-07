package com.polus.fibicomp.cmp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiManagementPlanProjectRelDto {

	private Integer cmpId;
	private Integer moduleCode;
	private String moduleItemKey;
    private Object projectDetails;

}
