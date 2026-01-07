package com.polus.integration.entity.cleansematch.controller;

import com.polus.integration.entity.cleansematch.service.BulkCleanseMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("cleansematch/bulk")
public class BulkCleanseMatchController {

    @Autowired
    private final BulkCleanseMatchService bulkCleanseMatchService;

    BulkCleanseMatchController(BulkCleanseMatchService bulkCleanseMatchService) {
        this.bulkCleanseMatchService = bulkCleanseMatchService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return new ResponseEntity<String>("Hello from cleansematch/bulk", HttpStatus.OK);
    }

    @GetMapping("/start")
    public ResponseEntity<String> startBulkCleanseMatch(@RequestParam(name = "batchId") String batchId) {
        bulkCleanseMatchService.startBulkCleanseMatch(batchId);
        return new ResponseEntity<String>("Processing started", HttpStatus.OK);
    }

    @GetMapping("/reRun")
    public ResponseEntity<String> startCustomCleanseMatch(@RequestParam Map<String, String> filters) {
        bulkCleanseMatchService.patchProcess(filters);
        return new ResponseEntity<String>("Processing started", HttpStatus.OK);
    }

    @GetMapping("/processError")
    public ResponseEntity<String> processError(@RequestParam String errorCode, @RequestParam String matchBy,@RequestParam(name = "batchId", defaultValue = "1") String batchId) {

        String[] matchParams = matchBy.split(",");
        Map<String, String> filters = new HashMap<>();
        filters.put("errorCode", errorCode);
        filters.put("batchId", batchId);
        bulkCleanseMatchService.processError(filters, matchParams);
        return new ResponseEntity<String>("Processing started", HttpStatus.OK);
    }

    @GetMapping("/status")
    public ResponseEntity<String> getBulkCleanseMatchStatus() {
        String status = bulkCleanseMatchService.getProcessStatus();
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    @GetMapping("/stopBulkCleanseMatch")
    public ResponseEntity<String> stopBulkCleanseMatch() {
        bulkCleanseMatchService.stopBulkCleanseMatch();
        return new ResponseEntity<String>("Processing stopped", HttpStatus.OK);
    }
}
