package com.polus.fibicomp.globalentity.dto;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CorporateFamilyRequestDTO {

	private Integer entityId;
	private Integer entityNumber;
	private String dunsNumber;
	private Integer parentEntityId;
	private Integer parentEntityNumber;
	private Integer guEntityId;
	private Integer hierarchyLevel;
	private List<String> roleTypeCodes;
	private String roleTypeCode;
	private String updatedBy;
	private Timestamp updateTimestamp;
	private Integer guEntityNumber;
	private Boolean isSystemCreated;
	private Boolean isForeign;
	private Integer currentEntityId;
	private Integer currentEntityNumber;
	private List<EntityFamilyTreeRole> entityFamilyTreeRoles;

}
