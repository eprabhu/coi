package com.polus.fibicomp.coi.repository;

import java.util.List;

import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanActionType;
import com.polus.fibicomp.cmp.pojo.CoiMgmtPlanActionLog;
import com.polus.fibicomp.coi.dao.GeneralDaoImpl;
import com.polus.fibicomp.coi.dto.DisclosureActionLogDto;
import com.polus.fibicomp.coi.dto.PersonEntityDto;
import com.polus.fibicomp.coi.pojo.DisclosureActionLog;
import com.polus.fibicomp.coi.pojo.PersonEntityActionLog;
import com.polus.fibicomp.coi.pojo.PersonEntityActionType;
import com.polus.fibicomp.coi.pojo.TravelDisclosureActionLog;
import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclActionLogType;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclActionLog;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclActionLogType;
import com.polus.fibicomp.opa.pojo.OPAActionLog;
import com.polus.fibicomp.opa.pojo.OPAActionLogType;
import com.polus.fibicomp.travelDisclosure.dtos.TravelDisclosureActionLogDto;

@Repository
@Primary
@Transactional
public class ActionLogDaoImpl implements ActionLogDao {

    protected static Logger logger = LogManager.getLogger(GeneralDaoImpl.class.getName());

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao;

    @Override
	public List<DisclosureActionLog> fetchDisclosureActionLogsBasedOnDisclosureId(Integer disclosureId, List<String> reviewActionTypeCodes) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<DisclosureActionLog> query = builder.createQuery(DisclosureActionLog.class);
		Root<DisclosureActionLog> root = query.from(DisclosureActionLog.class);
		query.where(builder.and(builder.equal(root.get("disclosureId"), disclosureId),
				builder.not(root.get("actionTypeCode").in(reviewActionTypeCodes))));
        query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}
    
    @Override
	public List<TravelDisclosureActionLog> fetchTravelDisclosureActionLog(Integer travelDisclosureId, String actionTypeCode) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT tda FROM TravelDisclosureActionLog tda WHERE tda.travelDisclosureId = :travelDisclosureId AND tda.actionTypeCode = :actionTypeCode ORDER BY updateTimestamp DESC");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("actionTypeCode", actionTypeCode);
        query.setParameter("entityId", travelDisclosureId);
        return query.getResultList();
	}


    @Override
    public void saveObject(Object e) {
        hibernateTemplate.saveOrUpdate(e);
    }

    @Override
    public List<DisclosureActionLog> fetchDisclosureActionLog(DisclosureActionLogDto actionLogDto) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT al FROM DisclosureActionLog al WHERE al.disclosureId = :disclosureId AND " );
        hqlQuery.append("al.actionTypeCode IN :actionTypeCode ORDER BY al.updateTimestamp DESC");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("actionTypeCode", actionLogDto.getActionTypeCodes());
        query.setParameter("disclosureId", actionLogDto.getDisclosureId());
        return query.getResultList();
    }

	@Override
	public List<TravelDisclosureActionLog> fetchTravelDisclosureActionLogsBasedOnId(Integer travelDisclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<TravelDisclosureActionLog> query = builder.createQuery(TravelDisclosureActionLog.class);
		Root<TravelDisclosureActionLog> root = query.from(TravelDisclosureActionLog.class);
        query.where(builder.equal(root.get("travelDisclosureId"), travelDisclosureId));
        query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public List<TravelDisclosureActionLog> fetchTravelDisclosureActionLog(TravelDisclosureActionLogDto actionLogDto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<TravelDisclosureActionLog> query = builder.createQuery(TravelDisclosureActionLog.class);
		Root<TravelDisclosureActionLog> root = query.from(TravelDisclosureActionLog.class);
		query.where(builder.equal(root.get("travelDisclosureId"), actionLogDto.getTravelDisclosureId()),
				builder.equal(root.get("actionTypeCode"), actionLogDto.getActionTypeCode()));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public List<DisclosureActionLog> fetchReviewActionLogs(Integer disclosureId, List<String> actionTypeCodes) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<DisclosureActionLog> query = builder.createQuery(DisclosureActionLog.class);
		Root<DisclosureActionLog> root = query.from(DisclosureActionLog.class);
		query.where(builder.and(builder.equal(root.get("disclosureId"), disclosureId),
				root.get("actionTypeCode").in(actionTypeCodes)));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}
    @Override
    public PersonEntityActionType getPersonEntityActionType(String actionLogTypeCode) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT a FROM PersonEntityActionType a WHERE a.actionTypeCode = :actionTypeCode");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("actionTypeCode", actionLogTypeCode);
        return (PersonEntityActionType) query.getResultList().get(0);
    }

    @Override
    public List<PersonEntityActionLog> fetchPersonEntityActionLog(PersonEntityDto personEntityDto) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT a FROM PersonEntityActionLog a WHERE a.personEntityNumber = :personEntityNumber AND ");
        hqlQuery.append("a.personEntity.versionNumber <= :versionNumber ORDER BY a.updateTimestamp DESC");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("personEntityNumber", personEntityDto.getPersonEntityNumber());
        query.setParameter("versionNumber", personEntityDto.getVersionNumber());
        return query.getResultList();
    }

    @Override
    public void deletePersonEntityActionLog(Integer personEntityId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("DELETE FROM PersonEntityActionLog a WHERE a.personEntityId = :personEntityId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("personEntityId", personEntityId);
        query.executeUpdate();
    }

    @Override
    public OPAActionLogType getOPAActionType(String actionLogTypeCode) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT oa FROM OPAActionLogType oa WHERE oa.actionTypeCode = :actionTypeCode");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("actionTypeCode", actionLogTypeCode);
        return (OPAActionLogType) query.getResultList().get(0);
    }

    @Override
    public List<OPAActionLog> fetchOpaDisclosureActionLogsBasedOnId(Integer opaDisclosureId, List<String> actionTypeCodes, boolean isStatusIn) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT a FROM OPAActionLog a WHERE a.opaDisclosureId = :opaDisclosureId ");
        if (isStatusIn) {
            hqlQuery.append("AND a.actionTypeCode IN :actionTypeCode ");
        } else {
            hqlQuery.append("AND a.actionTypeCode NOT IN :actionTypeCode ");
        }
        hqlQuery.append("ORDER BY a.updateTimestamp DESC, actionLogId DESC");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId", opaDisclosureId);
        query.setParameter("actionTypeCode", actionTypeCodes);
        return query.getResultList();
    }

    @Override
	public ConsultingDisclActionLogType getConsultDisclActionType(String actionLogTypeCode) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT d FROM ConsultingDisclActionLogType d WHERE d.actionTypeCode = :actionTypeCode");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("actionTypeCode", actionLogTypeCode);
        return (ConsultingDisclActionLogType) query.getResultList().get(0);
	}

	@Override
	public List<ConsultingDisclActionLog> fetchConsultDisclActionLogsBasedOnId(Integer disclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<ConsultingDisclActionLog> query = builder.createQuery(ConsultingDisclActionLog.class);
		Root<ConsultingDisclActionLog> root = query.from(ConsultingDisclActionLog.class);
		query.where(builder.equal(root.get("disclosureId"), disclosureId));
        query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

    @Override
    public List<DisclosureActionLog> fetchCoiDisclosureActionLogsBasedOnId(Integer disclosureId, List<String> actionTypeCodes, boolean isStatusIn) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT a FROM DisclosureActionLog a WHERE a.disclosureId = :disclosureId ");
        if (isStatusIn) {
            hqlQuery.append("AND a.actionTypeCode IN :actionTypeCode ");
        } else {
            hqlQuery.append("AND a.actionTypeCode NOT IN :actionTypeCode ");
        }
        hqlQuery.append("ORDER BY a.updateTimestamp DESC, actionLogId DESC");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("actionTypeCode", actionTypeCodes);
        return query.getResultList();
    }

    @Override
    public CoiDeclActionLogType getCoiDeclarationActionType(String actionTypeCode) {
        return hibernateTemplate.get(CoiDeclActionLogType.class, actionTypeCode);
    }

	@Override
	public CoiManagementPlanActionType getCmpActionType(String actionTypeCode) {
		return hibernateTemplate.get(CoiManagementPlanActionType.class, actionTypeCode);
	}

	@Override
	public List<CoiMgmtPlanActionLog> fetchCmpActionLogsByCmpId(Integer cmpId, List<String> actionTypeCodes,
			boolean isStatusIn) {
		StringBuilder hql = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hql.append("SELECT a FROM CoiMgmtPlanActionLog a ").append("WHERE a.cmpId = :cmpId ");
		if (isStatusIn) {
			hql.append("AND a.actionTypeCode IN :actionTypeCode ");
		} else {
			hql.append("AND a.actionTypeCode NOT IN :actionTypeCode ");
		}
		hql.append("ORDER BY a.updateTimestamp DESC, cmpActionLogId DESC");
		Query query = session.createQuery(hql.toString());
		query.setParameter("cmpId", cmpId);
		query.setParameter("actionTypeCode", actionTypeCodes);
		return query.getResultList();
	}

}
