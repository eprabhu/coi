package com.polus.fibicomp.globalentity.dashboard.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EntityDashboard {

	private List<EntityDashboardResponse> dashboardResponses;
	private Integer totalEntityResponse;

}
