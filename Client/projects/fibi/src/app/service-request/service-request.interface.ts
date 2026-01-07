export interface ServiceRequestStatus {
    statusCode: number;
    description: string;
    updateTimestamp: number;
    updateUser: string;
}

export interface ServiceRequestType {
    typeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    instruction?: any;
    subject?: any;
    activeFlag: string;
    sortOrder?: any;
    moduleCode: number;
    helpText: string;
}

export interface ServiceRequestModule {
    moduleCode: number;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface Unit {
    unitNumber: string;
    parentUnitNumber: string;
    organizationId?: any;
    unitName: string;
    active: boolean;
    updateTimestamp: number;
    updateUser: string;
    acronym?: any;
    isFundingUnit?: any;
    unitAdministrators: any[];
    unitDetail: string;
    parentUnitName?: any;
    organizationName?: any;
}

export interface ServiceRequestPriority {
    priorityId: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export class ServiceRequest {
    adminGroup: AdminGroup;
    adminGroupId: number;
    serviceRequestId: number;
    statusCode: number;
    serviceRequestStatus: ServiceRequestStatus;
    typeCode: string;
    serviceRequestType: ServiceRequestType;
    moduleCode: number;
    serviceRequestModule: ServiceRequestModule;
    moduleItemKey: string;
    subject: string;
    description: string;
    reporterPersonId: string;
    assigneePersonId?: any;
    unitNumber: string;
    unit: Unit;
    originatingModuleItemKey: string;
    createTimestamp: number;
    createUser: string;
    updateTimestamp: number;
    updateUser: string;
    isSystemGenerated: boolean;
    priorityId: string;
    serviceRequestPriority: ServiceRequestPriority;
    createUserFullName: string;
    updateUserFullName: string;
    moduleDetails: ModuleDetails;
    submitUserFullName?: any;
    createdPersonName: string;
    serviceRequestTypeData?: any;
    serviceRequestStatusData?: any;
    unitName?: any;
    reporterPersonName?: any;
    assigneePersonName?: any;
}

export interface ServiceRequestActionType {
    actionTypeCode: number;
    description: string;
    updateTimestamp: any;
    updateUser: string;
}

export interface ServiceRequestRoleType {
    roleTypeCode: string;
    description: string;
    updateTimestamp: any;
    updateUser: string;
}

export interface WorkflowMapDetail {
    mapDetailId: number;
    mapId: number;
    approvalStopNumber: number;
    approverNumber: number;
    approverPersonId: string;
    primaryApproverFlag: boolean;
    isRole: boolean;
    roleTypeCode?: any;
    personRoleType?: any;
    description: string;
    updateTimeStamp: any;
    updateUser: string;
    stopName: string;
    fullName?: any;
}

export interface WorkflowMap {
    mapId: number;
    unitNumber: string;
    description: string;
    updateUser: string;
    updateTimeStamp: any;
    mapType: string;
    workflowMapDetails: WorkflowMapDetail[];
    mapName: string;
}

export interface WorkflowStatus {
    approveStatusCode: string;
    approveStatus: string;
    updateTimeStamp: any;
    updateUser: string;
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
    approvalComment?: any;
    approvalDate?: number;
    updateUser: string;
    updateTimeStamp: any;
    workflowAttachments: any[];
    roleTypeCode?: any;
    personRoleType?: any;
    workflowReviewerDetails: any[];
    emailAddress: string;
    unitNumber?: any;
    delegatedByPersonId?: any;
    isReviewerCanScore: boolean;
    stopName: string;
    updateUserFullName: string;
    workflowDetailExt?: any;
    delegatedPersonName?: any;
}

export interface WorkflowList {
    workflowId: number;
    moduleCode: number;
    moduleItemId: string;
    isWorkflowActive: boolean;
    comments?: any;
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
    startPersonName?: any;
    endPersonName?: any;
}

export interface Workflow {
    workflowId: number;
    moduleCode: number;
    moduleItemId: string;
    isWorkflowActive: boolean;
    comments?: any;
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
    startPersonName?: any;
    endPersonName?: any;
}

export interface ServiceRequestStatusHistory {
    statusHistoryId: number;
    serviceRequestId: number;
    actionLogId: number;
    statusCode: number;
    serviceRequestStatus: ServiceRequestStatus;
    adminGroup: AdminGroup;
    actionStartTime: any;
    actionEndTime: any;
    updateUser: string;
    updateTimestamp: any;
}

export class ServiceRequestRoot {
    adminGroups: AdminGroup[];
    notificationTypeId?: any;
    subject?: any;
    body?: any;
    serviceRequestId: number;
    personId: string;
    updateType?: any;
    message?: any;
    acType: string;
    serviceRequest: ServiceRequest;
    moduleList: ServiceRequestModule[];
    serviceRequestTypes: ServiceRequestType[];
    serviceRequestActionTypes: ServiceRequestActionType[];
    serviceRequestRoleTypes: ServiceRequestRoleType[];
    serviceRequestComment?: any;
    moduleItemKey?: any;
    moduleCode?: any;
    personName?: any;
    assignActionType?: any;
    actionCode?: any;
    newAttachments: any[];
    attachmentId?: any;
    sort: any;
    serviceRequestTabName?: any;
    currentPage?: any;
    pageNumber?: any;
    commentId?: any;
    tabIndex?: any;
    availableRights: string[];
    leadUnitNumber?: any;
    serviceRequestActionLogs?: any;
    loginPersonUnitNumber?: any;
    actionType?: any;
    approveComment?: any;
    isFinalApprover?: any;
    workflowList: WorkflowList[];
    canApproveRouting: string;
    workflow: Workflow;
    workflowDetailId?: any;
    workflowDetail?: any;
    finalApprover?: any;
    isApproved?: any;
    isApprover?: any;
    approverStopNumber?: any;
    subModuleItemKey?: any;
    isSubmit?: any;
    mapNumber?: any;
    mapId?: any;
    approverNumber?: any;
    updateUser?: any;
    workFlowPersonId?: any;
    serviceRequestSubject?: any;
    serviceRequestDescription?: any;
    serviceRequestWatcher?: any;
    serviceRequestStatusHistories: ServiceRequestStatusHistory[];
    serviceRequestWatchers: any[];
    serviceRequestPriorities: ServiceRequestPriority[];
}

export class AdminGroup {
    adminGroupId: number;
    adminGroupName: string;
    description: string;
    email: string;
    isActive: string;
    moduleCode: number;
    person: any;
    primaryPersonId: string;
    role: Role;
    roleId: number;
    updateTimestamp: number;
    updateUser: string;
}

export interface Role {
    createTimeStamp: number;
    createUser: string;
    description: string;
    roleId: number;
    roleName: string;
    roleType: RoleType;
    roleTypeCode: string;
    statusFlag: string;
    updateTimeStamp: number;
    updateUser: string;
}

export interface RoleType {
    isActive: boolean;
    roleType: string;
    roleTypeCode: string;
}

export interface ServiceRequestModule {
    activeFlag: string;
    description: string;
    instruction: string;
    moduleCode: number;
    sortOrder: string;
    subject: string;
    typeCode: string;
    updateTimestamp: number;
    updateUser: string;
}

export interface PrintTemplates {

    letterTemplateTypeCode: string;
    fileName: string;
    correspondenceTemplate?: any;
    contentType: string;
    moduleCode: number;
    subModuleCode?: any;
    printFileType: string;
    updateTimestamp?: any;
    updateUser?: any;
    active?: any;
}

export interface UserSelectedTemplate {

    letterTemplateTypeCode: string;
    fileName: string;
    correspondenceTemplate?: any;
    contentType: string;
    moduleCode: number;
    subModuleCode?: any;
    printFileType: string;
    updateTimestamp?: any;
    updateUser?: any;
    active?: any;
}

export class CompleterOptions {
    arrayList: any[];
    contextField: string;
    filterFields: string;
    formatString: string;
    defaultValue = '';
}

export class Watcher {
    watcherId: number;
    watcherName: string;
    serviceRequestId: number;
    actionLogId: number;
    watcherPersonId: string;
    emailId: string;
}

export class ModuleDetails {
    accountNumber: string;
    agreementReqName: string;
    agreementType: string;
    anticipatedTotal: string;
    applicationId: string;
    endDate: number;
    fundingScheme: string;
    fundingSchemeCode: string;
    fundingSchemeName: string;
    leadUnitName: string;
    leadUnitNumber: string;
    moduleCode: number;
    moduleId: number;
    moduleItemId: number;
    moduleItemKey: string;
    moduleStatus: string;
    obligatedTotal: string;
    personId: string;
    piName: string;
    piPersonId: string;
    piRolodexId: string;
    primeSponsorCode: string;
    rolodexId: string;
    sponsor: string;
    sponsorAwardNumber: string;
    sponsorCode: string;
    sponsorName: string;
    startDate: number;
    status: string;
    title: string;
    totalCost: string;
    totalProjectValue: number;
}

export class ServiceRequestHistory {
    serviceRequestId: number;
    actionLogId?: number;
    typeCode?: string;
    serviceRequestType?: ServiceRequestType;
    previousTypeCode?: string;
    previousServiceRequestType?: ServiceRequestType;
    moduleCode?: number;
    requestModule?: ServiceRequestModule;
    previousModuleCode?: number;
    previousRequestModule?: ServiceRequestModule;
    subject?: string;
    previousSubject?: string;
    description?: string;
    previousDescription?: string;
    reporterPersonId?: string;
    reporterName?: string;
    assigneePersonId?: string;
    assigneeName?: string;
    updateTimestamp?: number;
    updateUser?: string;
    previousAssigneePersonId?: string;
    previousAssigneePersonName?: string;
    moduleItemKey?: string;
    previousModuleItemKey?: string;
    priorityId?: number;
    adminGroupId?: number;
    previousPriorityId?: number;
    previousAdminGroupId?: number;
    unitNumber: string;
    previousUnitNumber: string;
}

export class AssignRequest {
    serviceRequestId: number;
    isReturnServiceRequest: boolean;
    assigneePersonId: string;
    assigneePersonName: string;
    adminGroupId: number;
    serviceRequestComment: any;
    isAddAsWatcher = false;
    serviceRequestHistory: ServiceRequestHistory = new ServiceRequestHistory();
    adminGroup: AdminGroup;
    newAttachments: any[] = [];
}

export class ValidationObject {
    moduleCode = 20;
    subModuleCode = 0;
    moduleItemKey: any = '';
}
