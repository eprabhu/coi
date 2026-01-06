export interface InvoiceAdvanceSearch {
    property4: string[];
    property7?: any;
    property8?: any;
    property9?: any;
    property10?: any;
    property11?: any;
    isAdvanceSearch: string;
    batchId?: any;
    tabName: string;
    sort: Sort;
    currentPage: number;
    pageNumber: number;
    sortBy?: string;
    reverse?: string;
}

export interface Sort {
}

export interface InvoiceFeedType {
    feedTypeCode: string;
    description: string;
    isActive: string;
    updateTimeStamp: number;
    updateUser: string;
}

export interface InvoiceFeedStatus {
    feedStatusCode: string;
    description: string;
    isActive: string;
    updateTimestamp: number;
    updateUser: string;
}

export interface InvoiceFeedUserAction {
    userActionCode: string;
    userAction: string;
    description: string;
    comment: string;
    isActive: string;
    createTimestamp: number;
    updateTimeStamp: number;
    updateUser?: any;
}

export interface InvoiceClaimFeed {
    feedId: number;
    batchId: number;
    claimId: number;
    claimNumber: string;
    invoiceId: number;
    sequenceNumber: number;
    feedType: string;
    sapFeedType: InvoiceFeedType;
    feedStatus: string;
    sapFeedStatus: InvoiceFeedStatus;
    userActionCode: string;
    sapFeedUserAction: InvoiceFeedUserAction;
    createTimestamp: number;
    createUser: string;
    updateTimeStamp: number;
    updateUser: string;
    userComment?: any;
    businessArea: string;
    noFeedFlag: boolean;
}

export interface InvoiceClaimFeedBatch {
    batchId: number;
    noOfRecords: number;
    createTimestamp?: any;
    responseTimestamp?: any;
    updateUser: string;
    errorCount: number;
}

export interface InvoiceFeedDetails {
    pageNumber: number;
    sort: Sort;
    property1?: any;
    property2?: any;
    property3?: any;
    property4: string[];
    property5?: any;
    property6?: any;
    currentPage: number;
    sapAwardFeeds?: any;
    sapFeedStatus?: any;
    feedId?: any;
    isAdvanceSearch: string;
    tabName: string;
    feedIds?: any;
    userComment?: any;
    userAction?: any;
    changeType?: any;
    sapAwardFeedHistory?: any;
    batchId?: any;
    awardId?: any;
    award?: any;
    isViewInvoiceFeedRightExist: boolean;
    personId: string;
    sapFeedMaintenanceDto?: any;
    message?: any;
    sapFeedUserActions?: any;
    sapFeedUserAction?: any;
    sapClaimFeeds: InvoiceClaimFeed[];
    sapClaimFeedBatch: InvoiceClaimFeedBatch;
    property7?: any;
    property8?: any;
    property9?: any;
    claimInvoiceFeedDtoList?: any;
    totalCount: number;
    claimNumbers?: any;
}

export class BatchDetails implements InvoiceAdvanceSearch {
    currentPage = 1;
    isAdvanceSearch = 'A';
    pageNumber = 20;
    property4: string[] = ['E'];
    property7 = null;
    property8 = null;
    property9 = null;
    property10 = null;
    property11 = null;
    batchId = null;
    sort: Sort = {};
    tabName = 'BATCH_DETAIL';
    sortBy = '';
    reverse = ''
}

export class BatchHistory implements InvoiceAdvanceSearch {
    currentPage = 1;
    isAdvanceSearch = 'A';
    pageNumber = 20;
    property4: string[] = [''];
    property7 = null;
    property8 = null;
    property9 = null;
    property10 = null;
    property11 = null;
    batchId = null;
    sort: Sort = {};
    tabName = 'BATCH_HISTORY';
    sortBy = '';
    reverse = ''
}

export class PendingFeed implements InvoiceAdvanceSearch {
    currentPage = 1;
    isAdvanceSearch = 'A';
    pageNumber = 20;
    property4: string[] = ['P'];
    property7 = null;
    property8 = null;
    property9 = null;
    property10 = null;
    property11 = null;
    batchId = null;
    sort: Sort = {};
    tabName = 'PENDING_FEEDS';
    sortBy = '';
    reverse = ''
}
export interface claimInvoice {
    claimInvoiceLogId: number;
    invoiceId: number;
    sequenceNumber: number;
    claimId: number;
    claimNumber: string;
    documentTypeCode: string;
    currencyCode: string;
    documentHeaderText: string;
    customerEmailAddress: string;
    requesterEmailAddress: string;
    headerPostingKey: string;
    documentDate: number;
    baseDate: number;
    companyCode: string;
    particulars1: string;
    particulars2: string;
    particulars3?: any;
    particulars4?: any;
    contactTelephoneNo: string;
    inputDocumentNumber?: any;
    fiscalYear: string;
    actionIndicator: string;
    batchId: number;
    typeCode: string;
    assignmentField: string;
    description?: any;
    glAccountCode: string;
    outputDocumentNumber: string;
    grantCode: string;
    profitCentre: string;
    status: string;
    updateTimeStamp: number;
    updateUser: string;
}

export interface SapFeedUserActions {
    comment: string;
    createTimestamp: number;
    description: string;
    invoiceDescription: string;
    isActive: string;
    updateTimeStamp: number;
    updateUser: string;
    userAction: string;
    userActionCode: string;
}
