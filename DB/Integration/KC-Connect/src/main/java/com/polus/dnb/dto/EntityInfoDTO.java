package com.polus.dnb.dto;

import lombok.Data;

@Data
public class EntityInfoDTO {
	private int entityId;
	private String entityName;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;
	private String entityStatusTypeCode;
	private String entityStatus;
	private String primaryAddressLine1;
	private String primaryAddressLine2;
	private String city;
	private String state;
	private String postCode;
	private String countryCode;
	private String country;
	private String website;
	private String email;
	private String isActive;
	private String sponsorCode;
	private String phoneNumber;
	private Integer organizationId;
}