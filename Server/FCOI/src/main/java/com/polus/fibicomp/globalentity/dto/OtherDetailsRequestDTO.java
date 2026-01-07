package com.polus.fibicomp.globalentity.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtherDetailsRequestDTO {

	private Integer entityId;
	private String startDate;
	private String incorporationDate;
	private String incorporatedIn;
	private String congressionalDistrict;
	private String currencyCode;
	private String shortName;
	private String businessTypeCode;
	private String activityText;
	private String federalEmployerId;
	private Integer numberOfEmployees;
	private Map<OtherDetailsRequestField, Object> otherDetailsRequestFields;

}
