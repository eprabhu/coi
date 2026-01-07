package com.polus.fibicomp.dashboard.personDisclRequirement.dao;

import com.polus.fibicomp.coi.pojo.PersonDisclRequirement;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.personDisclRequirement.dto.PersonDisclRequirementDto;

import java.util.List;

public interface PersonDisclRequirementDao {

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
     * Get Person Disclosure Requirement By Search Keyword
     * @param dashboardRequest
     * @return
     */
    List<PersonDisclRequirementDto> getOPAPersonBySearch(DashboardRequest dashboardRequest);

    /**
     * Find Person Disclosure Requirement By Id
     * @param personDisclRequirementId
     * @return
     */
    PersonDisclRequirement findPersonDisclRequirementById(Integer personDisclRequirementId);

    /**
     * Save Or Update Person Disclosure Requirement
     * @param personDisclRequirement
     */
    void saveOrUpdatePersonDisclRequirement(PersonDisclRequirement personDisclRequirement);

    /**
     * Get Person Disclosure Requirement History
     * @param personId
     * @return
     */
    List<PersonDisclRequirementDto> getPersonDisclRequirementHistory(String personId);
}
