package com.polus.fibicomp.cmp.dto;

import java.util.List;

import lombok.Data;

@Data
public class CoiCmpDashboardResponseDto {

    private List<CoiCmpDashboardDto> records;
    private Integer totalCount;
}
