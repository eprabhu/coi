export class Person {
    name: string = null;
    personId: string = null;
    designation: string = null;
    homeUnit: string = null;
    emailAddress: string = null;
    phoneNumber: string = null;
    primaryTitle: string = null;
    isExternalUser: boolean;
}

export class WorkFlowAction {
    approvalStatus: string = null;
    approvalStopNumber: number = null;
    approverNumber: number = null;
    approverPersonId: string = null;
    mapDescription: string = null;
    mapId: number = null;
    mapName: string = null;
    mapNumber: number = null;
    moduleCode: string = null;
    moduleItemKey: number = null;
    primaryApprover: boolean | string = null;
    stopName: string = null;
    subModuleCode = null;
    subModuleItemKey = null;
    updateUser = null;
    workFlowId = null;
    note?: string;
    personId?: number;
}

export class BypassRO {
    actionType: string;
    workFlowPersonId: any;
    approverStopNumber: any;
    mapNumber: any;
    mapId: any;
    approverNumber: any;
    approveComment: any;
    updateUser: any;
    personId: any;
    moduleItemKey?: any;
    awardId?: any;
    awardNumber?: any;
    proposalId?: any;
    moduleItemId?: any;
    taskId?: any;
    endModuleSubItemKey?: any;
    claimId?: any;
    progressReportId?: any;
    agreementRequestId?: any;
    serviceRequestId?: any;
    opaDisclosureId?: string | number;
    opaDisclosureNumber?: string | number;
    coiDisclosureId?: string | number;
    coiDisclosureNumber?: string | number;
}

export interface Workflow {
    workflowId: number;
    moduleCode: number;
    moduleItemId: string;
    isWorkflowActive: boolean;
    comments: string;
    workflowDetails: WorkflowDetail[];
    workflowSequence: number;
    workflowStartDate: number;
    workflowEndDate: number;
    workflowStartPerson: string;
    workflowEndPerson: string;
    mapType: string;
    subModuleCode: number;
    subModuleItemId: string;
    workflowDetailMap: any;
    currentStopName: string;
    startPersonName: string;
    endPersonName: string;
    workflowCreatedBy: string;
    mapWorkFlow: MapWorkFlow[];
}

export interface MapWorkFlow {
    mapNumber: number;
    mapType: string;
    mapId: number;
    mapName: string;
    mapDescription: string;
    sequentialStops: SequentialStop[];
    mapStatus: string;
}

export interface SequentialStop {
    stopNumber: number;
    note: string;
    primaryApprovers: WorkflowDetail[];
    updateUserFullName: string;
    allApprovers: WorkflowDetail[];
    updateTimeStamp: number;
    stopName: string;
}

export interface WorkflowDetail {
    workflowDetailId: number;
    workflowId: number;
    mapId: number;
    workflowMap: WorkflowMap;
    mapNumber: number;
    approvalStopNumber: number;
    approverNumber: number;
    primaryApproverFlag: boolean;
    approverPersonId: string;
    approverPersonName: string;
    approvalStatusCode: string;
    workflowStatus: WorkflowStatus;
    approvalComment: string;
    approvalDate: number;
    updateUser: string;
    updateTimeStamp: number;
    workflowAttachments: WorkflowAttachment[];
    roleTypeCode: string;
    personRoleType: string;
    workflowReviewerDetails: any[];
    emailAddress: string;
    unitNumber: number;
    delegatedByPersonId: number;
    stopName: string;
    mapName: string;
    mapDescription: string;
    createUser: string;
    note: string;
    isReviewerCanScore: boolean;
    updateUserFullName: string;
    workflowDetailExt: any;
    delegatedPersonName: string;
    createUserFullName: string;
    alternateApprovers: WorkflowDetail[] | null;
}

export interface WorkflowAttachment {
    attachmentId: number;
    fileName: string;

}

export interface WorkflowMap {
    mapId: number;
    unitNumber: string;
    description: string;
    updateUser: string;
    updateTimeStamp: number;
    mapType: string;
    workflowMapDetails: WorkflowMapDetail[];
    mapName: string;
}

export interface WorkflowMapDetail {
    mapDetailId: number;
    mapId: number;
    approvalStopNumber: number;
    approverNumber: number;
    approverPersonId: string;
    primaryApproverFlag: boolean;
    isRole: boolean;
    roleTypeCode: string;
    personRoleType: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    stopName: string;
    fullName: string;
}

export interface WorkflowStatus {
    approveStatusCode: string;
    approveStatus: string;
    updateTimeStamp: number;
    updateUser: string;
}

export interface WorkflowLabels {
    approved?: string;
    bypassed?: string;
    rejected?: string;
    toBeSubmitted?: string;
    pending?: string;
    withdrawn?: string;
    deactivated?: string;
}

export class WorkFlowResult {
    workflow: Workflow | null = null;
    canApproveRouting: string | null = null;
    isFinalApprover: string | null = null;
    actionType: string | null = null;
    workFlowPersonId: number | null = null;
    approverStopNumber: number | null = null;
    mapId: number | null = null;
    approveComment: string | null = null;
    mapNumber: number | null = null;
    approverNumber: number | null = null;
    workflowDetailId: number | null = null;
    message: string | null = null;
    moduleCode: number | null = null;
    moduleItemKey: number | null = null;
    workflowList: Workflow[] = [];
    workFlowStatusName: string | null = null;
    finalApprover: boolean | null = null;
    isApproved: boolean | null = null;
    isApprover: boolean | null = null;
    availableRights: string[] = [];
    updateUser: string | null = null;
    approvalStopNumber: number | null = null;
    workFlowId: number | null = null;
    stopName: string | null = null;
    subModuleCode: number | null = null;
    subModuleItemKey: number | null = null;
    approverFlag: boolean | null = null;
    primaryApprover: boolean | null = null;
    approverPersonId: string | null = null;
    mapName: string | null = null;
    mapDescription: string | null = null;
    note: string | null = null;
    approvalStatus: string | null = null;
    personId: string | null = null;
    isFinalApprovalPending: boolean;
}

export interface ExtractAllApproversResult {
    approvers: WorkflowDetail[];
    alternateApprovers: WorkflowDetail[];
    approverPersonIds: string[];
}
