package com.polus.dnb.dto;

import lombok.Data;

@Data
public class DnBEntityCleanseMatchRequestDTO {

	private String sourceDataName;

	private String sourceDunsNumber;

	private String emailAddress;

	private String addressLine1;

	private String addressLine2;

	private String postalCode;

	private String state;

	private String countryCode;

}