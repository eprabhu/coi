package com.polus.fibicomp.coi.notification.log.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.core.common.dao.CommonDao;
import com.polus.core.notification.email.dao.EmailMaintenanceDao;
import com.polus.core.notification.pojo.NotificationRecipient;
import com.polus.core.notification.pojo.NotificationType;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.person.pojo.Person;
import com.polus.fibicomp.coi.dto.NotificationDto;
import com.polus.fibicomp.coi.notification.log.dao.CoiNotificationLogDao;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLogRecipient;
import com.polus.fibicomp.coi.notification.log.vo.CoiNotificationLogService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Transactional
@Service(value = "coiNotificationLogService")
public class CoiNotificationLogServiceImpl implements CoiNotificationLogService {

	@Autowired
	private CoiNotificationLogDao coiNotificationLogDao;

	@Autowired
	private CommonDao commonDao;

	@Autowired
	private EmailMaintenanceDao emailMaintenanceDao;

	@Autowired
	private PersonDao personDao;

	@Override
	public void logCoiNotificationLog(NotificationDto notificationDto) {
		try {
			prepareNotificationLogRecipients(notificationDto);

			CoiNotificationLog notificationLog = new CoiNotificationLog();
			notificationLog.setModuleItemKey(String.valueOf(notificationDto.getModuleItemKey()));
			notificationLog.setModuleSubItemKey(String.valueOf(notificationDto.getSubModuleItemKey()));
			notificationLog.setModuleCode(notificationDto.getModuleCode());

			notificationLog.setNotificationTypeId(notificationDto.getNotificationTypeId() != null
					? Integer.valueOf(notificationDto.getNotificationTypeId())  : null);

			notificationLog.setSendDate(commonDao.getCurrentTimestamp());
			notificationLog.setMessage(notificationDto.getMessage());
			notificationLog.setSubject(notificationDto.getSubject());
			notificationLog.setMessageId(notificationDto.getMessageId());
			notificationLog.setRequestedBy(notificationDto.getPublishedUserId());
			notificationLog.setActionType(notificationDto.getActionType());

			notificationLog = coiNotificationLogDao.createCoiNotificationLog(notificationLog);
			log.info("Saved COI Notification Log with ID: {}", notificationLog.getNotificationLogId());

			if (notificationDto.getRecipients() != null && !notificationDto.getRecipients().isEmpty()) {
				for (NotificationRecipient recipient : notificationDto.getRecipients()) {
					CoiNotificationLogRecipient notificationLogRecipient = new CoiNotificationLogRecipient();
					notificationLogRecipient.setNotificationLogId(notificationLog.getNotificationLogId());
					notificationLogRecipient.setNotificationLog(notificationLog);
					if (recipient.getEmailAddress() == null || recipient.getEmailAddress().isEmpty()) {
						Person person = personDao.getPersonPrimaryInformation(recipient.getRecipientPersonId());
						notificationLogRecipient.setRecipientEmailId(person.getEmailAddress());
					} else {
						notificationLogRecipient.setRecipientEmailId(recipient.getEmailAddress());
					}
					notificationLogRecipient.setRecipientPersonId(recipient.getRecipientPersonId());
					notificationLogRecipient.setRoleTypeCode(recipient.getRoleTypeCode());

					coiNotificationLogDao.createCoiNotificationLogRecipient(notificationLogRecipient);
				}
			} else {
				log.warn("No recipients found for notification with ID: {}", notificationLog.getNotificationLogId());
			}
		} catch (Exception e) {
			log.error("Error while logging COI notification: {}", e.getMessage(), e);
		}
	}

	public void prepareNotificationLogRecipients(NotificationDto notificationDto) {
		String notificationTypeId = notificationDto.getNotificationTypeId();
		if (notificationTypeId != null) {
			NotificationType notificationType = emailMaintenanceDao.fetchNotificationById(Integer.valueOf(notificationTypeId));
			List<NotificationRecipient> recipients = notificationType.getNotificationRecipient();
			if (recipients != null && !recipients.isEmpty()) {
				notificationDto.getRecipients().addAll(notificationType.getNotificationRecipient());
			}
		}
	}

    @Override
    public List<CoiNotificationLog> fetchNotificationHistory(NotificationDto request) {
        try {
            List<CoiNotificationLog> notificationLogs = coiNotificationLogDao.fetchNotificationHistory(request);

            if (notificationLogs != null && !notificationLogs.isEmpty()) {
                for (CoiNotificationLog notificationLog : notificationLogs) {
                    if (notificationLog.getRequestedBy() != null) {
                        Person person = personDao.getPersonPrimaryInformation(notificationLog.getRequestedBy());
                        if (person != null) {
                            notificationLog.setFromUserFullName(person.getFullName());
                        }
                    }
                    List<CoiNotificationLogRecipient> logRecipients = notificationLog.getNotificationLogRecipients();
                    if (logRecipients != null && !logRecipients.isEmpty()) {
                        for (CoiNotificationLogRecipient logRecipient : logRecipients) {
                            if (logRecipient.getRecipientPersonId() != null) {
                                Person recipient = personDao.getPersonPrimaryInformation(logRecipient.getRecipientPersonId());
                                if (recipient != null) {
                                    logRecipient.setRecipientFullName(recipient.getFullName());
                                }
                            }
                        }
                    }
                }
            }
            return notificationLogs;
        } catch (Exception ex) {
            log.error("Error retrieving notification logs for request: {}", request, ex);
            throw new RuntimeException("Unable to fetch notification logs. Please try again later.", ex);
        }
    }

}
