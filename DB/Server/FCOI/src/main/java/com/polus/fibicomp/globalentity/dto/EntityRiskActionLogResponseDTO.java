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
public class EntityRiskActionLogResponseDTO {

	private Integer actionLogId;
	private Integer entityId;
	private Integer entityRiskId;
	private String actionTypeCode;
	private String description;
	private String comment;
	private String updateUser;
	private Timestamp updateTimestamp;

}
