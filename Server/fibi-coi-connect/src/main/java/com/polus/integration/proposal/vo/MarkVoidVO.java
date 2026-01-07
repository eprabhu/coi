package com.polus.integration.proposal.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkVoidVO {	
	private Integer moduleCode;
	private String moduleItemKey;
	private String personId;
	private String remark;
	private String actionType;
}
