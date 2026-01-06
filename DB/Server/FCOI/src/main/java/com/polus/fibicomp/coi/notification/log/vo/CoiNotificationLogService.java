package com.polus.fibicomp.coi.notification.log.vo;

import com.polus.fibicomp.coi.notification.log.pojo.CoiNotificationLog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.polus.fibicomp.coi.dto.NotificationDto;

import java.util.List;

@Transactional
@Service(value = "coiNotificationLogService")
public interface CoiNotificationLogService {

	public void logCoiNotificationLog(NotificationDto notificationDto);

    /**
     * Fetch Notification History
     * @param request
     * @return
     */
    List<CoiNotificationLog> fetchNotificationHistory(NotificationDto request);

}
