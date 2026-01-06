package com.polus.integration.entity.cleansematch.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class EntityCleanupBulkUpdateDto {

    List<Integer> entityStageDetailIds;
    EntityCleanupAction action;
    Integer batchId;
}
