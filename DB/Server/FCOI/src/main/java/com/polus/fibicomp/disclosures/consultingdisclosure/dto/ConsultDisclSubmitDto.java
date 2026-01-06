package com.polus.fibicomp.disclosures.consultingdisclosure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConsultDisclSubmitDto {

    private Integer disclosureId;

    private String certificationText;

    private String disclosureStatus;

}
