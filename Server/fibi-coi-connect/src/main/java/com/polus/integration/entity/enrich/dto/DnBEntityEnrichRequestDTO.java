package com.polus.integration.entity.enrich.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DnBEntityEnrichRequestDTO {
	
	private String duns;
	
	private Integer entityId;
	
	private String actionPersonId;
	
	private List<String> datablock;

	private Boolean fromFeed;

}