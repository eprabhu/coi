package com.polus.integration.entity.dunsRefresh.controller;

import com.polus.integration.entity.dunsRefresh.processes.MonitoringFileProcess;
import com.polus.integration.entity.dunsRefresh.services.EntityRefreshService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RequestMapping("/dunsRefresh")
@RestController
@Log4j2
public class DunsRefreshController {

    @Autowired
    private EntityRefreshService entityRefreshService;

    @Autowired
    private MonitoringFileProcess monitoringFileProcess;

    @GetMapping("/register/dunsMonitoring/{dunsNumber}")
    public void registerDunsMonitoring(@PathVariable("dunsNumber") String dunsNumber) {
        log.info("Request for registerDunsMonitoring | duns : {}", dunsNumber);
        entityRefreshService.registerDunsMonitoring(dunsNumber);
    }

    @GetMapping("/start")
    public void startRefreshing() throws IOException {
        monitoringFileProcess.processFiles();
    }
}
