package com.polus.fibicomp.coi.notification.log.dao;

import com.polus.fibicomp.coi.dto.NotificationDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLogRecipient;

import java.util.List;

@Transactional
@Service
public interface CoiNotificationLogDao {

	public CoiNotificationLog createCoiNotificationLog(CoiNotificationLog notificationLog);

	public void createCoiNotificationLogRecipient(CoiNotificationLogRecipient notificationLogRecipient);

    /**
     * Fetch Notification Log
     * @param request
     * @return
     */
    List<CoiNotificationLog> fetchNotificationHistory(NotificationDto request);
}
