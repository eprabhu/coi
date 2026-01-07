package com.polus.fibicomp.coi.dto;

import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
public class CoiDisclosureCommonDto extends WorkflowDto {

	private Integer disclosureId;

}
