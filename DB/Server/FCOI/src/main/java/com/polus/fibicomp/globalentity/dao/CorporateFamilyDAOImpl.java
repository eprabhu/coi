package com.polus.fibicomp.globalentity.dao;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.hibernate.internal.SessionImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyRequestDTO;
import com.polus.fibicomp.globalentity.dto.CorporateFamilyResponseDTO;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTree;
import com.polus.fibicomp.globalentity.pojo.EntityFamilyTreeRole;

import lombok.extern.slf4j.Slf4j;
import oracle.jdbc.OracleTypes;

@Repository
@Transactional
@Slf4j
public class CorporateFamilyDAOImpl implements CorporateFamilyDAO {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Value("${oracledb}")
	private String oracledb;

	@Override
	public void createCorporateFamily(EntityFamilyTree entity) {
		hibernateTemplate.saveOrUpdate(entity);
	}

	@Override
	public void insertFamilyTreeRoles(EntityFamilyTreeRole entityFamilyTreeRole) {
		hibernateTemplate.saveOrUpdate(entityFamilyTreeRole);
	}

	@Override
	public void updateParent(CorporateFamilyRequestDTO dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hqlQuery = new StringBuilder("UPDATE EntityFamilyTree e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		if (dto.getGuEntityNumber() != null) {
			hqlQuery.append(", e.globalUltimateEntityNumber = :globalUltimateEntityNumber");
		}
		if (dto.getParentEntityNumber() != null) {
			hqlQuery.append(", e.parentEntityNumber = :parentEntityNumber");
		}
		if (dto.getIsSystemCreated() != null) {
			hqlQuery.append(", e.isSystemCreated = :isSystemCreated ");
		}
		hqlQuery.append(" WHERE e.entityNumber = :entityNumber");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityNumber", dto.getEntityNumber());
		query.setParameter("updatedBy", dto.getUpdatedBy());
		query.setParameter("updateTimestamp", dto.getUpdateTimestamp());
		if(dto.getGuEntityNumber() != null) {
			query.setParameter("globalUltimateEntityNumber", dto.getGuEntityNumber());
		}
		if(dto.getParentEntityNumber() != null) {
			query.setParameter("parentEntityNumber", dto.getParentEntityNumber());
		}
		if (dto.getIsSystemCreated() != null) {
			query.setParameter("isSystemCreated", dto.getIsSystemCreated());
		}
		query.executeUpdate();
	}

	@Override
	public List<CorporateFamilyResponseDTO> fetchCorporateFamily(Integer entityNumber) {
		List<CorporateFamilyResponseDTO> responseDTOs = new ArrayList<>();
		ResultSet rset = fetchEntityCorporateFamily(entityNumber);
		try {
			while (rset != null && rset.next()) {
				CorporateFamilyResponseDTO resposneDTO = CorporateFamilyResponseDTO.builder()
						.country(rset.getString("COUNTRY"))
						.entityId(rset.getInt("ENTITY_ID"))
						.entityNumber(rset.getInt("ENTITY_NUMBER"))
						.parentEntityNumber(rset.getInt("PARENT_ENTITY_NUMBER"))
						.parentEntityId(rset.getInt("PARENT_ENTITY_ID"))
						.entityName(rset.getString("PRIMARY_NAME"))
						.entityType(rset.getString("ENTITY_TYPE"))
						.dunsNumber(rset.getString("DUNS_NUMBER"))
						.updatedBy(rset.getString("UPDATED_BY"))
						.isSystemCreated(rset.getBoolean("IS_SYSTEM_CREATED"))
						.build();
				responseDTOs.add(resposneDTO);
			}
		} catch (Exception e) {
			log.error("Exception on fetchCorporateFamily {}", e.getMessage());
			throw new ApplicationException("Unable to fetch entity corporate family", e, Constants.DB_PROC_ERROR);
		}
		return responseDTOs;
	}

	private ResultSet fetchEntityCorporateFamily(Integer entityNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		SessionImpl sessionImpl = (SessionImpl) session;
		Connection connection = sessionImpl.connection();
		CallableStatement statement = null;
		ResultSet rset = null;
		try {
			if (oracledb.equalsIgnoreCase("N")) {
				statement = connection.prepareCall("{call GET_ENTITY_HIERARCHY(?)}");
				statement.setInt(1, entityNumber);
				statement.execute();
				rset = statement.getResultSet();
			} else if (oracledb.equalsIgnoreCase("Y")) {
				String functionCall = "{call GET_ENTITY_HIERARCHY(?,?)}";
				statement = connection.prepareCall(functionCall);
				statement.registerOutParameter(1, OracleTypes.CURSOR);
				statement.setInt(2, entityNumber);
				statement.execute();
				rset = (ResultSet) statement.getObject(1);
			}
		} catch (Exception e) {
			log.error("Exception on fetchEntityCorporateFamily {}", e.getMessage());
			throw new ApplicationException("Unable to fetch entity corporate family", e, Constants.DB_PROC_ERROR);
		}
		return rset;
	}

	@Override
	public Boolean isEntityPresent(Integer entityNumber) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<Long> query = builder.createQuery(Long.class);
			Root<EntityFamilyTree> root = query.from(EntityFamilyTree.class);
			query.select(builder.count(root));
			query.where(builder.equal(root.get("entityNumber"), entityNumber));
			Long count = session.createQuery(query).getSingleResult();
			return count != null && count > 0;
		} catch (Exception e) {
		    return false;
		}
	}

	@Override
	public Boolean isValidParent(Integer entityNumber) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<Long> query = builder.createQuery(Long.class);
			Root<EntityFamilyTree> root = query.from(EntityFamilyTree.class);
			query.select(builder.count(root));
			query.where(builder.equal(root.get("entityNumber"), entityNumber));
			Long count = session.createQuery(query).getSingleResult();
			return count != null && count > 0;
		} catch (Exception e) {
		    return false;
		}
	}

	@Override
	public Boolean isParentLinked(Integer entityNumber) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<Long> query = builder.createQuery(Long.class);
			Root<EntityFamilyTree> root = query.from(EntityFamilyTree.class);
			query.select(builder.count(root));
			query.where(builder.equal(root.get("entityNumber"), entityNumber), builder.isNotNull(root.get("parentEntityNumber")));
			Long count = session.createQuery(query).getSingleResult();
			return count != null && count > 0;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public Boolean isEntityRoleTypePresent(Integer entityNumber, String roleTypeCode) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<Long> query = builder.createQuery(Long.class);
			Root<EntityFamilyTreeRole> root = query.from(EntityFamilyTreeRole.class);
			query.select(builder.count(root));
			query.where(builder.equal(root.get("entityNumber"), entityNumber),
					builder.equal(root.get("familyRoleTypeCode"), roleTypeCode));
			Long count = session.createQuery(query).getSingleResult();
			return count != null && count > 0;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public Boolean isParentSingleNode(Integer entityNumber) {
		StringBuilder hqlBuilder = new StringBuilder("SELECT COUNT(e) FROM EntityFamilyTree e ");
		hqlBuilder.append("WHERE e.entityNumber = :entityNumber ");
		hqlBuilder.append("AND e.parentEntityNumber IS NULL ");
		hqlBuilder.append("AND NOT EXISTS (SELECT 1 FROM EntityFamilyTree sub WHERE sub.parentEntityNumber = :entityNumber)");
		Long count = hibernateTemplate.execute(session ->
				session.createQuery(hqlBuilder.toString(), Long.class)
						.setParameter("entityNumber", entityNumber)
						.getSingleResult());
		return count != null && count > 0;
	}

	@Override
	public Integer getParentEntityIdEntityId(Integer entityNumber) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			StringBuilder hqlBuilder = new StringBuilder("SELECT ft.parentEntityNumber FROM EntityFamilyTree ft ")
				.append("WHERE ft.entityNumber = :entityNumber");
			List<Integer> result = session.createQuery(hqlBuilder.toString()).setParameter("entityNumber", entityNumber).getResultList();
			return result.get(result.size() - 1);
		} catch (Exception e) {
			log.info("No parent found for entity id: {}", entityNumber);
			return null;
		}
	}

	@Override
	public int unlinkEntity(Integer entityNumber) {
		StringBuilder hqlBuilder = new StringBuilder("UPDATE EntityFamilyTree e ");
		hqlBuilder.append("SET e.parentEntityNumber = NULL ");
		hqlBuilder.append("WHERE e.entityNumber = :entityNumber");
		int updatedCount = hibernateTemplate.execute(session ->
				session.createQuery(hqlBuilder.toString())
						.setParameter("entityNumber", entityNumber)
						.executeUpdate()
		);
		return updatedCount;
	}

	@Override
	public int deleteEntityFromFamilyTree(Integer entityNumber) {
		StringBuilder hqlBuilder = new StringBuilder("DELETE FROM EntityFamilyTree e ");
		hqlBuilder.append("WHERE e.entityNumber = :entityNumber");
		int deletedCount = hibernateTemplate.execute(session ->
				session.createQuery(hqlBuilder.toString())
						.setParameter("entityNumber", entityNumber)
		           .executeUpdate()
		);
		return deletedCount;
	}

	@Override
	public int deleteAllEntityFromFamilyTree(List<Integer> entityNumbers) {
		StringBuilder hqlBuilder = new StringBuilder("DELETE FROM EntityFamilyTree e ");
		hqlBuilder.append("WHERE e.entityNumber IN :entityNumbers OR e.parentEntityNumber IN :entityNumbers");
		int deletedCount = hibernateTemplate.execute(session ->
				session.createQuery(hqlBuilder.toString())
						.setParameter("entityNumbers", entityNumbers)
						.executeUpdate()
		);
		return deletedCount;
	}

	@Override
	public void deleteEntityFamilyTreeRole(Integer entityNumber) {
		StringBuilder hqlBuilder = new StringBuilder("DELETE FROM EntityFamilyTreeRole WHERE entityNumber = :entityNumber");
		hibernateTemplate.execute(session ->
				session.createQuery(hqlBuilder.toString())
						.setParameter("entityNumber", entityNumber)
						.executeUpdate()
		);
	}

	@Override
	public boolean fetchExistingParentIs(Integer entityNumber, Integer parentEntityNumber) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END FROM EntityFamilyTree ")
				.append("WHERE entityNumber = :entityNumber AND parentEntityNumber = :parentEntityNumber");
		TypedQuery<Boolean> query = session.createQuery(hqlQuery.toString(), Boolean.class);
		query.setParameter("parentEntityNumber", parentEntityNumber);
		query.setParameter("entityNumber", entityNumber);
		return query.getSingleResult();
	}

}
