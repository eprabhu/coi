package com.polus.fibicomp.coi.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class COIValidateDataDto {

    private String VALIDATION_TYPE;
    private String VALIDATION_MSG_TYPE;
    private String MESSAGE;
    private List<String> SFIs;
    private List<String> PROJ_SFI_DETAILS;

}
