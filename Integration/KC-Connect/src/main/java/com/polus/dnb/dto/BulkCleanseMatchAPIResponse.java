package com.polus.dnb.dto;

import java.util.List;

import com.polus.dnb.dto.DnBCleanseMatchAPIResponse.MatchCandidate;

import lombok.Data;

@Data
public class BulkCleanseMatchAPIResponse {
	private String httpStatusCode;
	private String fullResponse;
	private String transactionID;
	private Integer candidatesMatchedQuantity;
	private List<MatchCandidate> matchCandidates;
	private MatchCandidate highestMatch;
	private Integer highestMatchConfidenceCode;
	private String errorCode;
	private String errorMessage;
	private String errorDetails;
}
