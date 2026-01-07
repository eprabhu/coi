package com.polus.fibicomp.opa.dto;

import java.sql.Timestamp;
import java.util.List;

import com.polus.fibicomp.opa.pojo.OPAReviewStatusType;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import com.polus.fibicomp.opa.pojo.OPADispositionStatusType;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
public class OPACommonDto extends WorkflowDto {

	private Integer opaDisclosureId;
	private String opaDisclosureNumber;
	private String adminGroupName;
	private String adminPersonName;
	private String reassignedAdminPersonName;
	private String comment;
	private String description;
	private String updateUserFullName;
	private String reviewerFullName;
	private String reviewLocationType;
	private String reviewStatus;
	private String reviewStatusCode;
	private String personId;
	private OPAReviewStatusType reviewStatusType;
	private Timestamp updateTimestamp;
	private String homeUnit;
	private OPADispositionStatusType dispositionStatusType;
	private String unitNumber;
	private List<String> rights; 

}
