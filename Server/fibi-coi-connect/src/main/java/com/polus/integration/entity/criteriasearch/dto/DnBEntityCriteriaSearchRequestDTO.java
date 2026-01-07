package com.polus.integration.entity.criteriasearch.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DnBEntityCriteriaSearchRequestDTO {

	private String duns;
	private List<String> dunsList;
	private String primaryName;
	private String tradeStyleName;
	private String countryISOAlpha2Code;
	private String addressRegion;
	private String addressLocality;
	private String addressCounty;
	private String streetAddressLine1;
	private String postalCode;
	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private List<String> registrationNumbers;
}