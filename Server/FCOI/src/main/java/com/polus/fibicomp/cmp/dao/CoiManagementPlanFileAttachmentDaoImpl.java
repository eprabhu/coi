package com.polus.fibicomp.cmp.dao;

import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttaType;
import com.polus.fibicomp.cmp.pojo.CoiManagementPlanAttachment;
import com.polus.fibicomp.coi.exception.COIFileAttachmentException;
import com.polus.fibicomp.globalentity.dao.EntityFileAttachmentDao;

@Transactional
@Component
public class CoiManagementPlanFileAttachmentDaoImpl implements CoiManagementPlanFileAttachmentDao {

	@Autowired
	EntityFileAttachmentDao entityFileAttachmentDao;

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	public static final String CMP_ATTACHMENT_COUNTER = "CMP_ATTACHMENT_COUNTER";

	@Override
	public CoiManagementPlanAttachment saveCmpAttachmentDetail(CoiManagementPlanAttachment attachment) {
		try {
			CoiManagementPlanAttachment cmpAttachment = CoiManagementPlanAttachment.builder()
					.attachmentNumber(attachment.getAttachmentNumber() != null ? attachment.getAttachmentNumber()
							: entityFileAttachmentDao.getNextAttachmentNumber(CMP_ATTACHMENT_COUNTER))
					.versionNumber(attachment.getVersionNumber() != null ? attachment.getVersionNumber() + 1 : 1)
					.attaTypeCode(attachment.getAttaTypeCode()).fileDataId(attachment.getFileDataId())
					.fileName(attachment.getFileName()).mimeType(attachment.getMimeType())
					.description(attachment.getDescription()).createdBy(AuthenticatedUser.getLoginPersonId())
					.createTimestamp(commonDao.getCurrentTimestamp()).cmpId(attachment.getCmpId())
					.updatedBy(AuthenticatedUser.getLoginPersonId()).updateTimestamp(commonDao.getCurrentTimestamp())
					.build();
			hibernateTemplate.saveOrUpdate(cmpAttachment);
			return cmpAttachment;
		} catch (Exception e) {
			throw new COIFileAttachmentException(
					"Error at saveCmpAttachmentDetail in CoiManagementPlanFileAttachmentDao " + e.getMessage());
		}
	}

	@Override
	public void updateCmpAttachmentDetail(Integer attachmentId, String description) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaUpdate<CoiManagementPlanAttachment> updateQuery = builder
				.createCriteriaUpdate(CoiManagementPlanAttachment.class);
		Root<CoiManagementPlanAttachment> rootAttachments = updateQuery.from(CoiManagementPlanAttachment.class);
		updateQuery.set(rootAttachments.get("description"), description);
		updateQuery.set(rootAttachments.get("updateTimestamp"), commonDao.getCurrentTimestamp());
		updateQuery.set(rootAttachments.get("updatedBy"), AuthenticatedUser.getLoginPersonId());
		updateQuery.where(builder.equal(rootAttachments.get("attachmentId"), attachmentId));
		session.createQuery(updateQuery).executeUpdate();
	}

	@Override
	public CoiManagementPlanAttachment fetchCmpAttachmentByAttachmentId(Integer attachmentId) {
	    return hibernateTemplate.get(CoiManagementPlanAttachment.class, attachmentId);
	}

	@Override
	public void deleteCmpAttachment(Integer attachmentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<CoiManagementPlanAttachment> query = builder
				.createCriteriaDelete(CoiManagementPlanAttachment.class);
		Root<CoiManagementPlanAttachment> root = query.from(CoiManagementPlanAttachment.class);
		query.where(builder.equal(root.get("attachmentId"), attachmentId));
		session.createQuery(query).executeUpdate();
	}

	@Override
	public List<CoiManagementPlanAttachment> fetchCmpAttachmentByAttachmentNumber(Integer attachmentNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<CoiManagementPlanAttachment> query = builder.createQuery(CoiManagementPlanAttachment.class);
		Root<CoiManagementPlanAttachment> root = query.from(CoiManagementPlanAttachment.class);
		query.where(builder.equal(root.get("attachmentNumber"), attachmentNumber));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public List<CoiManagementPlanAttachment> fetchCmpAttachmnetBycmpId(Integer cmpId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<CoiManagementPlanAttachment> query = builder.createQuery(CoiManagementPlanAttachment.class);
		Root<CoiManagementPlanAttachment> root = query.from(CoiManagementPlanAttachment.class);
		query.where(builder.equal(root.get("cmpId"), cmpId));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	@Override
	public CoiManagementPlanAttaType getCmpAttachmentTypeForTypeCode(String attaTypeCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<CoiManagementPlanAttaType> query = builder.createQuery(CoiManagementPlanAttaType.class);
		Root<CoiManagementPlanAttaType> root = query.from(CoiManagementPlanAttaType.class);
		query.where(builder.equal(root.get("attaTypeCode"), attaTypeCode));
		return session.createQuery(query).getSingleResult();
	}

}
