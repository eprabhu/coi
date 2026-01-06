import { WorkFlowResult, ExtractAllApproversResult, WorkflowDetail, MapWorkFlow, SequentialStop, Workflow } from "./workflow-engine-interface";

/**
 * -----------------------------------------------------------------------------
 * extractAllApprovers()
 * -----------------------------------------------------------------------------
 * Main Angular utility function used to collect:
 *   - All approvers across workflow & workflowList
 *   - All alternate approvers
 *   - Unique approverPersonIds
 * 
 * Works for:
 *   - Active workflow only
 *   - Active workflows inside workflowList
 *   - WorkflowDetails & MapWorkFlow SequentialStops
 * 
 * Returns a structured ExtractAllApproversResult object.
 * -----------------------------------------------------------------------------
 */
export function extractAllApprovers(workFlowResult: WorkFlowResult): ExtractAllApproversResult {
    /** Stores direct approvers */
    const APPROVERS: WorkflowDetail[] = [];
    /** Stores alternate approvers */
    const ALTERNATE_APPROVERS: WorkflowDetail[] = [];
    /** Stores unique approver person IDs */
    const APPROVER_PERSON_IDS = new Set<string>();
    /**
     * -------------------------------------------------------------------------
     * PUSH_APPROVER()
     * -------------------------------------------------------------------------
     * Adds a primary approver to the APPROVERS list and tracks their ID.
     * -------------------------------------------------------------------------
     */
    const PUSH_APPROVER = (approverDetails: WorkflowDetail | null) => {
        if (!approverDetails) return;
        APPROVERS.push(approverDetails);
        if (approverDetails.approverPersonId) {
            APPROVER_PERSON_IDS.add(approverDetails.approverPersonId);
        }
    };
    /**
     * -------------------------------------------------------------------------
     * PUSH_ALTERNATE()
     * -------------------------------------------------------------------------
     * Adds an alternate approver to ALTERNATE_APPROVERS and tracks their ID.
     * -------------------------------------------------------------------------
     */
    const PUSH_ALTERNATE = (alternateApprover: WorkflowDetail | null) => {
        if (!alternateApprover) return;
        ALTERNATE_APPROVERS.push(alternateApprover);
        if (alternateApprover.approverPersonId) {
            APPROVER_PERSON_IDS.add(alternateApprover.approverPersonId);
        }
    };
    /**
     * -------------------------------------------------------------------------
     * PROCESS_WORKFLOW_DETAIL()
     * -------------------------------------------------------------------------
     * Processes a WorkflowDetail node:
     *   - Adds primary approver
     *   - Adds all alternate approvers
     * -------------------------------------------------------------------------
     */
    const PROCESS_WORKFLOW_DETAIL = (detail: WorkflowDetail) => {
        PUSH_APPROVER(detail);
        if (Array.isArray(detail?.alternateApprovers)) {
            detail.alternateApprovers.forEach((alternateApprover: WorkflowDetail) => PUSH_ALTERNATE(alternateApprover));
        }
    };
    /**
     * -------------------------------------------------------------------------
     * PROCESS_MAP_WORKFLOW()
     * -------------------------------------------------------------------------
     * Processes mapWorkFlow structure:
     *   - Iterates sequentialStops
     *   - Extracts primaryApprovers & allApprovers
     *   - Processes their alternate approvers
     * -------------------------------------------------------------------------
     */
    const PROCESS_MAP_WORKFLOW = (mapWorkflow: MapWorkFlow) => {
        if (!Array.isArray(mapWorkflow?.sequentialStops)) return;
        mapWorkflow.sequentialStops.forEach((stop: SequentialStop) => {
            // Primary approvers
            if (Array.isArray(stop?.primaryApprovers)) {
                stop.primaryApprovers.forEach((primaryApprover: WorkflowDetail) => {
                    PUSH_APPROVER(primaryApprover);

                    if (Array.isArray(primaryApprover?.alternateApprovers)) {
                        primaryApprover.alternateApprovers.forEach((alternateApprover: WorkflowDetail) => PUSH_ALTERNATE(alternateApprover));
                    }
                });
            }
            // All approvers
            if (Array.isArray(stop?.allApprovers)) {
                stop.allApprovers.forEach((approver: WorkflowDetail) => {
                    PUSH_APPROVER(approver);

                    if (Array.isArray(approver?.alternateApprovers)) {
                        approver.alternateApprovers.forEach((alternateApprover: WorkflowDetail) => PUSH_ALTERNATE(alternateApprover));
                    }
                });
            }
        });
    };
    // -------------------------------------------------------------------------
    // PROCESS ACTIVE "workflow"
    // -------------------------------------------------------------------------
    if (workFlowResult?.workflow && workFlowResult.workflow?.isWorkflowActive !== false) {
        // WorkflowDetails approvers
        if (Array.isArray(workFlowResult.workflow.workflowDetails)) {
            workFlowResult.workflow.workflowDetails.forEach((workFlowDetail: WorkflowDetail) => PROCESS_WORKFLOW_DETAIL(workFlowDetail));
        }
        // MapWorkflow approvers
        if (Array.isArray(workFlowResult.workflow.mapWorkFlow)) {
            workFlowResult.workflow.mapWorkFlow.forEach((mapWorkFlow: MapWorkFlow) => PROCESS_MAP_WORKFLOW(mapWorkFlow));
        }
    }
    // -------------------------------------------------------------------------
    // PROCESS ACTIVE "workflowList"
    // -------------------------------------------------------------------------
    if (Array.isArray(workFlowResult?.workflowList)) {
        workFlowResult.workflowList
            .filter(result => result?.isWorkflowActive !== false)
            .forEach((workFlow: Workflow) => {
                if (Array.isArray(workFlow?.workflowDetails)) {
                    workFlow.workflowDetails.forEach((workFlowDetail: WorkflowDetail) => PROCESS_WORKFLOW_DETAIL(workFlowDetail));
                }
                if (Array.isArray(workFlow?.mapWorkFlow)) {
                    workFlow.mapWorkFlow.forEach((mapWorkFlow: MapWorkFlow) => PROCESS_MAP_WORKFLOW(mapWorkFlow));
                }
            });
    }
    return {
        approvers: APPROVERS,
        alternateApprovers: ALTERNATE_APPROVERS,
        approverPersonIds: Array.from(APPROVER_PERSON_IDS)
    };
}
