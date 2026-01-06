package com.polus.fibicomp.coi.hierarchy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HierarchyResponseDto {

	private String projectTypeCode;

	private String projectIcon;

	private String projectType;

	private String projectNumber;

	private List<HierarchyResponseDto> linkedModule;

}
