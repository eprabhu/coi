package com.polus.integration.proposal.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProposalUserNotifyReqVO {

	private Integer moduleCode;
	private Integer subModuleCode;
	private Integer disclosureId;
	private String moduleItemKey;
	private String subModuleItemKey;
	private String title;
	private String personId;
	private String unitNumber;
	private String unitName;

}
