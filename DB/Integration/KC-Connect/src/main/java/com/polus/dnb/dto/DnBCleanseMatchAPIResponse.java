package com.polus.dnb.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DnBCleanseMatchAPIResponse {
	private String HttpStatusCode;
	private TransactionDetail transactionDetail;
	// private InquiryDetail inquiryDetail;
	private int candidatesMatchedQuantity;
	private String matchDataCriteria;
	private List<MatchCandidate> matchCandidates;
	private APIError error;
	private String response;

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class TransactionDetail {
		private String transactionID;
		private String transactionTimestamp;
		private String inLanguage;
		private String serviceVersion;
	}

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class APIError {
		private String errorCode;
		private String errorMessage;
		private List<ErrorDetail> errorDetails;
	}

	@Data
	@ToString
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class ErrorDetail {
		private String parameter;
		private String description;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class InquiryDetail {
		private String name;
		private Address address;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Address {
		private String countryISOAlpha2Code;
		private String addressRegion;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class MatchCandidate {
		private int displaySequence;
		private DnBOrganizationDetails organization;
		private MatchQualityInformation matchQualityInformation;
		private EntityInfoDTO entity;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class MatchQualityInformation {
		private int confidenceCode;
		private double nameMatchScore;
	}

}
