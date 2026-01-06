package com.polus.fibicomp.globalentity.dao;

import static java.util.Map.entry;

import java.util.Map;
import java.util.StringJoiner;

import javax.persistence.EntityNotFoundException;
import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.persistence.TypedQuery;

import com.polus.fibicomp.globalentity.pojo.EntitySponsorInfo;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.SubAwardOrgField;
import com.polus.fibicomp.globalentity.dto.SubAwdOrgRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntitySubOrgInfo;

import lombok.extern.slf4j.Slf4j;

@Repository
@Transactional
@Slf4j
public class SubAwdOrgDAOImpl implements SubAwdOrgDAO {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	private static final Map<SubAwardOrgField, String> FIELD_MAPPINGS = Map.ofEntries(
			entry(SubAwardOrgField.organizationId, "organizationId"),
			entry(SubAwardOrgField.organizationTypeCode, "organizationTypeCode"),
			entry(SubAwardOrgField.samExpirationDate, "samExpirationDate"),
			entry(SubAwardOrgField.subAwdRiskAssmtDate, "subAwdRiskAssmtDate"),
			entry(SubAwardOrgField.feedStatusCode, "feedStatusCode"),
			entry(SubAwardOrgField.organizationName, "organizationName"),
			entry(SubAwardOrgField.dunsNumber, "dunsNumber"),
			entry(SubAwardOrgField.ueiNumber, "ueiNumber"),
			entry(SubAwardOrgField.cageNumber, "cageNumber"),
			entry(SubAwardOrgField.primaryAddressLine1, "primaryAddressLine1"),
			entry(SubAwardOrgField.primaryAddressLine2, "primaryAddressLine2"),
			entry(SubAwardOrgField.city, "city"),
			entry(SubAwardOrgField.state, "state"),
			entry(SubAwardOrgField.postCode, "postCode"),
			entry(SubAwardOrgField.countryCode, "countryCode"),
			entry(SubAwardOrgField.emailAddress, "emailAddress"),
			entry(SubAwardOrgField.phoneNumber, "phoneNumber"),
			entry(SubAwardOrgField.humanSubAssurance, "humanSubAssurance"),
			entry(SubAwardOrgField.animalWelfareAssurance, "animalWelfareAssurance"),
			entry(SubAwardOrgField.animalAccreditation, "animalAccreditation"),
			entry(SubAwardOrgField.congressionalDistrict, "congressionalDistrict"),
			entry(SubAwardOrgField.incorporatedIn, "incorporatedIn"),
			entry(SubAwardOrgField.incorporatedDate, "incorporatedDate"),
			entry(SubAwardOrgField.numberOfEmployees, "numberOfEmployees"),
			entry(SubAwardOrgField.federalEmployerId, "federalEmployerId"),
			entry(SubAwardOrgField.isCopy, "isCopy"),
			entry(SubAwardOrgField.rolodexId, "rolodexId"),
			entry(SubAwardOrgField.isCreatedFromImportEntity, "isCreatedFromImportEntity"));

	@Override
	public Integer saveDetails(EntitySubOrgInfo entity) {
		hibernateTemplate.saveOrUpdate(entity);
		return entity.getId();
	}

	@Override
	public void updateDetails(SubAwdOrgRequestDTO dto) {
		Map<SubAwardOrgField, Object> subAwardOrgFields = dto.getSubAwardOrgFields();

		if (subAwardOrgFields == null || subAwardOrgFields.isEmpty()) {
			log.info("subAwardOrgFields map is null or empty.");
			return;
		}

		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();

		StringBuilder hqlQuery = new StringBuilder("UPDATE EntitySubOrgInfo e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		StringJoiner updates = new StringJoiner(", ");

		subAwardOrgFields.forEach((field, value) -> {
			String fieldName = FIELD_MAPPINGS.get(field);
			if (fieldName != null) {
				updates.add("e." + fieldName + " = :" + fieldName);
			} else {
				throw new IllegalArgumentException("Unknown field: " + field);
			}
		});

		hqlQuery.append(", ").append(updates.toString());
		hqlQuery.append(" WHERE e.entityId = :entityId");

		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", dto.getEntityId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());

		subAwardOrgFields.forEach((field, value) -> {
			if (field.equals(SubAwardOrgField.samExpirationDate)) {
				query.setParameter(FIELD_MAPPINGS.get(field), dto.getDateFromMap(field));
			} else if (field.equals(SubAwardOrgField.subAwdRiskAssmtDate)) {
				query.setParameter(FIELD_MAPPINGS.get(field), dto.getDateFromMap(field));
			} else {
				query.setParameter(FIELD_MAPPINGS.get(field), value);
			}
		});

		int updatedRows = query.executeUpdate();
		if (updatedRows == 0) {
			throw new EntityNotFoundException("Entity with ID " + dto.getEntityId() + " not found.");
		}
	}


	@Override
	public EntitySubOrgInfo findByEntityId(Integer entityId) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			StringBuilder hqlQuery = new StringBuilder("SELECT e FROM EntitySubOrgInfo e WHERE  e.entityId = :entityId");
			TypedQuery<EntitySubOrgInfo> query = session.createQuery(hqlQuery.toString());
			query.setParameter("entityId", entityId);
			return query.getSingleResult();
		}catch (NoResultException e) {
			log.warn("No data found exception on findByEntityId {}", e.getMessage());
			return null;
		}
	}

	@Override
	public boolean isOrgFromImportEntity(Integer entityId) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		StringBuilder hqlQuery = new StringBuilder("SELECT case when (count(e.id) > 0) then true else false end ")
				.append("FROM EntitySubOrgInfo e WHERE  e.entityId = :entityId AND e.isCreatedFromImportEntity = :isCreatedFromImportEntity");
		TypedQuery<Boolean> query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", entityId);
		query.setParameter("isCreatedFromImportEntity", Boolean.TRUE);
		return query.getSingleResult();
	}

}
