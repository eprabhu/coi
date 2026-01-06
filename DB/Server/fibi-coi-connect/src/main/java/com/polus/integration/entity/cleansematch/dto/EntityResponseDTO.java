package com.polus.integration.entity.cleansematch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EntityResponseDTO {

	private CoiEntityDto entityDetails;
	private String originalName;
	private String sponsorCode;
	private String organizationId;
	private List<ForeignNameResponseDTO> foreignNames;

}
