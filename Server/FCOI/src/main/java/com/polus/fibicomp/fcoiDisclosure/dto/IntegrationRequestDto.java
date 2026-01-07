package com.polus.fibicomp.fcoiDisclosure.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IntegrationRequestDto {

    private String personId;
    private Integer moduleCode;
    private String moduleItemKey;
    private String remark;
    private String actionType;
}
