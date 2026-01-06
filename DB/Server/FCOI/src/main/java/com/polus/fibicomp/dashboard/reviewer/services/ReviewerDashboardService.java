package com.polus.fibicomp.dashboard.reviewer.services;

import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.reviewer.dto.OpaUserPreferenceDto;
import org.springframework.http.ResponseEntity;

public interface ReviewerDashboardService {

    /**
     * Fetch Reviewer Dashboard Details
     *
     * @param dashboardRequest
     * @return ResponseEntity with dashboard details/count
     */
    ResponseEntity<?> fetchReviewerDashboardDetails(DashboardRequest dashboardRequest);

    /**
     * Fetch Reviewer Units
     *
     * @param dashboardRequest
     * @return ResponseEntity with reviewer units details/count
     */
    ResponseEntity<?> fetchReviewerUnits(DashboardRequest dashboardRequest);

    /**
     * Fetch Department Overview Dashboard Details
     * @param dashboardRequest
     * @return
     */
    ResponseEntity<?> fetchDepartmentOverviewDashboardDetails(DashboardRequest dashboardRequest);

    /**
     *
     * @return
     */
    ResponseEntity<?> getReviewerDashUserPreference();

    /**
     *
     * @param userPreferenceDto
     * @return
     */
    String saveDefaultOpaUnitByPerson(OpaUserPreferenceDto userPreferenceDto);

}
