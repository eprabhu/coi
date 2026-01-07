package com.polus.fibicomp.globalentity.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CorporateFamilyResponseDTO {

	private int entityNumber;
	private int entityId;
	private int parentEntityNumber;
	private int parentEntityId;
	private String entityName;
	private String dunsNumber;
	private String entityType;
	private String country; 
	@Builder.Default
	private List<CorporateFamilyResponseDTO> child = new ArrayList<>();
	private String updatedBy;
	private Boolean isSystemCreated;

}
