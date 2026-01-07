package com.polus.integration.entity.cleansematch.service;

import com.polus.integration.entity.cleansematch.dto.EntityCleanUpDto;
import com.polus.integration.entity.cleansematch.dto.EntityCleanupAction;
import com.polus.integration.entity.cleansematch.dto.EntityCleanupBulkUpdateDto;
import com.polus.integration.entity.cleansematch.dto.EntityStageDetailsDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface EntityCleanUpService {

    /**
     * This method fetches the batches
     * @param entityCleanUpDto
     * @return
     */
    ResponseEntity<Object> getEntityCleanUpBatches(EntityCleanUpDto entityCleanUpDto);

    /**
     * This method fetches entity batch details
     * @param entityCleanUpDto
     * @return
     */
    ResponseEntity<Object> getEntityCleanUpBatchDetails(EntityCleanUpDto entityCleanUpDto);

    /**
     * This method is used to fetch entity detail
     * @param entityStageDetailId
     * @return
     */
    ResponseEntity<Object> getEntityCleanUpEntityDetail(Integer entityStageDetailId);

    /**
     * This method is used to update entity statuses
     * @param entityCleanUpDto
     * @return
     */
    ResponseEntity<Object> updateEntityDetails(EntityCleanUpDto entityCleanUpDto, HttpServletRequest request);

    /**
     * This method is used to fetch duns match
     * @param entityStageDetailId
     * @return
     */
    ResponseEntity<Object> getEntityDunsMatches(Integer entityStageDetailId);

    /**
     * This method is used to fetch lookups
     * @return
     */
    ResponseEntity<Object> getEntityCleanUpLookups();

    /**
     * This method is used to fetch system match entities
     * @param entityStageDetailId
     * @return
     */
    ResponseEntity<Object> getEntitySystemMatches(Integer entityStageDetailId);

    /**
     * This method is used to create entity
     * @param entityStageDetailsDto
     * @return
     */
    ResponseEntity<Object> createEntity(EntityStageDetailsDto entityStageDetailsDto, HttpServletRequest request);

    /**
     * This method is used to bulk update entity details
     * @param entityCleanupBulkUpdateDto
     * @return
     */
    ResponseEntity<Object> bulkUpdateEntityDetails(EntityCleanupBulkUpdateDto entityCleanupBulkUpdateDto, HttpServletRequest request);

    ResponseEntity<Object> validatingExcludingSource(Integer entityDetailId);

    /**
     * Manual interface to bulk  update a bach
     * @param updateType
     * @param batchId
     * @return
     */
    ResponseEntity<Object> bulkUpdateEntityDetailsByBatchId(EntityCleanupAction updateType, Integer batchId, HttpServletRequest request);

    /**
     * Bulk process status
     * @return
     */
    String getProcessStatus();
}
