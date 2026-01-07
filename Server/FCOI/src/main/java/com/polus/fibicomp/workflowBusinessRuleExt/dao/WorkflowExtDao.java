package com.polus.fibicomp.workflowBusinessRuleExt.dao;

import com.polus.fibicomp.workflowBusinessRuleExt.dto.WorkflowDto;

public interface WorkflowExtDao {

    /**
     * Add Alternative approver
     * @param vo
     * @return
     */
    Integer addAlternativeApprover(WorkflowDto vo);
}
