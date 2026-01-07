package com.polus.integration.entity.cleansematch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CoiEntitySponsorRequestDTO {

	private Integer id;
	private Integer entityId;
	private String acronym;
	private String sponsorTypeCode;
	private String feedStatusCode;
	private String acType;
	private Map<CoiEntitySponsorField, Object> entitySponsorFields;

}
