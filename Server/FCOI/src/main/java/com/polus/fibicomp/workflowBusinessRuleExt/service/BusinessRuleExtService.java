package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.polus.core.messageq.vo.MessageQVO;
import com.polus.core.workflow.pojo.WorkflowDetail;
import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface BusinessRuleExtService {

    /**
     * Approve or Reject workflow
     * @param files
     * @param formDataJson
     * @param moduleCode
     * @param subModuleCode
     * @return
     */
    ResponseEntity<String> approveOrRejectWorkflow(MultipartFile[] files, String formDataJson, String moduleCode, String subModuleCode) throws JsonProcessingException;

    /**
     * Fetch Workflow details
     * @param workflowDto
     * @return
     */
    String fetchWorkFlowDetails(WorkflowDto workflowDto);

    /**
     * Add route log sequence stop
     * @param vo
     * @return
     */
    ResponseEntity<String> addSequentialStop(WorkflowDto vo);

    /**
     * Add alternative approver
     * @param vo
     * @return
     */
    ResponseEntity<String> addAlternativeApprover(WorkflowDto vo);

    /**
     * Sends a notification based on the provided details.
     *
     * @param moduleItemKey Disclosure ID.
     * @param additionalDetails A map containing any additional key-value pairs relevant to the notification.
     * @param triggerType The type of event or action that triggered the notification.
     * @param moduleCode The code representing the module from which the notification is being sent.
     * @return A MessageQVO object containing information about the sent notification.
     */
    MessageQVO sendNotification(Integer moduleItemKey, Map<String, String> additionalDetails, String triggerType, Integer moduleCode);

    /**
     *
     * @param workflowDto
     * @param moduleItemKey
     * @param moduleCode
     * @param subModuleItemKey
     * @param subModuleCode
     * @return
     */
    WorkflowDto setWorkflowDetails(WorkflowDto workflowDto, Integer moduleItemKey, Integer moduleCode, String subModuleItemKey, Integer subModuleCode);

}
