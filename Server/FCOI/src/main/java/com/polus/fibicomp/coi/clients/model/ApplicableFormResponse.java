package com.polus.fibicomp.coi.clients.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicableFormResponse {

	private String formBuilderNumber;
    private String title;
    private Integer businessRuleId;
    private Integer activeFormId;
    private Integer answeredFormId;
    private String revisionRequired;
    private String isActive;

}
