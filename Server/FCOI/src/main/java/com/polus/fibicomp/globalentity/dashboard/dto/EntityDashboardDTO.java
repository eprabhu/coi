package com.polus.fibicomp.globalentity.dashboard.dto;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EntityDashboardDTO {

	private String personId;

	private Map<String, Object> entityDashboardData;

}
