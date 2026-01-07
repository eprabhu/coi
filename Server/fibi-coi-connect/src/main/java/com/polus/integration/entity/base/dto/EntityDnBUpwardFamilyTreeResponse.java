package com.polus.integration.entity.base.dto;

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
