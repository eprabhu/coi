package com.polus.integration.entity.cleansematch.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CoiEntityOwnershipTypeDto {

	private String ownershipTypeCode;
	private String description;

}
