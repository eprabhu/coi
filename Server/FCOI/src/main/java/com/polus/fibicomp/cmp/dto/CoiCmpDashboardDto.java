package com.polus.fibicomp.cmp.dto;

import java.sql.Timestamp;
import java.util.Date;

import lombok.Data;

@Data
public class CoiCmpDashboardDto {

    private Integer cmpId;
    private Integer cmpNumber;
    private String cmpTypeCode;
    private String cmpType;
    private String cmpStatusCode;
    private String cmpStatus;
    private String cmpStatusBadgeColor;
    private String versionStatus;
    private String personId;
    private String personFullName;
    private String rolodexId;
    private String rolodexFullName;
    private String homeUnit;
    private String homeUnitName;
    private Date approvalDate;
    private Date expirationDate;
    private String projectNumber;
    private String projectId;
    private String projectTitle;
    private Date projectStartDate;
    private Date projectEndDate;
    private String projectTypeCode;
    private String sponsorAwardNumber;
    private String leadUnit;
    private String leadUnitName;
    private String entityNumber;
    private String entityName;
    private Integer entityId;
    private String updatedBy;
    private Timestamp updateTimestamp;
    private Boolean isHomeUnitSubmission;
    private String sponsorCode;
    private String sponsorName;
    private String primeSponsorCode;
    private String primeSponsorName;
    private String totalCommentsCount;
    private Boolean isShowDownload;
    private Boolean isViewAllowed;

}
