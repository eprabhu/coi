package com.polus.integration.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class COIActionLogVO {
	private Integer entityId;
	private Integer entityNumber;
	private String entityName;
	private String updatedBy;
	private String dunsNumber;
	private String tabName;
	private String actionLogCode;
}
