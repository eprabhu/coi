package com.polus.fibicomp.dashboard.personDisclRequirement.controller;

import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.personDisclRequirement.service.PersonDisclRequirementService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/personDisclRequirementDashboard")
@Log4j2
@AllArgsConstructor
public class PersonDisclRequirementDashCtrl {

    private final PersonDisclRequirementService disclRequirementService;

    @PostMapping("/fetch")
    public ResponseEntity<?> getPersonDisclRequirementDashboardData(@RequestBody DashboardRequest request) {
        log.info("Inside PersonDisclRequirementCtrl#getPersonDisclRequirementDashboardData");
        return ResponseEntity.ok().body(disclRequirementService.getPersonDisclRequirementDashboardData(request));
    }

}
