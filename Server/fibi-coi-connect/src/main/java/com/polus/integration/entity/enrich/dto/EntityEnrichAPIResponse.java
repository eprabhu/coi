package com.polus.integration.entity.enrich.dto;

import java.util.List;

import com.polus.integration.entity.base.dto.DnBOrganizationDetails;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.DefaultType;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.DetailedAddress;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.DunsControlStatus;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.IndustryCode;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.MultilingualPrimaryName;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.RegistrationNumber;
import com.polus.integration.entity.enrich.dto.DnBEnrichAPIResponse.Telephone;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails.CorporateLinkage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityEnrichAPIResponse {
	private String httpStatusCode;	
	private String transactionID;	
	private Organization organization;
	private String errorCode;
	private String errorMessage;
	private String errorDetails;
	
	
	@Data
	public static class Organization {
		private String duns;
		private String uei;
		private String federalEmployerId;
		private String cageNumber;
		private String humanSubAssurance;
		private String animalWelfareAssurance;
		private String animalAccreditaion;
		private String primaryName;
		private String registeredName;
		private String tradeStyleNames;
		private String priorName;
		//private String multilingualPrimaryName;
		//private List<TradeNameStyle> tradeStyleNames;
		private List<MultilingualPrimaryName> multilingualPrimaryName;
		private List<IndustryCode> industryCodes;
		private String websiteAddress;
		//private List<Website> websiteAddress;
		private DunsControlStatus dunsControlStatus;
		private String ownershipType;
		private DefaultType businessEntityType;
		private String summary;
		//private List<Summary> summary;
		private List<Telephone> telephone;
		private DetailedAddress primaryAddress;
		private DetailedAddress mailingAddress;
		private DetailedAddress registeredAddress;
		private String defaultCurrency;
		private String startDate;
		private String incorporatedDate;
		private String certifiedEmail;
		private List<RegistrationNumber> registrationNumbers;
		//private List<Email> email;
		private Integer numberOfEmployees;
		//private List<NumberOfEmployees> numberOfEmployees;
		private boolean isStandalone;
		//private CorporateLinkage corporateLinkage;
		private DefaultType controlOwnershipType;
		private CorporateLinkage corporateLinkage;
	}
}


