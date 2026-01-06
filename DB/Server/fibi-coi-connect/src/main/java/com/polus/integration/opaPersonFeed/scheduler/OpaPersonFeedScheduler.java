package com.polus.integration.opaPersonFeed.scheduler;

import com.polus.integration.opaPersonFeed.services.OpaPersonFeedService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Log4j2
@Component
@ConditionalOnProperty(name = "schedule.cron.opa.personFeed.enabled", havingValue = "true")
public class OpaPersonFeedScheduler {

    @Autowired
    private OpaPersonFeedService opaPersonFeedService;

    @Scheduled(cron = "${schedule.cron.opa.personFeed}")
    public void startFeedOpaPersons() throws IOException {
        log.info("Opa Person Feed started and is in progress.");
        opaPersonFeedService.startFeedOpaPersons();
        log.info("Opa Person Feed completed");
    }
}
