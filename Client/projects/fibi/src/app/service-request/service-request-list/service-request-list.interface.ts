export interface UnitAdministratorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface UnitAdministrator {
    personId: string;
    fullName?: any;
    oldPersonId?: any;
    oldUnitAdministratorTypeCode?: any;
    unitAdministratorTypeCode: string;
    unitNumber: string;
    unitName?: any;
    updateTimestamp: any;
    updateUser: string;
    unitAdministratorType: UnitAdministratorType;
}

export interface ServiceRequest {
    serviceRequestId: number;
    statusCode?: any;
    serviceRequestStatus?: any;
    typeCode?: any;
    serviceRequestType?: any;
    moduleCode?: any;
    serviceRequestModule?: any;
    moduleItemKey?: any;
    subject: string;
    description?: any;
    reporterPersonId?: any;
    assigneePersonId?: any;
    unitNumber?: any;
    unit?: any;
    originatingModuleItemKey?: any;
    createTimestamp?: any;
    createUser?: any;
    updateTimestamp: any;
    updateUser?: any;
    isSystemGenerated?: any;
    priorityId?: any;
    serviceRequestPriority?: any;
    adminGroupId?: any;
    adminGroup?: any;
    createUserFullName?: any;
    updateUserFullName?: any;
    moduleDetails?: any;
    submitUserFullName?: any;
    createdPersonName?: any;
    serviceRequestTypeData: string;
    serviceRequestStatusData: string;
    unitName: string;
    reporterPersonName?: any;
    assigneePersonName?: any;
    sRPriority: string;
    serviceRequestCategory: string;
}

export class ServiceRequestList {
    dashBoardDetailMap?: any;
    dashBoardResearchSummaryMap?: any;
    totalServiceRequest: number;
    serviceRequestCount?: any;
    pageNumbers?: any;
    personDTO?: any;
    encryptedUserName?: any;
    awardViews?: any;
    proposalViews?: any;
    iacucViews?: any;
    disclosureViews?: any;
    expenditureVolumes?: any;
    summaryViews?: any;
    summaryAwardPieChart?: any;
    summaryProposalPieChart?: any;
    summaryProposalDonutChart?: any;
    summaryAwardDonutChart?: any;
    grantCalls?: any;
    proposal?: any;
    unitAdministrators: UnitAdministrator[];
    workflowList?: any;
    negotiationsList?: any;
    instituteProposal?: any;
    agreementHeaderList?: any;
    serviceRequestList: ServiceRequest[];
    finalEvaluationStatus?: any;
    unitsWithRights?: any;
    canCopyAward: boolean;
    progressReportViews?: any;
    quickLinks?: any;
    userSelectedWidgets?: any;
    widgetLookups?: any;
    userSelectedWidget?: any;
    widgetDatas?: any;
    isGrantcallAbbrevationRequired: boolean;
    isBudgetVersionEnabled: boolean;
    persons?: any;
    agreementAdminGroups?: any;
    inProgressCount?: any;
    newSubmissionCount?: any;
    allAgreementCount?: any;
    allPendingAgreementCount?: any;
    myPendingAgreementCount?: any;
    adminInProgressCount?: any;
    agreementView?: any;
}

export class AdvanceSearch {
    tabName = 'ALL_REQUEST';
    serviceRequestId = '';
    serviceRequestSubject = '';
    moduleCodes: any[] = [];
    srTypeCodes: any[] = [];
    srStatusCodes: any[] = [];
    unitName = '';
    unitNumber: number;
    srPriorities: any[] = [];
    currentPage = 1;
    pageNumber = 20;
    sort: any = {};
    sortBy = 'updateTimeStamp';
    reverse = 'DESC';
    advancedSearch = 'L';
    awardNumber: number;
    fullName: string;

    constructor (tab?: string) {
        if (tab) {
            this.tabName = tab;
        }
    }
}
