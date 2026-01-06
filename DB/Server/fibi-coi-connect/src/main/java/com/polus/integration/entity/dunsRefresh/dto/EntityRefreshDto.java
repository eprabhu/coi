package com.polus.integration.entity.dunsRefresh.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EntityRefreshDto {

    private Integer entityId;
    private Integer entityNumber;
    private String entityName;
}
