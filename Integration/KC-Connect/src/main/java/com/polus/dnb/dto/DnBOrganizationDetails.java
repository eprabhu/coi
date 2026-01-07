package com.polus.dnb.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DnBOrganizationDetails {

	private String duns;
	private List<Website> websiteAddress;
	private DunsControlStatus dunsControlStatus;
	private String primaryName;
	private List<TradeNameStyle> tradeStyleNames;
	private List<Telephone> telephone;
	private DetailedAddress primaryAddress;
	private DetailedAddress mailingAddress;
	private List<RegistrationNumber> registrationNumbers;
	private List<Principal> mostSeniorPrincipals;
	private boolean isStandalone;
	private CorporateLinkage corporateLinkage;

	private String registeredName;
	private List<FormerPrimaryName> formerPrimaryNames;
	private List<USSicV4> primaryIndustryCodes;
	private List<IndustryCode> industryCodes;
	private DetailedAddress registeredAddress;
	private String defaultCurrency;
	private String startDate;
	private String incorporatedDate;
	private String certifiedEmail;

	private boolean isPubliclyTradedCompany;

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class IndustryCode {
		private String code;
		private String description;
		private String typeDescription;
		private String typeDnbCode;
		private String priority;

	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class USSicV4 {
		private String usSicV4;
		private String usSicV4Description;

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
	public static class Website {
		private String url;
		private String domainName;
	}

	@Data
	public static class OperatingStatus {
		private String description;
		private int dnbCode;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Telephone {
		private String telephoneNumber;
		private boolean isUnreachable;
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
	public static class CorporateLinkage {
		private List<FamilyTreeRole> familytreeRolesPlayed;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class FamilyTreeRole {
		private String description;
		private int dnbCode;
	}

	@Data
	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class FormerPrimaryName {
		private String name;
		private String startDate;
		private String endDate;
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
	public static class DetailedAddress {
		private CountryAddress addressCountry;
		private LocalityAddress addressLocality;
		private RegionAddress addressRegion;
		private String postalCode;
		private String postalCodeExtension;
		private StreetAddress streetAddress;
	}
}