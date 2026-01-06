package com.polus.fibicomp.disclosures.consultingdisclosure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultDisclCommonDto {

    private Integer disclosureId;

    private String adminGroupName;

    private String adminPersonName;

    private String reassignedAdminPersonName;

    private String comment;

    private String description;

    private String updateUserFullName;

    private String reviewStatusType;

    private String personId;

    private Integer entityId;

    private Integer entityNumber;

}
