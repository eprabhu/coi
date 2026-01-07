package com.polus.fibicomp.opa.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class OPAReviewRequestDto {

    private Integer opaDisclosureId;
    private Integer opaSubSectionsId;
    private Integer opaSectionsTypeCode;
    private Integer componentSubRefId;
    private String personId;
    private List<Integer> tagGroupId;
    private String sort;
    private String documentOwnerPersonId;
}
