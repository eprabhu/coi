package com.polus.kcintegration.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SponsorDetailsDTO {

	private Integer entityId;
	private String sponsorCode;
	private String acronym;
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
	private String emailAddress;
	private String phoneNumber;
	private String comments;
	private String sponsorTypeCode;
	private String updatedBy;
	private String customerNumber;
	private String auditReportSentForFy;
	private String dunningCampaignId;
	private String dodacNumber;
	private Boolean isCreateSponsor;
	private Integer rolodexId;
}
