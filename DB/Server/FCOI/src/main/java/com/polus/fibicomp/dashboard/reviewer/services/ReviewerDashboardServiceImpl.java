package com.polus.fibicomp.dashboard.reviewer.services;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.login.vo.LoginVO;
import com.polus.core.person.pojo.PersonPreference;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.reviewer.dao.ReviewerDashboardDao;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.reviewer.dto.OpaUserPreferenceDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Log4j2
@AllArgsConstructor
@Transactional
public class ReviewerDashboardServiceImpl implements ReviewerDashboardService {

    private final ReviewerDashboardDao reviewerDashboardDao;
    private final CommonDao commonDao;

    private static final String DASHBOARD_FETCH_TYPE = "HEADER";
    private static final String IS_COUNT_NEEDED = "IS_COUNT";
    private static final String FETCH_TYPE = "FETCH_TYPE";
    private static final String MODULE_CODE = "MODULE_CODE";

    @Override
    public ResponseEntity<Object> fetchReviewerDashboardDetails(DashboardRequest dashboardRequest) {
        log.info("Fetching reviewer dashboard details for request: {}", dashboardRequest.toString());
        DashboardResponseDto.DashboardResponseDtoBuilder response = DashboardResponseDto.builder();
        dashboardRequest.getDashboardData().put(FETCH_TYPE, dashboardRequest.getFetchType());
        dashboardRequest.getDashboardData().put(MODULE_CODE, dashboardRequest.getModuleCode());
        if (!dashboardRequest.getFetchType().equalsIgnoreCase(DASHBOARD_FETCH_TYPE) && dashboardRequest.getIsCountNeeded() != null && dashboardRequest.getIsCountNeeded()) {
            log.info("Count needed for detailed fetch, setting fetchType to HEADER");
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, true);
            DashboardResponseDto totalCount = reviewerDashboardDao.fetchReviewerDashboardDetails(dashboardRequest);
            response.totalCount(totalCount.getTotalCount());
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, false);
        }
        response.dashboardData(reviewerDashboardDao.fetchReviewerDashboardDetails(dashboardRequest).getDashboardData());
        return ResponseEntity.ok(response.build());
    }

    @Override
    public ResponseEntity<?> fetchReviewerUnits(DashboardRequest dashboardRequest) {
        return ResponseEntity.ok(reviewerDashboardDao.fetchReviewerUnits(dashboardRequest));
    }

    @Override
    public ResponseEntity<?> fetchDepartmentOverviewDashboardDetails(DashboardRequest dashboardRequest) {
        DashboardResponseDto.DashboardResponseDtoBuilder response = DashboardResponseDto.builder();
        if (dashboardRequest.getIsCountNeeded() != null && dashboardRequest.getIsCountNeeded()) {
            log.info("Count needed for detailed fetch, setting fetchType to HEADER");
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, true);
            DashboardResponseDto totalCount = reviewerDashboardDao.fetchDepartmentOverviewDashboardDetails(dashboardRequest);
            response.totalCount(totalCount.getTotalCount());
            dashboardRequest.getDashboardData().put(IS_COUNT_NEEDED, false);
            dashboardRequest.setIsCountNeeded(false);
        }
        response.dashboardData(reviewerDashboardDao.fetchDepartmentOverviewDashboardDetails(dashboardRequest).getDashboardData());
        return ResponseEntity.ok(response.build());
    }

    @Override
    public ResponseEntity<?> getReviewerDashUserPreference() {
        List<PersonPreference> userPreferences = commonDao.getPersonPreference(AuthenticatedUser.getLoginPersonId(), getPreferenceTypeCodes());
        Optional<String> preferenceValue = userPreferences.stream()
                .filter(pref -> Constants.PREFERENCE_TYPE_CODE_DEFAULT_REW_DASH_UNIT.equals(pref.getPreferencesTypeCode()))
                .map(PersonPreference::getValue)
                .filter(Objects::nonNull)
                .findFirst();
        OpaUserPreferenceDto.OpaUserPreferenceDtoBuilder opaUserPrebuilder = OpaUserPreferenceDto.builder();
        opaUserPrebuilder.personPreferences(userPreferences);
        if (preferenceValue.isPresent()) {
            opaUserPrebuilder.unitDisplyName(commonDao.getUnitName(preferenceValue.get()));
        }
        return ResponseEntity.ok(opaUserPrebuilder.build());
    }

    private List<String> getPreferenceTypeCodes() {
        List<String> preferenceTypeCodes = new ArrayList<>();
        preferenceTypeCodes.add(Constants.PREFERENCE_TYPE_CODE_DEFAULT_REW_DASH_CHILD_UNIT);
        preferenceTypeCodes.add(Constants.PREFERENCE_TYPE_CODE_DEFAULT_REW_DASH_UNIT);
        return preferenceTypeCodes;
    }

    @Override
    public String saveDefaultOpaUnitByPerson(OpaUserPreferenceDto userPreferenceDto) {
        String personId = AuthenticatedUser.getLoginPersonId();
        for(PersonPreference personPreference : userPreferenceDto.getPersonPreferences()) {
            personPreference.setUpdateTimestamp(commonDao.getCurrentTimestamp());
            personPreference.setUpdateUser(AuthenticatedUser.getLoginUserName());
            commonDao.saveOrUpdatePreference(personPreference);
        }
        userPreferenceDto.setPersonPreferences(commonDao.getPersonPreference(personId, getPreferenceTypeCodes()));
        return commonDao.convertObjectToJSON(userPreferenceDto);
    }
}
