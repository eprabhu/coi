package com.polus.fibicomp.cmp.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CoiMgmtPlanAvailableActionDto {

	private Integer availableActionId;
	private String currentStatus;
	private String currentStatusDescription;
	private String currentStatusBadgeColor;
	private String actionTypeCode;
	private String actionDescription;
	private String actionMessage;
	private String resultingStatus;
	private String resultingStatusDescription;
	private String resultingStatusBadgeColor;
	private Integer sortOrder;

}
