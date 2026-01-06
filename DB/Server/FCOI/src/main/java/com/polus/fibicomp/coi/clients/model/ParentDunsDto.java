package com.polus.fibicomp.coi.clients.model;

import lombok.Data;

@Data
public class ParentDunsDto {

	private String duns;
	private String primaryName;
	private ParentDunsDto parentDuns;

}
