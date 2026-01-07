package com.polus.fibicomp.opa.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.ParameterMode;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.StoredProcedureQuery;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.COIValidateDto;
import com.polus.fibicomp.coi.exception.DisclosureValidationException;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.opa.dto.OPAAssignAdminDto;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.opa.dto.OPADashTabCountVO;
import com.polus.fibicomp.opa.dto.OPADashboardDto;
import com.polus.fibicomp.opa.dto.OPADashboardRequestDto;
import com.polus.fibicomp.opa.dto.OPADashboardResponseDto;
import com.polus.fibicomp.opa.dto.OPASubmitDto;
import com.polus.fibicomp.opa.pojo.OPADisclosure;
import com.polus.fibicomp.opa.pojo.OPADispositionStatusType;
import com.polus.fibicomp.opa.pojo.OPAFormBuilderDetails;
import com.polus.fibicomp.opa.pojo.OPAPersonType;
import com.polus.fibicomp.opa.pojo.OPAReviewStatusType;

import oracle.jdbc.OracleTypes;

@Transactional
@Service(value = "opaDaoImpl")
public class OPADaoImpl implements OPADao {

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @PersistenceContext
	private EntityManager entityManager;

    @Autowired
    private CommonDao commonDao;

    @Autowired
	private PersonDao personDao;

  	protected static Logger logger = LogManager.getLogger(OPADaoImpl.class.getName());
  	private static final String DESIGNATION_STATUS_CODE_FACULTY = "1";
  	private static final String DESIGNATION_STATUS_FACULTY = "\"Y\"";
  	private static final String DESIGNATION_STATUS_STAFF = "\"N\"";

    @Override
    public boolean canCreateOpaDisclosure(String personId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        try {
            String functionName = "FN_OPA_DISCLOSURE_REQUIRED";
            String functionCall = "{ ? = call " + functionName + "(?) }";
            statement = connection.prepareCall(functionCall);
            statement.registerOutParameter(1, OracleTypes.INTEGER);
            statement.setString(2, personId);
            statement.execute();
            return statement.getBoolean(1);
        } catch (SQLException e) {
            throw new ApplicationException(e.getMessage(),e, Constants.DB_PROC_ERROR);
        }
    }

    @Override
    public Timestamp submitOPADisclosure(OPASubmitDto opaSubmitDto) {
        Timestamp timesStamp = commonDao.getCurrentTimestamp();
        Timestamp expirationDate = Timestamp.valueOf(LocalDateTime.now().plusYears(1).minusDays(1));
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPADisclosure d SET d.certificationText = :certificationText, ");
        hqlQuery.append("d.certifiedBy = :certifiedBy, d.submissionTimestamp = :submissionTimestamp, ");
        hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, d.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy, d.dispositionStatusCode = :dispositionStatusCode, ");
        hqlQuery.append("d.expirationDate = :expirationDate, d.homeUnit = :homeUnit ");
        hqlQuery.append("WHERE d.opaDisclosureId = :opaDisclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId", opaSubmitDto.getOpaDisclosureId());
        query.setParameter("certificationText", opaSubmitDto.getCertificationText());
        query.setParameter("certifiedBy", AuthenticatedUser.getLoginPersonId());
        query.setParameter("submissionTimestamp", timesStamp);
        query.setParameter("expirationDate", expirationDate);
        query.setParameter("homeUnit", opaSubmitDto.getHomeUnit());
		if (opaSubmitDto.getOpaDisclosureStatus() != null) {
			query.setParameter("reviewStatusCode", opaSubmitDto.getOpaDisclosureStatus());
		} else {
			query.setParameter("reviewStatusCode", Constants.OPA_DISCLOSURE_STATUS_SUBMIT);
		}
	query.setParameter("dispositionStatusCode", Constants.OPA_DISPOSITION_STATUS_PENDING);
        query.setParameter("updateTimestamp", timesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timesStamp;
    }

    @Override
    public Timestamp returnOrWithdrawOPADisclosure(String opaStatusCode, Integer opaDisclosureId) {
        Timestamp timesStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPADisclosure d SET d.certificationText = :certificationText, ");
        hqlQuery.append("d.certifiedBy = :certifiedBy, d.submissionTimestamp = :submissionTimestamp, ");
        hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, d.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy, d.expirationDate = :expirationDate ");
        hqlQuery.append("WHERE d.opaDisclosureId = :opaDisclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        query.setParameter("certificationText", null);
        query.setParameter("certifiedBy", null);
        query.setParameter("submissionTimestamp", null);
        query.setParameter("expirationDate", null);
        query.setParameter("reviewStatusCode", opaStatusCode);
        query.setParameter("updateTimestamp", timesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timesStamp;
    }

    @Override
    public Timestamp assignAdminOPADisclosure(OPAAssignAdminDto assignAdminDto) {
        Timestamp timesStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPADisclosure d SET d.adminGroupId = :adminGroupId, ");
        hqlQuery.append("d.adminPersonId = :adminPersonId, d.updateTimestamp = :updateTimestamp, ");
		hqlQuery.append(assignAdminDto.getOpaDisclosureStatus() != null ? "d.reviewStatusCode = :reviewStatusCode, " : "");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.opaDisclosureId = :opaDisclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",assignAdminDto.getOpaDisclosureId());
        query.setParameter("adminGroupId", assignAdminDto.getAdminGroupId());
        query.setParameter("adminPersonId", assignAdminDto.getAdminPersonId());
        if(assignAdminDto.getOpaDisclosureStatus() != null ) {
        	query.setParameter("reviewStatusCode", assignAdminDto.getOpaDisclosureStatus());
        }
        query.setParameter("updateTimestamp", timesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timesStamp;
    }

	@Override
	public Timestamp completeOPADisclosure(Integer opaDisclosureId) {
		Timestamp timesStamp = commonDao.getCurrentTimestamp();
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE OPADisclosure d SET ");
		hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, d.updateTimestamp = :updateTimestamp, ");
		hqlQuery.append("d.updatedBy = :updatedBy, d.dispositionStatusCode = :dispositionStatusCode , d.versionStatus = :versionStatus ");
		hqlQuery.append("WHERE d.opaDisclosureId = :opaDisclosureId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("opaDisclosureId", opaDisclosureId);
		query.setParameter("reviewStatusCode", Constants.OPA_DISCLOSURE_STATUS_COMPLETED);
		query.setParameter("dispositionStatusCode", Constants.OPA_DISPOSITION_STATUS_COMPLETED);
		query.setParameter("versionStatus", Constants.COI_ACTIVE_STATUS);
		query.setParameter("updateTimestamp", timesStamp);
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.executeUpdate();
		return timesStamp;
	}

    @Override
    public boolean isOPAWithStatuses(List<String> opaDisclosureStatuses, String dispositionStatus, Integer opaDisclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.opaDisclosureId) > 0) then true else false end FROM OPADisclosure d WHERE ");
        if (opaDisclosureStatuses != null && !opaDisclosureStatuses.isEmpty()) {
            hqlQuery.append(" d.reviewStatusCode IN (:reviewStatusCodes) AND ");
        }
        if (dispositionStatus != null)
            hqlQuery.append("d.dispositionStatusCode = :dispositionStatusCode AND ");
        hqlQuery.append("d.opaDisclosureId = :opaDisclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        if (opaDisclosureStatuses != null && !opaDisclosureStatuses.isEmpty()) {
            query.setParameter("reviewStatusCodes", opaDisclosureStatuses);
        }
        if (dispositionStatus != null)
            query.setParameter("dispositionStatusCode", dispositionStatus);
        return (boolean) query.getSingleResult();
    }

    @Override
	public OPACommonDto createOpaDisclosure(String personId) {
		Session session = hibernateTemplate.getSessionFactory().openSession();
		try {
			SessionImpl sessionImpl = (SessionImpl) session;
			Transaction transaction = session.beginTransaction();
			Connection connection = sessionImpl.connection();
			CallableStatement statement = connection.prepareCall("{call INSERT_OPA_DISCLOSURE_DETAILS(?,?)}");
			statement.setString(1, personId);
			statement.setString(2, AuthenticatedUser.getLoginUserName());
			statement.execute();
			transaction.commit();
			statement.getMoreResults();
			try (ResultSet resultSet = statement.getResultSet()) {
				while (resultSet.next()) {
					return OPACommonDto.builder()
							.opaDisclosureId(resultSet.getInt("LI_OPA_DISCLOSURE_ID"))
							.opaDisclosureNumber(resultSet.getString("LS_OPA_DISCLOSURE_NUMBER")).build();
				}
			}
		} catch (SQLException e) {
			logger.error("Exception in createOpaDisclosure {}", e.getMessage());
			if (e.getErrorCode() == HttpStatus.NOT_ACCEPTABLE.value()) {
				throw new DisclosureValidationException(e.getMessage());
			} else
				throw new ApplicationException("Unable to create disclosure", e, Constants.DB_PROC_ERROR);
		} finally {
			session.close();
		}
		return null;
	  }

    @Override
    public boolean isAdminAssigned(Integer opaDisclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.opaDisclosureId) > 0) then true else false end ");
        hqlQuery.append("FROM OPADisclosure d WHERE d.adminPersonId IS NOT NULL AND  ");
        hqlQuery.append("d.opaDisclosureId = :opaDisclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        return (boolean) query.getSingleResult();
    }

    @Override
    public OPADisclosure getOPADisclosure(Integer opaDisclosureId) {
        OPADisclosure opaDisclosure = hibernateTemplate.get(OPADisclosure.class, opaDisclosureId);
        if (opaDisclosure != null) {
            hibernateTemplate.refresh(opaDisclosure);
        }
        return opaDisclosure;
    }

    @Override
    public OPADashboardResponseDto getOPADashboard(OPADashboardRequestDto requestDto) {

        List<OPADashboardDto> opaDashboardDtos = new ArrayList<>();
        try {
            ResultSet rset = getOPADashboardResultSet(requestDto, false);
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
                opaDashboardDtos.add(
                        OPADashboardDto.builder()
                        .opaDisclosureId(rset.getInt("OPA_DISCLOSURE_ID"))
                        .opaDisclosureNumber(rset.getString("OPA_DISCLOSURE_NUMBER"))
                        .opaCycleNumber(rset.getInt("OPA_CYCLE_NUMBER"))
                        .periodStartDate(rset.getDate("PERIOD_START_DATE"))
                        .periodEndDate(rset.getDate("PERIOD_END_DATE"))
                        .opaCycleStatus(rset.getBoolean("OPA_CYCLE_STATUS"))
                        .openDate(rset.getDate("OPEN_DATE"))
                        .closeDate(rset.getDate("CLOSE_DATE"))
                        .personName(rset.getString("PERSON_NAME"))
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
                        .submissionTimestamp(rset.getTimestamp("SUBMISSION_TIMESTAMP"))
                        .reviewStatusCode(rset.getString("REVIEW_STATUS_CODE"))
                        .dispositionStatusCode(rset.getString("DISPOSITION_STATUS_CODE"))
                        .dispositionStatus(rset.getString("DISPOSITION_STATUS"))
                        .reviewStatus(rset.getString("OPA_DISCLOSURE_STATUS"))
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
						.isViewAllowed(rset.getBoolean("IS_VIEW_ALLOWED"))
                        .build()
                );
            }
            Integer count = 0;
            rset = getOPADashboardResultSet(requestDto, true);
            while (rset.next()) {
                count = rset.getInt(1);
            }
            return OPADashboardResponseDto.builder().data(opaDashboardDtos).count(count).build();
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Exception on getOPADashboard {}", e.getMessage());
            throw new ApplicationException("Unable to fetch opa dashboard details", e, Constants.DB_PROC_ERROR);
        }
    }
    
	// This function needs to be refactored to run the procedures in parallel for retrieving the tab count.
    @Override
	public String getOPADashboardTabCount(OPADashboardRequestDto requestDto) {
		OPADashTabCountVO tabCountVO = new OPADashTabCountVO();
		try {
			Integer inProgressDisclosureCount = 0;
			Integer approvedDisclosureCount = 0;
			// fetching Count for MY_REVIEWS tab
			requestDto.setTabType("MY_REVIEWS");
			ResultSet rset = getOPADashboardResultSet(requestDto, true);
			while (rset.next()) {
				inProgressDisclosureCount = rset.getInt(1);
			}
			// fetching Count for ALL_REVIEWS tab
			requestDto.setTabType("ALL_REVIEWS");
			ResultSet rset2 = getOPADashboardResultSet(requestDto, true);
			while (rset2.next()) {
				approvedDisclosureCount = rset2.getInt(1);
			}
			tabCountVO.setMyReviewsTabCount(inProgressDisclosureCount);
			tabCountVO.setAllReviewsTabCount(approvedDisclosureCount);
		} catch (Exception e) {
			throw new RuntimeException("Error in fetching opa dashboard tab counts", e);
		}

		return commonDao.convertObjectToJSON(tabCountVO);
	}
    
    @Override
    public ResultSet getOPADashboardResultSet(OPADashboardRequestDto requestDto, boolean isCount) throws SQLException {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        Integer currentPage = requestDto.getCurrentPage();
        Integer pageNumber = requestDto.getPageNumber();
        List<String> disclosureStatusCodes = requestDto.getReviewStatusCodes();
        List<String> dispositionStatusCodes = requestDto.getDispositionStatusCodes();
		List<String> designationStatusCodes = requestDto.getDesignationStatusCodes();
		List<String> opaDisclosureTypes = requestDto.getOpaDisclosureTypes();
		List<String> adminPersonIds = requestDto.getAdminPersonIds();
		designationStatusCodes = designationStatusCodes != null && !designationStatusCodes.isEmpty()
				&& designationStatusCodes.contains("1") && designationStatusCodes.contains("2") ? null
						: designationStatusCodes;
		if (designationStatusCodes != null && !designationStatusCodes.isEmpty()) {
			designationStatusCodes = designationStatusCodes.stream()
					.map(code -> DESIGNATION_STATUS_CODE_FACULTY.equals(code) ? DESIGNATION_STATUS_FACULTY
							: DESIGNATION_STATUS_STAFF)
					.collect(Collectors.toList());
		}
        String submissionTimestamp = requestDto.getSubmissionTimestamp();
        String unitNumber = requestDto.getUnitIdentifier();
		Boolean fetchAllRecords = requestDto.getFetchAllRecords();
		List <String> freeTextSearchFields = requestDto.getFreeTextSearchFields();
		CallableStatement statement = connection.prepareCall("{call GET_COI_OPA_DASHBOARD(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}");
		statement.setString(1, requestDto.getDocumentOwner() != null ? requestDto.getDocumentOwner()
				: AuthenticatedUser.getLoginPersonId());
        statement.setString(2, requestDto.getFilterType());
        statement.setBoolean(3, isCount);
        statement.setString(4, setOPASortOrder(requestDto.getSort()));
        statement.setInt(5, (currentPage == null ? 0 : currentPage - 1));
        statement.setInt(6, (pageNumber == null ? 0 : pageNumber));
        statement.setString(7, requestDto.getTabType());
        statement.setString(8, disclosureStatusCodes != null &&
                !disclosureStatusCodes.isEmpty() ? String.join(",", disclosureStatusCodes) : null);
        statement.setString(9, dispositionStatusCodes != null &&
                !dispositionStatusCodes.isEmpty() ? String.join(",", dispositionStatusCodes) : null);
        statement.setString(10, submissionTimestamp);
        statement.setString(11, unitNumber);
		statement.setBoolean(12, (fetchAllRecords != null && fetchAllRecords) ? Boolean.TRUE : Boolean.FALSE);
        statement.setString(13, requestDto.getPersonIdentifier());
        statement.setString(14, requestDto.getEntityId() != null ? requestDto.getEntityId().toString() : null);
        statement.setString(15, designationStatusCodes != null &&
                !designationStatusCodes.isEmpty() ? String.join(",", designationStatusCodes) : null);
        statement.setString(16, requestDto.getPeriodStartDate());
        statement.setString(17, requestDto.getPeriodEndDate());
        statement.setString(18, requestDto.getExpirationDate());
        statement.setString(19, adminPersonIds != null && !adminPersonIds.isEmpty() ? String.join(",", adminPersonIds) : null);
        statement.setString(20, requestDto.getEntityIdentifier());
        statement.setString(21, opaDisclosureTypes != null && !opaDisclosureTypes.isEmpty() ? String.join(",", opaDisclosureTypes) : null);
        statement.setString(22, freeTextSearchFields != null && !freeTextSearchFields.isEmpty() ? String.join(",", freeTextSearchFields) : null);
        statement.setString(23, requestDto.getAdvancedSearch());
		statement.setString(24, AuthenticatedUser.getLoginPersonId());
        statement.execute();
        return  statement.getResultSet();
    }

    private String setOPASortOrder(Map<String, String> sort) {
        String sortOrder = null;
        if (!sort.isEmpty()) {
            for (Map.Entry<String, String> mapElement : sort.entrySet()) {
                if (mapElement.getKey().equals("createTimestamp")) {
                    sortOrder = (sortOrder == null ? "T.CREATE_TIMESTAMP " + mapElement.getValue() : sortOrder + ", T.CREATE_TIMESTAMP " + mapElement.getValue());
                } else if (mapElement.getKey().equals("person")) {
                    sortOrder = (sortOrder == null ? "T.PERSON_NAME " + mapElement.getValue() : sortOrder + ", T.PERSON_NAME " + mapElement.getValue());
                } else if (mapElement.getKey().equals("submissionTimestamp")) {
                    sortOrder = (sortOrder == null ? "T.SUBMISSION_TIMESTAMP " + mapElement.getValue() : sortOrder + ", T.SUBMISSION_TIMESTAMP " + mapElement.getValue());
                } else if (mapElement.getKey().equals("updateTimeStamp")) {
                    sortOrder = (sortOrder == null ? "T.UPDATE_TIMESTAMP " + mapElement.getValue() : sortOrder + ", T.UPDATE_TIMESTAMP " + mapElement.getValue());
                } else if (mapElement.getKey().equals("dispositionStatus")) {
                    sortOrder = (sortOrder == null ? "T.DISPOSITION_STATUS " + mapElement.getValue() : sortOrder + ", T.DISPOSITION_STATUS " + mapElement.getValue());
                } else if (mapElement.getKey().equals("disclosureStatus")) {
                    sortOrder = (sortOrder == null ? "T.OPA_DISCLOSURE_STATUS " + mapElement.getValue() : sortOrder + ", T.OPA_DISCLOSURE_STATUS " + mapElement.getValue());
                } else if (mapElement.getKey().equals("homeUnitName")) {
                    sortOrder = (sortOrder == null ? "T.UNIT_NAME " + mapElement.getValue() : sortOrder + ", T.UNIT_NAME " + mapElement.getValue());
                } else if (mapElement.getKey().equals("expirationDate")) {
                    sortOrder = (sortOrder == null ? "T.EXPIRATION_DATE " + mapElement.getValue() : sortOrder + ", T.EXPIRATION_DATE " + mapElement.getValue());
                }
            }
        }
        return sortOrder;
    }

    @Override
	public OPAFormBuilderDetails saveOrUpdateOpaFormBuilderDetails(OPAFormBuilderDetails opaFormBuilderDetails) {
		hibernateTemplate.saveOrUpdate(opaFormBuilderDetails);
		return opaFormBuilderDetails;
	}

	@Override
	public List<OPAFormBuilderDetails> getOpaFormBuilderDetailsByOpaDisclosureId(Integer opaDisclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    CriteriaBuilder builder = session.getCriteriaBuilder();
	    CriteriaQuery<OPAFormBuilderDetails> query = builder.createQuery(OPAFormBuilderDetails.class);
	    Root<OPAFormBuilderDetails> root = query.from(OPAFormBuilderDetails.class);
	    query.select(root).where(builder.equal(root.get("opaDisclosureId"), opaDisclosureId));
	    return session.createQuery(query).getResultList();
		
	}

	@Override
	public String getAssignedAdmin(Integer opaDisclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    CriteriaBuilder builder = session.getCriteriaBuilder();
	    CriteriaQuery<String> query = builder.createQuery(String.class);
	    Root<OPADisclosure> root = query.from(OPADisclosure.class);
	    query.select(root.get("adminPersonId")).where(builder.equal(root.get("opaDisclosureId"), opaDisclosureId));
	    return session.createQuery(query).getSingleResult();
	}

	@Override
	public List<OPADisclosure> getActiveAndPendingOpaDisclosure(String personId) {
		List<OPADisclosure> opaDisclosures = new ArrayList<>();
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<OPADisclosure> query = builder.createQuery(OPADisclosure.class);
			Root<OPADisclosure> rootOpaDisclosure = query.from(OPADisclosure.class);
			Predicate statusPredicate = builder.or(
					builder.equal(rootOpaDisclosure.get("dispositionStatusCode"),
							Constants.OPA_DISPOSITION_STATUS_COMPLETED),
					builder.equal(rootOpaDisclosure.get("dispositionStatusCode"),
							Constants.OPA_DISPOSITION_STATUS_EXPIRED));
			query.where(builder.and(builder.equal(rootOpaDisclosure.get("personId"), personId), statusPredicate,
					builder.equal(rootOpaDisclosure.get("versionStatus"), Constants.COI_ACTIVE_STATUS)));
			query.orderBy(builder.desc(rootOpaDisclosure.get("updateTimestamp")));
			List<OPADisclosure> opaDisclData = session.createQuery(query).getResultList();
			if (opaDisclData != null && !opaDisclData.isEmpty()) {
				OPADisclosure opaDisclosure = opaDisclData.get(0);
				opaDisclosure.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(opaDisclosure.getUpdatedBy()));
				opaDisclosure.setAdminPersonName(opaDisclosure.getAdminPersonId() != null ? personDao.getPersonFullNameByPersonId(opaDisclosure.getAdminPersonId()) : null);
				opaDisclosure.setAdminGroupName(opaDisclosure.getAdminGroupId() != null ? commonDao.getAdminGroupByGroupId(opaDisclosure.getAdminGroupId()).getAdminGroupName() : null);
				opaDisclosure.setHomeUnitName(commonDao.getUnitName(opaDisclosure.getHomeUnit()));
				if (opaDisclosure.getPerson().getUnit() != null && opaDisclosure.getPerson().getUnit().getDisplayName() != null) {
					opaDisclosure.setUnitDisplayName(opaDisclosure.getPerson().getUnit().getDisplayName());
				}
				opaDisclosures.add(opaDisclosure);
			}
			OPADisclosure opaDisclosure = getPendingOpaDisclosure(personId);
			if (opaDisclosure != null) {
				opaDisclosure.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(opaDisclosure.getUpdatedBy()));
				opaDisclosure.setHomeUnitName(commonDao.getUnitName(opaDisclosure.getHomeUnit()));
				if (opaDisclosure.getPerson().getUnit() != null
						&& opaDisclosure.getPerson().getUnit().getDisplayName() != null) {
					opaDisclosure.setUnitDisplayName(opaDisclosure.getPerson().getUnit().getDisplayName());
				}
				opaDisclosures.add(opaDisclosure);
			}
		} catch (Exception ex) {
			throw new ApplicationException("Unable to fetch Active Disclosure", ex, Constants.JAVA_ERROR);
		}
		return opaDisclosures;
	}

	private OPADisclosure getPendingOpaDisclosure(String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<OPADisclosure> query = builder.createQuery(OPADisclosure.class);
		Root<OPADisclosure> rootOpaDisclosure = query.from(OPADisclosure.class);
		query.where(builder.and(builder.equal(rootOpaDisclosure.get("personId"), personId),
				builder.equal(rootOpaDisclosure.get("dispositionStatusCode"), Constants.OPA_DISPOSITION_STATUS_PENDING)),
				builder.equal(rootOpaDisclosure.get("versionStatus"), Constants.COI_PENDING_STATUS));
		query.orderBy(builder.desc(rootOpaDisclosure.get("updateTimestamp")));
		List<OPADisclosure> opaDisclData = session.createQuery(query).getResultList();
		return !opaDisclData.isEmpty() ? opaDisclData.get(0) : null;
	}

    @Override
    public Timestamp updateOPADisclosureUpDetails(Integer opaDisclosureId, Timestamp timesStamp) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPADisclosure d SET ");
        hqlQuery.append("d.updateTimestamp = :updateTimestamp, d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.opaDisclosureId = :opaDisclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        query.setParameter("updateTimestamp", timesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timesStamp;
    }

    @Override
    public void updateOPADisclosureStatuses(Integer opaDisclosureId, Timestamp updateTimesStamp, String reviewStatusCode, String dispositionStatusCode) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPADisclosure d SET ");
        hqlQuery.append("d.updateTimestamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        if (reviewStatusCode != null)
            hqlQuery.append(", d.reviewStatusCode = :reviewStatusCode ");
        if (dispositionStatusCode != null)
            hqlQuery.append(", d.dispositionStatusCode = :dispositionStatusCode ");
        hqlQuery.append("WHERE d.opaDisclosureId = :opaDisclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        if (reviewStatusCode != null)
            query.setParameter("reviewStatusCode", reviewStatusCode);
        if (dispositionStatusCode != null)
            query.setParameter("dispositionStatusCode", dispositionStatusCode);
        query.setParameter("updateTimestamp", updateTimesStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
    }

    @Override
    public OPAReviewStatusType getOPADisclosureStatusType(String statusTypeCode) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT s FROM  OPAReviewStatusType s ");
        hqlQuery.append("WHERE s.reviewStatusCode = :reviewStatusCode");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("reviewStatusCode", statusTypeCode);
        List<OPAReviewStatusType> resultData = query.getResultList();
        if(resultData != null  && !resultData.isEmpty()) {
            return resultData.get(0);
        }
        return null;
    }

	@Override
	public List<OPAPersonType> getOpaPersonType() {
		return hibernateTemplate.loadAll(OPAPersonType.class);
	}

	@Override
	public boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer opaDisclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.opaDisclosureId) > 0) then true else false end ");
		hqlQuery.append("FROM OPADisclosure c WHERE  c.adminPersonId = :adminPersonId ");
		if (adminGroupId != null)
			hqlQuery.append("AND c.adminGroupId = :adminGroupId ") ;
		hqlQuery.append("AND c.opaDisclosureId = : opaDisclosureId");
		Query query = session.createQuery(hqlQuery.toString());
		if (adminGroupId != null)
			query.setParameter("adminGroupId", adminGroupId);
		query.setParameter("adminPersonId", adminPersonId);
		query.setParameter("opaDisclosureId", opaDisclosureId);
		return (boolean)query.getSingleResult();
	}

	@Override
	public boolean isAdminPersonOrGroupAdded(Integer opaDisclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.opaDisclosureId) > 0) then false else true end ");
		hqlQuery.append("FROM OPADisclosure c WHERE  c.adminPersonId is null AND c.adminGroupId is null ");
		hqlQuery.append("AND c.opaDisclosureId = : opaDisclosureId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("opaDisclosureId", opaDisclosureId);
		return (boolean)query.getSingleResult();
	}

	@Override
	public Map<String, String> evaluateRelationship(Integer personEntityId) {
		StoredProcedureQuery query = entityManager.createStoredProcedureQuery("EVALUATE_OPA_QUESTIONNAIRE")
				.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN)
				.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
		query.setParameter(1, personEntityId);
		query.setParameter(2, AuthenticatedUser.getLoginPersonId());
		query.execute();
		Object result = query.getSingleResult();
		Map<String, String> evaluationResult = new HashMap<>();
		evaluationResult.put("MESSAGE", (String) result);
		return evaluationResult;
	}


    public OPAReviewStatusType getDisclosureReviewStatue(Integer opaDisclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d.reviewStatusType ");
        hqlQuery.append("FROM OPADisclosure d WHERE d.opaDisclosureId = :opaDisclosureId ");
        TypedQuery<OPAReviewStatusType> query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        return query.getSingleResult();
    }

    @Override
    public String getOPAHomeUnit(Integer opaDisclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d.homeUnit ");
        hqlQuery.append("FROM OPADisclosure d WHERE d.opaDisclosureId = :opaDisclosureId ");
        TypedQuery<String> query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId",opaDisclosureId);
        return query.getSingleResult();
    }

	@Override
	public OPACommonDto reviseOpaDisclosure(OPACommonDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		try {
			SessionImpl sessionImpl = (SessionImpl) session;
			Connection connection = sessionImpl.connection();

			try (CallableStatement statement = connection.prepareCall("{call REVISE_OPA_DISCLOSURE_DETAILS(?,?,?)}")) {
				statement.setString(1, dto.getPersonId());
				statement.setString(2, AuthenticatedUser.getLoginUserName());
				statement.setString(3, dto.getOpaDisclosureNumber());

				boolean hasResultSet = statement.execute();

				if (hasResultSet) {
					try (ResultSet resultSet = statement.getResultSet()) {
						if (resultSet != null && resultSet.next()) {
							int opaId = resultSet.getInt(1);
							logger.info("Successfully revised disclosure. New OPA ID: {}", opaId);
							return OPACommonDto.builder().opaDisclosureId(opaId).opaDisclosureNumber(dto.getOpaDisclosureNumber()).build();
						} else {
							logger.warn("ResultSet was empty after executing stored procedure");
						}
					}
				} else {
					logger.warn("No ResultSet returned from stored procedure");
				}
			}
		} catch (SQLException e) {
			if (e.getErrorCode() == HttpStatus.NOT_ACCEPTABLE.value()) {
				throw new DisclosureValidationException(e.getMessage());
			} else
				throw new ApplicationException("Unable to revise disclosure", e, Constants.DB_PROC_ERROR);
		}
		return null;
	}

	@Override
	public void archiveOPADisclosureOldVersions(Integer opaDisclosureId, String opaDisclosureNumber) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE OPADisclosure SET versionStatus = :versionStatus where opaDisclosureId = :opaDisclosureId AND opaDisclosureNumber = :opaDisclosureNumber");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("versionStatus", Constants.COI_ARCHIVE_STATUS);
		query.setParameter("opaDisclosureId", opaDisclosureId);
		query.setParameter("opaDisclosureNumber", opaDisclosureNumber);
		query.executeUpdate();
	}

	@Override
	public OPADisclosure getPreviousOPADisclosureVersion(String opaDisclosureNumber, Integer versionNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<OPADisclosure> previousDisclosureQuery = builder.createQuery(OPADisclosure.class);
		Root<OPADisclosure> previousRoot = previousDisclosureQuery.from(OPADisclosure.class);

		previousDisclosureQuery.select(previousRoot).where(
				builder.equal(previousRoot.get("opaDisclosureNumber"), opaDisclosureNumber),
				builder.equal(previousRoot.get("versionNumber"), versionNumber - 1));

		try {
			return session.createQuery(previousDisclosureQuery).getSingleResult();
		} catch (NoResultException e) {
			logger.info("No previous OPA Disclosure found for number {} and version {}", opaDisclosureNumber, versionNumber - 1);
			return null;
		}
	}

	@Override
	public boolean existsPendingOPADisclosure(String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder cb = session.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<OPADisclosure> root = query.from(OPADisclosure.class);

		Predicate personIdPredicate = cb.equal(root.get("personId"), personId);
		Predicate statusPredicate = cb.equal(root.get("versionStatus"), "PENDING");

		query.select(cb.count(root)).where(cb.and(personIdPredicate, statusPredicate));

		Long count = session.createQuery(query).getSingleResult();

		return count != null && count > 0;
	}

    @Override
    public void updateSebbatical(String personId, Integer opaDisclosureId) {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        try {
            SessionImpl sessionImpl = (SessionImpl) session;
            Connection connection = sessionImpl.connection();
            CallableStatement statement = connection.prepareCall("{call OPA_DETERMINE_SEBBATIC_VALUE(?,?)}");
            statement.setInt(1, opaDisclosureId);
            statement.setString(2, personId);
            statement.executeUpdate();
        } catch (Exception e) {
            logger.error("Exception in updateSebbatical {}", e.getMessage());
            throw new ApplicationException("Unable to update disclosure sebbattical", e, Constants.DB_PROC_ERROR);
        }
    }
    
	public OPADispositionStatusType getOPADisclDispositionStatusType(String statusTypeCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT s FROM  OPADispositionStatusType s ");
		hqlQuery.append("WHERE s.dispositionStatusCode = :dispositionStatusCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("dispositionStatusCode", statusTypeCode);
		List<OPADispositionStatusType> resultData = query.getResultList();
		if (resultData != null && !resultData.isEmpty()) {
			return resultData.get(0);
		}
		return null;
	}
    
	@Override
	public List<COIValidateDto> validateOPA(String disclosureId) {
		Session session = hibernateTemplate.getSessionFactory().openSession();
		try {
			SessionImpl sessionImpl = (SessionImpl) session;
			Connection connection = sessionImpl.connection();
			CallableStatement statement = connection.prepareCall("{call GET_RULE_EVALUATE_VALIDATION(?,?,?,?,?,?)}");
			statement.setString(1, Constants.OPA_MODULE_CODE.toString());
			statement.setString(2, Constants.OPA_MODULE_SUB_ITEM_CODE);
			statement.setInt(3, Integer.parseInt(disclosureId));
			statement.setString(4, AuthenticatedUser.getLoginUserName());
			statement.setString(5, AuthenticatedUser.getLoginPersonId());
			statement.setString(6, Constants.OPA_MODULE_SUB_ITEM_CODE);
			boolean hasResultSet = statement.execute();
			List<COIValidateDto> validateDtos = new ArrayList<>();
			if (hasResultSet) {
				try (ResultSet resultSet = statement.getResultSet()) {
					if (resultSet != null) {
						while (resultSet.next()) {
							COIValidateDto validateDto = new COIValidateDto();
							validateDto.setValidationType(resultSet.getString("VALIDATION_TYPE"));
							validateDto.setValidationMessage(resultSet.getString("VALIDATION_MESSAGE"));
							validateDtos.add(validateDto);
						}
					}
				}
			} else {
				logger.warn("No result set returned from stored procedure");
			}
			return validateDtos;
		} catch (Exception e) {
			logger.error("Exception in validateOPA {}", e.getMessage());
			throw new ApplicationException("Unable to validate OPA", e, Constants.DB_PROC_ERROR);
		} finally {
			session.close();
		}
	}
	
	@Override
	public String getOpaDisclHomeUnit(String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		try {
			String functionName = "FN_GET_OPA_DISCLOSURE_HOME_UNIT";
			String functionCall = "{ ? = call " + functionName + "(?) }";
			statement = connection.prepareCall(functionCall);
			statement.registerOutParameter(1, OracleTypes.VARCHAR);
			statement.setString(2, personId);
			statement.execute();
			String result = statement.getString(1);
			if (result == null || result.trim().isEmpty()) {
				throw new DisclosureValidationException("No home unit found for this person. Contact the administrator for assistance.");
			}
			return result;
		} catch (SQLException e) {
			throw new ApplicationException(e.getMessage(), e, Constants.DB_PROC_ERROR);
		} finally {
			if (statement != null) {
				try {
					statement.close();
				} catch (SQLException e) {
					logger.warn("Failed to close CallableStatement", e);
				}
			}
		}
	}
	
	@Override
	public Object[] getActiveOpaDisclExpiryAndCertDate(Integer disclosureNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder sql = new StringBuilder();
		sql.append("SELECT CD.EXPIRATION_DATE, CD.SUBMISSION_TIMESTAMP, ")
				.append("CDST.DESCRIPTION AS DISPOSITION_STATUS, ")
				.append("P.FULL_NAME AS REPORTER_NAME, ")
				.append("CD.HOME_UNIT, ")
				.append("U.UNIT_NAME ")
				.append("FROM OPA_DISCLOSURE CD ")
				.append("INNER JOIN PERSON P ON P.PERSON_ID = CD.PERSON_ID ")
				.append("INNER JOIN UNIT U ON U.UNIT_NUMBER = CD.HOME_UNIT ")
				.append("INNER JOIN OPA_DISPOSITION_STATUS_TYPE CDST ON CDST.DISPOSITION_STATUS_CODE = CD.DISPOSITION_STATUS_CODE ")
				.append("WHERE CD.OPA_DISCLOSURE_NUMBER = :disclosureNumber ")
				.append("AND CD.VERSION_STATUS = :versionStatus");
		List<Object[]> dates = session.createNativeQuery(sql.toString())
				.setParameter("disclosureNumber", disclosureNumber)
				.setParameter("versionStatus", Constants.COI_ACTIVE_STATUS).getResultList();
		return dates.isEmpty() ? new Object[] { null, null } : dates.get(0);
	}

    @Override
    public Map<String, String> getExpiringDisclosureSumryData() throws SQLException {
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        SessionImpl sessionImpl = (SessionImpl) session;
        Connection connection = sessionImpl.connection();
        CallableStatement statement = null;
        Map<String, String> additionalData = new HashMap<>();
        ResultSet resultSet = null;
        statement = connection.prepareCall("{call OPA_DIS_RNWAL_RMNDR_MNTLY_SMRY()}");
        statement.execute();
        resultSet = statement.getResultSet();
        if (resultSet.next()) {
            additionalData.put("MODULE_CODE", resultSet.getString("MODULE_CODE"));
            additionalData.put("SUB_MODULE_CODE", resultSet.getString("SUB_MODULE_CODE"));
            additionalData.put("MODULE_ITEM_KEY", resultSet.getString("MODULE_ITEM_KEY"));
            additionalData.put("EXPIRATION_DATE", resultSet.getString("EXPIRATION_DATE"));
            additionalData.put("HTML_CONTENT", resultSet.getString("HTML_CONTENT"));
            additionalData.put("NOTIFICATION_TYPE_ID", resultSet.getString("NOTIFICATION_TYPE_ID"));
            additionalData.put("DAYS_LEFT_TO_EXPIRE", resultSet.getString("DAYS_LEFT_TO_EXPIRE"));
        }
        return additionalData;
    }

    @Override
    public OPADisclosure getLatestOpaDisclosure(String personId) {
    	StringBuilder hql = new StringBuilder();
        hql.append("SELECT d ")
    		.append("FROM OPADisclosure d ")
        	.append("WHERE d.personId = :personId ")
        	.append("AND d.dispositionStatusCode != 2 ")
        	.append("ORDER BY d.versionNumber DESC");
    	Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		TypedQuery<OPADisclosure> query = session.createQuery(hql.toString(), OPADisclosure.class);
        query.setParameter("personId", personId);
		query.setMaxResults(1);
		return query.getResultStream().findFirst().orElse(null);
	}
}
