package com.polus.fibicomp.dashboard.personDisclRequirement.service;

import com.fasterxml.jackson.databind.util.BeanUtil;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.roles.service.AuthorizationService;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.pojo.PersonDisclRequirement;
import com.polus.fibicomp.constants.ActionTypes;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.constants.StaticPlaceholders;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.personDisclRequirement.dao.PersonDisclRequirementDao;
import com.polus.fibicomp.dashboard.personDisclRequirement.dto.PersonDisclRequirementDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Log4j2
@AllArgsConstructor
public class PersonDisclRequirementServiceImpl implements PersonDisclRequirementService {

    private static final String IS_COUNT_NEEDED = "IS_COUNT";

    private final PersonDisclRequirementDao disclRequirementDao;
    private final CommonDao commonDao;
    private final AuthorizationService authorizationService;

    private final String MAINTAIN_OPA_ELIGIBILITY_RIGHT = "MAINTAIN_OPA_ELIGIBILITY";
    private final String VIEW_OPA_ELIGIBILITY_RIGHT = "VIEW_OPA_ELIGIBILITY";

    @Override
    public DashboardResponseDto getPersonDisclRequirementDashboardData(DashboardRequest dashboardRequest) {
        log.info("Inside PersonDisclRequirementServiceImpl#getPersonDisclRequirementDashboardData");
        DashboardResponseDto.DashboardResponseDtoBuilder response = DashboardResponseDto.builder();
        if (dashboardRequest.getIsCountNeeded() != null && dashboardRequest.getIsCountNeeded()) {
            log.info("Count needed for detailed fetch");
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, true);
            DashboardResponseDto totalCount = disclRequirementDao.getPersonDisclRequirementDashboardData(dashboardRequest);
            response.totalCount(totalCount.getTotalCount());
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, false);
            dashboardRequest.setIsCountNeeded(false);
        }
        response.dashboardData(disclRequirementDao.getPersonDisclRequirementDashboardData(dashboardRequest).getDashboardData());
        return response.build();
    }

    @Override
    public PersonDisclRequirementDto getPersonDisclRequirementData(String personId) {
        PersonDisclRequirementDto personDisclRequirement = disclRequirementDao.getPersonDisclRequirementData(personId);
        PersonDisclRequirementDto personDisclRequirementDto = new PersonDisclRequirementDto();
        personDisclRequirementDto.setCanView(false);
        personDisclRequirementDto.setCanEdit(false);
        if (authorizationService.isPersonHasRightInDepartment(MAINTAIN_OPA_ELIGIBILITY_RIGHT,
                AuthenticatedUser.getLoginPersonId(), personDisclRequirement.getUnitNumber())) {
            BeanUtils.copyProperties(personDisclRequirement, personDisclRequirementDto, "canView", "canEdit");
            personDisclRequirementDto.setCanEdit(true);
        }
        if (authorizationService.isPersonHasRightInDepartment(VIEW_OPA_ELIGIBILITY_RIGHT,
                AuthenticatedUser.getLoginPersonId(), personDisclRequirement.getUnitNumber())) {
            BeanUtils.copyProperties(personDisclRequirement, personDisclRequirementDto, "canView", "canEdit");
            personDisclRequirementDto.setCanView(true);
        }
        return personDisclRequirementDto;
    }

    @Override
    public List<PersonDisclRequirementDto> getOPAPersonBySearch(DashboardRequest dashboardRequest) {
        return disclRequirementDao.getOPAPersonBySearch(dashboardRequest);
    }

    @Override
    public ResponseEntity<?> updatePersonDisclRequirement(PersonDisclRequirementDto personDisclRequirementDto) {
        PersonDisclRequirement personDisclRequirement = disclRequirementDao.findPersonDisclRequirementById(personDisclRequirementDto.getPersonDisclRequirementId());
        if(!authorizationService.isPersonHasRightInDepartment(MAINTAIN_OPA_ELIGIBILITY_RIGHT, AuthenticatedUser.getLoginPersonId(), personDisclRequirement.getPerson().getHomeUnit())) {
            return new ResponseEntity<>("Not Authorized to Edit this record!", HttpStatus.FORBIDDEN);
        }
        if (Objects.equals(personDisclRequirementDto.getCreateOpaAdminForceAllowed(), personDisclRequirement.getCreateOpaAdminForceAllowed())
                && Objects.equals(personDisclRequirementDto.getIsExemptFromOPA(), personDisclRequirement.getIsExempFromOpa())
                && Objects.equals(personDisclRequirementDto.getOpaExemptFromDate(), personDisclRequirement.getOpaExemptFromDate())
                && Objects.equals(personDisclRequirementDto.getOpaExemptToDate(), personDisclRequirement.getOpaExemptToDate())) {
            log.info("No changes in CreateOpaAdminForceAllowed and IsExempFromOpa fields. No update needed.");
            return ResponseEntity.ok(personDisclRequirementDto);
        }
        PersonDisclRequirement personDisclRequirementNew = new PersonDisclRequirement();
        BeanUtils.copyProperties(personDisclRequirement, personDisclRequirementNew);
        personDisclRequirement.setVersionStatus(Constants.COI_ARCHIVE_STATUS);
        personDisclRequirementNew.setPersonDisclRequirementId(null);
        personDisclRequirementNew.setIsExempFromOpa(personDisclRequirementDto.getIsExemptFromOPA());
        personDisclRequirementNew.setCreateOpaAdminForceAllowed(personDisclRequirementDto.getCreateOpaAdminForceAllowed());
        personDisclRequirementNew.setOpaExemptionReason(personDisclRequirementDto.getOpaExemptionReason());
        personDisclRequirementNew.setOpaExemptFromDate(personDisclRequirementDto.getOpaExemptFromDate());
        personDisclRequirementNew.setOpaExemptToDate(personDisclRequirementDto.getOpaExemptToDate());
        personDisclRequirementNew.setUpdatedBy(AuthenticatedUser.getLoginPersonId());
        personDisclRequirementNew.setUpdateTimestamp(commonDao.getCurrentTimestamp());
        personDisclRequirementNew.setVersionNumber(personDisclRequirement.getVersionNumber() + 1);
        disclRequirementDao.saveOrUpdatePersonDisclRequirement(personDisclRequirementNew);
        personDisclRequirementDto.setPersonDisclRequirementId(personDisclRequirementNew.getPersonDisclRequirementId());
        return ResponseEntity.ok(personDisclRequirementDto);
    }

    @Override
    public List<PersonDisclRequirementDto> getPersonDisclRequirementHistory(String personId) {
        return disclRequirementDao.getPersonDisclRequirementHistory(personId);
    }

}
