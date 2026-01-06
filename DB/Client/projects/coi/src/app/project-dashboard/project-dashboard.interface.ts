import { CA_DASH_PROJECT_LOCALIZE } from "../app-locales";

export const PROJECT_NOTIFICATION_SLIDER_ID = 'coi-project-notification-slider';
export const COMMENTS_DELETE_MODAL_ID = 'project-overview-cmnt-delete-confirm-modal';
export const MANDATORY_MARKING_MODAL_ID = 'project-dashboard-disc-mandatory-confirm-modal'

export const DEV_PROPOSAL_SUBMISSION_STATUS = [
    {
        description: "Not Required",
        code: "Not Required"
    },
    {
        description: CA_DASH_PROJECT_LOCALIZE.PROJECT_OVERALL_SUBMISSION_STATUS.Pending,
        code: "Pending"
    },
    {
        description: CA_DASH_PROJECT_LOCALIZE.PROJECT_OVERALL_SUBMISSION_STATUS.Completed,
        code: "Completed"
    },
    {
        description: "To be determined",
        code: "To be determined"
    }
];

export const AWARD_SUBMISSION_STATUS = [
    {
        description: "Not Required",
        code: "Not Required"
    },
    {
        description: CA_DASH_PROJECT_LOCALIZE.PROJECT_OVERALL_SUBMISSION_STATUS["Yet to disclose"],
        code: "Yet to disclose"
    },
    {
        description: CA_DASH_PROJECT_LOCALIZE.PROJECT_OVERALL_SUBMISSION_STATUS.Pending,
        code: "Pending"
    },
    {
        description: CA_DASH_PROJECT_LOCALIZE.PROJECT_OVERALL_SUBMISSION_STATUS.Completed,
        code: "Completed"
    }
];

export type RecipientGroup = 'TO' | 'CC' | 'BCC' | null;
export type ContentRole = 'label' | 'title' | 'aria-label';

export class ProjectOverviewCommentFetch {
    commentTypeCode: any = null;
    moduleCode: any = null;
    moduleItemKey: any = null;
    parentCommentId: any = null;
}

// 1 = ascending , 2 = descending
export class SortCountObj {
    [key: string]: number;

    coiDisclosureNumber = 0;
    disclosurePersonFullName = 0;
    disclosureCategoryType = 0;
    disclosureStatus = 0;
    dispositionStatus = 0;
    reviewStatus = 0;
    expirationDate = 0;
    certificationDate = 0;
    travellerName = 0;
    travelEntityName = 0;
    travelState = 0;
    travelCountry = 0;
    travelCity = 0;
    documentStatusDescription = 0;
    reviewDescription = 0;
    certifiedAt = 0;
    travelExpirationDate = 0;
    travelDisclosureStatusDescription = 0;
    updateTimeStamp = 2;
    dispositionStatusDescription = 0;
    entityName = 0;
    fullName = 0;
    reviewStatusDescription = 0;
    projectSubmissionStatus = 1;
    projectReviewStatus = 2;
    title = 0;
    updateTimestamp = 0;
    leadUnitName = 0;
    sponsorName = 0;
    primeSponsorName = 0;
}

export class ProjectDashboardSearchRequest{
    [key: string]: any;
    projectDashboardData = new CoiProjectOverviewRequest();
  }

export class CoiProjectOverviewRequest {
    property2 = null;
    property3 = null;
    property6 = null;
    property4 = [];
    property5 = [];
    property9 = null;
    property11 = null;
    property13 = null;
    property14 = null;
    accountNumber = null;
    piPersonIdentifier = null;
    personIdentifier = null;
    caPersonIdentifier = null;
    pageNumber = 20;
    currentPage = 1;
    isDownload = true;
    advancedSearch = 'L';
    fieldSortOrders: { [key: string]: boolean } = {};
    fieldSortDefaultValues: { [key: string]: string } = {};
    sort: any = {  projectSubmissionStatus: 'asc',
                   projectReviewStatus: 'desc', };
    tabName = '';
    coiSubmissionStatus = [];
    freeTextSearchFields = [];
}

export class ProjectOverview {
    projectCount: number | null = null;
    projectOverviewDetails: ProjectOverviewDetails[] = [];
    proposalCount: number | null = null;
}

export interface ProjectOverviewDetails {
    keyPersonCount: number;
    keyPersonDetails: KeyPersonDetail[];
    projectDetails: ProjectDetails;
}

export class KeyPersonDetail {
    coiDisclProjectId: any;
    moduleCode: any;
    projectId: any;
    projectNumber: any;
    title: any;
    projectStatus: any;
    projectStartDate: any;
    projectEndDate: any;
    homeUnitNumber: string;
    homeUnitName: string;
    leadUnitNumber: any;
    leadUnitName: any;
    sponsorName: any;
    sponsorCode: any;
    primeSponsorName: any;
    primeSponsorCode: any;
    piName: any;
    keyPersonId: string;
    keyPersonName: string;
    keyPersonRole: string;
    reporterRole: any;
    conflictStatus: any;
    conflictStatusCode: any;
    entityCount: any;
    relationShipExists: any;
    conflictCompleted: any;
    conflictCount: any;
    projectTypeCode: any;
    projectType: any;
    projectBadgeColour: any;
    questionnaireCompleted: any;
    disclsoureNeeded: any;
    inCompleteCount: any;
    completeCount: any;
    disclosureId: number
    trainingCompleted: any;
    certification: any;
    disclosureRequired: any;
    updateTimestamp: any;
    disclosureStatus: any;
    proposalCount: any;
    commentCount: any;
    keyPersonCount: any;
    projectIcon: any;
    certificationFlag: any;
    disclosureRequiredFlag: any;
    coiDisclEntProjDetails: any;
    accountNumber: any;
    documentNumber: any;
    personSubmissionStatus: string;
    personReviewStatus: string;
    projectSubmissionStatus: any;
    projectReviewStatus: any;
    pck: any;
    sponsorRequirement: any;
    mandatorySelf: any;
    resubmissionFlag: any;
    info: any;
    personNonEmployeeFlag: 'Y' | 'N' | null;
    personCommentCount: number;
}

export class ProjectDetails {
    moduleCode: any
    projectId: string
    projectNumber: any
    title: string
    projectStatus: string
    projectStartDate: number
    projectEndDate: number
    homeUnitNumber: any
    homeUnitName: any
    leadUnitNumber: string
    leadUnitName: string
    sponsorName: string
    sponsorCode: string
    primeSponsorName?: string
    primeSponsorCode?: string
    piName: any
    keyPersonId: any
    keyPersonName: any
    keyPersonRole: any
    reporterRole: any
    conflictStatus: any
    conflictStatusCode: any
    entityCount: any
    relationShipExists: any
    sfiCompleted: any
    disclosureStatusCount: any
    projectTypeCode: string
    projectType: string
    projectBadgeColour: any
    disclosureSubmitted: any
    questionnaireCompleted: boolean
    disclsoureNeeded: any
    projectReviewStatus: any
    proposalStatus: string
    inCompletCount: number
    completeCount: number
    disclosureId: any
    updateTimestamp: any
    proposalCount: any
    commentCount: number;
    projectIcon: string;
    documentNumber: string;
    accountNumber: any;
    pck: any;
    sponsorRequirement: any;
    mandatorySelf: string;
    resubmissionFlag: string;
}

export class CoiProjectOverviewComment {
    commentTypeCode: any = null;
    commentType: any = null;
    parentCommentId: any = null;
    isPrivate: boolean = false;
    comment: any = null;
    moduleItemKey: any = null;
    moduleCode: any = null;
    commentId: any = null;
}

export class NotificationObject {
    subject: string;
    message: string = '';
    moduleItemKey: string;
    recipients: Recipient[]= [];
    description: string;
    disclosureId: number;
    notifyType: string;
    notificationTypeId: string;
    personId: string;
    projectTypeCode: string;
    projectId: string;
  }

  export class NotificationTypeRO{
      moduleCode: number = 8;
      subModuleCode: number = 0;
      showTemplateInModule = true
  }

  export class Recipient {
    recipientName = '';
    recipientPersonId = '';
    recipientType: RecipientGroup = 'TO';
}

export interface ContactPersonDetails {
    phone_nbr: string
    directory_title: string
    email_addr: string
    unit_name: string
    prncpl_nm: string
    addr_line_1: any
    unit_number: string
    primary_title: string
    prncpl_id: string
    full_name: string
  }


export class NameObject {
    personName = '';
    departmentName = '';
    sponsorName = '';
    primeSponsorName = '';
    piPersonName = '';
    caPersonName = '';
}

export interface LookupArrayForAwardStatus {
    description: string
    code: string
  }

export interface NotificationDetails {
    notificationLogId: number;
    notificationTypeId: number;
    moduleItemKey: string | number;
    moduleSubItemKey: string | number;
    moduleCode: number;
    subject: string;
    message: string;
    sendDate: number;
    requestedBy: string | number;
    messageId: string | number;
    actionType: string;
    notificationLogRecipients: NotificationRecipient[];
    fromUserFullName: string | number;
}

export interface NotificationRecipient {
    notificationLogRecipientId: number;
    notificationLogId: number;
    recipientEmailId: string | number;
    recipientPersonId: string | number;
    roleTypeCode: string | number;
    recipientFullName: string;
}

export interface NotificationHistoryRO {
    publishedUserId: string | number;
    disclosureId: string | number;
    projectId: string | number;
    actionType: string;
}

export interface ProjectDashboardComment {
    commentId: number;
    commentBy: number;
    parentCommentId: number;
    comment: string;
    commentTypeCode: number;
    commentType: CommentType;
    moduleCode: number;
    isPrivate: boolean;
    moduleItemKey: string;
    updateTimestamp: number;
    updatedBy: string;
    updateUserFullName: string;
    childComments: ProjectDashboardComment[] | null;
    projectTitle: string;
    replyCommentsCountRequired: boolean | null;
    isParentCommentResolved: boolean;
    isResolved: boolean;
    resolvedBy: number | string;
    resolvedTimestamp: number;
    resolvedUserFullName: string;
}

export interface CommentType {
    commentTypeCode: number;
    description: string;
    updateTimestamp: number;
    updatedBy: string;
    isActive: boolean;
}
