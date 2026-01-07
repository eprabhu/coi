package com.polus.integration.entity.base.dto;

import lombok.Data;

@Data
public class ParentDunsDto {
	private String duns;
	private String primaryName;
    private ParentDunsDto parentDuns;
}