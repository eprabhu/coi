package com.polus.fibicomp.globalentity.dto;

import lombok.*;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class EntityFeedRequestDto {

    private EntityRequestDTO entity;
    private AddressDetailsRequestDTO additionalAddress;
    private SponsorRequestDTO entitySponsor;
    private SubAwdOrgRequestDTO entitySubAward;
    private List<ExternalReferenceRequestDTO> externalReferences;
    private EntityRiskRequestDTO entityRisk;
    private Integer rolodexId;
}
