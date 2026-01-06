package com.polus.fibicomp.globalentity.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EntityDetailsResponseDTO {

	private Integer entityId;
	private String primaryName;
	private String entityTypeCode;
	private String primaryAddressLine1;
	private String primaryAddressLine2;
	private String city;
	private String state;
	private String postCode;
	private String countryCode;
	private String certifiedEmail;
	private String websiteAddress;
	private String dunsNumber;
	private String ueiNumber;
	private String cageNumber;

}
