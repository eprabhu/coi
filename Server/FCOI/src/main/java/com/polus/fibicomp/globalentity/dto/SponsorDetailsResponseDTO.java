package com.polus.fibicomp.globalentity.dto;

import com.polus.core.pojo.Country;
import com.polus.core.pojo.SponsorType;

import com.polus.core.pojo.State;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SponsorDetailsResponseDTO {

	private Integer entityId;
	private Integer id;
	private String sponsorCode;
	private String acronym;
	private SponsorType sponsorType;
	private String sponsorName;
	private String translatedName;
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
	private String comments;
	private Boolean isCopy;
	private State stateDetails;
	private Boolean isCreatedFromImportEntity;

}
