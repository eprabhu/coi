package com.polus.integration.entity.criteriasearch.dto;

import java.util.List;

import com.polus.integration.entity.criteriasearch.dto.DnBCriteriaSearchAPIResponse.MatchCandidate;

import lombok.Data;

@Data
public class BulkCriteriaSearchAPIResponse {
	private String httpStatusCode;
	private DnBCriteriaSearchAPIResponse fullResponse;
	private String transactionID;
	private Integer candidatesMatchedQuantity;
	private List<MatchCandidate> matchCandidates;
	private MatchCandidate highestMatch;
	private Integer highestMatchConfidenceCode;
	private String errorCode;
	private String errorMessage;
	private String errorDetails;
}
