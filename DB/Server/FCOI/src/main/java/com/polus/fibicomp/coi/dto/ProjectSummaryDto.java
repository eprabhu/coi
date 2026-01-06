package com.polus.fibicomp.coi.dto;

import java.util.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectSummaryDto {

    private String projectNumber;
    private String sponsorCode;
    private String primeSponsorCode;
    private String sponsorName;
    private String homeUnitName;
    private String homeUnitNumber;
    private String primeSponsorName;
    private String projectStatus;
    private String piName;
    private Date projectStartDate;
    private Date projectEndDate;
    private String projectBadgeColour;
    private String projectIcon;
    private String projectType;
    private String projectTypeCode;
    private String projectTitle;
    private String documentNumber;
    private String accountNumber;
    private String projectId;
    private String reporterRole;

}