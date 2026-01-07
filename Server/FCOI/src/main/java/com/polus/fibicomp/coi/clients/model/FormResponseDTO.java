package com.polus.fibicomp.coi.clients.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormResponseDTO {

	private Integer formBuilderId;
	
	private String formBuilderNumber;
	
	private String moduleItemCode;
	
	private String moduleSubItemCode;
	
	private String moduleItemKey;
	
	private String moduleSubItemKey;
	
	private String formName;
	
	private List<FormBuilderSectionsDTO> formSections;
	
	private List<Integer> disabledSections;

	private Integer formBuilderAnswerHeaderId;

}
