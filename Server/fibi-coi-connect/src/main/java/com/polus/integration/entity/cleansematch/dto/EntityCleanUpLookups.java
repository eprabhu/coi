package com.polus.integration.entity.cleansematch.dto;

import com.polus.integration.entity.cleansematch.entity.EntityStageAdminActionType;
import com.polus.integration.entity.cleansematch.entity.EntityStageAdminReviewStatusType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class EntityCleanUpLookups {

    private List<EntityStageAdminReviewStatusType> adminReviewStatusTypes;

    private List<EntityStageAdminActionType> adminActionTypes;

}
