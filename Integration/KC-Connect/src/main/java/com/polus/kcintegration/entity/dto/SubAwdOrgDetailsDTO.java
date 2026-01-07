package com.polus.kcintegration.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubAwdOrgDetailsDTO {

	private Integer entityId;
	private String organizationId;
	private Date samExpirationDate;
	private Date subAwdRiskAssmtDate;
	private String organizationName;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;
	private String primaryAddressLine1;
	private String primaryAddressLine2;
	private String city;
	private String state;
	private String postCode;
	private String countryCode;
	private String emailAddress;
	private String phoneNumber;
	private String humanSubAssurance;
	private String animalWelfareAssurance;
	private String animalAccreditation;
	private String congressionalDistrict;
	private String incorporatedIn;
	private Date incorporatedDate;
	private Integer numberOfEmployees;
	private String federalEmployerId;
	private String organizationTypeCode;
	private String updatedBy;
	private String irsTaxExemption;
	private String massTaxExemptNum;
	private String agencySymbol;
	private String vendorCode;
	private String comGovEntityCode;
	private String massEmployeeClaim;
	private Date scienceMisconductComplDate;
	private String phsAcount;
	private String nsfInstitutionalCode;
	private String indirectCostRateAgreement;
	private Integer cognizantAuditor;
	private Integer onrResidentRep;
	private String lobbyingRegistrant;
	private String lobbyingIndividual;
	private String riskLevel;
	private Boolean isCreateOrganization;
	private Integer rolodexId;
}
