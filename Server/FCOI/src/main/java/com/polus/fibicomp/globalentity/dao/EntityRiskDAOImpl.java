package com.polus.fibicomp.globalentity.dao;

import java.util.List;

import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.polus.fibicomp.globalentity.pojo.EntityRiskLevel;
import com.polus.fibicomp.globalentity.pojo.EntityRiskType;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.EntityRiskRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityRisk;

@Repository
@Transactional
public class EntityRiskDAOImpl implements EntityRiskDAO {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Override
	public int saveEntityRisk(EntityRisk entity) {
		hibernateTemplate.save(entity);
		return entity.getEntityRiskId();
	}

	@Override
	public void updateEntityRisk(EntityRiskRequestDTO dto) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE EntityRisk e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		if (dto.getRiskTypeCode() != null) {
			hqlQuery.append(", e.riskTypeCode = :riskTypeCode");
		}
		if (dto.getRiskLevelCode() != null) {
			hqlQuery.append(", e.riskLevelCode = :riskLevelCode");
		}
		if (dto.getDescription() != null) {
			hqlQuery.append(", e.description = :description");
		}
		hqlQuery.append(" WHERE e.entityRiskId = :entityRiskId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityRiskId", dto.getEntityRiskId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		if (dto.getRiskTypeCode() != null) {
			query.setParameter("riskTypeCode", dto.getRiskTypeCode());
		}
		if (dto.getRiskLevelCode() != null) {
			query.setParameter("riskLevelCode", dto.getRiskLevelCode());
		}
		if (dto.getDescription() != null) {
			query.setParameter("description", dto.getDescription());
		}
		query.executeUpdate();
	}

	@Override
	public List<EntityRisk> findSubAwdOrgRiskByEntityId(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityRisk> query = builder.createQuery(EntityRisk.class);
		Root<EntityRisk> rootEntityRisk = query.from(EntityRisk.class);
		Predicate riskCategoryCodePredicate = builder.equal(rootEntityRisk.get("riskType").get("riskCategoryCode"), "OR");
	    Predicate entityIdPredicate = builder.equal(rootEntityRisk.get("entityId"), entityId);
	    query.where(builder.and(riskCategoryCodePredicate, entityIdPredicate));
		return session.createQuery(query).getResultList();
	}

	@Override
	public List<EntityRisk> findSponsorRiskByEntityId(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityRisk> query = builder.createQuery(EntityRisk.class);
		Root<EntityRisk> rootEntityRisk = query.from(EntityRisk.class);
		Predicate riskCategoryCodePredicate = builder.equal(rootEntityRisk.get("riskType").get("riskCategoryCode"), "SP");
	    Predicate entityIdPredicate = builder.equal(rootEntityRisk.get("entityId"), entityId);
	    query.where(builder.and(riskCategoryCodePredicate, entityIdPredicate));
	    query.orderBy(builder.desc(rootEntityRisk.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public List<EntityRisk> findEntityRiskByEntityId(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityRisk> query = builder.createQuery(EntityRisk.class);
		Root<EntityRisk> rootEntityRisk = query.from(EntityRisk.class);
		Predicate riskCategoryCodePredicate = builder.equal(rootEntityRisk.get("riskType").get("riskCategoryCode"), "EN");
	    Predicate entityIdPredicate = builder.equal(rootEntityRisk.get("entityId"), entityId);
	    query.where(builder.and(riskCategoryCodePredicate, entityIdPredicate));
	    query.orderBy(builder.desc(rootEntityRisk.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public List<EntityRisk> findComplianceRiskByEntityId(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityRisk> query = builder.createQuery(EntityRisk.class);
		Root<EntityRisk> rootEntityRisk = query.from(EntityRisk.class);
		Predicate riskCategoryCodePredicate = builder.equal(rootEntityRisk.get("riskType").get("riskCategoryCode"), "CO");
	    Predicate entityIdPredicate = builder.equal(rootEntityRisk.get("entityId"), entityId);
	    query.where(builder.and(riskCategoryCodePredicate, entityIdPredicate));
	    query.orderBy(builder.desc(rootEntityRisk.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public EntityRiskLevel findEntityRiskLevel(String riskLevelCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("select r from EntityRiskLevel r where r.riskLevelCode = :riskLevelCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("riskLevelCode", riskLevelCode);
		return (EntityRiskLevel) query.getResultList().get(0);
	}

	@Override
	public EntityRiskType findEntityRiskType(String riskLevelCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("select r from EntityRiskType r where r.riskTypeCode = :riskTypeCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("riskTypeCode", riskLevelCode);
		return (EntityRiskType) query.getResultList().get(0);
	}

}
