package com.polus.integration.instituteProposal.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstituteProposalPersonDTO {

	private String projectNumber;

	private Integer keyPersonRoleCode;

	private String keyPersonRoleName;

	private String keyPersonId;

	private String keyPersonName;

	private BigDecimal percentOfEffort;

	private String attribute1Label;

	private String attribute1Value;

	private String attribute2Label;

	private String attribute2Value;

	private String attribute3Label;

	private String attribute3Value;

}
