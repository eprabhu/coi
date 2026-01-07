package com.polus.fibicomp.coi.dao;

import java.util.List;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.CriteriaUpdate;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.coi.pojo.Attachments;
import com.polus.fibicomp.coi.pojo.DisclAttaType;

@Service
public class COIAttachmentDaoImpl implements COIAttachmentDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Override
	public DisclAttaType getDisclosureAttachmentForTypeCode(String attaTypeCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<DisclAttaType> query = builder.createQuery(DisclAttaType.class);
		Root<DisclAttaType> root = query.from(DisclAttaType.class);
		query.where(builder.equal(root.get("attaTypeCode"), attaTypeCode));
		return session.createQuery(query).getSingleResult();
	}

	public void updateAttachmentDetail(Integer attachmentId, String description) {
    	Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaUpdate<Attachments> updateQuery = builder.createCriteriaUpdate(Attachments.class);
		Root<Attachments> rootAttachments = updateQuery.from(Attachments.class);
		updateQuery.set(rootAttachments.get("description"), description); 
		updateQuery.set(rootAttachments.get("updateTimestamp"), commonDao.getCurrentTimestamp());
		updateQuery.set(rootAttachments.get("updatedBy"),AuthenticatedUser.getLoginPersonId());
		updateQuery.where(rootAttachments.get("attachmentId").in(attachmentId));
		session.createQuery(updateQuery).executeUpdate();
	}

	@Override
	public Attachments fetchAttachmentByAttachmentId(Integer attachmentId) {
		return hibernateTemplate.load(Attachments.class, attachmentId);
	}

	public List<Attachments> fetchAttachmentByAttachmentNumber(Integer attachNumber) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<Attachments> query = builder.createQuery(Attachments.class);
		Root<Attachments> root = query.from(Attachments.class);
		query.where(builder.equal(root.get("attachmentNumber"), attachNumber));
		query.orderBy(builder.desc(root.get("updateTimestamp")));
		return session.createQuery(query).getResultList();
	}

	public void deleteAttachment(Integer attachmentId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<Attachments> query = builder.createCriteriaDelete(Attachments.class);
		Root<Attachments> root = query.from(Attachments.class);
		query.where(builder.equal(root.get("attachmentId"), attachmentId));
		session.createQuery(query).executeUpdate();
	}

}

