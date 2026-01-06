package com.polus.fibicomp.globalentity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityRiskRequestDTO {

	private Integer entityId;
	private Integer entityRiskId;
	private String riskTypeCode;
	private String riskType;
	private String riskLevelCode;
	private String riskLevel;
	private String oldRiskLevelCode;
	private String oldRiskLevel;
	private String description;
	private String oldDescription;
	private Boolean modificationIsInProgress;

}
