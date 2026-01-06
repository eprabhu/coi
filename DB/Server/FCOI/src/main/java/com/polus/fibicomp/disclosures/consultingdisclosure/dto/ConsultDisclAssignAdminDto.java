package com.polus.fibicomp.disclosures.consultingdisclosure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsultDisclAssignAdminDto {

    private Integer disclosureId;

    private Integer adminGroupId;

    private String adminPersonId;

    private String disclosureStatus;

    private String actionType;

}
