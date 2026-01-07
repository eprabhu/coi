package com.polus.fibicomp.dashboard.reviewer.services;

import com.polus.fibicomp.dashboard.common.DashboardRequest;
import org.springframework.http.ResponseEntity;

public interface ReviewerDashboardExport {

    /**
     * Export Reviewer Dashboard Details
     * @param dashboardRequest
     * @return
     */
    ResponseEntity<byte[]> exportReviewerDashboardDetails(DashboardRequest dashboardRequest);
}
