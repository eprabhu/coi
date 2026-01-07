package com.polus.fibicomp.opa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OPASubmitDto {

    private Integer opaDisclosureId;
    private String opaDisclosureNumber;
    private String certificationText;
    private String opaDisclosureStatus;
    private String opaDispositionStatus;
    private String homeUnit;
    private Integer versionNumber;

}
