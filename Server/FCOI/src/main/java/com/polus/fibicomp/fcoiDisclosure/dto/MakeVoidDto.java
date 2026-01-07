package com.polus.fibicomp.fcoiDisclosure.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MakeVoidDto {

	private Integer disclosureId;
	private String disclosureNumber;
	private String coiProjectType;
	private String projectTitle;
	private String projectNumber;
	private String reporterId;
	private String reporterName;
}
