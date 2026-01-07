import { GraphDetail } from "projects/shared/src/lib/graph/interface";
import { BATCH_DUNS_ENTITY_DETAILS_CARD_ORDER, BATCH_ENTITY_DETAILS_CARD_FOOTER_ORDER, BATCH_ENTITY_DETAILS_CARD_ORDER, BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER, GRAPH_ID, LEAVE_PAGE_PRIMARY_BUTTON, LEAVE_PAGE_SECONDARY_BUTTON, PAGINATION_LIMIT } from "../../app-constants";
import { AttachmentInputType, COIAttachment } from "../../attachments/attachment-interface";
import { ENTITY_MANDATORY_FIELDS } from "../../entity-management-module/shared/entity-constants";
import { EntityDetails, AdditionalAddress, ForeignName, EntityRoleDescriptionCode, CorporateLinkage, EntityWebsiteAddress, CoiEntityType, DunsMailingAddress, EntityOwnershipType } from "../../entity-management-module/shared/entity-interface";
import { CommonModalConfig } from "../../shared-components/common-modal/common-modal.interface";
import { Subject } from "rxjs";
import { Projects } from "../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface";
import { DefaultAssignAdminDetails } from "../../shared-components/shared-interface";

export type Method = 'SOME' | 'EVERY';
export type SuccessErrorType = 'ERROR' | 'SUCCESS';
export type FcoiType = 'INITIAL' | 'REVISION' | 'PROJECT';
export type OPAType = 'INITIAL' | 'REVISION';
export type DeclarationVersionType = 'MASTER' | 'REVISION';
export type EntityType = 'BATCH_ENTITY' | 'DB_ENTITY' | 'DUNS_MATCH_ENTITY';
export type EntityCreationSource = 'ENGAGEMENT_ADD' | 'ENGAGEMENT_EDIT' | 'ADMIN_ENTITY_CREATE' | 'CONSULTING_ADD' | 'CONSULTING_EDIT' | 'CMP_ADD' | 'CMP_EDIT';
export type GlobalEventNotifierUniqueId = 'CREATE_NEW_TRAVEL_DISCLOSURE' | 'COI_OPA_HEADER' | 'COI_DISCLOSURE_HEADER_RESIZE' | 'TRAVEL_DISCLOSURE_HEADER_RESIZE'
            | 'SCROLL_SPY' | 'COI_DISCLOSURE_ADD_CONFLICT_UPDATE' | 'NOTES_LIST' | 'NOTES_EDITOR' | 'MY_PROJECT_COUNT_CHANGE'
            | 'RELOAD_MY_PROJECTS' | 'DISCLOSURE_COMMENTS_SECTION_NAVIGATION' | 'ENTITY_CREATION_MODAL' | ValidationModalSource | LeavePageModalSource
            | 'MATRIX_COMPLETED' | 'TRIGGER_ENTITY_MANDATORY_VALIDATION' | 'TRAVEL_DISCLOSURE_ENGAGEMENT_ID' | 'DISCLOSURE_SUMMARY_RIGHT_NAV_TOGGLE'
            | 'SELECT_ENGAGEMENT_TRAVEL_DISCLOSURE' | 'COI_REVIEW_COMMENTS' | 'RELOAD_GLOBAL_ENTITY' | 'TRIGGER_TRAVEL_CERTIFY_MODAL'
            | 'TRIGGER_DISCLOSURE_CERTIFY_MODAL' | 'SFI_CHANGES_AVAILABLE' | 'TRIGGER_HEADER_TAB_COUNT_UPDATE' | 'TRIGGER_DISCLOSURE_PARAM_CHANGE'
            | 'TRIGGER_OPA_FORM_ACTIONS' | 'ENGAGEMENT_VIEW_DISCLOSURE' | 'TRIGGER_ROUTER_NAVIGATION_END' | 'ENGAGEMENT_GROUP_DELETE'
            | 'TRIGGER_MIGRATION_COUNT_UPDATE' | 'ATTACHMENTS_COUNT_UPDATE' | 'TRIGGER_SHARED_ATTACHMENT_COMPONENT' | 'TRIGGER_DISCLOSURE_REVIEW_COMPONENT'
            | 'TRIGGER_SFI_AMOUNT_MODAL' | 'TRIGGER_OPA_DISCLOSURE_CREATION' | 'TRIGGER_FCOI_DISCLOSURE_CREATION' | 'TRIGGER_USER_DECLARATION_ACTIONS'
            | 'TRIGGER_DECLARATION_DISCLOSURE_CREATION' | 'ACTIVATE_DEACTIVATE_ENG_MODAL' | 'FETCH_PENDING_ACTION_ITEMS_COUNT' | 'TRIGGER_CONSULTING_FORM_ACTIONS'
            | 'REFRESH_OVERVIEW_TAB' | 'DOC_ACTION_STORAGE_EVENT' | 'TRIGGER_USER_CMP_ACTIONS';
export type GlobalEventNotifier = { uniqueId: GlobalEventNotifierUniqueId, content?: any };
export type LoginPersonDetailsKey = keyof LoginPersonDetails;
export type DefaultInputType = { visible: boolean, defaultValue?: boolean, disable?: boolean, inputType?: 'BUTTON' | 'TOGGLE' };
export type SharedEntityCardActions = 'REVIEW' | 'SET_AS_ORIGINAL' | 'USE_THIS' | 'VIEW' | 'CHECK_BOX' | 'RE_REVIEW' | 'SELECT';
export type ActionListOptions = 'PAGINATION' | 'UPDATE_DATE' | 'ACTION_BTN';
export type BatchEntityAvailableInputs = Record<SharedEntityCardActions, DefaultInputType>; // Automatically generate BatchEntityAvailableInputs based on SharedEntityCardActions
export type ValidationModalSource = 'COI_VALIDATION_MODAL' | 'ADD_ENGAGEMENT_VALIDATION' | 'UPDATE_ENGAGEMENT_VALIDATION' | 'TRAVEL_FORM_UNSAVED_VALIDATION'
    | 'OPA_VALIDATION_MODAL' | 'DISCLOSURE_CREATION_VALIDATION' | 'CREATE_ENGAGEMENT_VALIDATION' | 'ENGAGEMENT_INACTIVE_VALIDATION';
export type LeavePageModalSource = 'ADD_SFI_LEAVE_PAGE' | 'CREATE_ENTITY_LEAVE_PAGE' | 'TRAVEL_DISCLOSURE_LEAVE_PAGE';
export type ValidationModalType = 'VIEW_ONLY' | 'ACTIONABLE';
export type PersonType = 'PERSON' | 'ROLODEX';
export type CoiDashboardDisclosureType = 'FCOI' | 'OPA' | 'PROJECT' | 'TRAVEL' | 'CONSULTING';
export type CoiDashboardCardEventActionType = 'ASSIGN_ADMIN' | 'COMMENTS' | 'ENGAGEMENTS_MODAL' | 'PROJECT_MODAL' | 'ATTACHMENTS_MODAL';
export type HistorySliderFilterTypes =  'ALL' | CoiDashboardDisclosureType;
export type EntityBasicDetailsFields = 'ENTITY_NAME' | 'ENTITY_TYPE' | 'OWNERSHIP_TYPE' | 'COUNTRY' | 'ADDRESS_LINE_1' | 'ADDRESS_LINE_2' | 'CITY' | 'STATE' | 'ZIP_CODE' | 'ADDRESS_CHECKBOX' | 'PHONE' | 'EMAIL_ADDRESS' | 'WEBSITE' | 'DUNS_NUMBER' | 'UEI_NUMBER' | 'CAGE_NUMBER' | 'HUMAN_SUB_ASSURANCE' | 'ANIMAL_WELFARE_ASSURANCE' | 'AAALAC';
export type EngagementSortType = 'COMPLETE_TO_INACTIVE' | '';
export type EntityGraphTriggeredFrom = 'ENTITY_DASHBOARD' | 'ENTITY_DETAILS_MODAL' | 'ENTITY_PAGE_MORE_OPTION' | null;
export type DataStoreEvent = { dependencies: string[], action: 'REFRESH' | 'UPDATE' };
export type DisclosureReviewFetchType = 'ASSIGN_ADMIN' | 'REFRESH' | 'REVIEWER_TAB_CLICKED';
export type DocumentActionTypes = 'REVISE' | 'WITHDRAW';
export type DocumentTypes = 'FCOI_DISCLOSURE' | 'OPA_DISCLOSURE' | 'DECLARATION' | 'TRAVEL_DISCLOSURE' | 'CONSULTING_FORM';
export type COIConfirmModalType = 'SUBMIT' | 'APPROVE' | 'CONFIRMATION' | 'REJECT' | 'WITHDRAW'
    | 'RETURN' | 'COMPLETE_FINAL_REVIEW' | 'CANCEL';

export class COIAppConfig {
    baseUrl = '';
    fibiUrl = '';
    authUrl = '';
    printUrl = '';
    formUrl = '';
    fibiCOIConnectUrl = '';
    enableSSO = false;
    enableGraph = true;
    isElasticAuthentiaction = false;
    elasticUserName = '';
    elasticDelimiter = '';
    elasticPassword = '';
    elasticAuthScheme = '';
    elasticIndexUrl = '';
    indexValue = '';
    fibiApplicationUrl = '';
    EXTERNAL_APPLICATION_BASE_URL = '';
    EXTERNAL_DEV_PROPOSAL_URL = '';
    EXTERNAL_AWARD_URL = '';
    EXTERNAL_IP_URL = '';
    EXTERNAL_PERSON_URL: '';
    EXTERNAL_ROLODEX_PERSON_URL: '';
    currencySymbol: '';

    constructor(init?: Partial<COIAppConfig>) {
        Object.assign(this, init);
    }
}

export class LoginPersonDetails {
    personID: any;
    userName: any;
    firstName: any;
    lastName: any;
    fullName: any;
    unitNumber: any;
    unitName: any;
    primaryTitle: any;
    email: any;
    isUnitAdmin: any;
    login: any;
    userType: any;
    secretImageUri: any;
    isExternalUser: any;
    gender: any;
}

export interface DashboardProjectCount {
    moduleCode: number,
    projectType: string,
    projectCount: number
}

export class COIAttachmentConfig {
    isViewMode = false;
    canEditByAdmin = false;
    attachmentPersonId = '';
    documentDetails?: { key: string | null; documentId: number | string | null; } | null = null;
    attachmentApiEndpoint: AttachmentApiEndpoint;
    gridClass = 'coi-grid-1 coi-grid-md-1 coi-grid-lg-1 coi-grid-xl-1 coi-grid-xxl-1';
}

export class COIAttachmentModalInfo {
    isOpenAttachmentModal = false;
    attachmentInputType: AttachmentInputType = 'ADD';
    currentAttachment: COIAttachment | null = null;
    attachmentApiEndpoint: AttachmentApiEndpoint | null = null;
    documentDetails?: { key: string | null; documentId: number | string | null; } | null = null;
}

export interface AttachmentSaveRO {
    fileName: string;
    mimeType: string;
    attachmentTypeCode?: string | number;
    description?: string;
    fileDataId: string | null;
    comment?: string;
    attaTypeCode?: string | number;
}

export interface AttachmentReplaceRO {
    fileName: string;
    mimeType: string;
    attachmentTypeCode?: string | number;
    description?: string;
    fileDataId: string | null;
    attachmentNumber: number;
    versionNumber: number;
    comment?: string;
    attaTypeCode?: string | number;
    disclosureId?: string;
}

export class CoiDisclosureCount {
    inProgressDisclosureCount?: number = 0;
    approvedDisclosureCount?: number = 0;
    travelDisclosureCount?: number = 0;
    consultDisclCount?: number = 0;
    disclosureHistoryCount?: number = 0;
    declarationCount?: number = 0;
    cmpCount?: number = 0;
}

export class SharedProjectDetails {
    projectNumber?: string = null;
    sponsorCode?: string = null;
    primeSponsorCode?: string = null;
    sponsorName?: string = null;
    homeUnitName?: string = null;
    homeUnitNumber?: string = null;
    primeSponsorName?: string = null;
    projectStatus?: string = null;
    piName?: string = null;
    projectStartDate?: number = null;
    projectEndDate?: number = null;
    projectBadgeColour?: string = null;
    projectIcon?: string = null;
    projectType?: string = null;
    projectTypeCode?: string = null;
    projectTitle?: string = null;
    documentNumber?: string = null;
    accountNumber?: string = null;
    projectId?: string = null;
    reporterRole?: string = null;
}

export class AttachmentApiEndpoint {
    attachmentTypeEndpoint?: string = '';
    saveOrReplaceEndpoint?: string = '';
    updateAttachmentEndpoint?: string = '';
    loadAttachmentListEndpoint?: string = '';
    deleteAttachmentEndpoint?: string = '';
    downloadAttachmentEndpoint?: string = '';
}

export class EntityBatchDetails {
    batchId?: number = null;
    batchSrcTypeCode?: string = null;
    batchSrcType?: BatchSrcType = null;
    batchStatusCode?: number = null;
    batchStatusType?: BatchStatusType = null;
    reviewStatusCode?: number = null;
    reviewStatusType?: ReviewStatusType = null;
    completionDate?: any = null;
    createdBy?: string = null;
    createTimestamp?: string = null;
    updateTimestamp?: string = null;
    updatedBy?: string = null;
}

export class BatchEntityDetails {
    entityStageDetailId?: number;
    srcTypeCode?: string;
    batchId?: number;
    srcDataCode?: string;
    srcDataName?: string;
    srcDunsNumber?: any;
    srcCageNumber?: any;
    srcUei?: any;
    srcEmailAddress?: string;
    srcPhoneNumber?: any;
    srcAddressLine1?: string;
    srcAddressLine2?: any;
    srcPostalCode?: string;
    srcStateDetails?: State;
    srcState?: string;
    srcStateCode?: string;
    srcCity?: any;
    srcCountryCode?: string;
    srcCountry?: any;
    srcApiName?: any;
    integrationStatusCode?: any;
    integrationStatusType?: any;
    matchStatusCode?: number;
    matchStatusType?: MatchStatusType;
    adminReviewStatusCode?: number;
    adminReviewStatusType?: AdminReviewStatusType;
    adminActionCode?: number;
    adminActionType?: AdminActionType;
    groupNumber?: number;
    isDuplicateInSrc?: any;
    entityId?: number;
    selectedDunsNumbers?: any;
    candidateMatchedQuantity?: any;
    highestConfidenceCode?: any;
    createTimestamp?: any;
    createdBy?: any;
    updateTimestamp?: any;
    updatedBy?: any;
    isExactDunsMatch?: boolean;
    isMultipleDunsMatch?: boolean;
    isNoDunsMatch?: boolean;
    isDuplicateInBatch?: boolean;
    isDuplicateInEntitySys?: boolean;
    canReReview?: boolean;
}

export interface BatchSrcType {
    batchSrcTypeCode?: number;
    description?: string;
    updateTimestamp?: string;
    updatedBy?: string;
    isActive?: any;
}

export interface BatchStatusType {
    batchStatusCode?: number;
    description?: string;
    updateTimestamp?: string;
    updatedBy?: string;
    isActive?: any;
}

export interface ReviewStatusType {
    reviewStatusCode?: number;
    description?: string;
    updateTimestamp?: string;
    updatedBy?: string;
    isActive?: any;
}

export interface MatchStatusType {
    matchStatusCode: number
    description: string
    updateTimestamp: string
    updatedBy: string
    isActive: any
}

export interface AdminReviewStatusType {
    adminReviewStatusCode: number;
    description: string;
    updateTimestamp: string;
    updatedBy: string;
    isActive: any;
}

export interface AdminActionType {
    adminActionCode: number;
    description: string;
    updateTimestamp: string;
    updatedBy: string;
    isActive: any;
}

export interface SharedEntityCardEvents {
    action: SharedEntityCardActions;
    content: {
        currentValue: any;
        sharedEntityDetails: SharedEntityCardDetails;
        entityCardConfig: EntityDetailsCardConfig,
    }
}

export class EntityDetailsCardConfig {
    uniqueId: string | number = null;
    cardType: EntityType = 'BATCH_ENTITY';
    entireDetails?: BatchEntityDetails | any;
    customClass = 'shadow-sm coi-light-gray-border';
    sharedEntityDetails= new SharedEntityCardDetails();
    individualColumnClass: Record<string, string> = {};
    displaySections: string[] = [];
    inputOptions: Partial<BatchEntityAvailableInputs> = {};
    columnClass = 'col-6 col-sm-6 col-md-4 col-lg-4 col-xl-3 col-xxl-3';
    cardOrder: Record<EntityType, string[]> = {
        BATCH_ENTITY: BATCH_ENTITY_DETAILS_CARD_ORDER,
        DB_ENTITY: BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER,
        DUNS_MATCH_ENTITY: BATCH_DUNS_ENTITY_DETAILS_CARD_ORDER
    };
    footerOrder: Record<EntityType, string[]> = {
        BATCH_ENTITY: BATCH_ENTITY_DETAILS_CARD_FOOTER_ORDER,
        DB_ENTITY: [],
        DUNS_MATCH_ENTITY: []
    };
}

export class SharedEntityCardDetails {
    entityName?: string;
    primaryAddress?: string;
    city?: string;
    stateDetails?: State;
    state?: string;
    country?: Country;
    dunsNumber?: any;
    ueiNumber?: any;
    cageNumber?: any;
    website?: string;
    email?: string;
    phone?: any;
    phoneNumber?: any;
    sponsorCode?: any;
    organizationId?: any;
    matchQualityInformation?: any;
    postCode?: any;
    entityId?: any;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    duplicateEntityDetails?: SharedEntityCardDetails;
    priorName?: string;
    foreignName?: string;
    foreignNames?: ForeignName[];
    ownershipType?: string;
    businessEntityType?: EntityRoleDescriptionCode;
    entityFamilyTreeRoles?: EntityRoleDescriptionCode[];
    isForeign?: boolean;

    // duns specific
    confidenceScore?: string;
    mailingAddress?: string;

    // batch specific
    batchId?: number;
    isExactDunsMatch?: boolean;
    isMultipleDunsMatch?: boolean;
    isNoDunsMatch?: boolean;
    isDuplicateInBatch?: boolean;
    isDuplicateInEntitySys?: boolean;
    entityStageDetailId?: number;
    srcTypeCode?: string;
    adminReviewStatusCode?: any;
    adminReviewStatusType?: any;
    adminActionCode?: any;
    adminActionType?: any;
    entityNumber?: number;
}

export class State {
    stateCode: string;
    stateName: string;
    countryCode: string;
    country: Country;
    updateTimeStamp: number;
    updateUser: string;
    value: string;
}

export class Country {
    countryCode?: string;
    countryName: string;
    currencyCode?: string;
    currency?: Currency
    updateTimeStamp?: any;
    updateUser?: string;
    countryTwoCode?: any;
    value?: string;
}

export class Currency {
    currencyCode: string;
    currency: string;
    currencySymbol: any;
    updateUser: string;
    updateTimeStamp: any;
}

export class BatchEntityDunsMatch {
    city?: string;
    state?: string;
    country?: string;
    postCode?: string;
    ueiNumber?: string;
    cageNumber?: string;
    entityName?: string;
    dunsNumber?: string;
    entityDetails?: any;
    countryCode?: string;
    stateCode?: string;
    industryType?: string;
    ownershipType?: string;
    websiteAddress?: EntityWebsiteAddress[];
    confidenceScore?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    businessEntityType?: EntityRoleDescriptionCode;
    corporateLinkage?: CorporateLinkage;
    mailingAddress?: DunsMailingAddress;
}

export class ProjDisclCreateModal {
    isOpenModal = false;
    projectTypeCode: number | string = null;
    selectedProject?: SharedProjectDetails = null;
}

export class CoiProjectType {
    updateUser: string | null = null;
    description: string | null = null;
    badgeColor?: string | null = null;
    projectIcon?: string | null = null;
    fcoiNeeded?: boolean | null = null;
    updateTimestamp: number | null = null;
    coiProjectTypeCode: string | null = null;
    projectDisclosureNeeded?: boolean | null = null;
}

export class EntityCreationConfig {
    isEditMode = true;
    isCreateView = false;
    isShowCoiEntityType = false;
    canNavigateToEntity = true;
    coiEntityType?: CoiEntityType;
    modificationIsInProgress = false;
    entityDetails = new EntityDetails();
    isCreateEntityFromEngagement = false;
    isDunsMatchedOnActiveVersion = false;
    isDunsMatchedOnSelectedVersion = false;
    mandatoryFieldsList = ENTITY_MANDATORY_FIELDS;
    fieldCustomClass = new EntityBasicDetailsField();
    entityMailingAddresses: AdditionalAddress[] = [];
    triggeredFrom: EntityCreationSource = 'ADMIN_ENTITY_CREATE';
    dataType: 'MANUAL_UPDATE' | 'DATA_STORE_CHANGE' = 'MANUAL_UPDATE';
    isDuplicateCheckNeeded = true;
};

export class EntityCreationModalConfig {
    isEditMode = true;
    isCreateView = true;
    isShowCoiEntityType = true;
    canNavigateToEntity = false;
    coiEntityType?: CoiEntityType;
    isCreateEntityFromEngagement = true;
    triggeredFrom: EntityCreationSource;
    entityDetails = new EntityDetails();
    mandatoryFieldsList = ENTITY_MANDATORY_FIELDS;
    fieldCustomClass = new EntityBasicDetailsField();
    entityMailingAddresses: AdditionalAddress[] = [];
    dataType: 'MANUAL_UPDATE' | 'DATA_STORE_CHANGE' = 'MANUAL_UPDATE';
    isDuplicateCheckNeeded = true;
}

export class EntityBasicDetailsField implements Record<EntityBasicDetailsFields, string> {
    ENTITY_NAME = 'col-md-12 col-lg-6';
    OWNERSHIP_TYPE = 'col-md-12 col-lg-3';
    COUNTRY = 'col-md-12 col-lg-3';
    ADDRESS_LINE_1 = 'col-12';
    ADDRESS_LINE_2 = 'col-12';
    CITY = 'col-md-12 col-lg-4';
    STATE = 'col-md-12 col-lg-4';
    ZIP_CODE = 'col-md-12 col-lg-4';
    ADDRESS_CHECKBOX = 'col-12';
    PHONE = 'col-md-12 col-lg-6 col-xl-4';
    EMAIL_ADDRESS = 'col-md-12 col-lg-6 col-xl-4';
    WEBSITE = 'col-md-12 col-lg-6 col-xl-4';
    DUNS_NUMBER = 'col-md-12 col-lg-6 col-xl-4';
    UEI_NUMBER = 'col-md-12 col-lg-6 col-xl-4';
    CAGE_NUMBER = 'col-md-12 col-lg-6 col-xl-4';
    HUMAN_SUB_ASSURANCE = 'col-md-12 col-lg-6 col-xl-4';
    ANIMAL_WELFARE_ASSURANCE = 'col-md-12 col-lg-6 col-xl-4';
    AAALAC = 'col-md-12 col-lg-6 col-xl-4';
    ENTITY_TYPE = 'col-md-12 col-lg-3 col-xl-4';

    constructor(fields: Partial<Record<EntityBasicDetailsFields, string>> = {}) {
      Object.assign(this, fields);
    }
  }


export class ActionListSliderConfig {
    isOpenSlider = false;
    inboxObject = new InboxObject();
    actionListOptions: ActionListOptions[] = ['PAGINATION', 'UPDATE_DATE'];
}

export class InboxObject {
    toDate = '';
    fromDate = '';
    toPersonId = '';
    isViewAll?: 'N' | 'Y' = 'N';
    processed? = false;
    currentPage: number = null;
    itemsPerPage: number = null;
    moduleCode: number | string = null;
    moduleCodes: any[];
    orderByFields: Record<string, string> = { alertType: 'DESC' };
};

export class COIValidationModalConfig {
    errorList: string[] = [];
    warningList: string[] = [];
    modalHeader = 'Validation';
    errorMsgHeader = 'Attention';
    helpElementId: string = null;
    warningMsgHeader = 'Warning(s)';
    additionalBtns: { action: string, event: any }[] = []; // need to pass like { action: 'BTN_TYPE', event?: { buttonName: string, btnClass: string } }
    helpSubSectionId: string | number = null;
    validationType: ValidationModalType = 'VIEW_ONLY';
    triggeredFrom: ValidationModalSource = 'COI_VALIDATION_MODAL';
    modalId = 'coi-validation';
    modalConfig = new CommonModalConfig(this.modalId, '', 'Close', 'lg');
};

export class COILeavePageModalConfig {
    modalHeader = 'Confirmation';
    helpElementId: string = null;
    additionalBtns: { action: string, event: any }[] = []; // need to pass like { action: 'BTN_TYPE', event?: { buttonName: string, btnClass: string } }
    triggeredFrom: LeavePageModalSource;
    modalId = 'coi-common-leave-page';
    unsavedChangesPageName = '';
    message = '';
    modalConfig = new CommonModalConfig(this.modalId, LEAVE_PAGE_PRIMARY_BUTTON, LEAVE_PAGE_SECONDARY_BUTTON);
    helpSubSectionId: string | number = null;
};

export class ReviewCommentsSliderConfig {
    isDisclosureOwner = false;
}

export interface CustomELementAutoSaveConfig {
    subSectionCode: string;
    entityId: null;
    viewMode: 'edit' | 'view';
}

export class COIPersonModalConfig {
    personId = '';
    personType: PersonType = 'PERSON';
    isShowViewButton = false;
}

export class COIEntityModalConfig {
    isOpenModal = false;
    entityId: string | number = '';
}

export class COIGraphModalConfig {
    entityId: string | number = '';
    entityName: string;
    graphId = GRAPH_ID.ENTITY_GRAPH_ID;
    graphEvent = new Subject<GraphDetail>();
    triggeredFrom: EntityGraphTriggeredFrom;
}
export class LookUpClass {
    code: string | number | null = null;
    description? = '';
}

export interface UserDisclosureDetails {
    consultDisclId: any;
    coiDisclosureId: any;
    documentNumber: string;
    coiDisclosureNumber: any;
    sequenceNumber: any;
    personId: any;
    fullName: any;
    dispositionStatusCode: any;
    dispositionStatus: any;
    conflictStatusCode: any;
    conflictStatus: any;
    moduleItemKey: any;
    discActiveStatus: any;
    expirationDate: any;
    updateTimeStamp: number;
    updateUser: any;
    updateUserFullName: any;
    createUser: any;
    versionStatus: any;
    reviewStatus: any;
    submittedDate: any;
    lastApprovedVersion: any;
    noOfSfiInActive: any;
    noOfSfiInPending: any;
    noOfAwardInPending: any;
    noOfProposalInPending: any;
    noOfAwardInActive: any;
    noOfProposalInActive: any;
    createTimestamp: any;
    disclosureVersionNumber: any;
    disclosurePersonFullName: any;
    fcoiTypeCode: any;
    fcoiType: any;
    lastApprovedVersionDate: any;
    reviseComment: any;
    reviewStatusCode: string;
    reviewId: any;
    reviewDescription: string;
    reviewerStatusCode: any;
    reviewerStatus: any;
    reviewerFullName: any;
    proposalId: any;
    proposalTitle: any;
    awardId: any;
    awardTitle: any;
    noOfSfi: any;
    noOfAward: any;
    noOfProposal: any;
    certifiedAt: any;
    unit: any;
    travelDisclosureId: number;
    travelStartDate: number;
    travelEndDate: number;
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
    travelEntityName: string;
    travellerName: string;
    travelAmount: number;
    travelReviewStatus: any;
    travelSubmissionDate: any;
    travelExpirationDate: any;
    travelPurpose: string;
    certificationDate: any;
    travelCity: string;
    travelCountry: string;
    travelState: string;
    travellerTypeCode: any;
    travellerTypeDescription: string;
    travelDisclosureStatusCode: string;
    travelDisclosureStatusDescription: string;
    opaDisclosureId: any;
    disclosureId: any;
    projectHeader: string;
    projectId: string;
}

export class COIEngagementSliderConfig {
    personEntityId: string | number = null;
    sliderElementId = '';
}

export interface COISortObj {
    key: string;
    parentKey?: string;
    order: 'ASC' | 'DESC';
}

export interface PersonTrainingDetails {
    personTrainingId: number;
    personId: string;
    trainingCode: number;
    training: any;
    dateRequested: number;
    dateSubmitted: number;
    dateAcknowledged: number;
    followupDate: number;
    score: number | string;
    comments: string;
    nonEmployee: boolean;
    updateTimestamp: number;
    updateUser: string;
    personTrainingAttachments: any;
    personTrainingComments: string;
    trainingDescription: string;
    personName: string;
    updateUserName: string;
    expirationDate: number;
    completionDate: number;
    sourceTypeCode: string;
}

export interface ApplicableFormRO {
    moduleItemCode: string,
    moduleSubItemCode: string,
    documentOwnerPersonId: string,
    moduleItemKey: string
}

export class FetchEachOrAllEngagementsRO {
    personId = '';
    searchWord = '';
    currentPage = 1;
    filterType = 'ALL';
    reviewStatusCode = '';
    pageNumber = PAGINATION_LIMIT;
    sortType: EngagementSortType = '';
    disclosureId: string | number | null = null;
    dispositionStatusCode: string | number | null = null;
}

export interface EvaluateValidationRO {
    moduleCode: string | number;
    subModuleCode: string | number;
    moduleItemKey: string | number;
    subModuleItemKey: string | number;
    disclosureNumber: string | number;
    disclosureId: string | number;
}

export interface CoiDisclosureType {
    disclosureTypeCode: string;
    description: string;
    dataCapturingTypeCode?: number;
    perEntDataCapturingType?: PerEntDataCapturingType;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface PerEntDataCapturingType {
    dataCapturingTypeCode: string;
    description: string;
    updateTimestamp: number;
    updatedBy: string;
    isActive: boolean;
}

export class DisclosureCommentsCountRO {
    moduleItemKey?: number | string | null = null;
    documentOwnerPersonId: string | null = null;
    moduleCode: number | string | null = null;
    replyCommentsCountRequired = false;
    projects?: Projects[];
}

export interface DisclosureCommentsCounts {
    reviewCommentsCount: DisclReviewCommentsCount[]
    totalCount: number;
}

export interface DisclReviewCommentsCount {
    componentTypeCode: string;
    subModuleItemKey?: string;
    count: number;
}

export interface OPADisclosureDetails {
  opaDisclosureId: number;
  opaDisclosureNumber: string;
  opaCycleNumber: number;
  opaCycles: OpaCycles;
  personId: string;
  opaPerson: OpaPerson;
  personName: string;
  homeUnit: string;
  statusCode: string;
  isFaculty: boolean;
  isFallSabatical: any;
  isSpringSabatical: any;
  receivedSummerComp: any;
  summerCompMonths: any;
  isFullTime: any;
  isPartTime: any;
  appointmentPercent: any;
  isCompensated: any;
  hasPotentialConflict: any;
  conflictDescription: any;
  reviewStatusCode: string;
  reviewStatusType: ReviewStatusType;
  dispositionStatusCode: string;
  dispositionStatusType: DispositionStatusType;
  certificationText: any;
  certifiedBy: string;
  submissionTimestamp: number;
  expirationDate: number;
  adminGroupId: any;
  adminPersonId: string;
  createTimestamp: number;
  createUser: string;
  updateTimestamp: number;
  updateUser: string;
  updateUserFullName: string;
  createUserFullName: any;
  adminGroupName: any;
  adminPersonName: string;
  personEmail: any;
  personPrimaryTitle: any;
  homeUnitName: string;
  opaFormBuilderDetails: any;
  personNotesCount: any;
  personAttachmentsCount: any;
  personEntitiesCount: any;
  isHomeUnitSubmission: boolean | null;
}

export interface OpaCycles {
  opaCycleNumber: number;
  periodStartDate: number;
  periodEndDate: number;
  opaCycleStatus: boolean;
  openDate: number;
  closeDate: number;
  updateTimestamp: number;
  updateUser: string;
}

export interface OpaPerson {
  personId: string;
  personName: string;
  formOfAddressShort: any;
  firstName: string;
  middleName: any;
  lastName: string;
  krbNameUppercase: any;
  emailAddress: any;
  jobId: any;
  jobTitle: string;
  adminEmployeeType: string;
  hrDepartmentCodeOld: any;
  hrDepartmentName: any;
  adminOrgUnitId: any;
  adminOrgUnitTitle: any;
  adminPositionTitle: any;
  payrollRank: string;
  isFaculty: boolean;
  employmentPercent: any;
  isConsultPriv: any;
  isPaidAppt: any;
  isSummerSessionAppt: any;
  summerSessionMonths: any;
  isSabbatical: any;
  sabbaticalBeginDate: any;
  sabbaticalEndDate: any;
  warehouseLoadDate: any;
}

export interface DispositionStatusType {
  dispositionStatusCode: string;
  description: string;
  updateTimestamp: number;
  updateUser: string;
  isActive: boolean;
  sortOrder: string;
}

export interface PersonEntityDto {
    personEntityId?: number;
    personEntityNumber?: number;
    personId?: string;
    entityId?: number;
    entityNumber?: number;
    isFormCompleted?: boolean;
    versionNumber?: number;
    versionStatus?: string;
    sponsorsResearch?: boolean;
    involvementStartDate?: Date | string;
    involvementEndDate?: Date | string;
    studentInvolvement?: string;
    staffInvolvement?: string;
    instituteResourceInvolvement?: string;
    updateTimestamp?: string | number;
    updateUser?: string;
    createUser?: string;
    createTimestamp?: string | number;
    personFullName?: string;
    revisionReason?: string;
    updateUserFullName?: string;
    personEntityRelationships?: [];
    country?: Country;
    entityOwnershipType?: EntityOwnershipType;
    actionTypeCode?: string;
    entityName?: string;
    relationshipName?: string;
    perEntDisclTypeSelection?: [];
    isCompensated?: boolean;
    message?: string;
    engagementFlow?: string;
}

export interface DisclosureHistory {
    updateTimestamp: number | null;
    updateUserFullName: string | null;
    actionTypeCode: string | null;
    message: string | null;
    comment: string | null;
}

export class COIEngagementMigrationModal {
    header = '';
    message = '';
    proceedText = '';
    closingText = '';
}

export class EngagementMigrationCount {
    completedCount = 0; 
    excludedCount = 0;
    toReviewCount = 0;
    totalCount = 0;
    inProgressCount = 0;
}

export class DownloadLetterTemplateRO {
    moduleItemKey: string | number | null = null;
    moduleItemCode: string | number | null = null;
    moduleItemNumber: string | number | null = null;
    moduleSubItemCode: string | number | null = null;
    letterTemplateTypeCodes: (string | number)[] = [];
}

export class PrintModalConfig extends DownloadLetterTemplateRO {
    fileName = 'print';
    modalHeaderText = 'Print';
    isOpenPrintModal = false;
    printApiEndpoint = new PrintApiEndpoint();
    templateLabel = 'Choose a template to print';
    helpTextConfig = { subSectionId: '', elementId: '' };
    modalConfig = new CommonModalConfig('coi-print-modal', 'Print', 'Cancel', 'lg');
}

export interface PrintModalClose {
    printModalConfig: PrintModalConfig;
    closeModalType: 'ERROR' | 'MANUAL_CLOSE' | 'PRINT_COMPLETE';
}

export class PrintApiEndpoint {
    printTemplateEndpoint = '/coiCustom/letterTemplate';
    downloadPrintEndpoint = '/print/generateDocument';
}

export class Person {
    personId?: string | null = null;
    lastName?: string | null = null;
    firstName?: string | null = null;
    middleName?: string | null = null;
    fullName?: string | null = null;
    priorName?: string | null = null;
    principalName?: string | null = null;
    emailAddress?: string | null = null;
    dateOfBirth?: string | null = null;
    age?: number | null = null;
    educationLevel?: string | null = null;
    officeLocation?: string | null = null;
    secOfficeLocation?: string | null = null;
    secOfficePhone?: string | null = null;
    school?: string | null = null;
    directoryDepartment?: string | null = null;
    countryOfCitizenshipCode?: string | null = null;
    countryOfCitizenshipDetails?: Country | null = null;
    primaryTitle?: string | null = null;
    directoryTitle?: string | null = null;
    homeUnit?: string | null = null;
    unit?: Unit | null = null;
    isFaculty?: boolean | null = null;
    isGraduateStudentStaff?: boolean | null = null;
    isResearchStaff?: boolean | null = null;
    isServiceStaff?: boolean | null = null;
    isSupportStaff?: boolean | null = null;
    isOtherAcadamic?: boolean | null = null;
    isMedicalStaff?: boolean | null = null;
    addressLine1?: string | null = null;
    addressLine2?: string | null = null;
    addressLine3?: string | null = null;
    city?: string | null = null;
    country?: string | null = null;
    state?: string | null = null;
    stateCode?: string | null = null;
    postalCode?: string | null = null;
    countryCode?: string | null = null;
    countryDetails?: Country | null = null;
    faxNumber?: string | null = null;
    pagerNumber?: string | null = null;
    visaCode?: string | null = null;
    visaType?: string | null = null;
    visaRenewalDate?: string | null = null;
    mobileNumber?: string | null = null;
    status?: string | null = null;
    personStatus?: PersonStatus | null = null;
    salaryAnniversary?: string | null = null;
    updateTimestamp?: number | null = null;
    updateUser?: string | null = null;
    jobCode?: string | null = null;
    supervisorPersonId?: string | null = null;
    orcidId?: string | null = null;
    isWebhookActive?: boolean | null = null;
    dateOfInactive?: string | null = null;
    isExternalUser?: boolean | null = null;
    officePhone?: string | null = null;
    aliasName?: string | null = null;
    genderCode?: string | null = null;
    alternateMobileNumber?: string | null = null;
    secondaryEmailAddress?: string | null = null;
    gender?: string | null = null;
    isMfaEnabled?: boolean | null = null;
    secret?: string | null = null;
    userType?: string | null = null;
    isPasswordChange?: boolean | null = null;
    isUsernameChange?: boolean | null = null;
}

export interface Unit {
    unitNumber?: string;
    parentUnitNumber?: string | null;
    organizationId?: string;
    unitName?: string;
    isActive?: boolean;
    updateTimestamp?: number;
    updateUser?: string;
    acronym?: string | null;
    isFundingUnit?: boolean | null;
    unitTypeId?: string | null;
    displayName?: string;
    unitAdministrators?: UnitAdministrator[];
    unitDetail?: string;
    parentUnitName?: string | null;
    organizationName?: string | null;
}

export interface UnitAdministrator {
    personId: string;
    fullName: string | null;
    oldPersonId: string | null;
    oldUnitAdministratorTypeCode: string | null;
    unitAdministratorTypeCode: string;
    unitNumber: string;
    unitName: string | null;
    updateTimestamp: number;
    updateUser: string;
    unitAdministratorType: UnitAdministratorType;
}

export interface UnitAdministratorType {
    code: string;
    description: string;
    isActive: boolean;
}

export interface PersonStatus {
    personStatusCode: string;
    description: string;
}

export interface UserSupportSliderConfig {
    copiedIndex: boolean[];
    copyTimeouts: Record<number, ReturnType<typeof setTimeout>>;
    isOpenSlider: boolean;
    sliderId: string;
}

export class COIFormValidation {
    componentId: string | number;
    label?: string;
    sectionId?: string;
    navigationURL?: string;
    validationMessage: string;
    validationType: 'VM' | 'VE';
    formBuilderId: number | string;
}

export class CoiAssignAdminConfig {
    isOpenAssignAdminModal = false;
    adminGroupId: string | null = null;
    documentId: number | null = null;
    adminPersonId: string | null = null;
    documentNumber: string | null = null;
    defaultAdminDetails = new DefaultAssignAdminDetails();
}

export interface DocumentActionStorageEvent {
    action: DocumentActionTypes;
    triggeredFrom: string;
    targetModule: DocumentTypes;
    isModalRequired: boolean;
}

export class COIConfirmationModal {
    description? = '';
    isShowDescription? = false;
    isDescriptionMandatory? = false;
    descriptionLabel? = 'Provide the Reason';
    textAreaPlaceholder? = 'Please provide the reason.';
    modalHeader = 'Confirmation';
    mandatoryList? = new Map<'CONFIRM_ACTION_DESCRIPTION', string>();
    modalBody = 'Are you sure want to confirm';
    modalConfig = new CommonModalConfig('coi-confirmation-modal', 'Yes', 'No');
    action: COIConfirmModalType = 'CONFIRMATION';
    modalHelpTextConfig: { subSectionId: string, elementId: string };
    descriptionHelpTextConfig?: { subSectionId: string, elementId: string };
    additionalFooterBtns: { action: string, event: any }[] = [];
}

export interface ElasticPersonSource {
    unit_number: string | null;
    phone_nbr: string | null;
    "@timestamp": string | null;
    full_name: string | null;
    prncpl_id: string | null;
    unit_display_name: string | null;
    primary_title: string | null;
    email_addr: string | null;
    unit_name: string | null;
    prncpl_nm: string | null;
    external: string | null;
    addr_line_1: string | null;
    directory_title: string | null;
    "@version": string | null;
    value?: any;
}

export interface ElasticPersonResult {
    personId: string | null;
    fullName: string | null;
    principalName: string | null;
    primaryTitle: string | null;
    directoryTitle: string | null;
    emailAddress: string | null;
    mobileNumber: string | null;
    addressLine1: string | null;
    unit: {
        unitNumber: string | null;
        unitName: string | null;
        displayName: string | null;
    };
    isExternalUser: boolean | null;
    timestamp: string | null;
    version: string | null;
}

export interface ElasticRolodexSource {
    "@version"?: string | null;
    "@timestamp"?: string | null;
    rolodex_id?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    email_address?: string | null;
    phone_number?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    designation?: string | null;
    create_user?: string | null;
    organization_display_name?: string | null;
    organization_id?: string | null;
    organization_name?: string | null;
    value?: any;
}

export interface ElasticRolodexResult {
    rolodexId?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    comments?: string;
    countryCode?: string;
    countryOfCitizenship?: any;
    countryOfCitizenshipDetails?: any;
    emailAddress?: string;
    faxNumber?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    organization?: string;
    organizationName?: string;
    ownedByUnit?: string;
    phoneNumber?: string;
    postalCode?: string;
    prefix?: string;
    sponsorCode?: string;
    state?: string;
    stateCode?: string;
    suffix?: string;
    title?: string;
    createUser?: string;
    isActive?: boolean;
    updateUser?: string;
    updateTimestamp?: number;
    organizations?: Organization;
    sponsor?: string;
    designation?: string;
    fullName?: string;
    country?: Country;
    createUserFullName?: string;
    sponsorName?: string;
    timestamp?: string | null;
    version?: string | null;
}

export class RolodexPerson {
    rolodexId?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;e
    city?: string;
    comments?: string;
    countryCode?: string;
    countryOfCitizenship?: any;
    countryOfCitizenshipDetails?: any;
    emailAddress?: string;
    faxNumber?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    organization?: string;
    organizationName?: string;
    ownedByUnit?: string;
    phoneNumber?: string;
    postalCode?: string;
    prefix?: string;
    sponsorCode?: string;
    state?: string;
    stateCode?: string;
    suffix?: string;
    title?: string;
    createUser?: string;
    isActive?: boolean;
    updateUser?: string;
    updateTimestamp?: number;
    organizations?: Organization;
    sponsor?: string;
    designation?: string;
    fullName?: string;
    country?: Country;
    createUserFullName?: string;
    sponsorName?: string;
}

export class AvailableDocumentActions {
    availableActionId: number | string | null = null;
    currentStatus: string | null = null;
    currentStatusDescription: string | null = null;
    actionTypeCode: string | null = null;
    actionDescription: string | null = null;
    actionMessage: string | null = null;
    resultingStatus: string | null = null;
    resultingStatusDescription: string | null = null;
    sortOrder: number | null = null;
    resultingStatusBadgeColor: string | null = null;
    currentStatusBadgeColor: string | null = null;
}

export interface Organization {
    organizationId?: string;
    organizationName?: string;
    organizationDisplayName?: string;
    contactAddressId?: number;
    address?: string;
    cableAddress?: any;
    telexNumber?: any;
    congressionalDistrict?: any;
    incorporatedIn?: any;
    incorporatedDate?: any;
    vendorCode?: string;
    dunsNumber?: any;
    dodacNumber?: any;
    cageNumber?: any;
    humanSubAssurance?: any;
    scienceMisconductComplDate?: any;
    animalWelfareAssurance?: any;
    phsAcount?: any;
    nsfInstitutionalCode?: any;
    indirectCostRateAgreement?: any;
    cognizantAuditor?: any;
    updateTimestamp?: number;
    isActive?: boolean;
    updateUser?: string;
    countryCode?: string;
    country?: Country;
    contactPersonName?: string;
    isPartneringOrganization?: boolean;
}
