package com.polus.fibicomp.dashboard.common;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Data
public class DashboardRequest {

    private String personId;
    private Map<String, Object> dashboardData;
    private Integer moduleCode;
    private String fetchType;
    private Boolean isCountNeeded;
    private String searchString;
    private String unitNumber;
    private Boolean includeChildUnits;
}
