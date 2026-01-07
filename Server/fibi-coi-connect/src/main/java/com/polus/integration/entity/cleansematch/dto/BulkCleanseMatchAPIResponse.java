package com.polus.integration.entity.cleansematch.dto;

import java.util.List;

import com.polus.integration.entity.cleansematch.dto.DnBCleanseMatchAPIResponse.MatchCandidate;

import lombok.Data;

@Data
public class BulkCleanseMatchAPIResponse {
	private String httpStatusCode;
	private DnBCleanseMatchAPIResponse fullResponse;
	private String transactionID;
	private Integer candidatesMatchedQuantity;
	private List<MatchCandidate> matchCandidates;
	private MatchCandidate highestMatch;
	private Integer highestMatchConfidenceCode;
	private String errorCode;
	private String errorMessage;
	private String errorDetails;
}
