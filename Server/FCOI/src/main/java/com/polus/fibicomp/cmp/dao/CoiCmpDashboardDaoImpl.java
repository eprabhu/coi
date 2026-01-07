package com.polus.fibicomp.cmp.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.transaction.Transactional;

import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.constants.CoreConstants;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardDto;
import com.polus.fibicomp.cmp.dto.CoiCmpAdmDashboardReqDto;
import com.polus.fibicomp.cmp.dto.CoiCmpDashboardResponseDto;
import com.polus.fibicomp.cmp.dto.CoiCmpRepDashboardDto;
import com.polus.fibicomp.config.CustomExceptionService;
import com.polus.fibicomp.constants.Constants;

import lombok.extern.slf4j.Slf4j;

@Repository
@Transactional
@Slf4j
public class CoiCmpDashboardDaoImpl implements CoiCmpDashboardDao{
	
	@Autowired
	private HibernateTemplate hibernateTemplate;
	
	@Autowired
	private CustomExceptionService exceptionService;

	@Override
	public CoiCmpDashboardResponseDto getCmpAdminDashboard(CoiCmpAdmDashboardReqDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		ResultSet resultSet = null;
		CoiCmpDashboardResponseDto responseDto =  new CoiCmpDashboardResponseDto();
		try {
			resultSet = getCmpAdminDashboardResultSet(dto, connection, false);
			List<CoiCmpDashboardDto> cmpDashboardValues = new ArrayList<>();
			while (resultSet.next()) {
				cmpDashboardValues.add(setCmpDashboardValues(resultSet));
			}
			ResultSet countResultSet = getCmpAdminDashboardResultSet(dto, connection, true);
			while (countResultSet.next()) {
				responseDto.setTotalCount(Integer.parseInt(countResultSet.getString(1)));
			}
			responseDto.setRecords(cmpDashboardValues);
			return responseDto;
		} catch (Exception e) {
			log.error("Error in fetching CMP admin dashboard {}", e.getMessage());
			throw new ApplicationException("Error in getCmpAdminDashboard {}", e, Constants.JAVA_ERROR);
		}
	}
	
	private ResultSet getCmpAdminDashboardResultSet(CoiCmpAdmDashboardReqDto dto, Connection connection, boolean isCount) throws SQLException {
		ResultSet resultSet;
		CallableStatement statement;
		String cmpPerson = dto.getCmpPerson();
		String cmpRolodex = dto.getCmpRolodex();
		List<String> cmpTypeCode = dto.getCmpTypeCode();
		List<String> cmpStatusCode = dto.getCmpStatusCode();
		String approvalStartDate = dto.getApprovalStartDate();
		String approvalEndDate = dto.getApprovalEndDate();
		String expirationStartDate = dto.getExpirationStartDate();
		String expirationEndDate = dto.getExpirationEndDate();
		String leadUnit = dto.getLeadUnit();
		String sponsorAwardNumber = dto.getSponsorAwardNumber();
		String pi = dto.getPrincipleInvestigator();
		String sponsor = dto.getSponsor();
		String entity = dto.getEntity();
		String projectTitle = dto.getProjectTitle();
		String projectNumber = dto.getProjectNumber();
		String advancedSearch = dto.getAdvancedSearch();
		Map<String, String> sort = dto.getSort();
		Boolean isDownload = dto.getIsDownload();
		Integer currentPage = dto.getCurrentPage();
		Integer pageNumber = dto.getPageNumber();
		String homeUnit = dto.getHomeUnit();
		List<String> freeTextSearchFields = dto.getFreeTextSearchFields();

		statement = connection.prepareCall("{call GET_CMP_ADMIN_DASHBOARD(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}");
		statement.setString(1, cmpPerson);
		statement.setString(2, cmpRolodex);
		statement.setString(3, cmpTypeCode != null && !cmpTypeCode.isEmpty() ? String.join(",", cmpTypeCode) : null);
		statement.setString(4, cmpStatusCode != null && !cmpStatusCode.isEmpty() ? String.join(",", cmpStatusCode) : null);
		statement.setString(5, approvalStartDate);
		statement.setString(6, approvalEndDate);
		statement.setString(7, expirationStartDate);
		statement.setString(8, expirationEndDate);
		statement.setString(9, leadUnit);
		statement.setString(10, sponsorAwardNumber);
		statement.setString(11, pi);
		statement.setString(12, sponsor);
		statement.setString(13, entity);
		statement.setString(14, projectTitle);
		statement.setString(15, projectNumber);
		statement.setString(16, AuthenticatedUser.getLoginPersonId());
		statement.setString(17, advancedSearch);
		statement.setString(18, setSortOrderForCmp(sort));
		statement.setBoolean(19, isDownload);
		statement.setInt(20, (currentPage == null ? 0 : currentPage - 1));
		statement.setInt(21, (pageNumber == null ? 0 : pageNumber));
		statement.setBoolean(22, isCount);
		statement.setString(23, homeUnit);
		statement.setString(24, (freeTextSearchFields != null && !freeTextSearchFields.isEmpty() ? String.join(",", freeTextSearchFields): null));
		statement.execute();
		resultSet = statement.getResultSet();
		return resultSet;
	}
	
	@Override
	public CoiCmpDashboardResponseDto getCmpReporterDashboard(CoiCmpRepDashboardDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		ResultSet resultSet = null;
		CoiCmpDashboardResponseDto responseDto =  new CoiCmpDashboardResponseDto();
		try {
			resultSet = getCmpReporterDashboardResultSet(dto, connection, false);
			List<CoiCmpDashboardDto> cmpDashboardValues = new ArrayList<>();
			while (resultSet.next()) {
				cmpDashboardValues.add(setCmpDashboardValues(resultSet));
			}
			ResultSet countResultSet = getCmpReporterDashboardResultSet(dto, connection, true);
			while (countResultSet.next()) {
				responseDto.setTotalCount(Integer.parseInt(countResultSet.getString(1)));
			}
			responseDto.setRecords(cmpDashboardValues);
			return responseDto;
		} catch (Exception e) {
			log.error("Error in fetching CMP reporter dashboard {}", e.getMessage());
			throw new ApplicationException("Error in getCmpReporterDashboard {}", e, Constants.JAVA_ERROR);
		}
	}
	
	@Override
	public List<CoiCmpDashboardDto> getCmpHistoryDashboard(CoiCmpRepDashboardDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		ResultSet resultSet = null;
		try {
			resultSet = getCmpReporterDashboardResultSet(dto, connection, false);
			List<CoiCmpDashboardDto> cmpDashboardValues = new ArrayList<>();
			while (resultSet.next()) {
				cmpDashboardValues.add(setCmpDashboardValues(resultSet));
			}
			return cmpDashboardValues;
		} catch (Exception e) {
			log.error("Error in fetching CMP history dashboard {}", e.getMessage());
			throw new ApplicationException("Error in getCmpReporterDashboard {}", e, Constants.JAVA_ERROR);
		}
	}
	
	private ResultSet getCmpReporterDashboardResultSet(CoiCmpRepDashboardDto dto, Connection connection, boolean isCount) throws SQLException {
		ResultSet resultSet;
		CallableStatement statement;
		Map<String, String> sort = dto.getSort();
		String personId = dto.getCmpPersonId();
		if (personId == null || personId.isBlank()) {
		    personId = AuthenticatedUser.getLoginPersonId();
		}
		Boolean isDownload = dto.getIsDownload();
		Integer currentPage = dto.getCurrentPage();
		Integer pageNumber = dto.getPageNumber();

		statement = connection.prepareCall("{call GET_CMP_REPORTER_DASHBOARD(?,?,?,?,?,?,?)}");
		statement.setString(1, personId);
		statement.setString(2, AuthenticatedUser.getLoginPersonId());
		statement.setString(3, (sort == null ? null : setSortOrderForCmp(sort)));
		statement.setBoolean(4, isDownload);
		statement.setInt(5, (currentPage == null ? 0 : currentPage - 1));
		statement.setInt(6, (pageNumber == null ? 0 : pageNumber));
		statement.setBoolean(7, isCount);
		statement.execute();
		resultSet = statement.getResultSet();
		return resultSet;
	}
	
	private String setSortOrderForCmp(Map<String, String> sort) {
		String sortOrder = null;
		if (!sort.isEmpty()) {
			for (Map.Entry<String, String> mapElement : sort.entrySet()) {
				if (mapElement.getKey().equals("updateTimeStamp")) {
					sortOrder = (sortOrder == null ? "T.UPDATE_TIMESTAMP " + mapElement.getValue() : sortOrder + ", T.UPDATE_TIMESTAMP " + mapElement.getValue());
				} else if (mapElement.getKey().equals("cmpType")) {
					sortOrder = (sortOrder == null ? "T.CMP_TYPE " + mapElement.getValue() : sortOrder + ", T.CMP_TYPE " + mapElement.getValue());
				} else if (mapElement.getKey().equals("homeUnitName")) {
					sortOrder = (sortOrder == null ? "T.HOME_UNIT_NAME " + mapElement.getValue() : sortOrder + ", T.HOME_UNIT_NAME " + mapElement.getValue());
				} else if (mapElement.getKey().equals("fullName")) {
					sortOrder = (sortOrder == null ? "T.PERSON_NAME " + mapElement.getValue() : sortOrder + ", T.PERSON_NAME " + mapElement.getValue());
				} else if (mapElement.getKey().equals("leadUnitName")) {
					sortOrder = (sortOrder == null ? "T.LEAD_UNIT_NAME " + mapElement.getValue() : sortOrder + ", T.LEAD_UNIT_NAME " + mapElement.getValue());
				}
			}
		}
		return sortOrder;
	}
	
	private CoiCmpDashboardDto setCmpDashboardValues(ResultSet resultSet) {
		CoiCmpDashboardDto dto = new CoiCmpDashboardDto();
		try {
			dto.setCmpId(resultSet.getInt("CMP_ID"));
			dto.setCmpNumber(resultSet.getInt("CMP_NUMBER"));
			dto.setCmpTypeCode(resultSet.getString("CMP_TYPE_CODE"));
			dto.setCmpType(resultSet.getString("CMP_TYPE"));
			dto.setCmpStatusCode(resultSet.getString("CMP_STATUS_CODE"));
			dto.setCmpStatus(resultSet.getString("CMP_STATUS"));
			dto.setCmpStatusBadgeColor(resultSet.getString("CMP_STATUS_BADGE_COLOR"));
			dto.setVersionStatus(resultSet.getString("VERSION_STATUS"));
			dto.setPersonId(resultSet.getString("PERSON_ID"));
			dto.setPersonFullName(resultSet.getString("PERSON_NAME"));
			dto.setRolodexId(resultSet.getString("ROLODEX_ID"));
			dto.setRolodexFullName(resultSet.getString("ROLODEX_NAME"));
			dto.setHomeUnit(resultSet.getString("HOME_UNIT_NUMBER"));
			dto.setHomeUnitName(resultSet.getString("HOME_UNIT_NAME"));
			dto.setApprovalDate(resultSet.getDate("APPROVAL_DATE"));
			dto.setExpirationDate(resultSet.getDate("EXPIRATION_DATE"));
			dto.setProjectNumber(resultSet.getString("PROJECT_NUMBER"));
			dto.setProjectId(resultSet.getString("PROJECT_ID"));
			dto.setProjectTitle(resultSet.getString("PROJECT_TITLE"));
			dto.setProjectStartDate(resultSet.getDate("PROJECT_START_DATE"));
			dto.setProjectEndDate(resultSet.getDate("PROJECT_END_DATE"));
			dto.setProjectTypeCode(resultSet.getString("PROJECT_TYPE_CODE"));
			dto.setSponsorAwardNumber(resultSet.getString("SPONSOR_AWARD_NUMBER"));
			dto.setLeadUnit(resultSet.getString("LEAD_UNIT_NUMBER"));
			dto.setLeadUnitName(resultSet.getString("LEAD_UNIT_NAME"));
			dto.setEntityNumber(resultSet.getString("ENTITY_NUMBER"));
			dto.setEntityName(resultSet.getString("ENTITY_NAME"));
			dto.setEntityId(resultSet.getInt("ENTITY_ID"));
			dto.setUpdatedBy(resultSet.getString("UPDATED_BY_FULL_NAME"));
			dto.setUpdateTimestamp(resultSet.getTimestamp("UPDATE_TIMESTAMP"));
			dto.setIsHomeUnitSubmission((resultSet.getString("UNIT_ACCESS_TYPE") != null
					&& resultSet.getString("UNIT_ACCESS_TYPE").equals("HOME_UNIT")) ? Boolean.TRUE : Boolean.FALSE);
			dto.setSponsorCode(resultSet.getString("SPONSOR_CODE"));
			dto.setSponsorName(resultSet.getString("SPONSOR_NAME"));
			dto.setPrimeSponsorCode(resultSet.getString("PRIME_SPONSOR_CODE"));
			dto.setPrimeSponsorName(resultSet.getString("PRIME_SPONSOR_NAME"));
			dto.setTotalCommentsCount(resultSet.getString("TOTAL_COMMENTS_COUNT"));
			dto.setIsShowDownload(resultSet.getBoolean("IS_SHOW_DOWNLOAD"));
			dto.setIsViewAllowed(resultSet.getBoolean("IS_VIEW_ALLOWED"));
			return dto;
		} catch (SQLException e) {
			log.error("Error in CMP dashboard value mapping {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		return null;
	}
	
	@Override
	public Integer fetchCmpReporterDashboardCount(CoiCmpRepDashboardDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet resultSet = null;
		Integer count = null;
		String personId = dto.getCmpPersonId();
		if (personId == null || personId.isBlank()) {
		    personId = AuthenticatedUser.getLoginPersonId();
		}
		Boolean isDownload = dto.getIsDownload();

		try {
			statement = connection.prepareCall("{call GET_CMP_REPORTER_DASHBOARD(?,?,?,?,?,?,?)}");
			statement.setString(1, personId);
			statement.setString(2, AuthenticatedUser.getLoginPersonId());
			statement.setString(3, null);
			statement.setBoolean(4, isDownload);
			statement.setInt(5, 0);
			statement.setInt(6, 0);
			statement.setBoolean(7, true);
			statement.execute();
			resultSet = statement.getResultSet();
			while (resultSet.next()) {
				count = Integer.parseInt(resultSet.getString(1));
			}
			return count;
		} catch (SQLException e) {
			log.error("Error in fetch CMP reporter dashboard count {}", e.getMessage());
			exceptionService.saveErrorDetails(e.getMessage(), e,CoreConstants.JAVA_ERROR);
		}
		return null;
	}
}
