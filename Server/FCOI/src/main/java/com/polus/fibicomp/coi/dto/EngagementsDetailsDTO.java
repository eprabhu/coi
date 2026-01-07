package com.polus.fibicomp.coi.dto;

import com.polus.fibicomp.coi.pojo.PersonEntityRelationship;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EngagementsDetailsDTO {

	private Integer perEntDisclTypeSelectedId;

	private Integer personEntityId;

	private PersonEntityRelationship personEntityRelationship;

	private PersonEntityDto personEntityDto;

	private PersonEntityDto updatePersonEntityDto;

	private Boolean isEngagementCompensated = Boolean.FALSE;

	private Boolean isSystemCreated;

	private Boolean isMandatoryFieldsComplete;

	private Boolean isCommitment;

	private Boolean isModifyingCommitmentRel;

}
