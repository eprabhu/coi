package com.polus.kcintegration.proposal.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProposalPersonDTO {

	private String proposalNumber;

	private String keyPersonName;

	private String keyPersonId;

	private Integer keyPersonRoleCode;

	private String keyPersonRole;

	private BigDecimal percentageOfEffort;

	private String certificationFlag;

	private String disclosureReqFlag;

	private String disclosureStatus;

	private String disclosureReviewStatus;

	private String attribute1Label;

	private String attribute1Value;

	private String attribute2Label;

	private String attribute2Value;

	private String attribute3Label;

	private String attribute3Value;
	
}
