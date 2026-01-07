package com.polus.integration.proposal.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProposalDisclosureVO {

	private Integer disclosureId;

	private String homeUnit;

	private String fcoiTypeCode;

	private String coiProjectTypeCode;

	private Integer moduleItemKey;

	private String personId;

	private Integer moduleCode;

}
