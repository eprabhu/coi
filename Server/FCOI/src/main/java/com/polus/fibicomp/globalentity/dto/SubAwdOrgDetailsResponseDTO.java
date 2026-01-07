package com.polus.fibicomp.globalentity.dto;

import java.util.Date;

import com.polus.core.pojo.Country;
import com.polus.core.pojo.State;
import com.polus.fibicomp.globalentity.pojo.EntityOrganizationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubAwdOrgDetailsResponseDTO {

	private Integer entityId;
	private Integer id;
	private String organizationId;
	private EntityOrganizationType entityOrganizationType;
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
	private Country country;
	private String emailAddress;
	private String phoneNumber;
	private String humanSubAssurance;
	private String animalWelfareAssurance;
	private String animalAccreditation;
	private String congressionalDistrict;
	private String incorporatedIn;
	private String incorporatedDate;
	private Integer numberOfEmployees;
	private String federalEmployerId;
	private Boolean isCopy;
	private State stateDetails;
	private Boolean isCreatedFromImportEntity;
	private String translatedName;

}
