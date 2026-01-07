package com.polus.fibicomp.coi.clients;

import com.polus.fibicomp.coi.clients.model.EmailNotificationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient("FIBI-NOTIFICATION-SERVICE")
public interface NotificationServiceClients {

    @PostMapping("/previewMail")
    EmailNotificationDto previewEmail(@RequestBody EmailNotificationDto emailDto);

}
