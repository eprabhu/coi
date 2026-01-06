package com.polus.fibicomp.workflowBusinessRuleExt.dto;

import java.sql.Timestamp;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.polus.core.workflow.pojo.Workflow;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
public class WorkflowDto {

    private Workflow workflow;
    private String canApproveRouting;
    private String isFinalApprover;
    private String actionType;
    private String workFlowPersonId;
    private Integer approverStopNumber;
    private Integer mapId;
    private String approveComment;
    private Integer mapNumber;
    private Integer approverNumber;
    private Integer workflowDetailId;
    private String message;
    private Integer moduleCode;
    private Integer moduleItemKey;
    private List<Workflow> workflowList;
    private String workFlowStatusName;
    private Boolean finalApprover;
    private Boolean isApproved;
    private Boolean isApprover;
    List<String> availableRights;
    private String updateUser;
    private Integer approvalStopNumber;
    private Integer workFlowId;
    private String stopName;
    private Integer subModuleCode;
    private Integer subModuleItemKey;
    private String approverFlag;
    private boolean primaryApprover;
    private String approverPersonId;
    private String mapName;
    private String mapDescription;
    private String note;
    private String approvalStatus;
    private String personId;
	@JsonProperty("isFinalApprovalPending")
	private boolean isFinalApprovalPending;
	private Timestamp updateTimestamp;
	private String updateUserFullName;

}
