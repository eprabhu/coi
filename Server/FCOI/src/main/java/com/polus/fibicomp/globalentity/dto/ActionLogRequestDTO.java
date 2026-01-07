package com.polus.fibicomp.globalentity.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActionLogRequestDTO {

	private Integer entityId;
	private Integer entityNumber;
	private Integer entityRiskId;
	private String entityName;
	private String updatedBy;
	private String dunsNumber;
	private String tabName;
	private String actionLogCode;
	private String riskType;
	private String oldRiskLevel;
	private String newRiskLevel;
	private String oldComment;
	private String newComment;
	private String oldFeedStatus;
	private String newFeedStatus;
	private Timestamp updateTimestamp;

}
