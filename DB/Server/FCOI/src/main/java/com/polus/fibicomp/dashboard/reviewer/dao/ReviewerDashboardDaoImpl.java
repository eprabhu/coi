package com.polus.fibicomp.dashboard.reviewer.dao;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.pojo.Unit;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.CoiTravelDashboardDto;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.common.UnitDto;
import com.polus.fibicomp.dashboard.reviewer.constants.Constants;
import com.polus.fibicomp.dashboard.reviewer.dto.DepartmentOverviewDto;
import com.polus.fibicomp.dashboard.reviewer.dto.FCOIDisclosureDto;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import com.polus.fibicomp.opa.dto.OPADashboardDto;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.StoredProcedureQuery;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@Log4j2
@AllArgsConstructor
@Transactional
public class ReviewerDashboardDaoImpl implements ReviewerDashboardDao {

    private final HibernateTemplate hibernateTemplate;
    private final CommonDao commonDao;
    private final FcoiDisclosureDao fcoiDisclosureDao;
    private EntityManager entityManager;

    @Override
    public DashboardResponseDto fetchReviewerDashboardDetails(DashboardRequest dashboardRequest) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet resultSet = null;
        DashboardResponseDto.DashboardResponseDtoBuilder response = DashboardResponseDto.builder();
        try {
            statement = connection.prepareCall("{call REVIEWER_DASHBOARD_OVERVIEW(?,?)}");
            String dashBoardData = commonDao.convertObjectToJSON(dashboardRequest.getDashboardData());
            log.info("dashBoardData : {}", dashBoardData);
            statement.setString(1, AuthenticatedUser.getLoginPersonId());
            statement.setString(2, dashBoardData);
            boolean hasResultSet = statement.execute();
            if (!hasResultSet) {
                throw new ApplicationException("No data found", CoreConstants.DB_PROC_ERROR);
            }
            resultSet = statement.getResultSet();
            ResultSetMetaData metaData = resultSet.getMetaData();
            int columnCount = metaData.getColumnCount();

            if (columnCount == 1 && dashboardRequest.getIsCountNeeded() && !dashboardRequest.getFetchType().equalsIgnoreCase(Constants.DASHBOARD_FETCH_TYPE_HEADER)) {
                if (resultSet.next()) {
                    response.totalCount(resultSet.getLong("TOTAL_COUNT"));
                }
            }
            if (!dashboardRequest.getFetchType().equalsIgnoreCase(Constants.DASHBOARD_FETCH_TYPE_HEADER)) {
                if (dashboardRequest.getModuleCode().equals(com.polus.fibicomp.constants.Constants.COI_MODULE_CODE)) {
                    response.dashboardData(getFCOIReviewerDashboardDetails(resultSet));
                } else if (dashboardRequest.getModuleCode().equals(com.polus.fibicomp.constants.Constants.OPA_MODULE_CODE)) {
                    response.dashboardData(getOPAReviewerDashboardDetails(resultSet));
                } else if (dashboardRequest.getModuleCode().equals(com.polus.fibicomp.constants.Constants.TRAVEL_MODULE_CODE)) {
                    response.dashboardData(getTravelDisclosureDetails(resultSet));
                } else {
                    throw new ApplicationException("Invalid module code", CoreConstants.DB_PROC_ERROR);
                }
            } else if (dashboardRequest.getFetchType().equalsIgnoreCase(Constants.DASHBOARD_FETCH_TYPE_HEADER)) {
                if (resultSet.next()) {
                    response.dashboardData(fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString(Constants.DASHBOARD_FETCH_TYPE_HEADER)));
                }
            } else {
                List<Map<String, Object>> resultList = new ArrayList<>();
                while (resultSet.next()) {
                    Map<String, Object> rowMap = new LinkedHashMap<>();
                    for (int i = 1; i <= columnCount; i++) {
                        String columnName = metaData.getColumnLabel(i);
                        Object columnValue = resultSet.getObject(i);
                        if (columnValue instanceof LocalDateTime) {
                            columnValue = Timestamp.valueOf((LocalDateTime) columnValue);
                        }
                        rowMap.put(columnName, columnValue);
                    }
                    resultList.add(rowMap);
                }
                response.dashboardData(resultList);
            }

        } catch (Exception e) {
            log.error("Exception in fetchReviewerDashboardDetails", e);
            throw new ApplicationException("Exception in fetchReviewerDashboardDetails", e, CoreConstants.DB_PROC_ERROR);
        } finally {
            try {
                if (resultSet != null) {
                    resultSet.close();
                }
                if (statement != null) {
                    statement.close();
                }
            } catch (Exception e) {
                log.error("Exception while closing resources in fetchReviewerDashboardDetails", e);
                throw new ApplicationException("Exception while closing resources in fetchReviewerDashboardDetails", e, CoreConstants.JAVA_ERROR);
            }
        }
        return response.build();
    }

    private List<FCOIDisclosureDto> getFCOIReviewerDashboardDetails(ResultSet resultSet) throws SQLException {
        List<FCOIDisclosureDto> fcoiDisclosures = new ArrayList<>();
        while (resultSet.next()) {
            Unit unit = new Unit();
            unit.setUnitNumber(resultSet.getString("HOME_UNIT"));
            unit.setUnitName(resultSet.getString("HOME_UNIT_NAME"));
            unit.setOrganizationId(resultSet.getString("ORGANIZATION_ID"));
            unit.setParentUnitNumber(resultSet.getString("PARENT_UNIT_NUMBER"));
            unit.setAcronym(resultSet.getString("ACRONYM"));
            unit.setIsFundingUnit(resultSet.getString("IS_FUNDING_UNIT"));
            String reviewers = resultSet.getString("REVIEWERS");
            List<List<String>> reviewerList = new ArrayList<>();
            if (reviewers != null && !reviewers.isEmpty()) {
                String[] reviewerArray = reviewers.split(";");
                Arrays.stream(reviewerArray)
                        .forEach(reviewer -> {
                            List<String> subList = Arrays.stream(reviewer.split(":"))
                                    .map(String::trim)
                                    .collect(Collectors.toList());
                            reviewerList.add(subList);
                        });
            }
            List<Map<Object, Object>> engRelationships = fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString("ENG_RELATIONSHIPS"));
            List<CoiDisclosureType> coiDisclosureTypes = new ArrayList<>();
            if (engRelationships != null && !engRelationships.isEmpty()) {
                for (Map<Object, Object> map : engRelationships) {
                    CoiDisclosureType coiDisclosureType = new CoiDisclosureType();
                    coiDisclosureType.setDisclosureTypeCode((String) map.get("DISCLOSURE_TYPE_CODE"));
                    coiDisclosureType.setDescription((String) map.get("DESCRIPTION"));
                    coiDisclosureTypes.add(coiDisclosureType);
                }
            }
            FCOIDisclosureDto fcoiDisclosure = FCOIDisclosureDto.builder()
                    .coiDisclosureId(resultSet.getInt("DISCLOSURE_ID"))
                    .coiDisclosureNumber(resultSet.getString("DISCLOSURE_NUMBER"))
                    .disclosurePersonFullName(resultSet.getString("DISCLOSURE_PERSON_FULL_NAME"))
                    .conflictStatusCode(resultSet.getString("CONFLICT_STATUS_CODE"))
                    .conflictStatus(resultSet.getString("DISCLOSURE_STATUS"))
                    .dispositionStatusCode(resultSet.getString("DISPOSITION_STATUS_CODE"))
                    .dispositionStatus(resultSet.getString("DISPOSITION_STATUS"))
                    .fcoiTypeCode(resultSet.getString("FCOI_TYPE_CODE"))
                    .fcoiType(resultSet.getString("DISCLOSURE_CATEGORY_TYPE"))
                    .reviewStatusCode(resultSet.getString("REVIEW_STATUS_CODE"))
                    .reviewStatus(resultSet.getString("EXPIRATION_DATE"))
                    .reviewStatus(resultSet.getString("REVIEW_STATUS"))
                    .lastApprovedVersion(resultSet.getInt("LAST_APPROVED_VERSION"))
                    .lastApprovedVersionDate(resultSet.getTimestamp("LAST_APPROVED_DATE"))
                    .versionStatus(resultSet.getString("VERSION_STATUS"))
                    .disclosureVersionNumber(resultSet.getInt("VERSION_NUMBER"))
                    .updateTimeStamp(resultSet.getTimestamp("UPDATE_TIMESTAMP"))
                    .updateUser(resultSet.getString("UPDATE_USER_FULL_NAME"))
                    .personId(resultSet.getString("PERSON_ID"))
                    .expirationDate(resultSet.getTimestamp("EXPIRATION_DATE"))
                    .certifiedAt(resultSet.getTimestamp("CERTIFIED_AT"))
                    .noOfSfi(resultSet.getInt("NO_OF_SFI"))
                    .projectCount(fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString("PROJECT_COUNT")))
                    .projectNumber(resultSet.getString("PROJECT_NUMBER"))
                    .projectTitle(resultSet.getString("PROJECT_TITLE"))
                    .projectBadgeColor(resultSet.getString("BADGE_COLOR"))
                    .projectIcon(resultSet.getString("PROJECT_ICON"))
                    .projectType(resultSet.getString("COI_PROJECT_TYPE"))
                    .coiProjectTypeCode(resultSet.getString("COI_PROJECT_TYPE_CODE"))
                    .disclosureAttachmentCount(resultSet.getInt("DISCLOSURE_ATTACHMENT_COUNT"))
                    .reviewerList(reviewerList)
                    .unit(unit)
                    .adminGroupName(resultSet.getString("ADMIN_GROUP_NAME"))
                    .administrator(resultSet.getString("ADMINISTRATOR"))
                    .isExtended(resultSet.getString("IS_EXTENDED") != null && resultSet.getString("IS_EXTENDED").equals("Y")
                            ? Boolean.TRUE
                            : Boolean.FALSE)
                    .commentCount(resultSet.getInt("DISCLOSURE_COMMENT_COUNT"))
                    .isHomeUnitSubmission((resultSet.getString("UNIT_ACCESS_TYPE") != null
                            && resultSet.getString("UNIT_ACCESS_TYPE").equals("HOME_UNIT")) ? Boolean.TRUE : Boolean.FALSE)
                    .adminPersonId(resultSet.getString("ADMINISTRATOR_PERSON_ID"))
                    .coiDisclosureTypes(coiDisclosureTypes)
                    .existingDisclosures(fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString("EXISTING_DISCLOSURES"))).build();
            fcoiDisclosures.add(fcoiDisclosure);
        }
        return fcoiDisclosures;
    }

    private List<OPADashboardDto> getOPAReviewerDashboardDetails(ResultSet rset) throws SQLException {
        List<OPADashboardDto> opaDashboardDtos = new ArrayList<>();
        while (rset.next()) {
            String reviewers = rset.getString("REVIEWERS");
            List<List<String>> reviewerList = new ArrayList<>();
            if (reviewers != null && !reviewers.isEmpty()) {
                String[] reviewerArray = reviewers.split(";");
                Arrays.stream(reviewerArray)
                        .forEach(reviewer -> {
                            List<String> subList = Arrays.stream(reviewer.split(":"))
                                    .map(String::trim)
                                    .collect(Collectors.toList());
                            reviewerList.add(subList);
                        });
            }
            List<Map<Object, Object>> engRelationships = fcoiDisclosureDao.convertJsonStringToListMap(rset.getString("ENG_RELATIONSHIPS"));
            List<CoiDisclosureType> coiDisclosureTypes = new ArrayList<>();
            if (engRelationships != null && !engRelationships.isEmpty()) {
                for (Map<Object, Object> map : engRelationships) {
                    CoiDisclosureType coiDisclosureType = new CoiDisclosureType();
                    coiDisclosureType.setDisclosureTypeCode((String) map.get("DISCLOSURE_TYPE_CODE"));
                    coiDisclosureType.setDescription((String) map.get("DESCRIPTION"));
                    coiDisclosureTypes.add(coiDisclosureType);
                }
            }
            opaDashboardDtos.add(
                    OPADashboardDto.builder()
                            .coiDisclosureTypes(coiDisclosureTypes)
                            .opaDisclosureId(rset.getInt("OPA_DISCLOSURE_ID"))
                            .opaDisclosureNumber(rset.getString("OPA_DISCLOSURE_NUMBER"))
                            .opaCycleNumber(rset.getInt("OPA_CYCLE_NUMBER"))
                            .periodStartDate(rset.getDate("PERIOD_START_DATE"))
                            .periodEndDate(rset.getDate("PERIOD_END_DATE"))
                            .opaCycleStatus(rset.getBoolean("OPA_CYCLE_STATUS"))
                            .openDate(rset.getDate("OPEN_DATE"))
                            .closeDate(rset.getDate("CLOSE_DATE"))
                            .personName(rset.getString("DISCLOSURE_PERSON_FULL_NAME"))
                            .homeUnitName(rset.getString("UNIT_NAME"))
                            .homeUnit(rset.getString("UNIT_NUMBER"))
                            .isFaculty(rset.getBoolean("IS_FACULTY"))
                            .isFallSabatical(rset.getBoolean("IS_FALL_SABATICAL"))
                            .isSpringSabatical(rset.getBoolean("IS_SPRING_SABATICAL"))
                            .receivedSummerComp(rset.getBoolean("RECEIVED_SUMMER_COMP"))
                            .summerCompMonths(rset.getBigDecimal("SUMMER_COMP_MONTHS"))
                            .hasPotentialConflict(rset.getBoolean("HAS_POTENTIAL_CONFLICT"))
                            .conflictDescription(rset.getString("CONFLICT_DESCRIPTION"))
                            .createTimestamp(rset.getTimestamp("CREATE_TIMESTAMP"))
                            .createUser(rset.getString("CREATE_USER"))
                            .submissionTimestamp(rset.getTimestamp("CERTIFIED_AT"))
                            .reviewStatusCode(rset.getString("REVIEW_STATUS_CODE"))
                            .dispositionStatusCode(rset.getString("DISPOSITION_STATUS_CODE"))
                            .dispositionStatus(rset.getString("DISPOSITION_STATUS"))
                            .reviewStatus(rset.getString("REVIEW_STATUS"))
                            .updateTimeStamp(rset.getTimestamp("UPDATE_TIMESTAMP"))
                            .updatedBy(rset.getString("UPDATED_BY"))
                            .updateUserFullName(rset.getString("UPDATE_USER_FULL_NAME"))
                            .adminPersonName(rset.getString("ADMIN_FULL_NAME"))
                            .adminGroupName(rset.getString("ADMIN_GROUP_NAME"))
                            .personId(rset.getString("PERSON_ID"))
                            .reviewers(reviewerList)
                            .commentCount(rset.getInt("DISCLOSURE_COMMENT_COUNT"))
                            .versionNumber(rset.getInt("VERSION_NUMBER"))
                            .versionStatus(rset.getString("VERSION_STATUS"))
                            .expirationDate(rset.getTimestamp("EXPIRATION_DATE"))
                            .unitDisplayName(rset.getString("DISPLAY_NAME"))
                            .noOfSfi(rset.getInt("NO_OF_SFI"))
                            .isHomeUnitSubmission((rset.getString("UNIT_ACCESS_TYPE") != null
                                    && rset.getString("UNIT_ACCESS_TYPE").equals("HOME_UNIT")) ? Boolean.TRUE
                                    : Boolean.FALSE)
                            .existingDisclosures(fcoiDisclosureDao.convertJsonStringToListMap(rset.getString("EXISTING_DISCLOSURES")))
                            .build()
            );
        }
        return opaDashboardDtos;
    }

    private List<CoiTravelDashboardDto> getTravelDisclosureDetails(ResultSet resultSet) throws SQLException {
        List<CoiTravelDashboardDto> travelDashboardDtos = new ArrayList<>();
        while (resultSet.next()) {
            List<Map<Object, Object>> engRelationships = fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString("ENG_RELATIONSHIPS"));
            List<CoiDisclosureType> coiDisclosureTypes = new ArrayList<>();
            if (engRelationships != null && !engRelationships.isEmpty()) {
                for (Map<Object, Object> map : engRelationships) {
                    CoiDisclosureType coiDisclosureType = new CoiDisclosureType();
                    coiDisclosureType.setDisclosureTypeCode((String) map.get("DISCLOSURE_TYPE_CODE"));
                    coiDisclosureType.setDescription((String) map.get("DESCRIPTION"));
                    coiDisclosureTypes.add(coiDisclosureType);
                }
            }
            CoiTravelDashboardDto travelDashboardDto = new CoiTravelDashboardDto();
            travelDashboardDto.setCoiDisclosureTypes(coiDisclosureTypes);
            travelDashboardDto.setTravelDisclosureId(resultSet.getInt("TRAVEL_DISCLOSURE_ID"));
            travelDashboardDto.setTravellerName(resultSet.getString("TRAVELLER_NAME"));
            travelDashboardDto.setTravelNumber(resultSet.getInt("TRAVEL_NUMBER"));
            travelDashboardDto.setTravellerTypeDescription(resultSet.getString("TRAVELER_TYPE_DESCRIPTION"));
            travelDashboardDto.setTravelEntityName(resultSet.getString("TRAVEL_ENTITY_NAME"));

            travelDashboardDto.setTravelAmount(resultSet.getBigDecimal("TRAVEL_AMOUNT"));
            travelDashboardDto.setDocumentStatusCode(resultSet.getString("DOCUMENT_STATUS_CODE"));
            travelDashboardDto.setDocumentStatusDescription(resultSet.getString("DISPOSITION_STATUS"));
            Unit unit = new Unit();
            unit.setUnitNumber(resultSet.getString("UNIT"));
            unit.setUnitName(resultSet.getString("UNIT_NAME"));
            unit.setDisplayName(resultSet.getString("DISPLAY_NAME"));
            travelDashboardDto.setUnitDetails(unit);
            travelDashboardDto.setCertifiedAt(resultSet.getTimestamp("CERTIFIED_AT"));
            travelDashboardDto.setExpirationDate(resultSet.getTimestamp("EXPIRATION_DATE"));
            travelDashboardDto.setReviewStatusCode(resultSet.getString("REVIEW_STATUS_CODE"));
            travelDashboardDto.setReviewDescription(resultSet.getString("REVIEW_STATUS"));
            travelDashboardDto.setTravelPurpose(resultSet.getString("PURPOSE_OF_THE_TRIP"));
            travelDashboardDto.setTravelStartDate(resultSet.getDate("TRAVEL_START_DATE"));
            travelDashboardDto.setTravelEndDate(resultSet.getDate("TRAVEL_END_DATE"));
            travelDashboardDto.setTravelSubmissionDate(resultSet.getDate("CERTIFIED_AT"));
            travelDashboardDto.setAdminPersonId(resultSet.getString("ADMIN_PERSON_ID"));
            travelDashboardDto.setAdminGroupId(resultSet.getInt("ADMIN_GROUP_ID"));
            travelDashboardDto.setVersionStatus(resultSet.getString("VERSION_STATUS"));
            travelDashboardDto.setCreateTimestamp(resultSet.getTimestamp("CREATE_TIMESTAMP"));
            travelDashboardDto.setUpdateTimestamp(resultSet.getTimestamp("UPDATE_TIMESTAMP"));
            travelDashboardDto.setUpdateUser(resultSet.getString("UPDATE_USER_FULL_NAME"));
            travelDashboardDto.setFundingType(resultSet.getString("FUNDING_TYPE"));
            travelDashboardDto.setIsLateSubmission(resultSet.getBoolean("IS_LATE_SUBMISSION"));
            travelDashboardDto.setPersonId(resultSet.getString("PERSON_ID"));
            travelDashboardDto.setEntityId(resultSet.getInt("ENTITY_ID"));
            travelDashboardDto.setTripTitle(resultSet.getString("TRIP_TITLE"));
            String countryNames = resultSet.getString("TRAVEL_DESTINATIONS");
            if (countryNames != null && !countryNames.isBlank()) {
                List<String> countryNamesList = Arrays.stream(countryNames.split("\\s*\\|\\|\\s*"))
                        .filter(s -> s != null && !s.isBlank())
                        .distinct()
                        .collect(Collectors.toList());
                travelDashboardDto.setTravelDestinations(countryNamesList);
            }
            travelDashboardDto.setAdminPersonName(resultSet.getString("ADMIN_PERSON_NAME"));
            travelDashboardDto.setAdminGroupName(resultSet.getString("ADMIN_GROUP_NAME"));
            travelDashboardDto.setCommentCount(resultSet.getInt("DISCLOSURE_COMMENT_COUNT"));
            travelDashboardDto.setIsHomeUnitSubmission((resultSet.getString("UNIT_ACCESS_TYPE") != null
                    && resultSet.getString("UNIT_ACCESS_TYPE").equals("HOME_UNIT")) ? Boolean.TRUE
                    : Boolean.FALSE);
            travelDashboardDto.setExistingDisclosures(fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString("EXISTING_DISCLOSURES")));
            travelDashboardDtos.add(travelDashboardDto);
        }
        return travelDashboardDtos;
    }

    @Override
    public List<UnitDto> fetchReviewerUnits(DashboardRequest dashboardRequest) {
        StoredProcedureQuery query = entityManager
                .createStoredProcedureQuery("GET_REVIEWER_UNIT_HIERARCHY");
        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
        query.setParameter(1, AuthenticatedUser.getLoginPersonId());
        query.setParameter(2, dashboardRequest.getSearchString() != null ? dashboardRequest.getSearchString() : "");
        List<Object[]> results = query.getResultList();
        return results.stream()
                .map(row -> UnitDto.builder()
                        .unitNumber((String) row[0])
                        .unitName((String) row[1])
                        .parentUnitNumber((String) row[2])
                        .displayName((String) row[3])
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public DashboardResponseDto fetchDepartmentOverviewDashboardDetails(DashboardRequest dashboardRequest) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet resultSet = null;
        DashboardResponseDto.DashboardResponseDtoBuilder response = DashboardResponseDto.builder();
        try {
            statement = connection.prepareCall("{call REVIEWER_DEPARTMENT_DASH_OVERVIEW(?,?)}");
            String dashBoardData = commonDao.convertObjectToJSON(dashboardRequest.getDashboardData());
            log.info("dashBoardData : {}", dashBoardData);
            statement.setString(1, AuthenticatedUser.getLoginPersonId());
            statement.setString(2, dashBoardData);
            boolean hasResultSet = statement.execute();
            if (!hasResultSet) {
                log.warn("No Data Found!!");
                return response.build();
            }
            resultSet = statement.getResultSet();
            if (dashboardRequest.getIsCountNeeded()) {
                if (resultSet.next()) {
                    response.totalCount(resultSet.getLong("TOTAL_COUNT"));
                }
            } else {
                List<DepartmentOverviewDto> departmentOverviewDtos = new ArrayList<>();
                while (resultSet.next()) {
                    departmentOverviewDtos.add(DepartmentOverviewDto.builder()
                            .unitNumber(resultSet.getString("UNIT_NUMBER"))
                            .unitName(resultSet.getString("UNIT_NAME"))
                            .displayName(resultSet.getString("DISPLAY_NAME"))
                            .parentUnitNumber(resultSet.getString("PARENT_UNIT_NUMBER"))
                            .departmentOverviewCountDetails(fcoiDisclosureDao.convertJsonStringToListMap(resultSet.getString("COUNT_DETAILS")))
                            .build());
                }
                response.dashboardData(departmentOverviewDtos);
            }
            return response.build();

        } catch (Exception e) {
            log.error("Exception in fetchDepartmentOverviewDashboardDetails", e);
            throw new ApplicationException("Exception in fetchDepartmentOverviewDashboardDetails", e, CoreConstants.DB_PROC_ERROR);
        } finally {
            try {
                if (resultSet != null) {
                    resultSet.close();
                }
                if (statement != null) {
                    statement.close();
                }
            } catch (Exception e) {
                log.error("Exception while closing resources in fetchDepartmentOverviewDashboardDetails", e);
                throw new ApplicationException("Exception while closing resources in fetchDepartmentOverviewDashboardDetails", e, CoreConstants.JAVA_ERROR);
            }
        }
    }
}
