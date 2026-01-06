export class AwardDashboardRequest{  
    property1: string = '';
    property2: string = '';
    property3: string = '';
    property4: string = '';
    property5: string = '';
    property6: string = '';
    property7: string = '';
    property8: any[]  = [];
    property9: string  = '';
    property10: string  = '';
    property11: any[] = [];
    property12: string  = '';
    property13: any[] = [];
    property14: any[] = [];
    property15: any[] = [];
    pageNumber: number = 20;
    sort: any = {};
    tabName: string = 'MY_AWARDS';
    advancedSearch: string = 'L';
    sortBy: string = 'updateTimeStamp';
    currentPage: number = 1;  
    fullName: string;
    grantCallName: string;
    unitName: string; 
}

export interface ResearchType {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ResearchType2 {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ResearchTypeArea {
    researchTypeAreaCode: string;
    description: string;
    researchTypeCode: string;
    researchType: ResearchType2;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface ResearchType3 {
    researchTypeCode: string;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface ResearchTypeArea2 {
    researchTypeAreaCode: string;
    description: string;
    researchTypeCode: string;
    researchType: ResearchType3;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface ResearchTypeSubArea {
    researchTypeSubAreaCode: string;
    description: string;
    researchTypeAreaCode: string;
    researchTypeArea: ResearchTypeArea2;
    isActive: boolean;
    updateTimeStamp: number;
    updateUser: string;
}

export interface areaOfResearchAward {
    researchAreaId: number;
    awardId: number;
    awardNumber: string;
    sequenceNumber: number;
    researchTypeCode: string;
    researchType: ResearchType;
    researchTypeAreaCode: string;
    researchTypeArea: ResearchTypeArea;
    researchTypeSubAreaCode: string;
    researchTypeSubArea: ResearchTypeSubArea;
    updateTimeStamp: number;
    updateUser: string;
}

export interface AwardDashboardItem {
    awardId: number;
    awardNumber: string;
    sequenceNumber?: any;
    documentNumber?: any;
    accountNumber?: any;
    title: string;
    status: string;
    sponsor: string;
    sponsorCode: string;
    unitNumber?: any;
    unitName: string;
    updateTimeStamp?: any;
    updateUser?: any;
    fullName: string;
    personId?: any;
    total_cost?: any;
    awardDocumentType: string;
    grantCallTitle?: any;
    awardType?: any;
    awardSequenceStatus: string;
    workflowAwardStatusCode: string;
    awardWorkflowStatus: string;
    awardVariationType?: any;
    sponsorAwardNumber?: any;
    claimId?: any;
    claimNumber?: any;
    claimSubmissionDate?: any;
    createUserName?: any;
    updateUserName?: any;
    claimUpdateTimeStamp?: any;
    awardStartDate?: any;
    awardEndDate?: any;
    lastClaimEndDate?: any;
    progressReportNumber?: any;
    progressReportId?: any;
    progressReportStatus?: any;
    reportTrackingId?: any;
    reportClassCode?: any;
    dueDate?: any;
    financeOfficer?: any;
    reportClassDescription?: any;
    claimStatus?: any;
    submittedDate?: any;
    reportType?: any;
    claimStatusCode?: any;
}

