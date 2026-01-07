package com.polus.fibicomp.dashboard.personDisclRequirement.controller;

import com.polus.core.roles.service.AuthorizationService;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.pojo.PersonDisclRequirement;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.personDisclRequirement.dto.PersonDisclRequirementDto;
import com.polus.fibicomp.dashboard.personDisclRequirement.service.PersonDisclRequirementService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/personDisclRequirement")
@Log4j2
@AllArgsConstructor
public class PersonDisclRequirementCtrl {

    private final PersonDisclRequirementService disclRequirementService;

    @GetMapping("/{personId}")
    public ResponseEntity<?> getPersonDisclRequirementData(@PathVariable String personId) {
        log.info("Inside PersonDisclRequirementCtrl#getPersonDisclRequirementData");
        return ResponseEntity.ok().body(disclRequirementService.getPersonDisclRequirementData(personId));
    }

    @PostMapping("/opaPersonSearch")
    public ResponseEntity<?> getOPAPersonBySearch(@RequestBody DashboardRequest dashboardRequest) {
        log.info("Inside PersonDisclRequirementCtrl#getOPAPersonBySearch");
        return ResponseEntity.ok().body(disclRequirementService.getOPAPersonBySearch(dashboardRequest));
    }

    @PutMapping
    public ResponseEntity<?> updatePersonDisclRequirement(@RequestBody PersonDisclRequirementDto personDisclRequirementDto) {
        log.info("Inside PersonDisclRequirementCtrl#updatePersonDisclRequirement");
        return disclRequirementService.updatePersonDisclRequirement(personDisclRequirementDto);
    }

    @GetMapping("/history/{personId}")
    public ResponseEntity<?> getPersonDisclRequirementHistory(@PathVariable String personId) {
        log.info("Inside PersonDisclRequirementCtrl#getPersonDisclRequirementHistory");
        return ResponseEntity.ok().body(disclRequirementService.getPersonDisclRequirementHistory(personId));
    }
}
