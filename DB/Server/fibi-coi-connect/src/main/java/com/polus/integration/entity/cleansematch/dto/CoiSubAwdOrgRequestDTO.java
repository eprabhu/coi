package com.polus.integration.entity.cleansematch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiSubAwdOrgRequestDTO {

	private Integer id;
	private Integer entityId;
	private String organizationId;
	private String organizationTypeCode;
	private String feedStatusCode;
	private Date samExpirationDate;
	private Date subAwdRiskAssmtDate;
	private Map<CoiSubAwardOrgField, Object> subAwardOrgFields;

}
