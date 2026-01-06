package com.polus.integration.entity.cleansematch.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class CoiEntityResponseDto {
    private Integer entityId;
    private Boolean isErrorInEnrichProcess;
}
