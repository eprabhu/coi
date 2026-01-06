package com.polus.fibicomp.coi.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class COIValidateDto {

	private String validationType;
	private String validationMessage;
	private List<String> sfiList;
	private List<List<Map<String, String>>> projectSfiList;

}
