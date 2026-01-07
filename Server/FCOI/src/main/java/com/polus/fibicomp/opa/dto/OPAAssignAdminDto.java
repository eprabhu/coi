package com.polus.fibicomp.opa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPAAssignAdminDto {

    private Integer opaDisclosureId;
    private String opaDisclosureNumber;
    private Integer adminGroupId;
    private String adminPersonId;
    private String opaDisclosureStatus;
    private String actionType;

}
