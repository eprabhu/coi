package com.polus.fibicomp.globalentity.dao;

import javax.persistence.EntityNotFoundException;
import javax.persistence.Query;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.fibicomp.globalentity.dto.ComplianceRequestDTO;
import com.polus.fibicomp.globalentity.pojo.EntityComplianceInfo;

@Repository
@Transactional
public class EntityComplianceDaoImpl implements EntityComplianceDao {

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Override
    public int saveComplianceInfo(EntityComplianceInfo complianceInfo) {
        try {
            hibernateTemplate.save(complianceInfo);
            return complianceInfo.getId();
        } catch (Exception e) {
            throw new RuntimeException("Database error occurred", e);
        }
    }

	@Override
	public void updateComplianceInfo(ComplianceRequestDTO dto) {
		try {
			Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
			StringBuilder hqlQuery = new StringBuilder("UPDATE EntityComplianceInfo e SET e.updatedBy = :updatedBy, e.updateTimestamp = :updateTimestamp");

			if (dto.getEntityTypeCode() != null) {
				hqlQuery.append(", e.entityTypeCode = :entityTypeCode");
			}

			hqlQuery.append(" WHERE e.id = :id");

			Query query = session.createQuery(hqlQuery.toString());
			query.setParameter("id", dto.getId());
			query.setParameter("updatedBy", AuthenticatedUser.getLoginPersonId());
			query.setParameter("updateTimestamp", commonDao.getCurrentTimestamp());

			if (dto.getEntityTypeCode() != null) {
				query.setParameter("entityTypeCode", dto.getEntityTypeCode());
			}

			int updatedRows = query.executeUpdate();
			if (updatedRows == 0) {
				throw new RuntimeException("No record found with the given ID: " + dto.getId());
			}

		} catch (Exception e) {
			throw new RuntimeException("Database error occurred while updating compliance info", e);
		}
	}

	@Override
	public void deleteComplianceInfoById(Integer id) {
		EntityComplianceInfo entity = hibernateTemplate.get(EntityComplianceInfo.class, id);

		if (entity != null) {
			hibernateTemplate.delete(entity);
		} else {
			throw new EntityNotFoundException("No compliance info found for ID: " + id);
		}
	}

}
