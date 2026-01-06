package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.polus.fibicomp.opa.dto.OPACommonDto;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface WorkflowOPAExtService {

    /**
     *
     * @param vo
     * @param workflowDetailId
     */
    void sendAlternateApproverNotificationForOPA(WorkflowDto vo, Integer workflowDetailId);

    /**
     *
     * @param files
     * @param opaDto
     * @param moduleCode
     * @return
     */
    ResponseEntity<String> opaWorkflowApproval(MultipartFile[] files, OPACommonDto opaDto, String moduleCode);
}
