package com.polus.fibicomp.mig.eng.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EngMigEntityDto {

	private Integer entityId;
	private Integer entityNumber;
	private String entityName;
	private String addressLine1;
	private String addressLine2;
	private String city;
	private String state;
	private String country;
	private String dunsNumber;
	private String ueiNumber;
	private String organizationId;
	private String sponsorCode;
	private String postalCode;
	private String cageNumber;
	private String website;
	private String ownershipType;
	private String businessType;
	private String entityType;
}
