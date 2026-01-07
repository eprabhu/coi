package com.polus.integration.entity.cleansematch.dto;


import lombok.Builder;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Builder
public class EntityFamilyTreeRoleDto {

	private Integer entityFamilyTreeRoleId;
	private Integer entityId;
	private String familyRoleTypeCode;
	private EntityFamilyRoleTypeDto familyRoleType;
	private String updatedBy;
	private Timestamp updateTimestamp;

}
