package com.polus.fibicomp.cmp.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoiManagementPlanDto {

	private Integer cmpId;
    private String cmpTypeCode;
    private String personId;
    private String academicDepartmentNumber;
    private String labCenterNumber;
    private String subAwardInstituteCode;
    private Integer rolodexId;
    private String versionStatus;
    private String cmpStatusCode;
    private Integer availableActionId;
    private List<CoiManagementPlanEntityRelDto> entityRelations;
    private List<CoiManagementPlanProjectRelDto> projectRelations;
    private List<CoiManagementPlanSectionRelDto> sectionRelations;

}
