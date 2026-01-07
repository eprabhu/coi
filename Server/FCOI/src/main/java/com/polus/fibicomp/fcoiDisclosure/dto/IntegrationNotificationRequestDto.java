package com.polus.fibicomp.fcoiDisclosure.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class IntegrationNotificationRequestDto {

    private Integer moduleCode;
    private Integer subModuleCode;
    private Integer moduleItemId;
    private String moduleItemKey;
    private String subModuleItemKey;
    private String title;
    private List<String> personIds;
    private List<String> inactivePersonIds;
    private String unitNumber;
    private String unitName;
    private String projectType;
    private String projectStatus;

}
