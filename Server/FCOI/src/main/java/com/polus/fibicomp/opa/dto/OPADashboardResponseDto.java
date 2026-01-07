package com.polus.fibicomp.opa.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class OPADashboardResponseDto {

    private List<OPADashboardDto> data;
    private Integer count;
}
