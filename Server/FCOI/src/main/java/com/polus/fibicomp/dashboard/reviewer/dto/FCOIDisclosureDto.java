package com.polus.fibicomp.dashboard.reviewer.dto;

import com.polus.core.pojo.Unit;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDisclosureType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
public class FCOIDisclosureDto {

    private Integer coiDisclosureId;
    private String coiDisclosureNumber;
    private String disclosurePersonFullName;
    private String conflictStatusCode;
    private String conflictStatus;
    private String dispositionStatusCode;
    private String dispositionStatus;
    private String fcoiTypeCode;
    private String fcoiType;
    private String reviewStatusCode;
    private String reviewStatus;
    private Integer lastApprovedVersion;
    private Timestamp lastApprovedVersionDate;
    private String versionStatus;
    private Integer disclosureVersionNumber;
    private Timestamp updateTimeStamp;
    private String updateUser;
    private String reviseComment;
    private String personId;
    private Timestamp expirationDate;
    private Timestamp certifiedAt;
    private Integer noOfSfi;
    private List<Map<Object, Object>> projectCount;
    private String projectNumber;
    private String projectTitle;
    private String projectBadgeColor;
    private String projectIcon;
    private String projectType;
    private String coiProjectTypeCode;
    private Integer disclosureAttachmentCount;
    private String adminGroupName;
    private String administrator;
    private Boolean isExtended;
    private Integer commentCount;
    private Boolean isHomeUnitSubmission;
    private String adminPersonId;
    private List<List<String>> reviewerList;
    private Unit unit;
    private List<CoiDisclosureType> coiDisclosureTypes;
    private List<Map<Object, Object>> existingDisclosures;
}
