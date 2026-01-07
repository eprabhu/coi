package com.polus.fibicomp.workflowBusinessRuleExt.service;

import com.polus.fibicomp.fcoiDisclosure.dto.COICommonDto;
import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface WorkflowCOIExtService {

    /**
     *
     * @param files
     * @param opaDto
     * @param moduleCode
     * @return
     */
    ResponseEntity<String> coiWorkflowApproval(MultipartFile[] files, COICommonDto opaDto, String moduleCode);

    /**
     *
     * @param vo
     * @param workflowDetailId
     */
    void sendAlternateApproverNotificationForCOI(WorkflowDto vo, Integer workflowDetailId);
}
