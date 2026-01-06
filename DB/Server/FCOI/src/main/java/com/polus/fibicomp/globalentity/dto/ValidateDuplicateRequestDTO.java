package com.polus.fibicomp.globalentity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ValidateDuplicateRequestDTO {

	private String entityName;
	private String primaryAddressLine1;
	private String primaryAddressLine2;
	private String countryCode;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;
	private Integer entityNumber;
}
