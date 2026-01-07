package com.polus.fibicomp.fcoiDisclosure.dao;

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
import com.polus.fibicomp.coi.exception.COIFileAttachmentException;
import com.polus.fibicomp.fcoiDisclosure.pojo.DisclAttachment;
import com.polus.fibicomp.globalentity.dao.EntityFileAttachmentDao;

@Component
public class FileAttachmentDaoImpl implements FileAttachmentDao{

	@Autowired
	EntityFileAttachmentDao entityFileAttachmentDao;
	
	public static final String DISCL_ATTACHMENT_COUNTER = "DISCL_ATTACHMENT_COUNTER";

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Transactional
	public DisclAttachment saveDisclAttachmentDetail(DisclAttachment attachment) {
		try {
			DisclAttachment disclAttachment = DisclAttachment.builder()
					.attachmentNumber(attachment.getAttachmentNumber() != null ? attachment.getAttachmentNumber() : entityFileAttachmentDao.getNextAttachmentNumber(DISCL_ATTACHMENT_COUNTER))
					.versionNumber(attachment.getVersionNumber() != null ? attachment.getVersionNumber() + 1 : 1)
					.attaTypeCode(attachment.getAttaTypeCode())
					.fileDataId(attachment.getFileDataId())
					.fileName(attachment.getFileName())
					.mimeType(attachment.getMimeType())
					.description(attachment.getDescription())
					.createdBy(AuthenticatedUser.getLoginPersonId())
					.createTimestamp(commonDao.getCurrentTimestamp())
					.disclosureId(attachment.getDisclosureId())
					.updatedBy(AuthenticatedUser.getLoginPersonId())
					.updateTimestamp(commonDao.getCurrentTimestamp()).build();
			hibernateTemplate.saveOrUpdate(disclAttachment);
			return disclAttachment;
		} catch (Exception e) {
			throw new COIFileAttachmentException(
					"Error at saveDisclAttachmentDetail in DisclFileAttachmentDao " + e.getMessage());
		}
	}

	public void updateDisclAttachmentDetail(Integer attachmentId, String description) {
    	Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaUpdate<DisclAttachment> updateQuery = builder.createCriteriaUpdate(DisclAttachment.class);
		Root<DisclAttachment> rootAttachments = updateQuery.from(DisclAttachment.class);
		updateQuery.set(rootAttachments.get("description"), description); 
		updateQuery.set(rootAttachments.get("updateTimestamp"), commonDao.getCurrentTimestamp());
		updateQuery.set(rootAttachments.get("updatedBy"), AuthenticatedUser.getLoginPersonId());
		updateQuery.where(builder.equal(rootAttachments.get("attachmentId"), attachmentId));
		session.createQuery(updateQuery).executeUpdate();
	}

	@Override
	public DisclAttachment fetchDisclAttachmentByAttachmentId(Integer attachmentId) {
		return hibernateTemplate.load(DisclAttachment.class, attachmentId);
	}

	public void deleteDisclAttachment(Integer attachmentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<DisclAttachment> query = builder.createCriteriaDelete(DisclAttachment.class);
		Root<DisclAttachment> root = query.from(DisclAttachment.class);
		query.where(builder.equal(root.get("attachmentId"), attachmentId));
		session.createQuery(query).executeUpdate();
	}

	public List<DisclAttachment> fetchDisclAttachmentByAttachmentNumber(Integer attachNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<DisclAttachment> query = builder.createQuery(DisclAttachment.class);
		Root<DisclAttachment> root = query.from(DisclAttachment.class);
		query.where(builder.equal(root.get("attachmentNumber"), attachNumber));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	public List<DisclAttachment> fetchDisclAttachmnetByDisclosureId(Integer disclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<DisclAttachment> query = builder.createQuery(DisclAttachment.class);
		Root<DisclAttachment> root = query.from(DisclAttachment.class);
		query.where(builder.equal(root.get("disclosureId"), disclosureId));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}
}
