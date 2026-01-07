package com.polus.fibicomp.coi.clients.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormValidationRequest {
	
	private Integer formBuilderId;

	private List<Integer> formBuilderIds;

	private String moduleItemCode;
	
	private String moduleSubItemCode;
	
	private String moduleItemKey;
	
	private String moduleSubItemKey;

	private Integer formBuilderSectionId;

	private Integer formBuilderSectCompId;

}
