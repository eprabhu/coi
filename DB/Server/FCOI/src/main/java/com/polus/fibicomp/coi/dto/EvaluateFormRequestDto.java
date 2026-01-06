package com.polus.fibicomp.coi.dto;

import lombok.Data;

@Data
public class EvaluateFormRequestDto {

	private Integer formBuilderId;
	private String moduleItemCode;
	private String moduleItemKey;
	private String moduleSubItemCode;
	private String moduleSubItemKey;
	private Integer personEntityId;

}
