package com.polus.integration.entity.criteriasearch.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DnBCriteriaSearchAPIResponse {
	private String HttpStatusCode;
	private TransactionDetail transactionDetail;
	// private InquiryDetail inquiryDetail;
	private int candidatesMatchedQuantity;
	private String matchDataCriteria;
	private List<MatchCandidate> searchCandidates;
	private APIError error;

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
	public static class DetailedAddress {
		private CountryAddress addressCountry;
		private LocalityAddress addressLocality;
		private RegionAddress addressRegion;
		private String postalCode;
		private String postalCodeExtension;
		private StreetAddress streetAddress;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class CountryAddress {
		private String isoAlpha2Code;
		private String name;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class LocalityAddress {
		private String name;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class RegionAddress {
		private String name;
		private String abbreviatedName;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class StreetAddress {
		private String line1;
		private String line2;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class MatchCandidate {
		private int displaySequence;
		private DnBOrganizationDetails organization;
		// private MatchQualityInformation matchQualityInformation;
	}

}
