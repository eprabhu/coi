package com.polus.fibicomp.dashboard.common;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DashboardResponseDto {

    private Object dashboardData;
    private Long totalCount;
}
