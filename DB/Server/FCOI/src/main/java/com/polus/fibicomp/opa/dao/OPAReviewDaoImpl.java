package com.polus.fibicomp.opa.dao;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.pojo.CoiReview;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.opa.pojo.OPAReview;
import com.polus.core.security.AuthenticatedUser;

@Repository
@Transactional
public class OPAReviewDaoImpl implements OPAReviewDao {

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao;

    @Autowired
    private PersonDao personDao;

    protected static Logger logger = LogManager.getLogger(OPADaoImpl.class.getName());

    @Override
    public void saveOrUpdate(Object entity) {
        hibernateTemplate.saveOrUpdate(entity);
    }

    @Override
    public Timestamp updateOPAReview(OPAReview opaReview) {
        Timestamp timesStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPAReview r SET r.assigneePersonId = :assigneePersonId, ");
        hqlQuery.append("r.adminGroupId = :adminGroupId, r.reviewStatusTypeCode = :reviewStatusTypeCode, ");
        hqlQuery.append("r.locationTypeCode = :locationTypeCode, ");
        if (opaReview.getDescription() != null)
            hqlQuery.append(" r.description = :description, ");
        hqlQuery.append("r.startDate = :startDate, r.endDate = :endDate, ");
        hqlQuery.append("r.updateTimestamp = :updateTimestamp, r.updateUser = :updateUser ");
        hqlQuery.append("WHERE r.opaReviewId = :opaReviewId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("assigneePersonId", opaReview.getAssigneePersonId());
        query.setParameter("adminGroupId", opaReview.getAdminGroupId());
        query.setParameter("reviewStatusTypeCode", opaReview.getReviewStatusTypeCode());
        query.setParameter("locationTypeCode", opaReview.getLocationTypeCode());
        query.setParameter("startDate", opaReview.getStartDate());
        query.setParameter("endDate", opaReview.getEndDate());
        query.setParameter("updateTimestamp", timesStamp);
        query.setParameter("updateUser", AuthenticatedUser.getLoginUserName());
        query.setParameter("opaReviewId", opaReview.getOpaReviewId());
        if (opaReview.getDescription() != null)
            query.setParameter("description", opaReview.getDescription());
        query.executeUpdate();
        return timesStamp;
    }

    @Override
    public Long numberOfReviewOfStatuesIn(Integer opaDisclosureId, List<String> reviewStatusTypeCodes) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT count(r.opaReviewId) FROM  OPAReview r ");
        hqlQuery.append("WHERE r.opaDisclosureId = :opaDisclosureId AND r.reviewStatusTypeCode IN :reviewStatusTypeCode");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId", opaDisclosureId);
        query.setParameter("reviewStatusTypeCode", reviewStatusTypeCodes);
        return (Long) query.getSingleResult();
    }

    @Override
    public List<OPAReview> fetchAllOPAReviewByDisId(Integer opaDisclosureId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT r FROM  OPAReview r ");
        hqlQuery.append("WHERE r.opaDisclosureId = :opaDisclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaDisclosureId", opaDisclosureId);
        return query.getResultList();
    }

    @Override
    public Timestamp updateReviewStatus(Integer opaReviewId, String reviewStatus, Date opaReviewEndDate) {
        Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE OPAReview r SET r.reviewStatusTypeCode = :reviewStatusTypeCode, ");
        hqlQuery.append("r.updateTimestamp = :updateTimestamp, r.updateUser = :updateUser");
        if (opaReviewEndDate != null) {
            hqlQuery.append(" ,r.endDate = :opaReviewEndDate ");
        }
        hqlQuery.append(" WHERE r.opaReviewId = :opaReviewId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("reviewStatusTypeCode", reviewStatus);
        query.setParameter("opaReviewId", opaReviewId);
        query.setParameter("updateUser", AuthenticatedUser.getLoginUserName());
        query.setParameter("updateTimestamp", updateTimestamp);
        if (opaReviewEndDate != null) {
            query.setParameter("opaReviewEndDate", opaReviewEndDate);
        }
        query.executeUpdate();
        return updateTimestamp;
    }

    @Override
    public OPAReview getOPAReview(Integer opaReviewId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT r FROM  OPAReview r ");
        hqlQuery.append("WHERE r.opaReviewId = :opaReviewId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaReviewId", opaReviewId);
        List<OPAReview> resultData = query.getResultList();
        if(resultData != null  && !resultData.isEmpty()) {
            return resultData.get(0);
        }
        return null;
    }

    @Override
    public boolean isOPAReviewAdded(OPAReview opaReview) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(r.opaReviewId) > 0) then true else false end ");
        hqlQuery.append("FROM OPAReview r WHERE r.locationTypeCode = :locationTypeCode ");
        hqlQuery.append("AND r.opaDisclosureId = :opaDisclosureId AND r.reviewStatusTypeCode != :reviewStatusTypeCode ");
        if (opaReview.getAssigneePersonId() != null) {
			hqlQuery.append(" AND r.assigneePersonId = :assigneePersonId ");
		} else {
			hqlQuery.append(" AND r.assigneePersonId IS NULL ");
		}
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("locationTypeCode", opaReview.getLocationTypeCode());
        query.setParameter("opaDisclosureId", opaReview.getOpaDisclosureId());
        query.setParameter("reviewStatusTypeCode", Constants.OPA_REVIEW_COMPLETED);
        if (opaReview.getAssigneePersonId() != null)
            query.setParameter("assigneePersonId", opaReview.getAssigneePersonId());
        return (boolean) query.getSingleResult();
    }

    @Override
    public boolean isOPAReviewExistsOfStatus(Integer opaReviewId, List<String> statuses) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(r.opaReviewId) > 0) then true else false end ");
        hqlQuery.append("FROM OPAReview r WHERE r.opaReviewId = :opaReviewId ");
        if (statuses != null)
            hqlQuery.append("AND r.reviewStatusTypeCode IN :reviewStatusTypeCodes ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaReviewId", opaReviewId);
        if (statuses != null)
            query.setParameter("reviewStatusTypeCodes", statuses);
        return (boolean) query.getSingleResult();
    }

    @Override
    public void deleteOPAReview(Integer opaReviewId) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("DELETE FROM OPAReview r ");
        hqlQuery.append("WHERE r.opaReviewId = :opaReviewId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("opaReviewId", opaReviewId);
        query.executeUpdate();
    }

	@Override
	public boolean isReviewStatusChanged(OPAReview opaReview) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT r.opaReviewId FROM OPAReview r WHERE ");
		hqlQuery.append("r.opaReviewId = :reviewId");
		hqlQuery.append(" AND r.reviewStatusTypeCode = :currentReviewStatusTypeCode AND r.locationTypeCode = :currentLocationTypeCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("reviewId", opaReview.getOpaReviewId());
		query.setParameter("currentLocationTypeCode", opaReview.getCurrentLocationTypeCode());
		query.setParameter("currentReviewStatusTypeCode", opaReview.getCurrentReviewStatusTypeCode());
		try {
			Integer result = (Integer) query.getSingleResult();
			return result == null;
		}catch (NoResultException e) {
			return true;
		}
	}

	@Override
	public boolean isReviewPresent(OPAReview opaReview) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT r.opaReviewId FROM OPAReview r WHERE ");
		hqlQuery.append(" r.opaDisclosureId = :disclosureId AND r.opaReviewId != :reviewId ");
		hqlQuery.append("AND (r.reviewStatusTypeCode = :newReviewStatusTypeCode OR r.reviewStatusTypeCode != :reviewStatusTypeCode) ");
		hqlQuery.append(" AND r.locationTypeCode = :newLocationTypeCode ");
		if (opaReview.getAssigneePersonId() != null) {
			hqlQuery.append(" AND r.assigneePersonId = :assigneePersonId ");
		} else {
			hqlQuery.append(" AND r.assigneePersonId IS NULL ");
		}
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("newLocationTypeCode", opaReview.getLocationTypeCode());
		query.setParameter("newReviewStatusTypeCode", opaReview.getReviewStatusTypeCode());
		query.setParameter("disclosureId", opaReview.getOpaDisclosureId());
		query.setParameter("reviewId", opaReview.getOpaReviewId());
		query.setParameter("reviewStatusTypeCode", Constants.OPA_REVIEW_COMPLETED);
		if (opaReview.getAssigneePersonId() != null)
			query.setParameter("assigneePersonId", opaReview.getAssigneePersonId());
		try {
			Integer result = (Integer) query.getSingleResult();
			return result != null;
		} catch (NoResultException e) {
			return false;
		}
	}
	
	@Override
	public Integer numberOfReviewNotOfStatus(Integer disclosureId, String reviewStatus) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<Integer> query = builder.createQuery(Integer.class);
		Root<OPAReview> root = query.from(OPAReview.class);
		Predicate disclosureIdPredicate = builder.equal(root.get("opaDisclosureId"), disclosureId);
		query.select(root.get("opaReviewId"));
		if (reviewStatus != null) {
			Predicate predicate2 = builder.notEqual(root.get("reviewStatusTypeCode"), reviewStatus);
			query.where(builder.and(disclosureIdPredicate, predicate2));
		} else {
			query.where(disclosureIdPredicate);
		}
		return (session.createQuery(query).getResultList().size());
	}

	@Override
	public Integer getReviewCountForDisclosure(Integer disclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT COUNT(r.opaReviewId) FROM OPAReview r WHERE r.opaDisclosureId = :disclosureId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("disclosureId", disclosureId);
		Long count = (Long) query.getSingleResult();
		return count != null ? count.intValue() : 0;
	}
}
