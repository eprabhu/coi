package com.polus.fibicomp.globalentity.dao;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.EntityCommentsDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComment;
import com.polus.fibicomp.globalentity.pojo.EntitySectionCommentRef;


@Repository
@Transactional
public class EntityCommentsDAOImpl implements EntityCommentsDAO {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Override
	public Integer saveComment(EntityComment entityComment) {
		hibernateTemplate.save(entityComment);
		return entityComment.getEntityCommentId();
	}

	@Override
	public void saveEntitySectionCommentRef(EntitySectionCommentRef entitySectionCommentRef) {
		hibernateTemplate.save(entitySectionCommentRef);
	}

	@Override
	public Timestamp updateComment(EntityCommentsDTO dto) {
		Timestamp updateTimestamp = commonDao.getCurrentTimestamp();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaUpdate<EntityComment> updateQuery = builder.createCriteriaUpdate(EntityComment.class);
		Root<EntityComment> root = updateQuery.from(EntityComment.class);
		updateQuery.set(root.get("updatedBy"), AuthenticatedUser.getLoginPersonId());
		updateQuery.set(root.get("updateTimestamp"), updateTimestamp);
		updateQuery.set(root.get("comment"), dto.getComment());
		updateQuery.where(builder.equal(root.get("entityCommentId"), dto.getEntityCommentId()));
		session.createQuery(updateQuery).executeUpdate();
		return updateTimestamp;
	}

	@Override
	public List<EntityComment> getCommentsBySectionCode(String sectionCode, Integer entityNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityComment> query = builder.createQuery(EntityComment.class);
		Root<EntityComment> root = query.from(EntityComment.class);
		Subquery<Long> subquery = query.subquery(Long.class);
		Root<EntitySectionCommentRef> subRoot = subquery.from(EntitySectionCommentRef.class);
		subquery.select(subRoot.get("entityCommentId")).where(builder.equal(subRoot.get("entityNumber"), entityNumber),
				builder.equal(subRoot.get("sectionCode"), sectionCode));
		query.where(root.get("entityCommentId").in(subquery));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public void deleteEntitySectionCommentRef(Integer entityCommentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<EntitySectionCommentRef> deleteQuery = builder.createCriteriaDelete(EntitySectionCommentRef.class);
		Root<EntitySectionCommentRef> root = deleteQuery.from(EntitySectionCommentRef.class);
		deleteQuery.where(builder.equal(root.get("entityCommentId"), entityCommentId));
		session.createQuery(deleteQuery).executeUpdate();
	}

	@Override
	public void deleteComment(Integer entityCommentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<EntityComment> deleteQuery = builder.createCriteriaDelete(EntityComment.class);
		Root<EntityComment> root = deleteQuery.from(EntityComment.class);
		deleteQuery.where(builder.equal(root.get("entityCommentId"), entityCommentId));
		session.createQuery(deleteQuery).executeUpdate();
	}

	@Override
	public Boolean resolveComment(Integer entityCommentId) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaUpdate<EntityComment> update = cb.createCriteriaUpdate(EntityComment.class);
			Root<EntityComment> root = update.from(EntityComment.class);

			update.set(root.get("isResolved"), true);
			update.set(root.get("resolvedBy"), AuthenticatedUser.getLoginPersonId());
			update.set(root.get("resolvedTimestamp"), commonDao.getCurrentTimestamp());
			update.set(root.get("updateTimestamp"), commonDao.getCurrentTimestamp());
			update.set(root.get("updatedBy"), AuthenticatedUser.getLoginPersonId());
			update.where(cb.equal(root.get("entityCommentId"), entityCommentId));

			int rowsUpdated = session.createQuery(update).executeUpdate();
			return rowsUpdated > 0;
		} catch (Exception e) {
			throw new RuntimeException("Failed to update comment as resolved", e);
		}
	}

}
