package com.polus.fibicomp.dashboard.reviewer.dao;

import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.common.UnitDto;

import java.util.List;

public interface ReviewerDashboardDao {

    /**
     * Fetch Reviewer Dashboard Details
     * @param dashboardRequest
     * @return
     */
    DashboardResponseDto fetchReviewerDashboardDetails(DashboardRequest dashboardRequest);

    /**
     * Fetch Reviewer Units
     * @param dashboardRequest
     * @return List of UnitDto
     */
    List<UnitDto> fetchReviewerUnits(DashboardRequest dashboardRequest);

    /**
     * Fetch Department Overview Dashboard Details
     * @param dashboardRequest
     * @return
     */
    DashboardResponseDto fetchDepartmentOverviewDashboardDetails(DashboardRequest dashboardRequest);
}
