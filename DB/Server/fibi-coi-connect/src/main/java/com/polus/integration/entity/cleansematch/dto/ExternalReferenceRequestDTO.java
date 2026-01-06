package com.polus.integration.entity.cleansematch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExternalReferenceRequestDTO {

	private Integer entityId;
	private Integer entityExternalMappingId;
	private String organizationId;
	private String sponsorCode;
	private String externalIdTypeCode;
	private String externalId;
	private String description;

}
