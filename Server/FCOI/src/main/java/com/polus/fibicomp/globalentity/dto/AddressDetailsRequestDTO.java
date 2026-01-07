package com.polus.fibicomp.globalentity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressDetailsRequestDTO {

	private Integer entityId;
	private Integer entityMailingAddressId;
	private String addressTypeCode;
	private String addressLine1;
	private String addressLine2;
	private String city;
	private String state;
	private String postCode;
	private String countryCode;
	private String locality;
	private String region;
	private String county;
	private Boolean isCopy;

}
