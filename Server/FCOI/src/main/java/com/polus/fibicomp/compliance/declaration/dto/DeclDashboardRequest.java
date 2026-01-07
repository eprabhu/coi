package com.polus.fibicomp.compliance.declaration.dto;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeclDashboardRequest {

	private String personId;

	private Map<String, Object> declarationDashboardData;

}
