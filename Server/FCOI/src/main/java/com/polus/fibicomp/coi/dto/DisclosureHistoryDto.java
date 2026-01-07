package com.polus.fibicomp.coi.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.Date;

@Getter
@Setter
public class DisclosureHistoryDto {

    private Integer disclosureId;
    private Integer travelDisclosureId;
    private Integer consultDisclId;
    private String homeUnit;
    private String homeUnitName;
    private String versionStatus;
    private Timestamp certifiedAt;
    private Timestamp expirationDate;
    private String fcoiTypeCode;
    private String fcoiType;
    private String conflictStatusCode;
    private String conflictStatus;
    private String dispositionStatusCode;
    private String dispositionStatus;
    private String reviewStatusCode;
    private String reviewStatus;
    private String entityName;
    private String travelStatusCode;
    private String travelStatus;
    private String purposeOfTheTrip;
    private Date travelStartDate;
    private Date travelEndDate;
    private String destinationCity;
    private String destinationCountry;
    private String travelState;
    private Timestamp updateTimeStamp;
    private String projectNumber;
    private String projectTitle;
    private String projectTypeCode;
    private String projectType;
    private String projectIcon;
    private String projectBadgeColor;
    private String documentStatus;
    private Integer entityId;
    private String documentNumber;
    private String projectId;
    private Boolean isExtended;
    private Boolean isViewAllowed;

}
