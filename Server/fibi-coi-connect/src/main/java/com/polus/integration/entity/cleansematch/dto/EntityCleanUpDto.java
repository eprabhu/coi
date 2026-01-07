package com.polus.integration.entity.cleansematch.dto;

import lombok.Data;

@Data
public class EntityCleanUpDto {

    private Integer batchId;
    private String[] batchStatusCodes;
    private String[] reviewStatusCodes;
    private Integer adminReviewStatusCode;
    private Integer[] adminReviewStatusCodes;
    private Integer adminActionCode;
    private Integer[] adminActionCodes;
    private String searchKeyword;
    private Boolean isExactDunsMatch;
    private Boolean isMultipleDunsMatch;
    private Boolean isNoDunsMatch;
    private Boolean isDuplicateInBatch;
    private Boolean isDuplicateInEntitySys;
    private Integer originalEntityDetailId;
    private Integer duplicateEntityDetailId;
    private Integer excludedEntityDetailId;
    private Integer entityStageDetailId;
    private Integer entityId;
    private Integer pageNumber;
    private Integer totalCount;
    private Boolean canReReview;
}
