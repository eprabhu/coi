package com.polus.integration.entity.enrich.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.polus.integration.entity.base.dto.DnBOrganizationDetails.CorporateLinkage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DnBEnrichAPIResponse {
	private String HttpStatusCode;
	private TransactionDetail transactionDetail;
	private Organization organization;
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
	public static class Organization {
		private String duns;
		private String primaryName;
		private String registeredName;
		private List<TradeNameStyle> tradeStyleNames;
		private List<MultilingualPrimaryName> multilingualPrimaryName;
		private List<IndustryCode> industryCodes;
		private List<Website> websiteAddress;
		private DunsControlStatus dunsControlStatus;

		private DefaultType businessEntityType;
		private List<Summary> summary;
		private List<Telephone> telephone;
		private DetailedAddress primaryAddress;
		private DetailedAddress mailingAddress;
		private DetailedAddress registeredAddress;
		private String defaultCurrency;
		private String startDate;
		private String incorporatedDate;
		private String certifiedEmail;
		private List<RegistrationNumber> registrationNumbers;
		private List<Email> email;
		private List<NumberOfEmployees> numberOfEmployees;
		private boolean isStandalone;
		private CorporateLinkage corporateLinkage;
		private DefaultType controlOwnershipType;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class MultilingualPrimaryName {
		private DefaultType language;
		private String name;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class IndustryCode {
		private String code;
		private String description;
		private String typeDescription;
		private String typeDnBCode;
		private String priority;

	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Email {
		private String address;
		private String certifiedEmail;

	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class NumberOfEmployees {
		private Integer value;
		private String informationScopeDescription;
		private Integer informationScopeDnBCode;

	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class TradeNameStyle {
		private String name;
		private Integer priority;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class DunsControlStatus {
		private OperatingStatus operatingStatus;
		private boolean isMailUndeliverable;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Summary {
		private DefaultType textType;
		private String text;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Website {
		private String url;
		private String domainName;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class OperatingStatus {
		private String description;
		private int dnbCode;
		private String startDate;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Telephone {
		private String telephoneNumber;
		private boolean isUnreachable;
		private String isdCode;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class RegistrationNumber {
		private String registrationNumber;
		private String typeDescription;
		private int typeDnBCode;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Principal {
		private String fullName;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class DefaultType {
		private String description;
		private int dnbCode;
	}

}
