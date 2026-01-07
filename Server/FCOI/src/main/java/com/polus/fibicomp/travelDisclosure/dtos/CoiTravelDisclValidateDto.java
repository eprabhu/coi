package com.polus.fibicomp.travelDisclosure.dtos;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
public class CoiTravelDisclValidateDto {


    private Integer personEntityNumber;
    private BigDecimal reimbursedCost;
    private String personId;
    private Integer noOfTravels;
    private Map<String, Object> fcoiDisclosureDetails;
}
