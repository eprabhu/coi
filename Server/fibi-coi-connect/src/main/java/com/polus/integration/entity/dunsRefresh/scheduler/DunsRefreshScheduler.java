package com.polus.integration.entity.dunsRefresh.scheduler;

import com.polus.integration.entity.dunsRefresh.processes.MonitoringFileProcess;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Log4j2
@Component
@ConditionalOnProperty(name = "schedule.cron.duns.monitoring.enabled", havingValue = "true")
public class DunsRefreshScheduler {

    @Autowired
    private MonitoringFileProcess monitoringFileProcess;

    @Scheduled(cron = "${schedule.cron.duns.monitoring}")
    public void startMonitoring() throws IOException {
        log.error("DUNS refresh scheduler started: Monitoring file process | in progress.");
        monitoringFileProcess.processFiles();
        log.error("DUNS refresh scheduler: Monitoring file process | completed");
    }
}
