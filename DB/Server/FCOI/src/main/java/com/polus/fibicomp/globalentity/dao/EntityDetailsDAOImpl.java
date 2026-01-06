package com.polus.fibicomp.globalentity.dao;

import static java.util.Map.entry;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.persistence.EntityNotFoundException;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dto.EntityDocumentStatusesDTO;
import com.polus.fibicomp.globalentity.dto.EntityMandatoryFiledsDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestDTO;
import com.polus.fibicomp.globalentity.dto.EntityRequestField;
import com.polus.fibicomp.globalentity.dto.ValidateDuplicateRequestDTO;
import com.polus.fibicomp.globalentity.pojo.Entity;
import com.polus.fibicomp.globalentity.pojo.EntityDocumentStatusType;

import lombok.extern.slf4j.Slf4j;
import oracle.jdbc.OracleTypes;

@Repository
@Transactional
@Slf4j
public class EntityDetailsDAOImpl implements EntityDetailsDAO {

	private static final String UPDATED_BY_SYSTEM = "system";

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Value("${oracledb}")
	private String oracledb;

	protected static Logger logger = LogManager.getLogger(EntityDetailsDAOImpl.class.getName());

	private static final Map<EntityRequestField, String> FIELD_MAPPINGS = Map.ofEntries(
			entry(EntityRequestField.entityName, "entityName"), entry(EntityRequestField.entityNumber, "entityNumber"),
			entry(EntityRequestField.entityOwnershipTypeCode, "entityOwnershipTypeCode"),
			entry(EntityRequestField.primaryAddressLine1, "primaryAddressLine1"),
			entry(EntityRequestField.primaryAddressLine2, "primaryAddressLine2"),
			entry(EntityRequestField.city, "city"), entry(EntityRequestField.state, "state"),
			entry(EntityRequestField.postCode, "postCode"), entry(EntityRequestField.countryCode, "countryCode"),
			entry(EntityRequestField.certifiedEmail, "certifiedEmail"),
			entry(EntityRequestField.websiteAddress, "websiteAddress"),
			entry(EntityRequestField.dunsNumber, "dunsNumber"), entry(EntityRequestField.ueiNumber, "ueiNumber"),
			entry(EntityRequestField.cageNumber, "cageNumber"),
			entry(EntityRequestField.humanSubAssurance, "humanSubAssurance"),
			entry(EntityRequestField.anumalWelfareAssurance, "anumalWelfareAssurance"),
			entry(EntityRequestField.animalAccreditation, "animalAccreditation"),
			entry(EntityRequestField.phoneNumber, "phoneNumber"), entry(EntityRequestField.approvedBy, "approvedBy"),
			entry(EntityRequestField.approvedTimestamp, "approvedTimestamp"),
			entry(EntityRequestField.entityStatusTypeCode, "entityStatusTypeCode"),
			entry(EntityRequestField.isDunsMatched, "isDunsMatched"),
			entry(EntityRequestField.documentStatusTypeCode, "documentStatusTypeCode"),
			entry(EntityRequestField.originalEntityId, "originalEntityId"),
			entry(EntityRequestField.updatedBy, "updatedBy"),
			entry(EntityRequestField.versionStatus, "versionStatus"),
			entry(EntityRequestField.isDunsMonitoringEnabled, "isDunsMonitoringEnabled")
			);

	@Override
	public Integer createEntity(Entity entity) {
		hibernateTemplate.save(entity);
		Map<EntityRequestField, Object> entityRequestFields = new HashMap<>();
		entityRequestFields.put(EntityRequestField.entityNumber, entity.getEntityId());
		if (UPDATED_BY_SYSTEM.equals(entity.getUpdatedBy())) {
			entityRequestFields.put(EntityRequestField.updatedBy, entity.getUpdatedBy());
		}
		updateEntity(EntityRequestDTO.builder().entityId(entity.getEntityId()).entityRequestFields(entityRequestFields)
				.build());
		return entity.getEntityId();
	}

	@Override
	public void updateEntity(EntityRequestDTO dto) {
		Map<EntityRequestField, Object> entityRequestFields = dto.getEntityRequestFields();

		if (entityRequestFields == null || entityRequestFields.isEmpty()) {
			String errorMsg = "No fields to update for entity with ID " + dto.getEntityId();
			log.warn(errorMsg);
			return;
		}

		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();

		StringBuilder hqlQuery = new StringBuilder("UPDATE Entity e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		StringJoiner updates = new StringJoiner(", ");

		entityRequestFields.forEach((field, value) -> {
			String fieldName = FIELD_MAPPINGS.get(field);
			if (fieldName != null) {
				updates.add("e." + fieldName + " = :" + fieldName);
			} else {
				String errorMsg = "Unknown field: " + field;
				log.error(errorMsg);
				throw new IllegalArgumentException("Unknown field: " + field);
			}
		});

		hqlQuery.append(", ").append(updates.toString());
		hqlQuery.append(" WHERE e.entityId = :entityId");

		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", dto.getEntityId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());

		entityRequestFields.forEach((field, value) -> {
			query.setParameter(FIELD_MAPPINGS.get(field), value);
		});

		try {
			int updatedRows = query.executeUpdate();
			if (updatedRows == 0) {
				String errorMsg = "Entity with ID " + dto.getEntityId() + " not found.";
				log.warn(errorMsg);
				throw new EntityNotFoundException(errorMsg);
			}
		} catch (Exception e) {
			log.error("Failed to update entity with ID " + dto.getEntityId(), e);
			throw new RuntimeException("Error updating entity with ID " + dto.getEntityId(), e);
		}
	}

	@Override
	public Entity fetchEntityDetails(Integer entityId) {
		Entity entity = hibernateTemplate.get(Entity.class, entityId);
		if (entity != null) {
			hibernateTemplate.refresh(entity);
		}
		return entity;
	}

	@Override
	public Map<String, Object> getEntityTabStatus(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		Map<String, Object> entityTabStatus = new HashMap<>();
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_ENTITY_TAB_STATUS(?)}");
				statement.setInt(1, entityId);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call GET_ENTITY_TAB_STATUS(?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setInt(1, entityId);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
			while (rset != null && rset.next()) {
				entityTabStatus.put("entity_sub_org_info", rset.getBoolean("entity_sub_org_info"));
				entityTabStatus.put("entity_sponsor_info", rset.getBoolean("entity_sponsor_info"));
				entityTabStatus.put("entity_overview", rset.getBoolean("entity_overview"));
				entityTabStatus.put("sponsor_feed_status", rset.getString("sponsor_feed_status") != null ? rset.getString("sponsor_feed_status") : "");
				entityTabStatus.put("organization_feed_status", rset.getString("organization_feed_status") != null ? rset.getString("organization_feed_status") : "");
				entityTabStatus.put("sponsor_feed_status_code", rset.getString("sponsor_feed_status_code") != null ? rset.getString("sponsor_feed_status_code") : "");
				entityTabStatus.put("organization_feed_status_code", rset.getString("organization_feed_status_code") != null ? rset.getString("organization_feed_status_code") : "");
				entityTabStatus.put("organization_id", rset.getString("organization_id") != null ? rset.getString("organization_id") : "");
				entityTabStatus.put("sponsor_code", rset.getString("sponsor_code") != null ? rset.getString("sponsor_code") : "");
			}
		} catch (Exception e) {
			logger.error("Exception on getEntityTabStatus {}", e.getMessage());
			throw new ApplicationException("Unable to fetch entity tab status", e, Constants.DB_PROC_ERROR);
		}
		return entityTabStatus;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Entity> validateDuplicateByParams(ValidateDuplicateRequestDTO dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hql = new StringBuilder("SELECT e FROM Entity e  ");
		hql.append(" WHERE e.entityStatusTypeCode != 3 AND e.versionStatus NOT IN ('ARCHIVE', 'CANCELLED') AND e.documentStatusTypeCode NOT IN ('2','3') ");
		if (dto.getEntityNumber() != null) {
			hql.append("AND e.entityNumber != :entityNumber ");
		}
		hql.append("AND(");
		if (dto.getDunsNumber() != null) {
			hql.append(" e.dunsNumber = :dunsNumber OR ");
		}
		if (dto.getUeiNumber() != null) {
			hql.append(" e.ueiNumber = :ueiNumber OR ");
		}
		if (dto.getCageNumber() != null) {
			hql.append(" e.cageNumber = :cageNumber OR ");
		}
		hql.append(" (e.countryCode = :countryCode AND ((LOWER(TRIM(e.entityName)) LIKE :entityName OR SOUNDEX(e.entityName) LIKE SOUNDEX(:entityName)) ");
		if (dto.getPrimaryAddressLine1() != null && !dto.getPrimaryAddressLine1().trim().isEmpty()) {
			hql.append(" OR (e.primaryAddressLine1 IS NOT NULL AND TRIM(e.primaryAddressLine1) != '' ");
			hql.append(" AND LOWER(TRIM(e.primaryAddressLine1)) LIKE :primaryAddressLine1)");
			hql.append(" OR (e.primaryAddressLine2 IS NOT NULL AND TRIM(e.primaryAddressLine2) != '' ");
			hql.append(" AND LOWER(TRIM(e.primaryAddressLine2)) LIKE :primaryAddressLine1)");
		}
		if (dto.getPrimaryAddressLine2() != null && !dto.getPrimaryAddressLine2().trim().isEmpty()) {
		    hql.append(" OR (e.primaryAddressLine2 IS NOT NULL AND TRIM(e.primaryAddressLine2) != '' ");
		    hql.append(" AND LOWER(TRIM(e.primaryAddressLine2)) LIKE :primaryAddressLine2)");
		    hql.append(" OR (e.primaryAddressLine1 IS NOT NULL AND TRIM(e.primaryAddressLine1) != '' ");
		    hql.append(" AND LOWER(TRIM(e.primaryAddressLine1)) LIKE :primaryAddressLine2)");
		}
		hql.append(" )))");
		Query query = session.createQuery(hql.toString());
		if (dto.getEntityNumber() != null) {
			query.setParameter("entityNumber", dto.getEntityNumber());
		}
		if (dto.getDunsNumber() != null) {
			query.setParameter("dunsNumber", dto.getDunsNumber());
		}
		if (dto.getUeiNumber() != null) {
			query.setParameter("ueiNumber", dto.getUeiNumber());
		}
		if (dto.getCageNumber() != null) {
			query.setParameter("cageNumber", dto.getCageNumber());
		}
		query.setParameter("entityName", "%" + dto.getEntityName().trim().toLowerCase() + "%");
		if (dto.getPrimaryAddressLine1() != null && !dto.getPrimaryAddressLine1().trim().isEmpty()) {
			query.setParameter("primaryAddressLine1", "%" + dto.getPrimaryAddressLine1().trim().toLowerCase() + "%");
		}
		if (dto.getPrimaryAddressLine2() != null && !dto.getPrimaryAddressLine2().trim().isEmpty()) {
		    query.setParameter("primaryAddressLine2", "%" + dto.getPrimaryAddressLine2().trim().toLowerCase() + "%");
		}
		query.setParameter("countryCode", dto.getCountryCode());
		return query.getResultList();
	}

	@SuppressWarnings("unused")
	@Override
	public void updateDocWithOriginalEntity(Integer duplicateEntityId, Integer originalEntityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call UPD_DOCS_WITH_ORG_ENTITY(?,?)}");
				statement.setInt(1, duplicateEntityId);
				statement.setInt(2, originalEntityId);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call UPD_DOC_WITH_ORG_ENTITY(?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setInt(1, duplicateEntityId);
				statement.setInt(2, originalEntityId);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
		} catch (Exception e) {
			logger.error("Exception on updateDocWithOriginalEntity {}", e.getMessage());
			throw new ApplicationException("Exception on updateDocWithOriginalEntity", e, Constants.DB_PROC_ERROR);
		}
	}

	@Override
	public Object[] getEntityIdByDunsNumber(String dunsNumber) {
		try {
			StringBuilder hqlQuery = new StringBuilder();
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			hqlQuery.append("SELECT e.entityId, e.entityNumber FROM Entity e ");
			hqlQuery.append("WHERE e.dunsNumber = :dunsNumber AND e.versionStatus = :versionStatus");
			TypedQuery<Object[]> query = session.createQuery(hqlQuery.toString());
			query.setParameter("dunsNumber", dunsNumber);
			query.setParameter("versionStatus", Constants.COI_ACTIVE_STATUS);
			return query.getSingleResult();
		} catch (Exception e) {
			return null;
		}
	}

	@Override
	public EntityMandatoryFiledsDTO fetchEntityMandatoryFields() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		EntityMandatoryFiledsDTO response = null;
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_ENTITY_MANDATORY_FIELDS()}");
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call GET_ENTITY_MANDATORY_FIELDS(?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
			while (rset != null && rset.next()) {
                String jsonResponse = rset.getString("mandatory_fields");
                ObjectMapper mapper = new ObjectMapper();
                response = mapper.readValue(jsonResponse, EntityMandatoryFiledsDTO.class);
			}
		} catch (Exception e) {
			logger.error("Exception on fetchEntityMandatoryFields {}", e.getMessage());
			throw new ApplicationException("Unable to fetch entity mandatory fields", e, Constants.DB_PROC_ERROR);
		}
		return response;
	}

	@Override
	public ObjectNode validateEntityDetails(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    SessionImpl sessionImpl = (SessionImpl) session;
	    Connection connection = sessionImpl.connection();
	    CallableStatement statement = null;
	    ResultSet rset = null;
	    ObjectMapper objectMapper = new ObjectMapper();
	    ObjectNode resultNode = null;
	    try {
	        if (oracledb.equalsIgnoreCase("N")) {
	            statement = connection.prepareCall("{call VALIDATE_ENTITY_MANDATORY_FIELDS(?)}");
	            statement.setInt(1, entityId);
	            statement.execute();
	            rset = statement.getResultSet();
	        } else if (oracledb.equalsIgnoreCase("Y")) {
	            String functionCall = "{call VALIDATE_ENTITY_MANDATORY_FIELDS(?,?)}";
	            statement = connection.prepareCall(functionCall);
	            statement.registerOutParameter(1, OracleTypes.CURSOR);
	            statement.setInt(2, entityId);
	            statement.execute();
	            rset = (ResultSet) statement.getObject(1);
	        }
	        if (rset != null) {
	            while (rset.next()) {
	                try {
	                    JsonNode arrayNode = objectMapper.readTree(rset.getString("fields_status"));
	                    resultNode = objectMapper.createObjectNode();
	                    for (JsonNode node : arrayNode) {
	                        Iterator<String> fieldNames = node.fieldNames();
	                        if (fieldNames.hasNext()) {
	                            String fieldName = fieldNames.next();
	                            JsonNode fields = node.get(fieldName);
	                            ObjectNode sectionNode = objectMapper.createObjectNode();
	                            sectionNode.set("fields", fields);
	                            sectionNode.put("ValidationType", node.get("ValidationType").asText());
	                            sectionNode.put("ValidationMessage", node.get("ValidationMessage").asText());
	                            resultNode.set(fieldName.toLowerCase(), sectionNode);
	                        }
	                    }
	                } catch (Exception e) {
	                    logger.warn("Error processing ResultSet: {}", e.getMessage());
	                }
	            }
	        }
	    } catch (Exception e) {
	        logger.error("Exception on validateEntityDetails: {}", e.getMessage());
	        throw new ApplicationException("Exception on validateEntityDetails", e, Constants.DB_PROC_ERROR);
	    } 
	    return resultNode;
	}

	@Override
	public List<EntityDocumentStatusesDTO> fetchEntityDocumentStatuses() {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityDocumentStatusesDTO> query = builder.createQuery(EntityDocumentStatusesDTO.class);
		Root<EntityDocumentStatusType> root = query.from(EntityDocumentStatusType.class);
		query.select(builder.construct(
		    EntityDocumentStatusesDTO.class,
		    root.get("documentStatusTypeCode"),
		    root.get("description")
		));
		List<EntityDocumentStatusesDTO> documentStatuses = session.createQuery(query).getResultList();
		return documentStatuses;
	}

	@Override
	public Integer copyEntity(Integer entityId, Integer entityNumber, String entityStatusTypeCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call COI_COPY_GLOBAL_ENTITY(?,?,?)}");
				statement.setInt(1, entityId);
				statement.setInt(2, entityNumber);
				statement.setString(3, entityStatusTypeCode);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call COI_COPY_GLOBAL_ENTITY(?,?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setInt(2, entityId);
				statement.setInt(3, entityNumber);
				statement.setString(4, entityStatusTypeCode);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
			if (rset != null) {
				while (rset.next()) {
					return rset.getInt(1);
				}
			}
		} catch (Exception e) {
			logger.error("Exception on copyEntity: {}", e.getMessage());
			throw new ApplicationException("Exception on copyEntity", e, Constants.DB_PROC_ERROR);
		}
		return null;
	}

	@Override
	public List<Object[]> fetchEntityUsedEngagements(Integer entityNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		String hqlQuery = "SELECT max(personEntityId), personId, person.fullName, personEntityNumber FROM PersonEntity WHERE entityNumber=:entityNumber";
		org.hibernate.query.Query<Object[]> query = session.createQuery(hqlQuery);
		query.setParameter("entityNumber", entityNumber);
		return query.getResultList();
	}

	@Override
	public void updateEntityForeignFlag(Integer entityId, Integer entityNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		EntityMandatoryFiledsDTO response = null;
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call UPDATE_GLOBAL_ENTITY_FOREIGN_FLAG(?,?)}");
				statement.setInt(1, entityId);
				statement.setInt(2, entityNumber);
				statement.executeUpdate();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call UPDATE_GLOBAL_ENTITY_FOREIGN_FLAG(?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setInt(2, entityId);
				statement.setInt(3, entityNumber);
				statement.executeUpdate();
			}

		} catch (Exception e) {
			logger.error("Exception on updateEntityForeignFlag {}", e.getMessage());
			throw new ApplicationException("Unable to update foreign flag ", e, Constants.DB_PROC_ERROR);
		}
	}

	@Override
	public Boolean isEntityForeign(Integer entityId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT e.isForeign FROM Entity e WHERE e.entityId = :entityId");
		TypedQuery<Boolean> query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", entityId);
		return query.getSingleResult();
	}

	@Override
	public void unlinkDnbMatchDetails(Integer entityId, String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call UNLINK_DNB_MATCH_DETAIL(?,?)}");
				statement.setInt(1, entityId);
				statement.setString(2, personId);
				statement.executeUpdate();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call UNLINK_DNB_MATCH_DETAIL(?,?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setInt(2, entityId);
				statement.setString(3, personId);
				statement.executeUpdate();
			}

		} catch (Exception e) {
			logger.error("Exception on unlinkDnbMatchDetails {}", e.getMessage());
			throw new ApplicationException("Unable to unlink DnbMatch Details ", e, Constants.DB_PROC_ERROR);
		}
	}


	@Override
	public Integer getEntityIdByEntityNumberAndVersionStatus(Integer entityNumber, String versionStatus) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT e.entityId FROM Entity e WHERE e.versionStatus = :versionStatus  AND e.entityNumber = :entityNumber");
		TypedQuery<Integer> query = session.createQuery(hqlQuery.toString());
		query.setParameter("versionStatus", versionStatus);
		query.setParameter("entityNumber", entityNumber);
		return query.getSingleResult();
	}
}
