package com.polus.fibicomp.fcoiDisclosure.dto;

import com.polus.fibicomp.coi.pojo.CoiReviewStatusType;
import com.polus.fibicomp.fcoiDisclosure.pojo.CoiDispositionStatusType;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.sql.Timestamp;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
public class COICommonDto extends WorkflowDto {

	private Integer coiDisclosureId;
	private String coiDisclosureNumber;
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
	private CoiReviewStatusType reviewStatusType;
	private Timestamp updateTimestamp;
	private String homeUnit;
	private CoiDispositionStatusType dispositionStatusType;
	private String unitNumber;
	private List<String> rights; 

}
