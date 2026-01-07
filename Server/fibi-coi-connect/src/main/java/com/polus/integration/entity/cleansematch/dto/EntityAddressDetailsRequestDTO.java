package com.polus.integration.entity.cleansematch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class EntityAddressDetailsRequestDTO {

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

}
