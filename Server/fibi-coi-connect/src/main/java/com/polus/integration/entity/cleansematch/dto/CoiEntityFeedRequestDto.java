package com.polus.integration.entity.cleansematch.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class CoiEntityFeedRequestDto {

    private CoiEntityRequestDTO entity;
    private EntityAddressDetailsRequestDTO additionalAddress;
    private CoiEntitySponsorRequestDTO entitySponsor;
    private CoiSubAwdOrgRequestDTO entitySubAward;
    private List<ExternalReferenceRequestDTO> externalReferences;
    private CoiEntityRiskDto entityRisk;

}
