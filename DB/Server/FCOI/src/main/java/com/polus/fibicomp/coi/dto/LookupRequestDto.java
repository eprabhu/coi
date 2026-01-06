package com.polus.fibicomp.coi.dto;

import lombok.Data;

@Data
public class LookupRequestDto {

	private String lookupTableName;
	private String lookupTableColumnName;
	private String isActive;

}
