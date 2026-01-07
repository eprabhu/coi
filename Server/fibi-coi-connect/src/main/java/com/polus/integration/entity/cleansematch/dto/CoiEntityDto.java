package com.polus.integration.entity.cleansematch.dto;

import com.polus.integration.dnb.referencedata.entity.EntityBusinessType;
import com.polus.integration.pojo.State;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class CoiEntityDto {

    private Integer entityId;
    private String entityName;
    private String foreignName;
    private String priorName;
    private String shortName;
    private String dunsNumber;
    private String ueiNumber;
    private String cageNumber;
    private String websiteAddress;
    private String startDate;
    private String incorporationDate;
    private String certifiedEmail;
    private String activityText;
    private String phoneNumber;
    private String primaryAddressLine1;
    private String primaryAddressLine2;
    private String city;
    private String state;
    private String postCode;
    private String humanSubAssurance;
    private String anumalWelfareAssurance;
    private String animalAccreditation;
    private String approvedBy;
    private String createdBy;
    private String updatedBy;
    private String countryCode;
    private CountryDto country;
    private String entityOwnershipTypeCode;
    private CoiEntityOwnershipTypeDto entityOwnershipType;
    private String incorporatedIn;
    private Integer entityNumber;
    private Integer versionNumber;
    private String versionStatus;
    private Boolean isDunsMatched;
    private String sponsorCode;
    private String organizationId;
    private List<ForeignNameResponseDTO> foreignNames;
    private EntityBusinessType entityBusinessType;
    private List<EntityFamilyTreeRoleDto> entityFamilyTreeRoles;
    private Boolean isForeign;
    private State stateDetails;

}
