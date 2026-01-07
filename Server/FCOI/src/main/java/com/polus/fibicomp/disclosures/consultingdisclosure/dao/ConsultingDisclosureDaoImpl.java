package com.polus.fibicomp.disclosures.consultingdisclosure.dao;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.polus.fibicomp.constants.Constants;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclAssignAdminDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.dto.ConsultDisclSubmitDto;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclFormBuilderDetails;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclReviewStatusType;
import com.polus.fibicomp.disclosures.consultingdisclosure.pojo.ConsultingDisclosure;

@Transactional
@Service
public class ConsultingDisclosureDaoImpl implements ConsultingDisclosureDao {

    @Autowired
    private HibernateTemplate hibernateTemplate;

    @Autowired
    private CommonDao commonDao;

    @Autowired
	private PersonDao personDao;

  	protected static Logger logger = LogManager.getLogger(ConsultingDisclosureDaoImpl.class.getName());

	@Override
	public ConsultingDisclosure createConsultingDisclosure(ConsultingDisclosure consultingDisclosure) {
		hibernateTemplate.saveOrUpdate(consultingDisclosure);
		return consultingDisclosure;
	}

	@Override
	public Timestamp submitConsultingDisclosure(ConsultDisclSubmitDto consultDisclSubmitDto) {
		Timestamp timeStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET d.certificationText = :certificationText, ");
        hqlQuery.append("d.certifiedBy = :certifiedBy, d.certifiedAt = :certifiedAt, ");
        hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, d.updateTimeStamp = :updateTimestamp,");
        hqlQuery.append("d.updatedBy = :updatedBy, d.dispositionStatusCode = :dispositionStatusCode ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", consultDisclSubmitDto.getDisclosureId());
        query.setParameter("certificationText", consultDisclSubmitDto.getCertificationText());
        query.setParameter("certifiedBy", AuthenticatedUser.getLoginPersonId());
        query.setParameter("certifiedAt", timeStamp);
		if (consultDisclSubmitDto.getDisclosureStatus() != null) {
			query.setParameter("reviewStatusCode", consultDisclSubmitDto.getDisclosureStatus());
		} else {
			query.setParameter("reviewStatusCode", Constants.CONSULT_DISCL_STATUS_SUBMIT);
		}
        query.setParameter("dispositionStatusCode", Constants.CONSULT_DISCL_DISPOSITION_STATUS_PENDING);
        query.setParameter("updateTimestamp", timeStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timeStamp;
	}

	@Override
	public Timestamp returnOrWithdrawConsultingDisclosure(String dislcosureStatusCode, Integer disclosureId) {
		Timestamp timeStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET d.certificationText = :certificationText, ");
        hqlQuery.append("d.certifiedBy = :certifiedBy, d.certifiedAt = :certifiedAt, ");
        hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, d.updateTimeStamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        query.setParameter("certificationText", null);
        query.setParameter("certifiedBy", null);
        query.setParameter("certifiedAt", null);
        query.setParameter("reviewStatusCode", dislcosureStatusCode);
        query.setParameter("updateTimestamp", timeStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timeStamp;
	}

	@Override
	public Timestamp assignAdminConsultingDisclosure(ConsultDisclAssignAdminDto consultDisclAssignAdminDto) {
		Timestamp timeStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET d.adminGroupId = :adminGroupId, ");
        hqlQuery.append("d.adminPersonId = :adminPersonId, d.updateTimeStamp = :updateTimestamp, ");
		hqlQuery.append(consultDisclAssignAdminDto.getDisclosureStatus() != null ? "d.reviewStatusCode = :reviewStatusCode, " : "");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",consultDisclAssignAdminDto.getDisclosureId());
        query.setParameter("adminGroupId", consultDisclAssignAdminDto.getAdminGroupId());
        query.setParameter("adminPersonId", consultDisclAssignAdminDto.getAdminPersonId());
        if(consultDisclAssignAdminDto.getDisclosureStatus() != null ) {
        	query.setParameter("reviewStatusCode", consultDisclAssignAdminDto.getDisclosureStatus());
        }
        query.setParameter("updateTimestamp", timeStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timeStamp;
	}

	@Override
	public Timestamp completeConsultingDisclosure(Integer disclosureId) {
		Timestamp timeStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET ");
        hqlQuery.append("d.reviewStatusCode = :reviewStatusCode, d.updateTimeStamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy, d.dispositionStatusCode = :dispositionStatusCode ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        query.setParameter("reviewStatusCode", Constants.CONSULT_DISCL_STATUS_COMPLETED);
        query.setParameter("dispositionStatusCode", Constants.CONSULT_DISCL_DISPOSITION_STATUS_COMPLETED);
        query.setParameter("updateTimestamp", timeStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timeStamp;
	}

	@Override
	public boolean isAdminAssigned(Integer disclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.disclosureId) > 0) then true else false end ");
        hqlQuery.append("FROM ConsultingDisclosure d WHERE d.adminPersonId IS NOT NULL AND  ");
        hqlQuery.append("d.disclosureId = :disclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        Object x = query.getSingleResult();
        return (boolean) query.getSingleResult();
	}

	@Override
	public String getAssignedAdmin(Integer disclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    CriteriaBuilder builder = session.getCriteriaBuilder();
	    CriteriaQuery<String> query = builder.createQuery(String.class);
	    Root<ConsultingDisclosure> root = query.from(ConsultingDisclosure.class);
	    query.select(root.get("adminPersonId")).where(builder.equal(root.get("disclosureId"), disclosureId));
	    return session.createQuery(query).getSingleResult();
	}

	@Override
	public List<ConsultingDisclosure> getActiveAndPendingConsultingDisclosure(String personId) {
		List<ConsultingDisclosure> consultingDisclosures = new ArrayList<>();
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			CriteriaBuilder builder = session.getCriteriaBuilder();
			CriteriaQuery<ConsultingDisclosure> query = builder.createQuery(ConsultingDisclosure.class);
			Root<ConsultingDisclosure> rootDisclosure = query.from(ConsultingDisclosure.class);
			query.where(builder.and(builder.equal(rootDisclosure.get("personId"), personId),
					builder.equal(rootDisclosure.get("dispositionStatusCode"), Constants.CONSULT_DISCL_DISPOSITION_STATUS_COMPLETED)));
			query.orderBy(builder.desc(rootDisclosure.get("updateTimeStamp")));
			List<ConsultingDisclosure> consultingDisclData = session.createQuery(query).getResultList();
			if (consultingDisclData != null && !consultingDisclData.isEmpty()) {
				ConsultingDisclosure consultingDisclosure = consultingDisclData.get(0);
				consultingDisclosure.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(consultingDisclosure.getUpdatedBy()));
				consultingDisclosure.setAdminPersonName(consultingDisclosure.getAdminPersonId() != null ? personDao.getPersonFullNameByPersonId(consultingDisclosure.getAdminPersonId()) : null);
				consultingDisclosure.setAdminGroupName(consultingDisclosure.getAdminGroupId() != null ? commonDao.getAdminGroupByGroupId(consultingDisclosure.getAdminGroupId()).getAdminGroupName() : null);
				consultingDisclosure.setHomeUnitName(commonDao.getUnitName(consultingDisclosure.getHomeUnit()));
				consultingDisclosures.add(consultingDisclosure);
			}
			ConsultingDisclosure consultingDisclosure = getPendingConsultingDisclosure(personId);
			if (consultingDisclosure != null) {
				consultingDisclosure.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(consultingDisclosure.getUpdatedBy()));
				consultingDisclosure.setHomeUnitName(commonDao.getUnitName(consultingDisclosure.getHomeUnit()));
				consultingDisclosures.add(consultingDisclosure);
			}
		} catch (Exception ex) {
			throw new ApplicationException("Unable to fetch Active Disclosure", ex, Constants.JAVA_ERROR);
		}
		return consultingDisclosures;
	}

	private ConsultingDisclosure getPendingConsultingDisclosure(String personId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaQuery<ConsultingDisclosure> query = builder.createQuery(ConsultingDisclosure.class);
		Root<ConsultingDisclosure> rootDisclosure = query.from(ConsultingDisclosure.class);
		query.where(builder.and(builder.equal(rootDisclosure.get("personId"), personId),
				builder.equal(rootDisclosure.get("dispositionStatusCode"), Constants.CONSULT_DISCL_DISPOSITION_STATUS_PENDING)));
		query.orderBy(builder.desc(rootDisclosure.get("updateTimeStamp")));
		List<ConsultingDisclosure> consultingDisclData = session.createQuery(query).getResultList();
		return !consultingDisclData.isEmpty() ? consultingDisclData.get(0) : null;
	}

	@Override
	public Timestamp updateConsultingDisclosureUpDetails(Integer disclosureId, Timestamp timeStamp) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET ");
        hqlQuery.append("d.updateTimeStamp = :updateTimestamp, d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        query.setParameter("updateTimestamp", timeStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timeStamp;
	}

	@Override
	public void updateConsultingDisclosureStatuses(Integer disclosureId, Timestamp timestamp, String reviewStatusCode, String dispositionStatusCode) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET ");
        hqlQuery.append("d.updateTimeStamp = :updateTimestamp, ");
        hqlQuery.append("d.updatedBy = :updatedBy ");
        if (reviewStatusCode != null)
            hqlQuery.append(", d.reviewStatusCode = :reviewStatusCode ");
        if (dispositionStatusCode != null)
            hqlQuery.append(", d.dispositionStatusCode = :dispositionStatusCode ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        if (reviewStatusCode != null)
            query.setParameter("reviewStatusCode", reviewStatusCode);
        if (dispositionStatusCode != null)
            query.setParameter("dispositionStatusCode", dispositionStatusCode);
        query.setParameter("updateTimestamp", timestamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
	}

	@Override
	public ConsultingDisclReviewStatusType getConsultingDisclosureStatusType(String statusTypeCode) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT s FROM  ConsultingDisclReviewStatusType s ");
		hqlQuery.append("WHERE s.reviewStatusCode = :reviewStatusCode");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("reviewStatusCode", statusTypeCode);
		List<ConsultingDisclReviewStatusType> resultData = query.getResultList();
		if (resultData != null && !resultData.isEmpty()) {
			return resultData.get(0);
		}
		return null;
	}

	@Override
	public boolean isSameAdminPersonOrGroupAdded(Integer adminGroupId, String adminPersonId, Integer disclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.disclosureId) > 0) then true else false end ");
		hqlQuery.append("FROM ConsultingDisclosure c WHERE  c.adminPersonId = :adminPersonId ");
		if (adminGroupId != null)
			hqlQuery.append("AND c.adminGroupId = :adminGroupId ") ;
		hqlQuery.append("AND c.disclosureId = : disclosureId");
		Query query = session.createQuery(hqlQuery.toString());
		if (adminGroupId != null)
			query.setParameter("adminGroupId", adminGroupId);
		query.setParameter("adminPersonId", adminPersonId);
		query.setParameter("disclosureId", disclosureId);
		return (boolean)query.getSingleResult();
	}

	@Override
	public boolean isAdminPersonOrGroupAdded(Integer disclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("SELECT case when (count(c.disclosureId) > 0) then false else true end ");
		hqlQuery.append("FROM ConsultingDisclosure c WHERE  c.adminPersonId is null AND c.adminGroupId is null ");
		hqlQuery.append("AND c.disclosureId = : disclosureId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("disclosureId", disclosureId);
		return (boolean)query.getSingleResult();
	}

	@Override
	public boolean isConsultingDisclWithStatuses(List<String> consultingDisclStatuses, String dispositionStatus, Integer disclosureId) {
		StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT case when (count(d.disclosureId) > 0) then true else false end FROM ConsultingDisclosure d WHERE ");
        if (consultingDisclStatuses != null && !consultingDisclStatuses.isEmpty()) {
            hqlQuery.append(" d.reviewStatusCode IN (:reviewStatusCodes) AND ");
        }
        if (dispositionStatus != null)
            hqlQuery.append("d.dispositionStatusCode = :dispositionStatusCode AND ");
        hqlQuery.append("d.disclosureId = :disclosureId ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId",disclosureId);
        if (consultingDisclStatuses != null && !consultingDisclStatuses.isEmpty()) {
            query.setParameter("reviewStatusCodes", consultingDisclStatuses);
        }
        if (dispositionStatus != null)
            query.setParameter("dispositionStatusCode", dispositionStatus);
        return (boolean) query.getSingleResult();
	}

	@Override
	public ConsultingDisclosure getConsultingDisclosure(Integer disclosureId) {
		return hibernateTemplate.get(ConsultingDisclosure.class, disclosureId);
	}

	@Override
	public ConsultingDisclFormBuilderDetails saveOrUpdateConsultDisclFormBuilderDetails(ConsultingDisclFormBuilderDetails consultingDisclFormBuilderDetails) {
		hibernateTemplate.saveOrUpdate(consultingDisclFormBuilderDetails);
		return consultingDisclFormBuilderDetails;
	}

	@Override
	public List<ConsultingDisclFormBuilderDetails> getConsultDisclFormBuilderDetailsByDisclosureId(Integer disclosureId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
	    CriteriaBuilder builder = session.getCriteriaBuilder();
	    CriteriaQuery<ConsultingDisclFormBuilderDetails> query = builder.createQuery(ConsultingDisclFormBuilderDetails.class);
	    Root<ConsultingDisclFormBuilderDetails> root = query.from(ConsultingDisclFormBuilderDetails.class);
	    query.select(root).where(builder.equal(root.get("disclosureId"), disclosureId));
	    return session.createQuery(query).getResultList();
	}

	@Override
	public Timestamp saveEntityDetails(Integer entityId, Integer disclosureId, Integer entityNumber, Integer personEntityNumber) {
		Timestamp timeStamp = commonDao.getCurrentTimestamp();
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("UPDATE ConsultingDisclosure d SET d.entityId = :entityId, d.entityNumber = :entityNumber, d.personEntityNumber = :personEntityNumber, "); 
        hqlQuery.append("d.updateTimeStamp = :updateTimestamp, d.updatedBy = :updatedBy ");
        hqlQuery.append("WHERE d.disclosureId = :disclosureId");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("disclosureId", disclosureId);
        query.setParameter("entityId", entityId);
        query.setParameter("personEntityNumber", personEntityNumber);
        query.setParameter("entityNumber", entityNumber);
        query.setParameter("updateTimestamp", timeStamp);
        query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
        query.executeUpdate();
        return timeStamp;
	}

}
