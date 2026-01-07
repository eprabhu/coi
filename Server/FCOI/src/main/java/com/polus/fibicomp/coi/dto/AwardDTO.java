package com.polus.fibicomp.coi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AwardDTO {

	private String projectNumber;
	private String disclosureValidationFlag;
	private String comment;
	private String projectTitle;
	private String projectUnitNumber;
	private String projectUnitName;
	private Integer projectId;
	private String projectStatus;

}
