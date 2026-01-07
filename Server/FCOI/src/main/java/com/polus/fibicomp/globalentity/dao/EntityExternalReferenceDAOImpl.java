package com.polus.fibicomp.globalentity.dao;

import javax.persistence.Query;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.ExternalReferenceRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityExternalIdMapping;

@Repository
@Transactional
public class EntityExternalReferenceDAOImpl implements EntityExternalReferenceDAO {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Autowired
	private CommonDao commonDao;

	@Override
	public int saveEntityExternalReference(EntityExternalIdMapping entity) {
		hibernateTemplate.save(entity);
		return entity.getEntityExternalMappingId();
	}

	@Override
	public void updatExternalReference(ExternalReferenceRequestDTO dto) {
		StringBuilder hqlQuery = new StringBuilder();
		Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
		hqlQuery.append("UPDATE EntityExternalIdMapping e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");
		if (dto.getExternalIdTypeCode() != null) {
			hqlQuery.append(", e.externalIdTypeCode = :externalIdTypeCode");
		}
		if (dto.getExternalId() != null) {
			hqlQuery.append(", e.externalId = :externalId");
		}
		if (dto.getDescription() != null) {
			hqlQuery.append(", e.description = :description");
		}
		hqlQuery.append(" WHERE e.entityExternalMappingId = :entityExternalMappingId");
		Query query = session.createQuery(hqlQuery.toString());
		query.setParameter("entityExternalMappingId", dto.getEntityExternalMappingId());
		query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
		query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());
		if (dto.getExternalIdTypeCode() != null) {
			query.setParameter("externalIdTypeCode", dto.getExternalIdTypeCode());
		}
		if (dto.getExternalId() != null) {
			query.setParameter("externalId", dto.getExternalId());
		}
		if (dto.getDescription() != null) {
			query.setParameter("description", dto.getDescription());
		}
		query.executeUpdate();
	}

}
