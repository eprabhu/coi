package com.polus.integration.entity.criteriasearch.dto;

import java.util.List;

import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse.MatchCandidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EntityCriteriaSearchAPIResponse {
	private String httpStatusCode;
	private String transactionID;
	private Integer candidatesMatchedQuantity;
	private List<MatchCandidate> matchCandidates;
	private String errorCode;
	private String errorMessage;
	private String errorDetails;
}
