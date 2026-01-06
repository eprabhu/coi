package com.polus.fibicomp.coi.dto;

import java.sql.Timestamp;

import com.polus.fibicomp.coi.pojo.CoiProjConflictStatusType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoiDisclEntProjDetailsDto {

	private Integer coiDisclProjectEntityRelId;
	private Integer coiDisclProjectId;
	private Integer personEntityId;
	private Integer prePersonEntityId;
	private Integer personEntityNumber;
	private Integer entityId;
	private CoiEntityDto coiEntity;
	private String projectConflictStatusCode;
	private CoiProjConflictStatusType coiProjConflictStatusType;
	private String updatedBy;
	private Timestamp updateTimestamp;
	private DisclosureProjectDto project;
	private PersonEntityRelationshipDto personEntity;
	private String personEngagementDetails;

}
