package com.polus.integration.feedentity.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class EntityResponse {

	private int entityId;
	private String sponsorCode;
	private String organizationId;
	private String sponsorFeedError;
	private String organizationFeedError;
	private Integer rolodexId;

}
