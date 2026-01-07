package com.polus.fibicomp.compliance.declaration.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;

import com.polus.core.common.dao.CommonDao;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardRequest;
import com.polus.fibicomp.compliance.declaration.dto.DeclDashboardResponse;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DeclarationDashboardDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Value("${oracledb}")
	private String oracledb;

	public List<DeclDashboardResponse> fetchDashboardList(DeclDashboardRequest request) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet resultSet = null;
		List<DeclDashboardResponse> responses = null;

		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_DECLARATION_DASHBOARD_DYNAMIC_DATA(?)}");
				String dashBoardData = commonDao.convertObjectToJSON(request.getDeclarationDashboardData());
				log.info("dashBoardData : {}", dashBoardData);
				statement.setString(1, dashBoardData);
				statement.execute();
				resultSet = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String procedureName = "GET_DECLARATION_DASHBOARD_DYNAMIC_DATA";
				String functionCall = "{call " + procedureName + "(?,?)}";
				statement = connection.prepareCall(functionCall);
				resultSet = (ResultSet) statement.getObject(1);
			}

			responses = processDashboardList(resultSet);
			log.info("Fetched {} dashboard records", responses.size());
			return responses;

		} catch (SQLException e) {
			log.error("SQL error during dashboard list fetch", e);
			throw new RuntimeException("Error fetching dashboard list", e);
		} finally {
			closeResources(statement, resultSet);
		}
	}

	public Integer fetchDashboardCount(DeclDashboardRequest request) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet resultSet = null;
		Integer count = null;

		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_DECLARATION_DASHBOARD_DYNAMIC_DATA(?)}");
				String dashBoardData = commonDao.convertObjectToJSON(request.getDeclarationDashboardData());
				log.info("dashBoardData : {}", dashBoardData);
				statement.setString(1, dashBoardData);
				statement.execute();
				resultSet = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String procedureName = "GET_DECLARATION_DASHBOARD_DYNAMIC_DATA";
				String functionCall = "{call " + procedureName + "(?,?)}";
				statement = connection.prepareCall(functionCall);
				resultSet = (ResultSet) statement.getObject(1);
			}

			count = processDashboardCount(resultSet);
			log.info("Dashboard total count: {}", count);
			return count;

		} catch (SQLException e) {
			log.error("SQL error during dashboard count fetch", e);
			throw new RuntimeException("Error fetching dashboard count", e);
		} finally {
			closeResources(statement, resultSet);
		}
	}

	private void closeResources(CallableStatement statement, ResultSet resultSet) {
		try {
			if (resultSet != null)
				resultSet.close();
			if (statement != null)
				statement.close();
		} catch (SQLException e) {
			log.error("Error closing resources: {}", e.getMessage());
		}
	}

	private List<DeclDashboardResponse> processDashboardList(ResultSet resultSet) throws SQLException {
		List<DeclDashboardResponse> responses = new ArrayList<>();
		while (resultSet != null && resultSet.next()) {
			DeclDashboardResponse response = DeclDashboardResponse.builder()
					.declarationId(resultSet.getInt("DECLARATION_ID"))
					.declarationNumber(resultSet.getString("DECLARATION_NUMBER"))
					.declarationStatus(resultSet.getString("DECLARATION_STATUS"))
					.declarationType(resultSet.getString("DECLARATION_TYPE"))
					.expirationDate(resultSet.getTimestamp("EXPIRATION_DATE"))
					.homeUnitName(resultSet.getString("HOME_UNIT_NAME"))
					.homeUnitNumber(resultSet.getString("HOME_UNIT_NUMBER"))
					.personFullName(resultSet.getString("PERSON_FULL_NAME"))
					.personId(resultSet.getString("PERSON_ID"))
					.submissionDate(resultSet.getTimestamp("SUBMISSION_DATE"))
					.updateTimeStamp(resultSet.getTimestamp("UPDATE_TIMESTAMP"))
					.updateUserFullName(resultSet.getString("UPDATE_USER_FULL_NAME"))
					.unitDisplayName(resultSet.getString("HOME_UNIT_NUMBER") + " - " + resultSet.getString("HOME_UNIT_NAME"))
					.badgeColor(resultSet.getString("BADGE_COLOR"))
					.declarationStatusCode(resultSet.getString("DECLARATION_STATUS_CODE"))
					.declarationTypeCode(resultSet.getString("DECLARATION_TYPE_CODE"))
					.versionStatus(resultSet.getString("VERSION_STATUS"))
					.versionNumber(resultSet.getInt("VERSION_NUMBER"))
					.reviewStatus(resultSet.getString("REVIEW_STATUS"))
					.reviewStatusCode(resultSet.getString("REVIEW_STATUS_CODE"))
					.adminGroupId(resultSet.getInt("ADMIN_GROUP_ID"))
					.adminGroupName(resultSet.getString("ADMIN_GROUP_NAME"))
					.adminPersonId(resultSet.getString("ADMIN_PERSON_ID"))
					.adminPersonName(resultSet.getString("ADMINISTRATOR"))
					.isHomeUnitSubmission((resultSet.getString("UNIT_ACCESS_TYPE") != null
							&& resultSet.getString("UNIT_ACCESS_TYPE").equals("HOME_UNIT")) ? Boolean.TRUE
							: Boolean.FALSE)
					.isViewAllowed(resultSet.getBoolean("IS_VIEW_ALLOWED"))
					.build();
			responses.add(response);
		}
		return responses;
	}

	private Integer processDashboardCount(ResultSet resultSet) throws SQLException {
		if (resultSet != null && resultSet.next()) {
			return resultSet.getInt("TOTAL");
		}
		return null;
	}

}
