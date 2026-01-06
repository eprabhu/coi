package com.polus.integration.entity.criteriasearch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DnBStageEntityMatchDTO {

	private Integer id;

	private String sourceDataCode;

	private String sourceDataName;

	private String integrationStatusCode;

	private Integer candidateMatchedQuantity;

	private String bestMatchResult;

	private Integer bestMatchConfidenceCode;

	private String httpStatusCode;

	private String externalSysTransactionId;

	private String errorCode;

	private String errorMessage;

	private String errorDetails;

}
