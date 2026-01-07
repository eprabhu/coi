package com.polus.fibicomp.globalentity.dao;

import java.util.List;

import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import com.polus.fibicomp.constants.Constants;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.globalentity.pojo.EntityActionLog;
import com.polus.fibicomp.globalentity.pojo.EntityActionType;
import com.polus.fibicomp.globalentity.pojo.EntityRiskActionLog;

@Repository
@Primary
@Transactional
public class EntityActionLogDaoImpl implements EntityActionLogDao {

    protected static Logger logger = LogManager.getLogger(EntityActionLogDaoImpl.class.getName());

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Override
    public void saveEntityActionLog(EntityActionLog entityActionLog) {
        hibernateTemplate.saveOrUpdate(entityActionLog);
    }

    @Override
	public EntityActionType getEntityActionType(String actionLogTypeCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
		CriteriaQuery<EntityActionType> criteriaQuery = criteriaBuilder.createQuery(EntityActionType.class);
		Root<EntityActionType> root = criteriaQuery.from(EntityActionType.class);
		criteriaQuery.select(root).where(criteriaBuilder.equal(root.get("actionTypeCode"), actionLogTypeCode));
		return session.createQuery(criteriaQuery).getSingleResult();

	}

    @Override
	public List<EntityActionLog> fetchAllEntityActionLog(Integer entityId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT al FROM EntityActionLog al ")
				.append("LEFT JOIN Entity e ON e.entityId = :entityId ")
				.append("LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber  ")
				.append("LEFT JOIN Entity e2 ON e2.entityId = :entityId AND e2.versionStatus = :versionStatus ")
				.append("WHERE al.entityId = e1.entityId AND (e2.entityId IS NOT NULL OR e1.versionNumber <= e.versionNumber )")
				.append("ORDER BY al.updateTimestamp desc, al.actionLogId desc");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", entityId);
		query.setParameter("versionStatus", Constants.COI_ACTIVE_STATUS);
		return query.getResultList();
	}

    @Override
    public void saveEntityRiskActionLog(EntityRiskActionLog entityriskActionLog) {
        hibernateTemplate.saveOrUpdate(entityriskActionLog);
    }

	@Override
	public List<EntityRiskActionLog> fetchAllEntityRiskActionLog(Integer entityRiskId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hqlQuery = new StringBuilder()
				.append("SELECT al FROM EntityRiskActionLog al ")
				.append("LEFT JOIN EntityRisk er ON er.entityRiskId = :entityRiskId ")
				.append("LEFT JOIN Entity e ON e.entityId = er.entityId ")
				.append("LEFT JOIN Entity e1 ON e1.entityNumber = e.entityNumber AND e1.versionNumber <= e.versionNumber ")
				.append("LEFT JOIN EntityRisk er1 ON er1.entityId = e1.entityId AND er1.riskTypeCode = er.riskTypeCode ")
				.append("WHERE al.entityRiskId = er1.entityRiskId AND e1.versionNumber <= e.versionNumber ORDER BY al.updateTimestamp DESC, al.actionLogId DESC");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityRiskId", entityRiskId);
		return query.getResultList();
	}

	@Override
	public List<EntityActionLog> fetchAllEntityActionLog(Integer entityId, Integer entityNumber) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT al FROM EntityRiskActionLog al ")
		.append("WHERE al.entityId IN (SELECT e.entityId FROM Entity e LEFT JOIN Entity e1 ON e1.entityId = :entityId ")
		.append("LEFT JOIN Entity e2 ON e2.entityId = :entityId AND e2.versionStatus = :versionStatus ")
		.append("WHERE (e2.entityId IS NOT NULL OR e.versionNumber <= e1.versionNumber) AND e.entityNumber = :entityNumber) ORDER BY al.updateTimestamp DESC, al.actionLogId DESC");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", entityId);
		query.setParameter("entityNumber", entityNumber);
		query.setParameter("versionStatus", Constants.COI_ACTIVE_STATUS);
		return query.getResultList();
	}

}
