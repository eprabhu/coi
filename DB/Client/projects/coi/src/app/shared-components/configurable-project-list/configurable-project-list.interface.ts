import { PAGINATION_LIMIT, ProjectTypeCodes } from "../../app-constants";
import { COMMON_DISCL_LOCALIZE } from "../../app-locales";
import { SharedProjectDetails, SuccessErrorType } from "../../common/services/coi-common.interface";

export type ProjectConfigActionType = 'REFRESH' | 'SEARCH' | 'PAGINATION' | 'GET_ACTIVE_DISCLOSURE' | 'COUNT_CHANGE';
export type ProjectConfigInpActionType = 'SEARCH' | 'PAGINATION' | 'CREATE_DISCLOSURE_BTN' | 'LINK_DISCLOSURE_BTN' | 'VIEW_DISCLOSURE_BTN';
export class UserProjectFetchRO {
    searchWord = '';
    currentPage = 1;
    paginationLimit = PAGINATION_LIMIT;
}

export class UserProposalFetchRO {
    currentPage = 1;
    searchKeyword = ''
    isUnlimited = false;
    pageNumber = PAGINATION_LIMIT;
}

export class UserProjectsCountRO extends UserProposalFetchRO {
    isUnlimited = true;
}

export type UserProjectsCountResponse = Partial<Record<ProjectTypeCodes | 'totalCount', number>>

export interface ProjectConfigAction {
    action: ProjectConfigActionType,
    apiStatus: SuccessErrorType,
    searchText: string,
    projectList: UserProjectDetails[],
    currentPageNumber: number,
    projectCardList: Record<string, SharedProjectDetails>
}

export interface ProjectConfigInputAction {
    action: ProjectConfigInpActionType,
    searchText?: string,
    currentPageNumber?: number,
    selectedProject?: UserProjectDetails
}

export class UserProjectDetails {
    coiDisclProjectId?: string = null;
    moduleCode?: string = null;
    projectId?: string = null;
    projectNumber?: string = null;
    title?: string = null;
    projectStatus?: string = null;
    projectStartDate?: number = null;
    projectEndDate?: number = null;
    homeUnitNumber?: string = null;
    homeUnitName?: string = null;
    leadUnitNumber?: string = null;
    leadUnitName?: string = null;
    sponsorName?: string = null;
    sponsorCode?: string = null;
    primeSponsorName?: string = null;
    primeSponsorCode?: string = null;
    piName?: string = null;
    keyPersonId?: string = null;
    keyPersonName?: string = null;
    keyPersonRole?: string = null;
    reporterRole?: string = null;
    conflictStatus?: string = null;
    conflictStatusCode?: string = null;
    entityCount?: number = null;
    relationShipExists?: boolean;
    conflictCompleted?: boolean;
    conflictCount?: number = null;
    projectTypeCode?: string = null;
    projectType?: string = null;
    projectBadgeColour?: string = null;
    disclosureSubmitted?: boolean;
    questionnaireCompleted?: boolean;
    disclsoureNeeded?: boolean;
    disclosureReviewStatus?: string = null;
    submissionStatus?: string = null;
    inCompleteCount?: number = null;
    completeCount?: number = null;
    disclosureId?: string = null;
    trainingCompleted?: boolean;
    certification?: boolean;
    disclosureRequired?: boolean;
    updateTimestamp?: number = null;
    disclosureStatus?: string = null;
    proposalCount?: number = null;
    commentCount?: number = null;
    keyPersonCount?: number = null;
    projectIcon?: string = null;
    certificationFlag?: boolean;
    disclosureRequiredFlag?: boolean;
    coiDisclEntProjDetails?: any;
    accountNumber?: string = null;
    documentNumber?: string = null;
}

export class UserProjectsResponse {
    projects: UserProjectDetails[] = [];
    count: number = null;
}

export class ProjectListConfiguration {
    uniqueId = '';
    searchText = '';
    newEngCreatedMsg? = '';
    currentPageNumber = 1;
    projectTypeCode = null;
    isSliderOrModal = true;
    isShowConfirmationModal = true;
    isShowCreateDisclosureBtn = true;
    paginationLimit = PAGINATION_LIMIT;
    customClass = 'coi-nav-tab-sticky coi-bg-body';
    triggeredFrom: 'CREATE_MODAL' | 'MY_PROJECTS' = 'MY_PROJECTS';
}

export class CurrentHomeUnit {
    homeUnit = '';
    unitName = '';
    unitNumber = '';
}

export const PROJECT_INFO_TEXT_FORMAT = `To disclose your {PROJECT_TYPE}s, select <strong>'Create Disclosure'</strong> to create individual disclosures for each {PROJECT_TYPE}`;
export const INITIAL_REVISE_INFO_TEXT_FORMAT = `, or choose <strong>'{INITIAL_REVISION_BTN_NAME}'</strong> to disclose all your {PROJECT_TYPE}s`;
export const DISCLOSURE_SUBMITTED_INFO_TEXT_FORMAT = `, or please <strong>${COMMON_DISCL_LOCALIZE.TERM_WITHDRAW.toLowerCase()}</strong> your submitted Initial/Revision to disclose all your {PROJECT_TYPE}s. Click the <strong>'View Disclosure'</strong> to see the details of the submitted disclosure`;
export const WITHDRAW_VIEW_DISCL_SUBMITTED_INFO_TEXT_FORMAT = `To disclose your {PROJECT_TYPE}s, please <strong>${COMMON_DISCL_LOCALIZE.TERM_WITHDRAW.toLowerCase()}</strong> your submitted Initial/Revision. Click the <strong>'View Disclosure'</strong> to see the details of the submitted disclosure`;
export const DISCLOSURE_PENDING_INFO_TEXT_FORMAT = `{PREFIX} {INITIAL_REVISION} has been initiated. To include all the {PROJECT_TYPE}s listed below, please click the <strong>'Link {CAPS_PROJECT_TYPE}s to {INITIAL_REVISION}'</strong>`;
export const CREATE_FCOI_DISCL_INFO_TEXT_FORMAT = `To disclose your {PROJECT_TYPE}s, select <strong>'{INITIAL_REVISION_BTN_NAME}'</strong>`;
