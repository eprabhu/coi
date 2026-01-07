package com.polus.integration.award.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AwardPersonDTO {

	private String projectNumber;

	private List<String> projectNumbers;

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

    private String disclosureReqFlag;

    private String newDisclosureRequired;

}
