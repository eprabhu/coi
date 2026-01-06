package com.polus.fibicomp.dashboard.personDisclRequirement.dao;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.constants.CoreConstants;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.pojo.PersonDisclRequirement;
import com.polus.fibicomp.dashboard.common.DashboardRequest;
import com.polus.fibicomp.dashboard.personDisclRequirement.dto.PersonDisclRequirementDto;
import com.polus.fibicomp.dashboard.common.DashboardResponseDto;
import com.polus.fibicomp.dashboard.reviewer.constants.Constants;
import com.polus.fibicomp.fcoiDisclosure.dao.FcoiDisclosureDao;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.math3.exception.NoDataException;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Repository
@Log4j2
@Transactional
@AllArgsConstructor
public class PersonDisclRequirementDaoImpl implements PersonDisclRequirementDao {

    private final HibernateTemplate hibernateTemplate;
    private final CommonDao commonDao;
    private final FcoiDisclosureDao fcoiDisclosureDao;
    private final EntityManager entityManager;

    @Override
    public DashboardResponseDto getPersonDisclRequirementDashboardData(DashboardRequest dashboardRequest) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        ResultSet resultSet = null;
        DashboardResponseDto.DashboardResponseDtoBuilder response = DashboardResponseDto.builder();
        try {
            statement = connection.prepareCall("{call GET_PERS_DISCL_REQUIREMENT_DASH_DATA(?,?)}");
            String dashBoardData = commonDao.convertObjectToJSON(dashboardRequest.getDashboardData());
            log.info("dashBoardData : {}", dashBoardData);
            statement.setString(1, AuthenticatedUser.getLoginPersonId());
            statement.setString(2, dashBoardData);
            boolean hasResultSet = statement.execute();
            if (!hasResultSet) {
                throw new ApplicationException("No data found", CoreConstants.DB_PROC_ERROR);
            }
            resultSet = statement.getResultSet();
            if (dashboardRequest.getIsCountNeeded()) {
                if (resultSet.next()) {
                    response.totalCount(resultSet.getLong("TOTAL_COUNT"));
                }
            } else {
                List<PersonDisclRequirementDto> personDisclRequirementDtoList = new ArrayList<>();
                while (resultSet.next()) {
                    PersonDisclRequirementDto personDisclRequirementDto = PersonDisclRequirementDto.builder()
                            .canEdit(resultSet.getBoolean("CAN_EDIT"))
                            .personDisclRequirementId(resultSet.getInt("PERSON_DISCL_REQUIREMENT_ID"))
                            .personId(resultSet.getString("PERSON_ID"))
                            .personFullName(resultSet.getString("PERSON_FULL_NAME"))
                            .unitName(resultSet.getString("HOME_UNIT_NAME"))
                            .unitNumber(resultSet.getString("HOME_UNIT"))
                            .displayName(resultSet.getString("DISPLAY_NAME"))
                            .appointmentTitle(resultSet.getString("APPOINTMENT_TITLE"))
                            .email(resultSet.getString("PERSON_EMAIL"))
                            .isFaculty(resultSet.getString("IS_FACULTY") != null && resultSet.getString("IS_FACULTY").equalsIgnoreCase("Y")
                                    ? Boolean.TRUE
                                    : Boolean.FALSE)
                            .isExemptFromOPA(resultSet.getString("IS_EXEMPT_FROM_OPA") != null && resultSet.getString("IS_EXEMPT_FROM_OPA").equalsIgnoreCase("Y")
                                    ? Boolean.TRUE
                                    : Boolean.FALSE)
                            .canCreateOPA(resultSet.getString("CAN_CREATE_OPA") != null && resultSet.getString("CAN_CREATE_OPA").equalsIgnoreCase("Y")
                                    ? Boolean.TRUE
                                    : Boolean.FALSE)
                            .createOpaAdminForceAllowed(resultSet.getString("CREATE_OPA_ADMIN_FORCE_ALLOWED") != null && resultSet.getString("CREATE_OPA_ADMIN_FORCE_ALLOWED").equalsIgnoreCase("Y")
                                    ? Boolean.TRUE
                                    : Boolean.FALSE)
                            .opaExemptionReason(resultSet.getString("OPA_EXEMPTION_REASON"))
                            .opaExemptFromDate(resultSet.getTimestamp("OPA_EXEMPT_FROM_DATE"))
                            .opaExemptToDate(resultSet.getTimestamp("OPA_EXEMPT_TO_DATE"))
                            .updateTimestamp(resultSet.getTimestamp("UPDATE_TIMESTAMP"))
                            .updateUserFullName(resultSet.getString("UPDATE_USER_FULL_NAME"))
                            .hasPendingDisclosure(resultSet.getBoolean("HAS_PENDING_DISCLOSURE"))
                            .build();
                    personDisclRequirementDtoList.add(personDisclRequirementDto);
                }
                response.dashboardData(personDisclRequirementDtoList);
            }
            return response.build();
        } catch (Exception e) {
            log.error("Exception in PersonDisclRequirementDaoImpl#getPersonDisclRequirementDashboardData : ", e);
            throw new ApplicationException("Exception in getPersonDisclRequirementDashboardData", e, CoreConstants.DB_PROC_ERROR);
        } finally {
            try {
                if (resultSet != null) {
                    resultSet.close();
                }
                if (statement != null) {
                    statement.close();
                }
            } catch (Exception e) {
                log.error("Exception while closing resources in getPersonDisclRequirementDashboardData", e);
                throw new ApplicationException("Exception while closing resources in getPersonDisclRequirementDashboardData", e, CoreConstants.JAVA_ERROR);
            }
        }
    }

    @Override
    public PersonDisclRequirementDto getPersonDisclRequirementData(String personId) {
        StringBuilder hqlQuery = getPersonDisclRequirementQuery();
        hqlQuery.append(" AND T1.VERSION_STATUS = 'ACTIVE' ");
        Query query = entityManager.createNativeQuery(hqlQuery.toString()).setParameter("personId", personId);
        List<Object[]> resultList = query.getResultList();
        if (resultList == null || resultList.isEmpty()) {
            throw new NoDataException();
        }
        Object[] result = resultList.get(0);
        return getPersonDisclRequirementDetails(result);
    }

    private static StringBuilder getPersonDisclRequirementQuery() {
        StringBuilder hqlQuery = new StringBuilder("SELECT T1.PERSON_DISCL_REQUIREMENT_ID,")
                .append("T1.PERSON_ID,")
                .append("T3.FULL_NAME AS PERSON_FULL_NAME,")
                .append("T2.UNIT_NUMBER AS HOME_UNIT,")
                .append("T2.UNIT_NAME AS HOME_UNIT_NAME,")
                .append("T4.JOB_TITLE AS APPOINTMENT_TITLE,")
                .append("T4.IS_FACULTY,")
                .append("T3.EMAIL_ADDRESS AS PERSON_EMAIL,")
                .append("T1.CAN_CREATE_OPA,")
                .append("T1.CREATE_OPA_ADMIN_FORCE_ALLOWED,")
                .append("T1.OPA_EXEMPTION_REASON,")
                .append("T1.IS_EXEMPT_FROM_OPA,")
                .append("T1.OPA_EXEMPT_FROM_DATE,")
                .append("T1.OPA_EXEMPT_TO_DATE,")
                .append("T1.UPDATE_TIMESTAMP, ")
                .append("T2.DISPLAY_NAME, ")
                .append("T5.FULL_NAME AS UPDATE_USER_FULL_NAME ")
                .append("FROM PERSON_DISCL_REQUIREMENT T1 ")
                .append("INNER JOIN PERSON T3 ON T3.PERSON_ID = T1.PERSON_ID ")
                .append("INNER JOIN UNIT T2 ON T2.UNIT_NUMBER = T3.HOME_UNIT ")
                .append("INNER JOIN OPA_PERSON T4 ON T4.PERSON_ID = T1.PERSON_ID ")
                .append("LEFT JOIN PERSON T5 ON T5.PERSON_ID = T1.UPDATED_BY ")
                .append("WHERE T1.PERSON_ID = :personId ");
        return hqlQuery;
    }

    private static PersonDisclRequirementDto getPersonDisclRequirementDetails(Object[] result) {
        return PersonDisclRequirementDto.builder()
                .personDisclRequirementId(result[0] != null ? ((Number) result[0]).intValue() : null)
                .personId((String) result[1])
                .personFullName((String) result[2])
                .unitNumber((String) result[3])
                .unitName((String) result[4])
                .appointmentTitle(result[5] != null ? (String) result[5] : null)
                .isFaculty(result[6] != null && ("Y".equalsIgnoreCase(result[6].toString()) || Boolean.TRUE.equals(result[6])))
                .email((String) result[7])
                .canCreateOPA(result[8] != null && ("Y".equalsIgnoreCase(result[8].toString()) || Boolean.TRUE.equals(result[8])))
                .createOpaAdminForceAllowed(result[9] != null && ("Y".equalsIgnoreCase(result[9].toString()) || Boolean.TRUE.equals(result[9])))
                .opaExemptionReason((String) result[10])
                .isExemptFromOPA(result[11] != null && ("Y".equalsIgnoreCase(result[11].toString()) || Boolean.TRUE.equals(result[11])))
                .opaExemptFromDate(result[12] != null ? (Timestamp) result[12] : null)
                .opaExemptToDate(result[13] != null ? (Timestamp) result[13] : null)
                .updateTimestamp((Timestamp) result[14])
                .displayName(result[15] != null ? (String) result[15] : null)
                .updateUserFullName(result[16] != null ? (String) result[16] : null)
                .build();
    }

    @Override
    public List<PersonDisclRequirementDto> getOPAPersonBySearch(DashboardRequest dashboardRequest) {
        StringBuilder hqlQuery = new StringBuilder("SELECT T1.PERSON_ID,")
                .append("T3.FULL_NAME ")
                .append("FROM OPA_PERSON T1 ")
                .append("INNER JOIN PERSON T3 ON T3.PERSON_ID = T1.PERSON_ID ")
                .append("WHERE (T1.PERSON_ID LIKE :searchKeyword OR T3.FULL_NAME LIKE :searchKeyword) ");
        if (dashboardRequest.getUnitNumber() != null && dashboardRequest.getIncludeChildUnits() != null && dashboardRequest.getIncludeChildUnits()) {
            hqlQuery.append(" AND T3.HOME_UNIT IN (SELECT CHILD_UNIT_NUMBER FROM UNIT_WITH_CHILDREN WHERE UNIT_NUMBER = :unitNumber ) ");
        } else if (dashboardRequest.getUnitNumber() != null) {
            hqlQuery.append(" AND T3.HOME_UNIT = :unitNumber ");
        }
        hqlQuery.append(" LIMIT 20");
        Query query = entityManager.createNativeQuery(hqlQuery.toString())
                .setParameter("searchKeyword", "%" + dashboardRequest.getSearchString() + "%");
        if (dashboardRequest.getUnitNumber() != null) {
            query.setParameter("unitNumber", dashboardRequest.getUnitNumber());
        }
        List<Object[]> resultList = query.getResultList();
        List<PersonDisclRequirementDto> personDisclRequirementDtoList = new ArrayList<>();
        for (Object[] result : resultList) {
            personDisclRequirementDtoList.add(PersonDisclRequirementDto.builder()
                    .personId((String) result[0])
                    .personFullName((String) result[1])
                    .build());
        }
        return personDisclRequirementDtoList;
    }
    
    @Override
    public PersonDisclRequirement findPersonDisclRequirementById(Integer personDisclRequirementId) {
        TypedQuery<PersonDisclRequirement> query = entityManager.createQuery("FROM PersonDisclRequirement WHERE personDisclRequirementId = :personDisclRequirementId", PersonDisclRequirement.class)
                .setParameter("personDisclRequirementId", personDisclRequirementId);
        return query.getSingleResult();
    }

    @Override
    public void saveOrUpdatePersonDisclRequirement(PersonDisclRequirement personDisclRequirement) {
        if (personDisclRequirement.getPersonDisclRequirementId() == null) {
            entityManager.persist(personDisclRequirement);
        } else {
            entityManager.merge(personDisclRequirement);
        }
    }

    @Override
    public List<PersonDisclRequirementDto> getPersonDisclRequirementHistory(String personId) {
        Query query = entityManager.createNativeQuery(getPersonDisclRequirementQuery().toString()).setParameter("personId", personId);
        List<Object[]> resultList = query.getResultList();
        List<PersonDisclRequirementDto> personDisclRequirements = new ArrayList<>();
        for (Object[] result : resultList) {
            personDisclRequirements.add(getPersonDisclRequirementDetails(result));
        }
        return personDisclRequirements;
    }
}
