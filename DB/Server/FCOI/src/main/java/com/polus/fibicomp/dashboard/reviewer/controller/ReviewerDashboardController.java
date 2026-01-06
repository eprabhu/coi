package com.polus.fibicomp.dashboard.reviewer.controller;

import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.reviewer.dto.OpaUserPreferenceDto;
import com.polus.fibicomp.dashboard.reviewer.services.ReviewerDashboardExport;
import com.polus.fibicomp.dashboard.reviewer.services.ReviewerDashboardService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RequestMapping("/reviewerDashboard")
@RestController
@AllArgsConstructor
@Log4j2
public class ReviewerDashboardController {

    private final ReviewerDashboardService  reviewerDashboardService;
    private final ReviewerDashboardExport reviewerDashboardExport;

    @PostMapping("/fetch")
    public ResponseEntity<?> getReviewerDashboardDetails(@RequestBody DashboardRequest dashboardRequest) {
        log.info("Received request to fetch reviewer dashboard details: {}", dashboardRequest.toString());
        // Implementation to fetch reviewer dashboard details
       return reviewerDashboardService.fetchReviewerDashboardDetails(dashboardRequest);
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportReviewerDashboardDetails(@RequestBody DashboardRequest dashboardRequest) {
        return reviewerDashboardExport.exportReviewerDashboardDetails(dashboardRequest);
    }

    @PostMapping("/units")
    public ResponseEntity<?> getReviewerUnits(@RequestBody DashboardRequest dashboardRequest) {
        log.info("Received request to fetch reviewer units: {}", dashboardRequest.toString());
        // Implementation to fetch reviewer units
       return reviewerDashboardService.fetchReviewerUnits(dashboardRequest);
    }

    @PostMapping("/departmentOverview/fetch")
    public ResponseEntity<?> getDepartmentOverview(@RequestBody DashboardRequest dashboardRequest) {
        log.info("Received request to fetch department overview: {}", dashboardRequest.toString());
        // Implementation to fetch department overview
       return reviewerDashboardService.fetchDepartmentOverviewDashboardDetails(dashboardRequest);
    }

    @GetMapping("/userPreference")
    public ResponseEntity<?> getReviewerDashUserPreference() {
        log.info("Received request to fetch userPreference");
        return reviewerDashboardService.getReviewerDashUserPreference();
    }

    @PostMapping("/userPreference")
    public ResponseEntity<?> saveDefaultOpaUnitByPerson(@RequestBody OpaUserPreferenceDto userPreferenceDto) {
        log.info("Received request to save userPreference");
        return ResponseEntity.ok(reviewerDashboardService.saveDefaultOpaUnitByPerson(userPreferenceDto));
    }

}
