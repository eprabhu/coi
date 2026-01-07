package com.polus.fibicomp.compliance.declaration.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeclDashboardDTO {

	private List<DeclDashboardResponse> dashboardResponses;

	private Integer totalDeclarationResponse;

}
