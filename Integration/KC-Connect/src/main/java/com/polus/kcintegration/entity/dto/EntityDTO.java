package com.polus.kcintegration.entity.dto;


import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class EntityDTO {

	private String primaryName;
	private String certifiedEmail;
	private String telephoneNumber;
	private String updatedBy;
	private String createdBy;
	private String ueiNumber;
	private String dunsNumber;
	private String acronym;
	private String cageNumber;
	private Integer entityId;
	private Integer rolodexId;
	private SponsorDetailsDTO sponsorDetails;
	private SubAwdOrgDetailsDTO organizationDetails;
	private String sponsorCode;
}
