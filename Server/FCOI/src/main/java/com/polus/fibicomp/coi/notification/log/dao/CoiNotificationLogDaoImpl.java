package com.polus.fibicomp.coi.notification.log.dao;

import com.polus.fibicomp.coi.dto.NotificationDto;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLogRecipient;

import javax.persistence.Query;
import java.util.List;

@Transactional
@Service(value = "coiNotificationLogDao")
public class CoiNotificationLogDaoImpl implements CoiNotificationLogDao {

	@Autowired
	private HibernateTemplate hibernateTemplate;

	@Override
	public CoiNotificationLog createCoiNotificationLog(CoiNotificationLog notificationLog) {
		hibernateTemplate.saveOrUpdate(notificationLog);
		return notificationLog;
	}

	@Override
	public void createCoiNotificationLogRecipient(CoiNotificationLogRecipient notificationLogRecipient) {
		hibernateTemplate.saveOrUpdate(notificationLogRecipient);
	}

    @Override
    public List<CoiNotificationLog> fetchNotificationHistory(NotificationDto request) {
        StringBuilder hqlQuery = new StringBuilder();
        Session session = hibernateTemplate.getSessionFactory().getCurrentSession();
        hqlQuery.append("SELECT n  ");
        hqlQuery.append("FROM CoiNotificationLog n WHERE n.actionType = :actionType ");
        hqlQuery.append("AND n.moduleCode = :moduleCode ");
        if (request.getModuleItemKey() != null) {

            hqlQuery.append("AND n.moduleItemKey = :moduleItemKey ");
        }
        if (request.getSubModuleItemKey() != null) {
            hqlQuery.append("AND n.moduleSubItemKey = :moduleSubItemKey ");
        }
        if (request.getSubModuleCode() != null) {
            hqlQuery.append("AND n.subModuleCode = :subModuleCode ");
        }
        hqlQuery.append("ORDER BY n.notificationLogId DESC ");
        Query query = session.createQuery(hqlQuery.toString());
        query.setParameter("actionType", request.getActionType());
        query.setParameter("moduleCode", request.getModuleCode());
        if (request.getModuleItemKey() != null) {
            query.setParameter("moduleItemKey", request.getModuleItemKey());
        }
        if (request.getSubModuleItemKey() != null) {
            query.setParameter("moduleSubItemKey", request.getSubModuleItemKey().toString());
        }
        if (request.getSubModuleCode() != null) {
            query.setParameter("subModuleCode", request.getSubModuleCode());
        }
        return query.getResultList();
    }


}
