package com.polus.fibicomp.coi.clients.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormEvaluateValidationResponse {
	
	private Integer formBuilderId;

	private Integer sectionId;

	private Integer componentId;

	private String label;

	private String validationType;

	private String validationMessage;

}
