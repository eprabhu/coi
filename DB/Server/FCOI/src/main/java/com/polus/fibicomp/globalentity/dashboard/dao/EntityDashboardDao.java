package com.polus.fibicomp.globalentity.dashboard.dao;

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
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.fibicomp.globalentity.dashboard.dto.EntityDashboard;
import com.polus.fibicomp.globalentity.dashboard.dto.EntityDashboardResponse;
import com.polus.fibicomp.globalentity.dashboard.dto.EntityDashboardDTO;

import lombok.extern.slf4j.Slf4j;
import oracle.jdbc.OracleTypes;

@Service
@Transactional
@Slf4j
public class EntityDashboardDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Value("${oracledb}")
	private String oracledb;

	private static final int DEADLOCK_RETRY_COUNT = 3;

	public EntityDashboard dashboardDataForEntity(EntityDashboardDTO vo) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet resultSet = null;
		EntityDashboard entityDashboard = new EntityDashboard();
		List<EntityDashboardResponse> dashboardResponses = new ArrayList<>();

		int retryCount = 0;
		boolean success = false;

		while (retryCount < DEADLOCK_RETRY_COUNT && !success) {
			try {
				if (oracledb.equalsIgnoreCase("N")) {
					statement = connection.prepareCall("{call GET_ENTITY_DASHBOARD_DYNAMIC_DATA(?)}");
					String dashBoardData = commonDao.convertObjectToJSON(vo.getEntityDashboardData());
					log.info("dashBoardData : {}", dashBoardData);
					statement.setString(1, dashBoardData);
					statement.execute();
					resultSet = statement.getResultSet();
				} else if (oracledb.equalsIgnoreCase("Y")) {
					String procedureName = "GET_ENTITY_DASHBOARD_DYNAMIC_DATA";
					String functionCall = "{call " + procedureName + "(?,?)}";
					statement = connection.prepareCall(functionCall);
					resultSet = (ResultSet) statement.getObject(1);
				}

				while (resultSet != null && resultSet.next()) {
					EntityDashboardResponse dashboardResponse = new EntityDashboardResponse();
					dashboardResponse.setEntityId(resultSet.getInt("ENTITY_ID"));
					dashboardResponse.setEntityNumber(resultSet.getInt("ENTITY_NUMBER"));
					dashboardResponse.setEntityName(resultSet.getString("PRIMARY_NAME"));
					dashboardResponse.setOwnershipType(resultSet.getString("OWNERSHIP_TYPE"));
					dashboardResponse.setPrimaryAddress(resultSet.getString("PRIMARY_ADDRESS"));
					dashboardResponse.setCountry(resultSet.getString("COUNTRY"));
					dashboardResponse.setCity(resultSet.getString("CITY"));
					dashboardResponse.setState(resultSet.getString("STATE"));
					dashboardResponse.setDunsNumber(resultSet.getString("DUNS_NUMBER"));
					dashboardResponse.setUeiNumber(resultSet.getString("UEI_NUMBER"));
					dashboardResponse.setCageNumber(resultSet.getString("CAGE_NUMBER"));
					dashboardResponse.setCertifiedEmail(resultSet.getString("CERTIFIED_EMAIL"));
					dashboardResponse.setWebsiteAddress(resultSet.getString("WEBSITE_ADDRESS"));
					dashboardResponse.setEntityStatus(resultSet.getString("ENTITY_STATUS"));
					dashboardResponse.setEntityVerificationStatus(resultSet.getString("VERIFICATION_STATUS"));
					dashboardResponse.setEntityStatusTypeCode(resultSet.getString("ENTITY_STATUS_TYPE_CODE"));
					dashboardResponse.setDocumentStatusTypeCode(resultSet.getString("DOCUMENT_STATUS_TYPE_CODE"));
					dashboardResponse.setOwnershipTypeCode(resultSet.getString("ENTITY_OWNERSHIP_TYPE_CODE"));
					String organizationId = resultSet.getObject("ORGANIZATION_ID") != null ? resultSet.getString("ORGANIZATION_ID") : null;
					dashboardResponse.setOrganizationId(organizationId);
					dashboardResponse.setSponsorCode(resultSet.getString("SPONSOR_CODE"));
					dashboardResponse.setPriorName(resultSet.getString("PRIOR_NAME"));
					dashboardResponse.setForeignName(resultSet.getString("FOREIGN_NAME"));
					dashboardResponse.setModificationIsInProgress(resultSet.getBoolean("MODIFICATION_IS_INPROGRESS"));
					dashboardResponse.setEntitySourceType(resultSet.getString("ENTITY_SOURCE_TYPE"));
					dashboardResponse.setEntitySourceTypeCode(resultSet.getString("ENTITY_SOURCE_TYPE_CODE"));
					dashboardResponse.setFamilyTreeRoleTypes(resultSet.getString("FAMILY_ROLE_TYPES"));
					dashboardResponse.setEntityBusinessType(resultSet.getString("ENTITY_BUSINESS_TYPE"));
					dashboardResponse.setIsDunsMatched(resultSet.getBoolean("IS_DUNS_MATCHED"));
					dashboardResponse.setPostCode(resultSet.getString("POST_CODE"));
					dashboardResponse.setIsForeign(resultSet.getBoolean("IS_FOREIGN"));
					dashboardResponse.setDunsRefVersionIsInProgress(resultSet.getBoolean("DUNS_REF_MODIFI_IS_INPROGRESS"));
                    dashboardResponse.setHasPersonEntityLinked(resultSet.getBoolean("HAS_PERSON_ENTITY_LINKED"));
					dashboardResponse.setCreateTimestamp(resultSet.getTimestamp("CREATE_TIMESTAMP"));
                    dashboardResponse.setCreateUserFullName(resultSet.getString("CREATE_USER_FULL_NAME"));
                    dashboardResponses.add(dashboardResponse);
				}
				entityDashboard.setDashboardResponses(dashboardResponses);
				entityDashboard.setTotalEntityResponse(getDashboardEntityCount(vo));
				success = true;
			} catch (SQLException e) {
				log.error("SQLException in dashboardDataForEntity: {}", e.getMessage());
				if (isDeadlockException(e)) {
					retryCount++;
					log.warn("Deadlock detected, retrying... attempt {}", retryCount);
					if (retryCount == DEADLOCK_RETRY_COUNT) {
						log.error("Max retry attempts reached, unable to resolve deadlock.");
						throw new RuntimeException("Unable to resolve deadlock after " + DEADLOCK_RETRY_COUNT + " attempts.");
					}
				} else {
					throw new RuntimeException("Error in fetching dashboard data: " + e.getMessage(), e);
				}
			} finally {
				closeResources(statement, resultSet);
			}
		}
		return entityDashboard;
	}

	private Integer getDashboardEntityCount(EntityDashboardDTO vo) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet resultSet = null;
		Integer count = 0;

		int retryCount = 0;
		boolean success = false;

		while (retryCount < DEADLOCK_RETRY_COUNT && !success) {
			try {
				if (oracledb.equalsIgnoreCase("N")) {
					statement = connection.prepareCall("{call GET_ENTITY_DASHBOARD_DYNAMIC_COUNT(?)}");
					vo.getEntityDashboardData().remove("LIMIT");
					vo.getEntityDashboardData().remove("PAGED");
					String dashBoardDataCount = commonDao.convertObjectToJSON(vo.getEntityDashboardData());
					log.info("dashBoardDataCount : {}", dashBoardDataCount);
					statement.setString(1, dashBoardDataCount);
					statement.execute();
					resultSet = statement.getResultSet();
				} else if (oracledb.equalsIgnoreCase("Y")) {
					String procedureName = "GET_ENTITY_DASHBOARD_DYNAMIC_COUNT";
					String functionCall = "{call " + procedureName + "(?,?)}";
					statement = connection.prepareCall(functionCall);
					statement.registerOutParameter(1, OracleTypes.CURSOR);
					statement.execute();
					resultSet = (ResultSet) statement.getObject(1);
				}
				if (resultSet != null && resultSet.next()) {
					count = Integer.parseInt(resultSet.getString(1));
				}
				success = true;
			} catch (SQLException e) {
				log.error("SQLException in getDashboardEntityCount: {}", e.getMessage());
				if (isDeadlockException(e)) {
					retryCount++;
					log.warn("Deadlock detected in getDashboardEntityCount, retrying... attempt {}", retryCount);
					if (retryCount == DEADLOCK_RETRY_COUNT) {
						log.error("Max retry attempts reached for getDashboardEntityCount.");
						throw new RuntimeException("Unable to resolve deadlock after " + DEADLOCK_RETRY_COUNT + " attempts.");
					}
				} else {
					throw new RuntimeException("Error in fetching entity count: " + e.getMessage(), e);
				}
			} finally {
				closeResources(statement, resultSet);
			}
		}
		return count;
	}

	private boolean isDeadlockException(SQLException e) {
		return "40001".equals(e.getSQLState()); // SQLState for deadlock
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

}
