package com.polus.fibicomp.cmp.dto;

import lombok.Data;

@Data
public class ProjectSummarySearchRequest {

	private Integer moduleCode;
    private String searchString;

}
