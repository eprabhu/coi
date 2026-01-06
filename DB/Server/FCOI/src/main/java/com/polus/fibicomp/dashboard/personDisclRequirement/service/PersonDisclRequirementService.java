package com.polus.fibicomp.dashboard.personDisclRequirement.service;

import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.personDisclRequirement.dto.PersonDisclRequirementDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface PersonDisclRequirementService {

    /**
     * Get Person Disclosure Requirement Dashboard Data
     * @param request
     * @return
     */
    DashboardResponseDto getPersonDisclRequirementDashboardData(DashboardRequest request);

    /**
     * Get Person Disclosure Requirement Data
     * @param personId
     * @return
     */
    PersonDisclRequirementDto getPersonDisclRequirementData(String personId);

    /**
     * Get Person Disclosure Requirement By Search
     * @param dashboardRequest
     * @return
     */
    List<PersonDisclRequirementDto> getOPAPersonBySearch(DashboardRequest dashboardRequest);

    /**
     * Update Person Disclosure Requirement
     * @param personDisclRequirementDto
     * @return
     */
    ResponseEntity<?> updatePersonDisclRequirement(PersonDisclRequirementDto personDisclRequirementDto);

    /**
     * Get Person Disclosure Requirement History
     * @param personId
     * @return
     */
    List<PersonDisclRequirementDto> getPersonDisclRequirementHistory(String personId);
}
