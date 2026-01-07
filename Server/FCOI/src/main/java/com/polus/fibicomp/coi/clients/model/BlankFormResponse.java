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
public class BlankFormResponse {

	private List<Integer> applicableFormsBuilderIds;
	
	private Integer formsBuilderId;
	
	private FormResponseDTO form;
	
}
