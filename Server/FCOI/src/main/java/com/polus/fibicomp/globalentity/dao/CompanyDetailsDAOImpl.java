package com.polus.fibicomp.globalentity.dao;

import static java.util.Map.entry;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.persistence.EntityNotFoundException;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaDelete;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.AddressDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.IndustryDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestDTO;
import com.polus.fibicomp.globalentity.dto.OtherDetailsRequestField;
import com.polus.fibicomp.globalentity.dto.RegistrationDetailsRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityForeignName;
import com.polus.fibicomp.globalentity.pojo.EntityIndustryClassification;
import com.polus.fibicomp.globalentity.pojo.EntityMailingAddress;
import com.polus.fibicomp.globalentity.pojo.EntityPriorName;
import com.polus.fibicomp.globalentity.pojo.EntityRegistration;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryCode;
import com.polus.fibicomp.globalentity.pojo.IndustryCategoryType;

import lombok.extern.slf4j.Slf4j;

@Repository
@Transactional
@Slf4j
public class CompanyDetailsDAOImpl implements CompanyDetailsDAO {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	private static final Map<OtherDetailsRequestField, String> FIELD_MAPPINGS = Map.ofEntries(
			entry(OtherDetailsRequestField.startDate, "startDate"),
			entry(OtherDetailsRequestField.incorporationDate, "incorporationDate"),
			entry(OtherDetailsRequestField.incorporatedIn, "incorporatedIn"),
			entry(OtherDetailsRequestField.congressionalDistrict, "congressionalDistrict"),
			entry(OtherDetailsRequestField.currencyCode, "currencyCode"),
			entry(OtherDetailsRequestField.shortName, "shortName"),
			entry(OtherDetailsRequestField.businessTypeCode, "businessTypeCode"),
			entry(OtherDetailsRequestField.activityText, "activityText"),
			entry(OtherDetailsRequestField.federalEmployerId, "federalEmployerId"),
			entry(OtherDetailsRequestField.numberOfEmployees, "numberOfEmployees"));

	@Override
	public int saveIndustryDetails(EntityIndustryClassification entity) {
		hibernateTemplate.save(entity);
		return entity.getEntityIndustryClassId();
	}

	@Override
	public void updateIndustryDetails(IndustryDetailsRequestDTO dto) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append(
				"UPDATE EntityIndustryClassification e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		hqlQuery.append(", e.industryCategoryId = :industryCategoryId");
		hqlQuery.append(" WHERE e.entityIndustryClassId = :entityIndustryClassId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityIndustryClassId", dto.getEntityIndustryClassId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		query.setParameter("industryCategoryId", dto.getEntityIndustryCatId());
		query.executeUpdate();
	}

	@Override
	public int saveRegistrationDetails(EntityRegistration entity) {
		hibernateTemplate.save(entity);
		return entity.getEntityRegistrationId();
	}

	@Override
	public void updateRegistrationDetails(RegistrationDetailsRequestDTO dto) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append(
				"UPDATE EntityRegistration e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		if (dto.getRegTypeCode() != null) {
			hqlQuery.append(", e.regTypeCode = :regTypeCode");
		}
		if (dto.getRegNumber() != null) {
			hqlQuery.append(", e.regNumber = :regNumber");
		}
		if (dto.getIsActive() != null) {
			hqlQuery.append(", e.isActive = :isActive");
		}
		hqlQuery.append(" WHERE e.entityRegistrationId = :entityRegistrationId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityRegistrationId", dto.getEntityRegistrationId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		if (dto.getRegTypeCode() != null) {
			query.setParameter("regTypeCode", dto.getRegTypeCode());
		}
		if (dto.getRegNumber() != null) {
			query.setParameter("regNumber", dto.getRegNumber());
		}
		if (dto.getIsActive() != null) {
			query.setParameter("isActive", dto.getIsActive());
		}
		query.executeUpdate();
	}

	@Override
	public int saveAdditionalAddresses(EntityMailingAddress entity) {
		hibernateTemplate.save(entity);
		return entity.getEntityMailingAddressId();
	}

	@Override
	public void updateAdditionalAddresses(AddressDetailsRequestDTO dto) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append(
				"UPDATE EntityMailingAddress e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		if (dto.getAddressTypeCode() != null) {
			hqlQuery.append(", e.addressTypeCode = :addressTypeCode");
		}
		if (dto.getAddressLine1() != null) {
			hqlQuery.append(", e.addressLine1 = :addressLine1");
		}
		if (dto.getAddressLine2() != null) {
			hqlQuery.append(", e.addressLine2 = :addressLine2");
		}
		if (dto.getCity() != null) {
			hqlQuery.append(", e.city = :city");
		}
		if (dto.getState() != null) {
			hqlQuery.append(", e.state = :state");
		}
		if (dto.getPostCode() != null) {
			hqlQuery.append(", e.postCode = :postCode");
		}
		if (dto.getCountryCode() != null) {
			hqlQuery.append(", e.countryCode = :countryCode");
		}
		if (dto.getLocality() != null) {
			hqlQuery.append(", e.locality = :locality");
		}
		if (dto.getRegion() != null) {
			hqlQuery.append(", e.region = :region");
		}
		if (dto.getCounty() != null) {
			hqlQuery.append(", e.county = :county");
		}if (dto.getIsCopy() != null) {
			hqlQuery.append(", e.isCopy = :isCopy");
		}
		hqlQuery.append(" WHERE e.entityMailingAddressId = :entityMailingAddressId");
		Query query = session.createQuery(hqlQuery.toString());
		if (dto.getAddressTypeCode() != null) {
			query.setParameter("addressTypeCode", dto.getAddressTypeCode());
		}
		if (dto.getAddressLine1() != null) {
			query.setParameter("addressLine1", dto.getAddressLine1());
		}
		if (dto.getAddressLine2() != null) {
			query.setParameter("addressLine2", dto.getAddressLine2());
		}
		if (dto.getCity() != null) {
			query.setParameter("city", dto.getCity());
		}
		if (dto.getState() != null) {
			query.setParameter("state", dto.getState());
		}
		if (dto.getPostCode() != null) {
			query.setParameter("postCode", dto.getPostCode());
		}
		if (dto.getCountryCode() != null) {
			query.setParameter("countryCode", dto.getCountryCode());
		}
		if (dto.getLocality() != null) {
			query.setParameter("locality", dto.getLocality());
		}
		if (dto.getRegion() != null) {
			query.setParameter("region", dto.getRegion());
		}
		if (dto.getCounty() != null) {
			query.setParameter("county", dto.getCounty());
		}
		if (dto.getIsCopy() != null) {
			query.setParameter("isCopy", dto.getIsCopy());
		}
		query.setParameter("entityMailingAddressId", dto.getEntityMailingAddressId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		query.executeUpdate();
	}

	@Override
	public void updateOtherDetails(OtherDetailsRequestDTO dto) {
		Map<OtherDetailsRequestField, Object> otherDetailsRequestFields = dto.getOtherDetailsRequestFields();

		if (otherDetailsRequestFields == null || otherDetailsRequestFields.isEmpty()) {
			log.info("otherDetailsRequestFields map is null or empty.");
			return;
		}

		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();

		StringBuilder hqlQuery = new StringBuilder("UPDATE Entity e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		StringJoiner updates = new StringJoiner(", ");

		otherDetailsRequestFields.forEach((field, value) -> {
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

		otherDetailsRequestFields.forEach((field, value) -> {
			query.setParameter(FIELD_MAPPINGS.get(field), value);
		});

		int updatedRows = query.executeUpdate();
		if (updatedRows == 0) {
			throw new EntityNotFoundException("Entity with ID " + dto.getEntityId() + " not found.");
		}
	}

	@Override
	public int savePriorName(EntityPriorName entity) {
		hibernateTemplate.save(entity);
		return entity.getId();
	}

	@Override
	public int saveForeignName(EntityForeignName entity) {
		hibernateTemplate.save(entity);
		return entity.getEntityId();
	}

	@Override
	public void deleteIndustryDetailsByCatCode(String industryCatCode) {
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		CriteriaBuilder builder = session.getCriteriaBuilder();
		CriteriaDelete<EntityIndustryClassification> deleteQuery = builder.createCriteriaDelete(EntityIndustryClassification.class);
		Root<EntityIndustryClassification> root = deleteQuery.from(EntityIndustryClassification.class);
		Subquery<Long> subquery = deleteQuery.subquery(Long.class);
		Root<IndustryCategoryCode> subqueryRoot = subquery.from(IndustryCategoryCode.class);
		subquery.select(subqueryRoot.get("industryCategoryId"))
		    .where(builder.equal(subqueryRoot.get("industryCategoryCode"), industryCatCode));
		deleteQuery.where(root.get("industryCategoryId").in(subquery));
		session.createQuery(deleteQuery).executeUpdate();
	}

	@Override
	public void removeCurrentPrimaryCatId(Integer entityId) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE EntityIndustryClassification e ").append("SET e.isPrimary = 'N', ")
				.append("e.updatedBy = :updatedBy, ").append("e.updateTimestamp = :updateTimestamp ")
				.append("WHERE e.entityId = :entityId AND e.isPrimary = 'Y'");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", entityId);
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		query.executeUpdate();
	}

	@Override
	public void setNewPrimaryCatId(Integer entityId, Integer primaryCatId) {
		StringBuilder hqlQuery = new StringBuilder();
		hqlQuery.append("UPDATE EntityIndustryClassification e ")
		        .append("SET e.isPrimary = 'Y', ")
		        .append("e.updatedBy = :updatedBy, ")
		        .append("e.updateTimestamp = :updateTimestamp ")
		        .append("WHERE e.entityId = :entityId ")
		        .append("AND e.industryCategoryId = :primaryCatId");
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityId", entityId);
		query.setParameter("primaryCatId", primaryCatId);
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		query.executeUpdate();
	}

	@Override
	public List<IndustryCategoryType> fetchIndustryCategoryTypeBySource(String source) {
		return hibernateTemplate.execute(session -> {
			CriteriaBuilder cb = session.getCriteriaBuilder();
			CriteriaQuery<IndustryCategoryType> query = cb.createQuery(IndustryCategoryType.class);
			Root<IndustryCategoryType> root = query.from(IndustryCategoryType.class);

			if (source == null || source.trim().isEmpty() || "A".equalsIgnoreCase(source)) {
				query.select(root); // Fetch all records if source is "A" or empty
			} else {
				query.select(root).where(cb.equal(root.get("source"), source));
			}

			return session.createQuery(query).getResultList();
		});
	}

}
