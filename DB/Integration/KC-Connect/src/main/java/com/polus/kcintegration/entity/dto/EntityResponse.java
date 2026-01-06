package com.polus.kcintegration.entity.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EntityResponse {

	private int entityId;
	private String sponsorCode;
	private String organizationId;
	private String sponsorFeedError;
	private String organizationFeedError;
	private Integer rolodexId;

}
