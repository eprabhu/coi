package com.polus.fibicomp.cmp.dto;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class CoiCmpAdmDashboardReqDto {

    private String cmpPerson;
    private String cmpRolodex;
    private List<String> cmpTypeCode;
    private List<String> cmpStatusCode;
    private String approvalStartDate;
    private String approvalEndDate;
    private String expirationStartDate;
    private String expirationEndDate;
    private String leadUnit;
    private String sponsorAwardNumber;
    private String principleInvestigator;
    private String sponsor;
    private String entity;
    private String projectTitle;
    private String projectNumber;
    private String advancedSearch;
    private Map<String, String> sort;
    private Boolean isDownload;
    private Integer currentPage;
    private Integer pageNumber;
    private String homeUnit;
    private List<String> freeTextSearchFields;
}
