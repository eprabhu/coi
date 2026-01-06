package com.polus.fibicomp.coi.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import com.polus.core.constants.CoreConstants;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.hibernate.query.NativeQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateCallback;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.persontraining.pojo.PersonTraining;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.dto.DisclosureProjectDto;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.dto.ProjectCommentDto;
import com.polus.fibicomp.coi.dto.ProjectStatusLookupDto;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.pojo.CoiAwardStatusType;
import com.polus.fibicomp.coi.pojo.CoiProjectAwardHistory;
import com.polus.fibicomp.coi.pojo.CoiProjectComment;
import com.polus.fibicomp.coi.pojo.CoiProposalStatusType;
import com.polus.fibicomp.coi.vo.CoiDashboardVO;
import com.polus.fibicomp.coi.vo.MyAwardDashboardVO;
import com.polus.fibicomp.constants.Constants;

import lombok.extern.slf4j.Slf4j;
import oracle.jdbc.OracleTypes;

@Repository
@Transactional
@Slf4j
public class ProjectDaoImpl implements ProjectDao {

	private static final String PROJECT_STATUS_CODE = "statusCode";
	private static final String PROJECT_STATUS_DESCRIPTION = "description";

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Value("${oracledb}")
	private String oracledb;

	@Override
	public void saveComment(CoiProjectComment comment) {
		hibernateTemplate.save(comment);
	}

	@Override
	public void updateComment(ProjectCommentDto dto) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE CoiProjectComment c SET ");
		hqlQuery.append("c.updateTimestamp = :updateTimestamp, ");
		hqlQuery.append("c.updatedBy = :updatedBy, ");
		hqlQuery.append("c.comment = :comment ");
		if (dto.getIsPrivate() != null)
			hqlQuery.append(", c.isPrivate = :isPrivate ");
		hqlQuery.append("WHERE c.commentId = :commentId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("commentId", dto.getCommentId());
		if (dto.getIsPrivate() != null)
			query.setParameter("isPrivate", dto.getIsPrivate());
		query.setParameter("comment", dto.getComment());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginUserName());
		query.executeUpdate();
	}

	@Override
	public List<CoiProjectComment> fetchComment(ProjectCommentDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder cb = session.getCriteriaBuilder();
		CriteriaQuery<CoiProjectComment> cq = cb.createQuery(CoiProjectComment.class);
		Root<CoiProjectComment> root = cq.from(CoiProjectComment.class);
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.equal(root.get("moduleCode"), dto.getModuleCode()));
		predicates.add(cb.equal(root.get("moduleItemKey"), dto.getModuleItemKey()));
		if (dto.getCommentTypeCode() != null) {
			predicates.add(cb.equal(root.get("commentTypeCode"), dto.getCommentTypeCode()));
		}
		cq.select(root).where(predicates.toArray(new Predicate[0]));
		return session.createQuery(cq).getResultList();
	}

	@Override
	public void deleteComment(Integer commentId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("DELETE FROM CoiProjectComment c WHERE c.commentId = :commentId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("commentId", commentId);
		query.executeUpdate();
	}

	@Override
	public Boolean canDeleteComment(Integer commentId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.commentId) > 0) then false else true end ");
		hqlQuery.append("FROM CoiProjectComment c WHERE c.parentCommentId = :commentId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("commentId", commentId);
		return (Boolean) query.getSingleResult();
	}

	@Override
	public List<DisclosureProjectDto> fetchProjectOverview(CoiDashboardVO vo) {
		List<DisclosureProjectDto> projectOverviewList = new ArrayList<>();
		String loginPersonId = AuthenticatedUser.getLoginPersonId();
		ResultSet rset = Constants.PROJECT_AWARD_TAB.equals(vo.getTabName()) 
				? fetchProjectAwardOverview(vo, Boolean.FALSE, loginPersonId)
				: fetchProjectProposalOverview(vo, Boolean.FALSE, loginPersonId);
		try {
			while (rset != null && rset.next()) {
				DisclosureProjectDto projectOverview = DisclosureProjectDto.builder()
						.projectNumber(rset.getString("PROJECT_NUMBER"))
						.projectId(rset.getString("PROJECT_ID")).title(rset.getString("TITLE"))
						.piName(rset.getString("PI_NAME")).keyPersonId(rset.getString("KEY_PERSON_ID"))
						.keyPersonName(rset.getString("KEY_PERSON_NAME"))
						.keyPersonRole(rset.getString("KEY_PERSON_ROLE"))
						.keyPersonRoleCode(rset.getInt("KEY_PERSON_ROLE_CODE"))
						.sponsorName(rset.getString("SPONSOR_NAME"))
						.sponsorCode(rset.getString("SPONSOR_CODE"))
						.primeSponsorName(rset.getString("PRIME_SPONSOR_NAME"))
						.primeSponsorCode(rset.getString("PRIME_SPONSOR_CODE"))
						.leadUnitName(rset.getString("LEAD_UNIT_NAME"))
						.leadUnitNumber(rset.getString("LEAD_UNIT_NUMBER"))
						.homeUnitName(rset.getString("HOME_UNIT_NAME")).homeUnitNumber(rset.getString("HOME_UNIT"))
						.projectStartDate(Constants.PROJECT_AWARD_TAB.equals(vo.getTabName())
								? rset.getTimestamp("AWARD_START_DATE")
								: rset.getTimestamp("PROPOSAL_START_DATE"))
						.projectEndDate(Constants.PROJECT_AWARD_TAB.equals(vo.getTabName())
								? rset.getTimestamp("AWARD_END_DATE")
								: rset.getTimestamp("PROPOSAL_END_DATE"))
						.projectStatus(rset.getString("PROJECT_STATUS"))
						.disclosureRequiredFlag(rset.getString("DISCLOSURE_REQUIRED_FLAG"))
						.certificationFlag(rset.getString("CERTIFICATION_FLAG"))
						.disclosureId(rset.getInt("DISCLOSURE_ID")).projectType(rset.getString("PROJECT_TYPE"))
						.projectTypeCode(rset.getString("PROJECT_TYPE_CODE"))
						.projectBadgeColour(rset.getString("BADGE_COLOR"))
						.projectIcon(rset.getString("PROJECT_ICON"))
						.updateTimestamp(rset.getTimestamp("UPDATE_TIMESTAMP"))
						.commentCount(rset.getInt("COMMENT_COUNT"))
						.documentNumber(rset.getString("DOCUMENT_NUMBER"))
						.accountNumber(rset.getString("ACCOUNT_NUMBER"))
						.personSubmissionStatus(rset.getString("PERSON_SUBMISSION_STATUS"))
						.personReviewStatus(rset.getString("PERSON_REVIEW_STATUS"))
						.projectSubmissionStatus(rset.getString("PROJECT_SUBMISSION_STATUS"))
						.projectReviewStatus(rset.getString("PROJECT_REVIEW_STATUS"))
						.completeCount(rset.getInt("COMPLETE_COUNT"))
						.inCompleteCount(rset.getInt("INCOMPLETE_COUNT"))
						.pck(rset.getString("PCK"))
						.sponsorRequirement(rset.getString("SPONSOR_HIERARCY"))
						.mandatorySelf(rset.getString("DISCLOSURE_VALIDATION_FLAG"))
						.resubmissionFlag(rset.getString("RESUBMISSION_FLAG"))
						.info(rset.getString("INFO"))
						.personNonEmployeeFlag(rset.getString("NON_EMPLOYEE_FLAG"))
						.personCommentCount(rset.getInt("PERSON_COMMENT_COUNT"))
						.trainingStatus(rset.getString("TRAINING_STATUS"))
						.build();
				projectOverviewList.add(projectOverview);
			}
		} catch (Exception e) {
			log.error("Exception on fetchProjectOverview {}", e.getMessage());
			throw new ApplicationException("Unable to fetch project overview details", e, Constants.DB_PROC_ERROR);
		}
		return projectOverviewList;
	}

	private ResultSet fetchProjectAwardOverview(CoiDashboardVO vo, Boolean isCount, String loginPersonId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		Map<String, String> sort = vo.getSort();
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_COI_AWARD_PROJECT_OVERVIEW(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}");
				statement.setString(1, vo.getProperty2()); // AV_AWARD_TITLE
				statement.setString(2, vo.getProperty6()); // AV_AWARD_NUMBER
				statement.setString(3, vo.getProperty3()); // AV_UNIT_NUMBER
				statement.setString(4, vo.getPersonIdentifier()); // AV_PERSON
				statement.setString(5, (vo.getProperty4() != null && !vo.getProperty4().isEmpty())
								? String.join(",", vo.getProperty4())
								: null); // AV_AWARD_STATUS
				statement.setString(6, (vo.getProperty5() != null && !vo.getProperty5().isEmpty())
								? String.join(",", vo.getProperty5())
								: null); // AV_REVIEW_STATUS
				statement.setString(7, vo.getProperty9()); // AV_SPONSOR
				statement.setString(8, vo.getProperty11()); // AV_PRIME_SPONSOR
				statement.setString(9, vo.getProperty13()); // AV_AWARD_START_DATE
				statement.setString(10, vo.getProperty14()); // AV_AWARD_END_DATE;
				statement.setInt(11, (vo.getCurrentPage() == null ? 1 : vo.getCurrentPage() - 1));
				statement.setInt(12, (vo.getPageNumber() == null ? 20 : vo.getPageNumber()));
				statement.setBoolean(13, isCount);
				statement.setString(14, vo.getAdvancedSearch());
				statement.setString(15, setSortOrderForProject(sort));
				statement.setString(16, vo.getAccountNumber());
				statement.setString(17, vo.getPiPersonIdentifier());
				statement.setString(18, loginPersonId);
				statement.setString(19, (vo.getCoiSubmissionStatus() != null && !vo.getCoiSubmissionStatus().isEmpty()) ? String.join(",", vo.getCoiSubmissionStatus()) : null);
				statement.setString(20, vo.getCaPersonIdentifier());
				statement.setString(21, (vo.getFreeTextSearchFields() != null && !vo.getFreeTextSearchFields().isEmpty()) ? String.join(",", vo.getFreeTextSearchFields()) : null);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call GET_COI_AWARD_PROJECT_OVERVIEW(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setString(2, vo.getProperty2());
				statement.setString(3, vo.getProperty6());
				statement.setString(4, vo.getProperty3());
				statement.setString(5, vo.getPersonIdentifier());
				statement.setString(6, (vo.getProperty4() != null && !vo.getProperty4().isEmpty())
								? String.join(",", vo.getProperty4())
								: null);
				statement.setString(7, (vo.getProperty5() != null && !vo.getProperty5().isEmpty())
								? String.join(",", vo.getProperty5())
								: null);
				statement.setString(8, vo.getProperty9());
				statement.setString(9, vo.getProperty11());
				statement.setString(10, vo.getProperty13());
				statement.setString(11, vo.getProperty14());
				statement.setInt(12, (vo.getCurrentPage() == null ? 1 : vo.getCurrentPage() - 1));
				statement.setInt(13, (vo.getPageNumber() == null ? 20 : vo.getPageNumber()));
				statement.setBoolean(14, Boolean.FALSE);
				statement.setString(15, vo.getAdvancedSearch());
				statement.setString(16, setSortOrderForProject(sort));
				statement.setString(17, vo.getAccountNumber()); 
				statement.setString(18, vo.getPiPersonIdentifier());
				statement.setString(19, loginPersonId);
				statement.setString(20, (vo.getCoiSubmissionStatus() != null && !vo.getCoiSubmissionStatus().isEmpty()) ? String.join(",", vo.getCoiSubmissionStatus()) : null);
				statement.setString(21, vo.getCaPersonIdentifier());
				statement.setString(22, (vo.getFreeTextSearchFields() != null && !vo.getFreeTextSearchFields().isEmpty()) ? String.join(",", vo.getFreeTextSearchFields()) : null);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
		} catch (Exception e) {
			log.error("Exception on fetchProjectOverview {}", e.getMessage());
			throw new ApplicationException("Unable to fetch project overview details", e, Constants.DB_PROC_ERROR);
		}
		return rset;
	}

	private ResultSet fetchProjectProposalOverview(CoiDashboardVO vo, Boolean isCount, String loginPersonId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		Map<String, String> sort = vo.getSort();
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_PROJECT_OVERVIEW(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}");
				statement.setString(1, vo.getFilterType());
				statement.setString(2, vo.getProperty2()); // AV_PROPOSAL_TITLE
				statement.setString(3, vo.getProperty6()); // AV_PROPOSAL_NUMBER
				statement.setString(4, vo.getProperty3()); // AV_UNIT_NUMBER
				statement.setString(5, vo.getPersonIdentifier()); // AV_PERSON
				statement.setString(6, (vo.getProperty4() != null && !vo.getProperty4().isEmpty())
								? String.join(",", vo.getProperty4())
								: null); // AV_PROPOSAL_STATUS
				statement.setString(7, (vo.getProperty5() != null && !vo.getProperty5().isEmpty())
								? String.join(",", vo.getProperty5())
								: null); // AV_REVIEW_STATUS
				statement.setString(8, vo.getProperty9()); // AV_SPONSOR
				statement.setString(9, vo.getProperty11()); // AV_PRIME_SPONSOR
				statement.setString(10, vo.getProperty13()); // AV_PROPOSAL_START_DATE
				statement.setString(11, vo.getProperty14()); // AV_PROPOSAL_END_DATE;
				statement.setInt(12, (vo.getCurrentPage() == null ? 1 : vo.getCurrentPage() - 1));
				statement.setInt(13, (vo.getPageNumber() == null ? 20 : vo.getPageNumber()));
				statement.setBoolean(14, isCount);
				statement.setString(15, vo.getAdvancedSearch());
				statement.setString(16, setSortOrderForProject(sort));
				statement.setString(17, vo.getPiPersonIdentifier());
				statement.setString(18, loginPersonId);
				statement.setString(19, (vo.getCoiSubmissionStatus() != null && !vo.getCoiSubmissionStatus().isEmpty()) ? String.join(",", vo.getCoiSubmissionStatus()) : null);
				statement.setString(20, vo.getCaPersonIdentifier());
				statement.setString(21, (vo.getFreeTextSearchFields() != null && !vo.getFreeTextSearchFields().isEmpty()) ? String.join(",", vo.getFreeTextSearchFields()) : null);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call GET_PROJECT_OVERVIEW(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setString(2, vo.getFilterType());
				statement.setString(3, vo.getProperty2());
				statement.setString(4, vo.getProperty6());
				statement.setString(5, vo.getProperty3());
				statement.setString(6, vo.getPersonIdentifier());
				statement.setString(7, (vo.getProperty4() != null && !vo.getProperty4().isEmpty())
								? String.join(",", vo.getProperty4())
								: null);
				statement.setString(8, (vo.getProperty5() != null && !vo.getProperty5().isEmpty())
								? String.join(",", vo.getProperty5())
								: null);
				statement.setString(9, vo.getProperty9());
				statement.setString(10, vo.getProperty11());
				statement.setString(11, vo.getProperty13());
				statement.setString(12, vo.getProperty14());
				statement.setInt(13, (vo.getCurrentPage() == null ? 1 : vo.getCurrentPage() - 1));
				statement.setInt(14, (vo.getPageNumber() == null ? 20 : vo.getPageNumber()));
				statement.setBoolean(15, Boolean.FALSE);
				statement.setString(16, vo.getAdvancedSearch());
				statement.setString(17, setSortOrderForProject(sort));
				statement.setString(18, vo.getPiPersonIdentifier());
				statement.setString(19, loginPersonId);
				statement.setString(20, (vo.getCoiSubmissionStatus() != null && !vo.getCoiSubmissionStatus().isEmpty()) ? String.join(",", vo.getCoiSubmissionStatus()) : null);
				statement.setString(21, vo.getCaPersonIdentifier());
				statement.setString(22, (vo.getFreeTextSearchFields() != null && !vo.getFreeTextSearchFields().isEmpty()) ? String.join(",", vo.getFreeTextSearchFields()) : null);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
		} catch (Exception e) {
			log.error("Exception on fetchProjectOverview {}", e.getMessage());
			throw new ApplicationException("Unable to fetch project overview details", e, Constants.DB_PROC_ERROR);
		}
		return rset;
	}

	private String setSortOrderForProject(Map<String, String> sort) {
		String sortOrder = null;
		if (!sort.isEmpty()) {
			for (Map.Entry<String, String> mapElement : sort.entrySet()) {
				if (mapElement.getKey().equals("updateTimestamp")) {
					sortOrder = (sortOrder == null ? "T1.UPDATE_TIMESTAMP " + mapElement.getValue() : sortOrder + ", T1.UPDATE_TIMESTAMP " + mapElement.getValue());
				} else if (mapElement.getKey().equals("projectSubmissionStatus")) {
					sortOrder = (sortOrder == null ? "T1.PROJECT_SUBMISSION_STATUS " + mapElement.getValue() : sortOrder + ", T1.PROJECT_SUBMISSION_STATUS " + mapElement.getValue());
				} else if (mapElement.getKey().equals("projectReviewStatus")) {
					sortOrder = (sortOrder == null ? "T1.PROJECT_REVIEW_STATUS " + mapElement.getValue() : sortOrder + ", T1.PROJECT_REVIEW_STATUS " + mapElement.getValue());
				} else if (mapElement.getKey().equals("title")) {
					sortOrder = (sortOrder == null ? "T1.TITLE " + mapElement.getValue() : sortOrder + ", T1.TITLE " + mapElement.getValue());
				} else if (mapElement.getKey().equals("leadUnitName")) {
					sortOrder = (sortOrder == null ? "T1.LEAD_UNIT_NAME " + mapElement.getValue() : sortOrder + ", T1.LEAD_UNIT_NAME " + mapElement.getValue());
				} else if (mapElement.getKey().equals("sponsorName")) {
					sortOrder = (sortOrder == null ? "T1.SPONSOR_NAME " + mapElement.getValue() : sortOrder + ", T1.SPONSOR_NAME " + mapElement.getValue());
				} else if (mapElement.getKey().equals("primeSponsorName")) {
					sortOrder = (sortOrder == null ? "T1.PRIME_SPONSOR_NAME " + mapElement.getValue() : sortOrder + ", T1.PRIME_SPONSOR_NAME " + mapElement.getValue());
				}
			}
		}
		return sortOrder;
	}

	@Override
	public Integer fetchProjectOverviewCount(CoiDashboardVO vo) {
		String loginPersonId = AuthenticatedUser.getLoginPersonId();
		ResultSet rset = Constants.PROJECT_AWARD_TAB.equals(vo.getTabName())
				? fetchProjectAwardOverview(vo, vo.getIsDownload(), loginPersonId)
				: fetchProjectProposalOverview(vo, vo.getIsDownload(), loginPersonId);
		try {
			while (rset != null && rset.next()) {
				return Constants.PROJECT_AWARD_TAB.equals(vo.getTabName())
						? rset.getInt("AWARD_COUNT")
						: rset.getInt("PROPOSAL_COUNT");
			}
		} catch (Exception e) {
			log.error("Exception on fetchProjectOverview {}", e.getMessage());
			throw new ApplicationException("Unable to fetch project overview details", e, Constants.DB_PROC_ERROR);
		}
		return null;
	}

	@Override
	public List<ProjectStatusLookupDto> getProposalStatusLookup() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder cb = session.getCriteriaBuilder();
		CriteriaQuery<ProjectStatusLookupDto> cq = cb.createQuery(ProjectStatusLookupDto.class);
		Root<CoiProposalStatusType> root = cq.from(CoiProposalStatusType.class);
		cq.select(cb.construct(ProjectStatusLookupDto.class, root.get(PROJECT_STATUS_CODE), root.get(PROJECT_STATUS_DESCRIPTION)));
		cq.orderBy(cb.asc(root.get(PROJECT_STATUS_CODE)));
		return session.createQuery(cq).getResultList();
	}

	@Override
	public List<DisclosureProjectDto> fetchMyAwards(MyAwardDashboardVO vo, Boolean isCount) {
		List<DisclosureProjectDto> awardDtos = new ArrayList<>();
		ResultSet rset = fetchAwardDashboardOverview(vo, isCount);
		try {
			while (rset != null && rset.next()) {
				prepareProjectDTO(rset, awardDtos);
			}
		} catch (Exception e) {
			log.error("Exception on fetchMyAwards {}", e.getMessage());
			throw new ApplicationException("Unable to fetch awards details", e, Constants.DB_PROC_ERROR);
		}
		return awardDtos;
	}

	private List<DisclosureProjectDto> prepareProjectDTO(ResultSet rset, List<DisclosureProjectDto> awardDtos) throws SQLException {
		DisclosureProjectDto projectOverview = DisclosureProjectDto.builder()
				.projectNumber(rset.getString("PROJECT_NUMBER"))
				.projectId(rset.getString("PROJECT_ID")).title(rset.getString("TITLE"))
				.piName(rset.getString("PI_NAME"))
				.keyPersonRole(rset.getString("KEY_PERSON_ROLE")).sponsorName(rset.getString("SPONSOR_NAME"))
				.sponsorCode(rset.getString("SPONSOR_CODE"))
				.primeSponsorName(rset.getString("PRIME_SPONSOR_NAME"))
				.primeSponsorCode(rset.getString("PRIME_SPONSOR_CODE"))
				.leadUnitName(rset.getString("LEAD_UNIT_NAME"))
				.leadUnitNumber(rset.getString("LEAD_UNIT_NUMBER"))
				.projectStartDate(rset.getTimestamp("AWARD_START_DATE"))
				.projectEndDate(rset.getTimestamp("AWARD_END_DATE"))
				.projectStatus(rset.getString("PROJECT_STATUS"))
				.projectType(rset.getString("PROJECT_TYPE"))
				.projectTypeCode(rset.getString("PROJECT_TYPE_CODE"))
				.projectBadgeColour(rset.getString("BADGE_COLOR"))
				.projectIcon(rset.getString("PROJECT_ICON"))
				.updateTimestamp(rset.getTimestamp("UPDATE_TIMESTAMP"))
				.documentNumber(rset.getString("DOCUMENT_NUMBER"))
				.accountNumber(rset.getString("ACCOUNT_NUMBER"))
				.build();
		awardDtos.add(projectOverview);
		return awardDtos;
	}

	private ResultSet fetchAwardDashboardOverview(MyAwardDashboardVO vo, Boolean isCount) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		try {
			String personId = AuthenticatedUser.getLoginPersonId();
			Integer currentPage = vo.getCurrentPage();
			Integer pageNumber = vo.getPaginationLimit();
			String searchWord = vo.getSearchWord();
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_AWARD_DASHBOARD_OVERVIEW(?,?,?,?,?)}");
				if(personId == null) {
					statement.setNull(1, Types.VARCHAR);
				} else {
					statement.setString(1, personId);
				}
				statement.setInt(2, (currentPage == null ? 0 : currentPage - 1));
				statement.setInt(3, (pageNumber == null ? 0 : pageNumber));
				statement.setBoolean(4, isCount);
				statement.setString(5, searchWord);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call GET_AWARD_DASHBOARD_OVERVIEW(?,?,?,?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				if(personId == null) {
					statement.setNull(2, Types.VARCHAR);
				} else {
					statement.setString(2, personId);
				}				
				statement.setInt(3, (currentPage == null ? 0 : currentPage - 1));
				statement.setInt(4, (pageNumber == null ? 0 : pageNumber));
				statement.setBoolean(5, isCount);
				statement.setString(6, searchWord);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
		} catch (Exception e) {
			log.error("Exception on fetchAwardDashboardOverview {}", e.getMessage());
			throw new ApplicationException("Unable to fetch award overview details", e, Constants.DB_PROC_ERROR);
		}
		return rset;
	}

	@Override
	public void saveCoiProjectAwardHistory(CoiProjectAwardHistory coiProjectAwardHistory) {
		hibernateTemplate.save(coiProjectAwardHistory);
	}

	@Override
	public List<CoiProjectAwardHistory> fetchCoiProjectAwardHistory(String awardNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    CriteriaBuilder cb = session.getCriteriaBuilder();
	    CriteriaQuery<CoiProjectAwardHistory> cq = cb.createQuery(CoiProjectAwardHistory.class);
	    Root<CoiProjectAwardHistory> root = cq.from(CoiProjectAwardHistory.class);
	    cq.where(cb.equal(root.get("awardNumber"), awardNumber));
	    cq.select(root);
	    cq.orderBy(cb.desc(root.get("updateTimestamp")));
	    return session.createQuery(cq).getResultList();
	}

	@Override
	public List<String> getProjectPersonsForReDisclose(String projectNumber) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d.KEY_PERSON_ID FROM COI_INT_STAGE_AWARD_PERSON d ")
                .append("WHERE d.PROJECT_NUMBER = :projectNumber and STATUS <> 'I'");
        Query query = session.createNativeQuery(hqlQuery.toString());
        query.setParameter("projectNumber", projectNumber);
        return query.getResultList();
	}

	@Override
	public Integer getCountBySponsorCodeAndRequirement(List<String> sponsorCodes, List<String> requirements) {
		return hibernateTemplate.execute((HibernateCallback<Integer>) session -> {
			String sql = "SELECT COUNT(*) FROM SPONSOR_DISCLOSURE_REQUIREMENTS "
					+ "WHERE SPONSOR_CODE IN (:sponsorCodes) AND KEY_PERSON_DISCL_REQUIREMENT IN (:requirements)";

			NativeQuery<?> query = session.createNativeQuery(sql);
			query.setParameterList("sponsorCodes", sponsorCodes);
			query.setParameterList("requirements", requirements);

			Object result = query.uniqueResult();
			return (result != null) ? ((Number) result).intValue() : 0;
		});
	}

	@Override
	public List<PersonTraining> getPersonTrainingByParams(String personId, Integer trainingCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("FROM PersonTraining pt WHERE pt.personId = :personId AND pt.trainingCode = :trainingCode");

		org.hibernate.query.Query<PersonTraining> query = session.createQuery(hqlQuery.toString(), PersonTraining.class);
		query.setParameter("personId", personId);
		query.setParameter("trainingCode", trainingCode);

		return query.getResultList();
	}

	@Override
	public List<ProjectStatusLookupDto> getAwardStatusLookup() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder cb = session.getCriteriaBuilder();
		CriteriaQuery<ProjectStatusLookupDto> cq = cb.createQuery(ProjectStatusLookupDto.class);
		Root<CoiAwardStatusType> root = cq.from(CoiAwardStatusType.class);
		cq.select(cb.construct(ProjectStatusLookupDto.class, root.get(PROJECT_STATUS_CODE),
				root.get(PROJECT_STATUS_DESCRIPTION)));
		cq.orderBy(cb.asc(root.get(PROJECT_STATUS_CODE)));
		return session.createQuery(cq).getResultList();
	}

	@Override
	public Integer fetchMyAwardCount(MyAwardDashboardVO vo, Boolean isCount) {
		ResultSet rset = fetchAwardDashboardOverview(vo, isCount);
		try {
			while (rset != null && rset.next()) {
				return rset.getInt("COUNT");
			}
		} catch (Exception e) {
			log.error("Exception on fetchMyAwardCount {}", e.getMessage());
			throw new ApplicationException("Unable to fetch reporter award dashboard details", e, Constants.DB_PROC_ERROR);
		}
		return null;
	}

	@Override
	public Boolean isDisclosureCompleteForProject(String projectNumber) {
		StringBuilder sql = new StringBuilder();
		sql.append("SELECT CASE ");
		sql.append("WHEN COUNT(*) = SUM(CASE WHEN NEW_DISCLOSURE_REQUIRED = 'N' THEN 1 ELSE 0 END) ");
		sql.append("THEN 'true' ELSE 'false' END AS all_flags_n ");
		sql.append("FROM COI_INT_STAGE_AWARD_PERSON ");
		sql.append("WHERE PROJECT_NUMBER = :projectNumber AND STATUS = 'A'");

		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Query query = session.createNativeQuery(sql.toString());
		query.setParameter("projectNumber", projectNumber);

		Object result = query.getSingleResult();
		return result != null && Boolean.parseBoolean(result.toString());
	}

	@Override
	public List<CoiNotificationLog> fetchProjectNotificationHistory(NotificationDto request) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder cb = session.getCriteriaBuilder();
		CriteriaQuery<CoiNotificationLog> cq = cb.createQuery(CoiNotificationLog.class);
		Root<CoiNotificationLog> logRoot = cq.from(CoiNotificationLog.class);

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.equal(logRoot.get("moduleSubItemKey"), request.getProjectId()));
		predicates.add(cb.equal(logRoot.get("actionType"), request.getActionType()));

		cq.select(logRoot).where(cb.and(predicates.toArray(new Predicate[0]))).orderBy(cb.desc(logRoot.get("sendDate"))).distinct(true);

		return session.createQuery(cq).getResultList();
	}

	@Override
	public String fetchProjectTitle(Integer moduleCode, String moduleItemKey) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT TITLE FROM ");
		if (Constants.AWARD_MODULE_CODE.equals(moduleCode)) {
			hqlQuery.append("COI_INT_STAGE_AWARD");
			hqlQuery.append(" WHERE PROJECT_NUMBER = :projectNumber ");
		} else if (Constants.DEV_PROPOSAL_MODULE_CODE.equals(moduleCode)) {
			hqlQuery.append("COI_INT_STAGE_DEV_PROPOSAL");
			hqlQuery.append(" WHERE PROPOSAL_NUMBER = :projectNumber ");
		} else if (Constants.INST_PROPOSAL_MODULE_CODE.equals(moduleCode)) {
			hqlQuery.append("COI_INT_STAGE_PROPOSAL");
			hqlQuery.append(" WHERE PROJECT_NUMBER = :projectNumber ");
		}
		Query query = session.createNativeQuery(hqlQuery.toString());
	    if (Constants.AWARD_MODULE_CODE.equals(moduleCode) || Constants.DEV_PROPOSAL_MODULE_CODE.equals(moduleCode) || Constants.INST_PROPOSAL_MODULE_CODE.equals(moduleCode)) {
	        query.setParameter("projectNumber", moduleItemKey);
	    }
		List<?> resultList = query.getResultList();
		return (resultList != null && !resultList.isEmpty()) ? (String) resultList.get(0) : null;
	}

	@Override
	public Integer fetchCommentCount(ProjectCommentDto projectCommentDto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    CriteriaBuilder cb = session.getCriteriaBuilder();
	    CriteriaQuery<Long> cq = cb.createQuery(Long.class);
	    Root<CoiProjectComment> root = cq.from(CoiProjectComment.class);
	    cq.select(cb.count(root));
	    Predicate moduleCodePredicate = cb.equal(root.get("moduleCode"), projectCommentDto.getModuleCode());
	    Predicate moduleItemKeyPredicate = cb.equal(root.get("moduleItemKey"), projectCommentDto.getModuleItemKey());
	    Predicate commentTypePredicate = cb.equal(root.get("commentTypeCode"), Constants.PROJECT_COMMENT_TYPE_GENERAL);
	    Predicate basePredicate = cb.and(moduleCodePredicate, moduleItemKeyPredicate, commentTypePredicate);
	    if (Boolean.FALSE.equals(projectCommentDto.getReplyCommentsCountRequired())) {
	        Predicate noRepliesPredicate = cb.isNull(root.get("parentCommentId"));
	        basePredicate = cb.and(basePredicate, noRepliesPredicate);
	    }
	    cq.where(basePredicate);
	    Long count = session.createQuery(cq).getSingleResult();
	    return count != null ? count.intValue() : 0;
	}

	@Override
	public List<DisclosureProjectDto> fetchMyProposals(CoiDashboardVO vo, boolean isCount) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		List<DisclosureProjectDto> proposalDetails = new ArrayList<>();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		ResultSet rset = null;
		try {
			rset = setMyProposalProCallParams(vo, isCount, connection, rset);
			while (rset != null && rset.next()) {
				DisclosureProjectDto detail = new DisclosureProjectDto();
				detail.setModuleCode(Constants.DEV_PROPOSAL_MODULE_CODE);
				detail.setProjectNumber(rset.getString("PROPOSAL_ID"));
				detail.setProjectId(rset.getString("PROPOSAL_ID"));
				detail.setTitle(rset.getString("TITLE"));
				detail.setProjectStartDate(rset.getTimestamp("START_DATE"));
				detail.setProjectEndDate(rset.getTimestamp("END_DATE"));
				detail.setLeadUnitNumber(rset.getString("HOME_UNIT_NUMBER"));
				detail.setLeadUnitName(rset.getString("HOME_UNIT_NAME"));
				detail.setSponsorName(rset.getString("SPONSOR_NAME"));
				detail.setSponsorCode(rset.getString("SPONSOR_CODE"));
				detail.setPrimeSponsorCode(rset.getString("PRIME_SPONSOR_CODE"));
				detail.setPrimeSponsorName(rset.getString("PRIME_SPONSOR_NAME"));
				detail.setPiName(rset.getString("PI"));
				detail.setProjectStatus(rset.getString("STATUS"));
				detail.setReporterRole(rset.getString("KEY_PERSON_ROLE_NAME"));
				detail.setKeyPersonName(rset.getString("KEY_PERSON"));
				detail.setKeyPersonId(rset.getString("KEY_PERSON_ID"));
				detail.setKeyPersonRole(rset.getString("KEY_PERSON_ROLE_NAME"));
				detail.setProjectTypeCode(rset.getString("PROJECT_TYPE_CODE"));
				detail.setProjectType(rset.getString("PROJECT_TYPE"));
				detail.setProjectBadgeColour(rset.getString("BADGE_COLOR"));
				detail.setProjectIcon(rset.getString("PROJECT_ICON"));
				proposalDetails.add(detail);
			}
		} catch (SQLException e) {
			log.error("Exception in getProposalDashboard: {} ", e.getMessage());
			throw new ApplicationException("Unable to fetch data!", e, CoreConstants.DB_PROC_ERROR);
		}
		return proposalDetails;
	}

	private ResultSet setMyProposalProCallParams(CoiDashboardVO vo, boolean isCount, Connection connection, ResultSet rset) throws SQLException {
		CallableStatement statement;
		statement = connection.prepareCall("{call GET_COI_PROPOSAL_DASHBOARD(?,?,?,?,?,?)}");
		statement.setString(1, vo.getPersonIdentifier());
		if (vo.getSearchKeyword() == null) {
			statement.setNull(2, Types.VARCHAR);
		} else {
			statement.setString(2, vo.getSearchKeyword());
		}
		statement.setInt(3, (vo.getCurrentPage() == null ? 0 : vo.getCurrentPage() - 1));
		statement.setInt(4, (vo.getPageNumber() == null ? 0 : vo.getPageNumber()));
		statement.setBoolean(5, isCount);
		statement.setBoolean(6, vo.getIsUnlimited());
		statement.execute();
		rset = statement.getResultSet();
		return rset;
	}

	@Override
	public Integer fetchMyProposalsCount(CoiDashboardVO vo, boolean isCount) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		ResultSet rset = null;
		Integer count = 0;
		try {
			rset = setMyProposalProCallParams(vo, isCount, connection, rset);
			while (rset != null && rset.next()) {
				count = rset.getInt("COUNT");
			}
		} catch (Exception e) {
			log.error("Exception in fetchMyProposalsCount: {} ", e.getMessage());
			throw new ApplicationException("Unable to fetch data!", e, CoreConstants.DB_PROC_ERROR);
		}
		return count;
	}

	@Override
	public Boolean resolveComment(Integer commentId) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaUpdate<CoiProjectComment> update = cb.createCriteriaUpdate(CoiProjectComment.class);
			Root<CoiProjectComment> root = update.from(CoiProjectComment.class);

			update.set(root.get("isResolved"), true);
			update.set(root.get("resolvedBy"), AuthenticatedUser.getLoginPersonId());
			update.set(root.get("resolvedTimestamp"), commonDao.getCurrentTimestamp());
			update.set(root.get("updateTimestamp"), commonDao.getCurrentTimestamp());
			update.set(root.get("updatedBy"), AuthenticatedUser.getLoginUserName());
			update.where(cb.equal(root.get("commentId"), commentId));

			int rowsUpdated = session.createQuery(update).executeUpdate();
			return rowsUpdated > 0;
		} catch (Exception e) {
			throw new RuntimeException("Failed to update comment as resolved", e);
		}
	}

}
