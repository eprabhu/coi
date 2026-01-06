import { DashboardProjectCount, LookUpClass } from "../common/services/coi-common.interface";
import { ModulesConfiguration } from "../shared/common.interface";

export const PROJECT_NOTIFICATION_SLIDER_ID = 'coi-project-notification-slider';
export const COMMENTS_DELETE_MODAL_ID = 'project-overview-cmnt-delete-confirm-modal';

export type RecipientGroup = 'TO' | 'CC' | 'BCC' | null;
export type AdminPathType = 'DISCLOSURES' | 'TRAVEL_DISCLOSURES' | 'CONSULTING_DISCLOSURES' | 'PROJECTS' | 'OPA_DISCLOSURES' | 'CMP';
export type ContentRole = 'label' | 'title' | 'aria-label';
export type DisclosureStatusFilterType = 'ALL' | 'NO_CONFLICT_WITHOUT_ENGAGEMENTS' | 'NO_CONFLICT_WITHOUT_PROJECTS' | 'NO_CONFLICT_WITHOUT_PROJECTS_AND_ENGAGEMENTS' | null;

export class ProjectOverview {
    projectOverviewDetails: ProjectOverviewDetails[] = [];
    proposalCount: number | null = null;
}

export interface ProjectOverviewDetails {
    keyPersonCount: number;
    keyPersonDetails: KeyPersonDetail[];
    projectDetails: ProjectDetails;
}
export class KeyPersonDetail {
    moduleCode: any
    projectId: any
    projectNumber: any
    title: any
    projectStatus: any
    projectStartDate: any
    projectEndDate: any
    homeUnitNumber: string
    homeUnitName: string
    leadUnitNumber: any
    leadUnitName: any
    sponsorName: any
    sponsorCode: any
    primeSponsorName: any
    primeSponsorCode: any
    piName: any
    keyPersonId: string
    keyPersonName: string
    keyPersonRole: string
    reporterRole: any
    conflictStatus: any
    conflictStatusCode: any
    entityCount: any
    relationShipExists: any
    sfiCompleted: any
    disclosureStatusCount: any
    projectTypeCode: any
    projectType: any
    projectBadgeColour: any
    disclosureSubmitted: boolean
    questionnaireCompleted: any
    disclsoureNeeded: any
    personReviewStatus?: string
    proposalStatus: any
    inCompletCount: any
    completeCount: any
    disclosureId: number
}

export interface ProjectDetails {
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
    accountNumber: any
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
    personId = null;
    pageNumber = 20;
    currentPage = 1;
    isDownload = true;
    advancedSearch = 'L';
    fieldSortOrders: { [key: string]: boolean } = {};
    fieldSortDefaultValues: { [key: string]: string } = {};
    sort: any = {  "projectSubmissionStatus": 'asc',
                   "projectReviewStatus": 'desc', };
    tabName = '';
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

export class projectOverviewCommentFetch {
    commentTypeCode: any = null;
    moduleCode: any = null;
    moduleItemKey: any = null;
    parentCommentId: any = null;
}

export class CoiDashboardRequest {
    isDownload = false;
    property1 = null;
    property2 = null;
    property3 = null;
    property4 = [];
    property5 = [];
    property6 = null;
    property7 = null;
    property8 = null;
    property9 = null;
    property10 = [];
    property11 = null;
    property12 = null;
    property13 = null;
    property14 = null;
    property15 = null;
    property20 = [];
    property21 = [];
    property22 = null;
    property23 = null;
    property24 = null;
    property25 = null;
    property26 = null;
    pageNumber = 20;
    sort: any = { 'updateTimeStamp': 'desc' };
    tabName = '';
    advancedSearch = 'L';
    currentPage = 1;
    filterType: DisclosureStatusFilterType = null;
    freeTextSearchFields = [];

    constructor(tabName?) {
        this.tabName = tabName ? tabName : 'ALL_DISCLOSURES';
        this.filterType = tabName === 'NEW_SUBMISSIONS_WITHOUT_SFI' ? 'ALL' : null;
    }
}
export class CmpDashboardRequest {
    isDownload = false;
    cmpPerson = null;
    cmpRolodex = null;
    entity = null;
    cmpTypeCode = [];
    cmpStatusCode = [];
    approvalStartDate = null;
    approvalEndDate = null;
    expirationStartDate = null;
    expirationEndDate = null;
    projectNumber = null;
    projectTitle = null;
    leadUnit = null;
    sponsorAwardNumber = null;
    principleInvestigator = null;
    sponsor = null;
    homeUnit = null;
    pageNumber = 20;
    sort: any = { 'updateTimeStamp': 'desc' };
    advancedSearch = 'L';
    currentPage = 1;
    freeTextSearchFields = [];
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
    cmpType = 0;
    homeUnitName = 0;
}

export class NameObject {
    entityName = '';
    personName = '';
    rolodexName = '';
    departmentName = '';
    travelCountryName = '';
    piPersonName = '';
    sponsorName = '';
    leadUnitName = '';
    employeeType: 'PERSON' | 'ROLODEX' = 'PERSON';
}

export class CoiDashboardDisclosures {
    coiDisclosureId: number;
    disclosureId: number;
    opaDisclosureId: number;
    opaDisclosureNumber: number;
    documentNumber: any;
    coiDisclosureNumber: number;
    sequenceNumber: any;
    personId: string;
    fullName: any;
    dispositionStatusCode: string;
    dispositionStatus: string;
    conflictStatusCode: any;
    conflictStatus: any;
    moduleItemKey: any;
    discActiveStatus: any;
    expirationDate: any;
    updateTimeStamp: number;
    updateUser: string;
    updateUserFullName: any;
    createUser: any;
    versionStatus: string;
    reviewStatus: string;
    submittedDate: any;
    lastApprovedVersion: number;
    noOfSfiInActive: any;
    noOfSfiInPending: any;
    noOfAwardInPending: any;
    noOfProposalInPending: any;
    noOfAwardInActive: any;
    noOfProposalInActive: any;
    createTimestamp: any;
    disclosureVersionNumber: number;
    disclosurePersonFullName: string;
    fcoiTypeCode: string;
    fcoiType: string;
    lastApprovedVersionDate: any;
    reviseComment: any;
    reviewStatusCode: string;
    reviewId: any;
    reviewDescription: any;
    reviewerStatusCode: any;
    reviewerStatus: any;
    reviewerFullName: any;
    noOfSfi: number;
    certifiedAt: any;
    unit: Unit
    travelDisclosureId: any;
    travelStartDate: any;
    travelEndDate: any;
    acknowledgeBy: any;
    destination: any;
    purpose: any;
    acknowledgeDate: any;
    travelDisclosureNumber: any;
    description: any;
    disclosurestatus: any;
    homeUnitName: any;
    homeUnit: any;
    adminGroupName: any;
    administrator: any;
    department: any;
    travelDisclosureStatus: any;
    travelEntityName: any;
    travellerName: any;
    travelAmount: any;
    travelReviewStatus: any;
    travelSubmissionDate: any;
    travelExpirationDate: any;
    travelPurpose: any;
    certificationDate: any;
    unitDetails: any;
    travelCity: any;
    travelCountry: any;
    travelState: any;
    travellerTypeCode: any;
    travellerTypeDescription: any;
    travelDisclosureStatusCode: any;
    travelDisclosureStatusDescription: any;
    documentStatusCode: any;
    documentStatusDescription: any;
    adminPersonId: any;
    adminGroupId: any;
    unitName: any;
    reviewerList: any;
    coiProjectTypeCode: string;
    projectCount: DashboardProjectCount[];
    projectNumber: string;
    projectTitle: string;
    projectBadgeColor: string;
    projectIcon: string;
    projectType: string;
    projectHeader?: string = '';
    consultingDislosureId: string | number;
    travelNumber: string | number;
    disclosureAttachmentCount: number;
    isHomeUnitSubmission: boolean | null = null;
    versionNumber?: string| number;
    cmpId?: string | number;
    isShowCommentBtn = false; // for frontend
    isShowAssignAdminBtn = false; // for frontend
    cardType: string; // for frontend
}

export interface Unit {
    unitNumber: string;
    parentUnitNumber: any;
    organizationId: string;
    unitName: string;
    updateTimestamp: any;
    updateUser: any;
    acronym: any;
    isFundingUnit: any;
    unitAdministrators: any[];
    unitDetail: string;
    parentUnitName: any;
    organizationName: any;
}

export class Recipient {
    recipientName = '';
    recipientPersonId = '';
    recipientType: RecipientGroup = 'TO';
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

export interface AdminDashboardResolvedData {
    moduleConfig: ModulesConfiguration;
    lookupArrayForAdministrator: LookUpClass[];
}

export interface AdminDashboardTabCount {
    newSubmissionTabCount: number;
    newSubmissionWithoutSfiTabCount: number;
    myReviewsTabCount: number;
    allReviewsTabCount: number;
}
