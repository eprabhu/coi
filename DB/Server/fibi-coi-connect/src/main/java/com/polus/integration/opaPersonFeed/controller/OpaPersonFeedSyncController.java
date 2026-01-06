package com.polus.integration.opaPersonFeed.controller;

import com.polus.integration.opaPersonFeed.services.OpaPersonFeedService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/opaPerson")
@AllArgsConstructor
@Log4j2
public class OpaPersonFeedSyncController {

    private final OpaPersonFeedService opaPersonFeedService;

    @GetMapping("/start")
    private void startOpaPersonFeed() {
        log.info("Request for OpaPersonFeedSyncController started.....");
        CompletableFuture.runAsync(() -> opaPersonFeedService.startFeedOpaPersons());
        log.info("Request for OpaPersonFeedSyncController ended.....");
    }
}
