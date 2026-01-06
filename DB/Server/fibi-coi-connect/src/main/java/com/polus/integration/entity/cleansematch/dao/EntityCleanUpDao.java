package com.polus.integration.entity.cleansematch.dao;

import com.polus.integration.entity.cleansematch.dto.EntityCleanUpDto;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminActionType;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminReviewStatusType;
import com.polus.integration.entity.cleansematch.entity.EntityStageBatch;
import com.polus.integration.entity.cleansematch.entity.EntityStageDetails;
import com.polus.integration.pojo.State;

import java.util.List;

public interface EntityCleanUpDao {

    /**
     * This method used to fetch batches
     * @param entityCleanUpDto
     * @return
     */
    List<EntityStageBatch> getEntityCleanUpBatches(EntityCleanUpDto entityCleanUpDto);

    /**
     *
     * @param entityCleanUpDto
     * @return
     */
    List<EntityStageDetails> getEntityCleanUpBatchDetails(EntityCleanUpDto entityCleanUpDto);

    /**
     * This method is used to fetch entity detail
     * @param entityStageDetailId
     * @return
     */
    EntityStageDetails getEntityCleanUpEntityDetail(Integer entityStageDetailId);

    /**
     *
     * @param entityCleanUpDto
     * @return
     */
    Long getEntityCleanUpBatchDetailsCount(EntityCleanUpDto entityCleanUpDto);

    /**
     *
     * @param entityStageDetailId
     * @return
     */
    List<EntityStageDetails> getEntityDetailsByGroupNumber(Integer entityStageDetailId);

    /**
     * This method is used to update admin actions on entity details
     * @param entityStageDetailId
     * @param originatingId
     * @param adminActionTypeCode
     * @param adminReviewStatusCode
     */
    void updateAdminActionStatus(Integer entityStageDetailId, Integer originatingId, Integer entityId, Integer adminActionTypeCode, Integer adminReviewStatusCode);

    /**
     * This method is used to fetch batch details
     * @param batchId
     * @return
     */
    EntityStageBatch getEntityCleanUpBatch(Integer batchId);

    /**
     * Admin Review Status Types
     * @return
     */
    List<EntityStageAdminReviewStatusType> getAdminReviewStatusTypes();

    /**
     * Admin Action Types
     * @return
     */
    List<EntityStageAdminActionType> getAdminActionTypes();

    /**
     * This method is used to update entity stage detail with sys created id
     * @param entityId
     * @param entityStageDetailId
     */
    void updateEntityDetailsWithSysEntity(Integer entityId, Integer entityStageDetailId, Integer adminReviewStatusCode, Integer adminActionCode);

    /**
     * This method used to check the entity stage admin action already done
     * @param entityStageDetailId
     * @param adminActionStatusCode
     * @return
     */
    boolean isEntityAdminActionAlreadyDoneInGroup(Integer entityStageDetailId, Integer adminActionStatusCode);

    /**
     * This method used to check the entity stage admin action already done
     * @param entityStageDetailId
     * @param adminActionStatusCodes
     * @return
     */
    boolean isEntityAdminActionAlreadyDone(Integer entityStageDetailId, List<Integer> adminActionStatusCodes);

    /**
     *
     * @param entityStageDetailIds
     * @param adminReviewStatusCode
     */
    void bulkUpdateAdminReviewStatus(List<Integer> entityStageDetailIds, Integer adminReviewStatusCode);

    /**
     *
     * @param entityStageDetailIds
     * @param adminActionTypeCode
     * @param adminReviewStatusCode
     */
    void bulkUpdateAdminActionStatus(List<Integer> entityStageDetailIds, Integer adminActionTypeCode, Integer adminReviewStatusCode);

    /**
     * This method used to update batch completion status
     * @param batchId
     */
    void updateBatchCompletionStatus(Integer batchId);

    /**
     *
     * @param entityStageDetailId
     * @return
     */
    List<EntityStageDetails> getEntityDetailExternalReferences(Integer entityStageDetailId);

    /**
     *
     * @param entityStageDetailId
     * @param originalEntityDetailId
     */
    void resetOriginEntityDetail(Integer entityStageDetailId, Integer originalEntityDetailId);

    /**
     *
     * @param entityStageDetailId
     * @return
     */
    List<EntityStageDetails> getEntityDetailByOriginatingId(Integer entityStageDetailId);

    /**
     * Update child's admin action code
     * @param entityStageDetailId
     * @param oldAdminActionCode
     * @param newAdminActionCode
     */
    void updateGroupChildAdminAction(Integer entityStageDetailId, Integer oldAdminActionCode, Integer newAdminActionCode, boolean isChildAction);

    List<Integer> getEntityIdsByDunsNumber(List<String> dunsNumbers);

	/**
	 * get admin action code
	 * @param entityStageDetailId
	 */
	Integer getAdminActionCode(Integer entityStageDetailId);

	/**
	 * get admin review code
	 * @param entityStageDetailId
	 */
	Integer getAdminReviewCode(Integer entityStageDetailId);

    /**
     * Find state by state code and country code
     * @param countryCode
     * @param stateCode
     * @return
     */
    State findStateByStateCodeCountryCode(String countryCode, String stateCode);


    /**
     * Get all entity stage detail id by batch id
     * @param batchId
     * @return
     */
    List<Integer> getEntityDetailIdByBatchId(Integer batchId);
}
