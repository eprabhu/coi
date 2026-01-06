package com.polus.fibicomp.coi.clients.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FormBuilderSectionsComponentDTO {

	private Integer componentId;
	
	private Integer sectionId;
	
	private String componentDescription;
	
	private String componentType;
	
	private Integer ComponentOrder;
	
	private String componentRefId;
	
	private String componentData;
	
	private String componentHeader;
	
	private String componentFooter;

	private String label;

	private String isMandatory;

	private String validationMessage;

	private List<Integer> ruleIds;

	//TODO need to bind Real object than Object class
	private Object programmedElement;

	private Object customElement;

	private Object questionnaire;

	private String captureDescription;

}