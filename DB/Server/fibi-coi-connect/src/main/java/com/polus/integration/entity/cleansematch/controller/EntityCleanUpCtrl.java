package com.polus.integration.entity.cleansematch.controller;

import com.polus.integration.entity.cleansematch.dto.EntityCleanUpDto;
import com.polus.integration.entity.cleansematch.dto.EntityCleanupAction;
import com.polus.integration.entity.cleansematch.dto.EntityCleanupBulkUpdateDto;
import com.polus.integration.entity.cleansematch.dto.EntityStageDetailsDto;
import com.polus.integration.entity.cleansematch.service.EntityCleanUpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequestMapping("/entityCleanUp")
@RestController
public class EntityCleanUpCtrl {

    @Autowired
    private EntityCleanUpService entityCleanService;

    @PostMapping("/fetchBatches")
    public ResponseEntity<Object> getEntityCleanUpBatches(@RequestBody EntityCleanUpDto entityCleanUpDto) {
        log.info("Request for /fetchBatches getEntityCleanUpBatches");
        return entityCleanService.getEntityCleanUpBatches(entityCleanUpDto);
    }

    @PostMapping("/batchDetails")
    public ResponseEntity<Object> getEntityCleanUpBatchDetails(@RequestBody EntityCleanUpDto entityCleanUpDto) {
        log.info("Request for /batchDetails getEntityCleanUpBatchDetails");
        return entityCleanService.getEntityCleanUpBatchDetails(entityCleanUpDto);
    }

    @GetMapping("/entityDetail/{entityStageDetailId}")
    public ResponseEntity<Object> getEntityCleanUpEntityDetail(@PathVariable("entityStageDetailId") Integer entityStageDetailId) {
        log.info("Request for /entityDetail getEntityCleanUpEntityDetail");
        return entityCleanService.getEntityCleanUpEntityDetail(entityStageDetailId);
    }

    @PatchMapping("/entityDetails")
    public ResponseEntity<Object> updateEntityDetails(@RequestBody EntityCleanUpDto entityCleanUpDto, HttpServletRequest request) {
        log.info("Request for /entityDetail updateEntityDetails");
        return entityCleanService.updateEntityDetails(entityCleanUpDto, request);
    }

    @GetMapping("/entityDetail/{entityStageDetailId}/dunsMatch")
    public ResponseEntity<Object> getEntityDunsMatches(@PathVariable("entityStageDetailId") Integer entityStageDetailId) {
        log.info("Request for /entityDetail getEntityDunsMatches");
        return entityCleanService.getEntityDunsMatches(entityStageDetailId);
    }

    @GetMapping("/lookups")
    public ResponseEntity<Object> getEntityCleanUpLookups() {
        log.info("Request for /lookups getEntityCleanUpLookups");
        return entityCleanService.getEntityCleanUpLookups();
    }

    @GetMapping("/entityDetail/{entityStageDetailId}/systemMatch")
    public ResponseEntity<Object> getEntitySystemMatches(@PathVariable("entityStageDetailId") Integer entityStageDetailId) {
        log.info("Request for /entityDetail/{}/systemMatch getEntitySystemMatches", entityStageDetailId);
        return entityCleanService.getEntitySystemMatches(entityStageDetailId);
    }

    @PostMapping("/createEntity")
    public ResponseEntity<Object> createEntity(@RequestBody EntityStageDetailsDto entityStageDetailsDto, HttpServletRequest request) {
        log.info("Request for /createEntity createEntity");
        return entityCleanService.createEntity(entityStageDetailsDto, request);
    }

    @PostMapping("/batchDetails/bulkUpdate")
    public ResponseEntity<Object> bulkUpdateEntityDetails(@RequestBody EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request) {
        log.info("Request for /batchDetails/bulkUpdate bulkUpdateEntityDetails");
        return entityCleanService.bulkUpdateEntityDetails(entityCleanupBulkUpdateDto, request);
    }

    @GetMapping("/entityDetail/{entityStageDetailId}/validateExcludingSource")
    public ResponseEntity<Object> validatingExcludingSource(@PathVariable("entityStageDetailId") Integer entityStageDetailId) {
        return entityCleanService.validatingExcludingSource(entityStageDetailId);
    }

    @GetMapping("/batchDetails/bulkUpdate/{updateType}/{batchId}")
    public ResponseEntity<Object> bulkUpdateEntityDetails(@PathVariable("updateType") EntityCleanupAction updateType, @PathVariable("batchId") Integer batchId, HttpServletRequest request) {
        log.info("/batchDetails/bulkUpdate/{}/{}", updateType, batchId);
        return entityCleanService.bulkUpdateEntityDetailsByBatchId(updateType, batchId, request);
    }

    @GetMapping("/batchDetails/bulkUpdate/{updateType}/{batchId}/status")
    public ResponseEntity<Object> getBulkProcessStatus(@PathVariable("updateType") EntityCleanupAction updateType, @PathVariable("batchId") Integer batchId) {
        log.info("/batchDetails/bulkUpdate/{}/{}/status", updateType, batchId);
        return new ResponseEntity<>(entityCleanService.getProcessStatus(), HttpStatus.OK);
    }
}
