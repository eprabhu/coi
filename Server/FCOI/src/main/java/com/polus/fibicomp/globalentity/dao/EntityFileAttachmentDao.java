package com.polus.fibicomp.globalentity.dao;

import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.globalentity.exception.EntityFileAttachmentException;
import com.polus.fibicomp.globalentity.pojo.EntityAttachment;
import com.polus.fibicomp.globalentity.pojo.EntitySectionAttachRef;

@Component
public class EntityFileAttachmentDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	public static final String ATTACHMENT_COUNTER = "ATTACHMENT_COUNTER";

    @Transactional(rollbackFor = {EntityFileAttachmentException.class})
	public Integer saveEntityAttachmentDetail(EntityAttachment attach) {
		try {
			EntityAttachment entity = EntityAttachment.builder()
					.attachmentNumber(attach.getAttachmentNumber() != null ? attach.getAttachmentNumber() : getNextAttachmentNumber(ATTACHMENT_COUNTER))
					.versionNumber(attach.getVersionNumber() != null ? attach.getVersionNumber() + 1 : 1)
					.attachmentTypeCode(attach.getAttachmentTypeCode())
					.fileDataId(attach.getFileDataId())
					.fileName(attach.getFileName())
					.mimeType(attach.getMimeType())
					.comment(attach.getComment())
					.entityId(attach.getEntityId())
					.updatedBy(AuthenticatedUser.getLoginPersonId())
					.updateTimestamp(commonDao.getCurrentTimestamp()).build();
			hibernateTemplate.saveOrUpdate(entity);
			return entity.getEntityAttachmentId();
		} catch (Exception e) {
			throw new EntityFileAttachmentException(
					"Error at saveEntityAttachmentDetail in EntityFileAttachmentDao " + e.getMessage());
		}
	}

	public Integer getNextAttachmentNumber(String attachmentCounterName) {
		final Integer[] attachmentNumber = { null };
		hibernateTemplate.execute(session -> {
			session.doWork(connection -> {
				String procedureCall = "{call GENERATE_ATTACHMENT_NUMBER(?)}";
				try (CallableStatement statement = connection.prepareCall(procedureCall)) {
					statement.setString(1, attachmentCounterName);
					boolean hasResultSet = statement.execute();

					if (hasResultSet) {
						try (ResultSet resultSet = statement.getResultSet()) {
							if (resultSet != null && resultSet.next()) {
								int nextValue = resultSet.getInt("LI_NEXT_VALUE");
								if (nextValue == 0) {
									throw new ApplicationException("Unable to acquire lock", Constants.JAVA_ERROR);
								}
								attachmentNumber[0] = nextValue;
							} else {
								throw new ApplicationException("No result returned from procedure", Constants.JAVA_ERROR);
							}
						}
					} else {
						throw new ApplicationException("No result set available", Constants.JAVA_ERROR);
					}
				} catch (SQLException e) {
					throw new ApplicationException("Unable to fetch data", e, Constants.JAVA_ERROR);
				}
			});
			return null;
		});
		return attachmentNumber[0];
	}
    
	public EntityAttachment getEntityAttachByAttachId(Integer attachmentId) {
		return hibernateTemplate.load(EntityAttachment.class, attachmentId);
	}

    @Transactional(rollbackFor = {EntityFileAttachmentException.class})
	public void updateEntityAttachmentDetail(Integer attachmentId, String description) {
    	Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaUpdate<EntityAttachment> updateQuery = builder.createCriteriaUpdate(EntityAttachment.class);
		Root<EntityAttachment> rootEntityAttachment = updateQuery.from(EntityAttachment.class);
		updateQuery.set(rootEntityAttachment.get("comment"), description);
		updateQuery.set(rootEntityAttachment.get("updateTimestamp"), commonDao.getCurrentTimestamp()); 
		updateQuery.set(rootEntityAttachment.get("updatedBy"), AuthenticatedUser.getLoginPersonId()); 
		updateQuery.where(rootEntityAttachment.get("entityAttachmentId").in(attachmentId));
		session.createQuery(updateQuery).executeUpdate();
	}

	public List<EntityAttachment> getEntityAttachByAttachIds(List<Integer> attachmentIds) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityAttachment> query = builder.createQuery(EntityAttachment.class);
		Root<EntityAttachment> root = query.from(EntityAttachment.class);
		query.where(root.get("entityAttachmentId").in(attachmentIds));
		return session.createQuery(query).getResultList();
	}

	public void deleteEntityAttachment(Integer attachmentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<EntityAttachment> query = builder.createCriteriaDelete(EntityAttachment.class);
		Root<EntityAttachment> root = query.from(EntityAttachment.class);
		query.where(builder.equal(root.get("entityAttachmentId"), attachmentId));
		session.createQuery(query).executeUpdate();
	}

	public void updateEntityAttachmentStatus(String statusCode, Integer attachmentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaUpdate<EntityAttachment> updateQuery = builder.createCriteriaUpdate(EntityAttachment.class);
		Root<EntityAttachment> rootEntityAttachment = updateQuery.from(EntityAttachment.class);
		updateQuery.set(rootEntityAttachment.get("attachmentStatusCode"), statusCode); 
		updateQuery.set(rootEntityAttachment.get("updateTimestamp"), commonDao.getCurrentTimestamp()); 
		updateQuery.set(rootEntityAttachment.get("updatedBy"), AuthenticatedUser.getLoginPersonId()); 
		updateQuery.where(rootEntityAttachment.get("entityAttachmentId").in(attachmentId));
		session.createQuery(updateQuery).executeUpdate();
	}

	public List<EntityAttachment> getAttachmentsByEntityId(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityAttachment> query = builder.createQuery(EntityAttachment.class);
		Root<EntityAttachment> root = query.from(EntityAttachment.class);
		query.where(builder.equal(root.get("entityId"), entityId));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	public void saveEntitySecAttachRef(EntitySectionAttachRef entitySectionAttachRef) {
		hibernateTemplate.saveOrUpdate(entitySectionAttachRef);
	}

	public List<EntityAttachment> getAttachmentsBySectionCode(String sectionCode, Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityAttachment> query = builder.createQuery(EntityAttachment.class);
		Root<EntityAttachment> root = query.from(EntityAttachment.class);
		Subquery<Long> subquery = query.subquery(Long.class);
		Root<EntitySectionAttachRef> subRoot = subquery.from(EntitySectionAttachRef.class);
		subquery.select(subRoot.get("entityAttachmentId"))
		        .where(
		            builder.equal(subRoot.get("entityId"), entityId),
		            builder.equal(subRoot.get("sectionCode"), sectionCode)
		        );
		query.where(root.get("entityAttachmentId").in(subquery));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	public void deleteEntitySecAttachRef(Integer attachmentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<EntitySectionAttachRef> query = builder.createCriteriaDelete(EntitySectionAttachRef.class);
		Root<EntitySectionAttachRef> root = query.from(EntitySectionAttachRef.class);
		query.where(builder.equal(root.get("entityAttachmentId"), attachmentId));
		session.createQuery(query).executeUpdate();
	}

	public List<EntityAttachment> getAttachByAttachNumber(Integer attachNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<EntityAttachment> query = builder.createQuery(EntityAttachment.class);
		Root<EntityAttachment> root = query.from(EntityAttachment.class);
		query.where(builder.equal(root.get("attachmentNumber"), attachNumber));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

}
