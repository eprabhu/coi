package com.polus.integration.feedentity.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.polus.integration.feedentity.service.EntityOutboundIntegrationService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@ConditionalOnProperty(name = "schedule.cron.entity.feed.enabled", havingValue = "true")
public class EntityIntegrationScheduler {

	@Autowired
	private EntityOutboundIntegrationService integrationService;

	@Scheduled(cron = "${schedule.cron.entity.feed}")
	public void scheduleTask() {
		try {
			log.info("Scheduler started - Setting up header token and calling getEntityDetails");

			integrationService.getEntityDetails(null);

			log.info("Scheduler completed successfully");

		} catch (Exception e) {
			log.error("Exception occurred while executing scheduled task", e);
		}
	}
}
