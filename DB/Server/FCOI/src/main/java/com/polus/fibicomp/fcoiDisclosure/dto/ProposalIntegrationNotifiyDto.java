package com.polus.fibicomp.fcoiDisclosure.dto;

import lombok.Data;

@Data
public class ProposalIntegrationNotifiyDto {

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
