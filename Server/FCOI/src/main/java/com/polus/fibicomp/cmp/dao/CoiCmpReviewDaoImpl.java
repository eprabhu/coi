package com.polus.fibicomp.cmp.dao;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import javax.persistence.Query;
import javax.transaction.Transactional;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;

import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.dto.CoiCmpReviewDto;
import com.polus.fibicomp.cmp.pojo.CoiCmpReview;
import com.polus.fibicomp.constants.Constants;

@Repository
@Transactional
public class CoiCmpReviewDaoImpl implements CoiCmpReviewDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Override
	public void saveOrUpdate(CoiCmpReview review) {
		hibernateTemplate.saveOrUpdate(review);
		hibernateTemplate.flush();
		hibernateTemplate.refresh(review);
	}

	@Override
	public CoiCmpReview getReview(Integer cmpReviewId) {
		return hibernateTemplate.get(CoiCmpReview.class, cmpReviewId);
	}

	@Override
	public List<CoiCmpReview> getReviewsByCmpId(Integer cmpId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		return session.createQuery("FROM CoiCmpReview r WHERE r.cmpId = :cmpId", CoiCmpReview.class)
				.setParameter("cmpId", cmpId).getResultList();
	}

	@Override
	public Timestamp updateReviewStatus(Integer reviewId, String statusCode, Date startDate, Date endDate) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Timestamp ts = new Timestamp(System.currentTimeMillis());
		String hql = "UPDATE CoiCmpReview r " + "SET r.reviewStatusTypeCode = :status, " + "r.updateTimestamp = :ts, "
				+ "r.updatedBy = :user ";
		if (startDate != null) {
			hql += ", r.startDate = :startDate ";
		}
		if (endDate != null) {
			hql += ", r.endDate = :endDate ";
		}
		hql += "WHERE r.cmpReviewId = :id";
		Query query = session.createQuery(hql);
		query.setParameter("status", statusCode);
		query.setParameter("ts", ts);
		query.setParameter("user", AuthenticatedUser.getLoginUserName());
		query.setParameter("id", reviewId);
		if (startDate != null) {
			query.setParameter("startDate", startDate);
		}
		if (endDate != null) {
			query.setParameter("endDate", endDate);
		}
		query.executeUpdate();
		return ts;
	}

	@Override
	public void deleteReview(Integer reviewId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Query query = session.createQuery("DELETE FROM CoiCmpReview r WHERE r.cmpReviewId = :id");
		query.setParameter("id", reviewId);
		query.executeUpdate();
	}

	@Override
	public boolean exists(Integer reviewId) {
		return getReview(reviewId) != null;
	}

	@Override
	public boolean isReviewInStatuses(Integer reviewId, List<String> statuses) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Long count = (Long) session.createQuery(
				"SELECT COUNT(r) FROM CoiCmpReview r WHERE r.cmpReviewId = :id AND r.reviewStatusType.reviewStatusCode IN (:s)")
				.setParameter("id", reviewId).setParameter("s", statuses).getSingleResult();
		return count > 0;
	}

	@Override
	public boolean existsReviewForCmp(Integer cmpId, String reviewerId, String statusCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Long count = (Long) session.createQuery(
				"SELECT COUNT(r) FROM CoiCmpReview r WHERE r.cmpId = :cmp AND r.assigneePersonId = :pid AND r.reviewStatusType.reviewStatusCode = :status")
				.setParameter("cmp", cmpId).setParameter("pid", reviewerId).setParameter("status", statusCode)
				.getSingleResult();
		return count > 0;
	}

	@Override
	public boolean isCmpReviewAdded(CoiCmpReviewDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hql = new StringBuilder();
		hql.append("SELECT (COUNT(r.cmpReviewId) > 0) FROM CoiCmpReview r ").append("WHERE r.cmpId = :cmpId ")
				.append("AND r.locationTypeCode = :locationTypeCode ")
				.append("AND r.reviewStatusTypeCode != :completedStatus ");
		if (dto.getAssigneePersonId() != null) {
			hql.append("AND r.assigneePersonId = :assigneePersonId ");
		} else {
			hql.append("AND r.assigneePersonId IS NULL ");
		}
		if (dto.getCmpReviewId() != null) {
			hql.append("AND r.cmpReviewId != :id ");
		}
		Query q = session.createQuery(hql.toString());
		q.setParameter("cmpId", dto.getCmpId());
		q.setParameter("locationTypeCode", dto.getLocationTypeCode());
		q.setParameter("completedStatus", Constants.COI_MANAGEMENT_PLAN_REVIEWER_REVIEW_STATUS_COMPLETED);
		if (dto.getAssigneePersonId() != null) {
			q.setParameter("assigneePersonId", dto.getAssigneePersonId());
		}
		if (dto.getCmpReviewId() != null) {
			q.setParameter("id", dto.getCmpReviewId());
		}
		return (Boolean) q.getSingleResult();
	}

	@Override
	public boolean isReviewPresent(CoiCmpReviewDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hql = new StringBuilder();
		hql.append("SELECT (COUNT(r.cmpReviewId) > 0) FROM CoiCmpReview r ").append("WHERE r.cmpId = :cmpId ")
				.append("AND r.locationTypeCode = :locationTypeCode ")
				.append("AND r.reviewStatusTypeCode != :completedStatus ");
		if (dto.getCmpReviewId() != null) {
			hql.append("AND r.cmpReviewId != :id ");
		}
		Query q = session.createQuery(hql.toString());
		q.setParameter("cmpId", dto.getCmpId());
		q.setParameter("locationTypeCode", dto.getLocationTypeCode());
		q.setParameter("completedStatus", Constants.COI_MANAGEMENT_PLAN_REVIEWER_REVIEW_STATUS_COMPLETED);
		if (dto.getCmpReviewId() != null) {
			q.setParameter("id", dto.getCmpReviewId());
		}
		return (Boolean) q.getSingleResult();
	}

	@Override
	public boolean isReviewStatusChanged(CoiCmpReviewDto dto) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		String hql = "SELECT COUNT(r.cmpReviewId) FROM CoiCmpReview r " + "WHERE r.cmpReviewId = :id "
				+ "AND r.reviewStatusTypeCode = :currentStatus " + "AND r.locationTypeCode = :currentLocation";
		Query q = session.createQuery(hql);
		q.setParameter("id", dto.getCmpReviewId());
		q.setParameter("currentStatus", dto.getReviewStatusTypeCode());
		q.setParameter("currentLocation", dto.getLocationTypeCode());
		Long count = (Long) q.getSingleResult();
		return count == 0;
	}

}
