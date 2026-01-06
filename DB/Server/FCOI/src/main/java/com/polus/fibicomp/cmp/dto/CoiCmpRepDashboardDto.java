package com.polus.fibicomp.cmp.dto;

import java.util.Map;

import lombok.Data;

@Data
public class CoiCmpRepDashboardDto {

    private String cmpPersonId;
    private Map<String, String> sort;
    private Boolean isDownload;
    private Integer currentPage;
    private Integer pageNumber;
}
