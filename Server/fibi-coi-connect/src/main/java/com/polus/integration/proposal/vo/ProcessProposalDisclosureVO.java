package com.polus.integration.proposal.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessProposalDisclosureVO {

	private String moduleCode;

	private Integer moduleItemId;

	private String personId;

	private String homeUnit;

	private String coiProjectTypeCode;

}
