package com.polus.fibicomp.coi.clients.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FormBuilderSectionsDTO {

	private Integer sectionId;
	
	private String sectionName;
	
	private Integer sectionOrder;
	
	private String sectionDescription;
	
	private Integer sectionBusinessRule;
	
	private String sectionHelpText;
	
	private String sectionHeader;
	
	private String sectionFooter;
	
	private List<FormBuilderSectionsComponentDTO> sectionComponent;
}