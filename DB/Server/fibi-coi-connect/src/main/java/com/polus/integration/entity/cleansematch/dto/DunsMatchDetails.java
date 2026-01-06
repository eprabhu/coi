package com.polus.integration.entity.cleansematch.dto;

import com.polus.integration.entity.base.dto.DnBOrganizationDetails.DetailedAddress;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails.BusinessEntityType;
import com.polus.integration.entity.base.dto.DnBOrganizationDetails.CorporateLinkage;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class DunsMatchDetails {

    private String entityName;
    private String dunsNumber;
    private String ueiNumber;
    private String cageNumber;
    private String primaryAddressLine1;
    private String primaryAddressLine2;
    private String city;
    private String state;
    private String stateCode;
    private String postCode;
    private String countryCode;
    private String country;
    private String industryType;
    private String ownershipType;
    private String ownershipTypeCode;
    private String confidenceScore;
    private EntityInfoDTO entityDetails;
    private CorporateLinkage corporateLinkage;
    private BusinessEntityType businessEntityType;
    private DetailedAddress mailingAddress;
}
