package com.polus.fibicomp.coi.clients.model;

import lombok.Data;

@Data
public class EntityDnBUpwardFamilyTreeResponse {

	private String duns;
	private String primaryName;
	private Object familytreeRolesPlayed;
	private String globalUltimateDuns;
	private String globalUltimatePrimaryName;
	private ParentDunsDto parentDuns;

}
