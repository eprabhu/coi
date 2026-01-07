import { Country, DashboardProjectCount } from "../common/services/coi-common.interface";
import { EntityOwnershipType } from "../entity-management-module/shared/entity-interface";

export type AttachmentSourceSection = 'SFI_TAB' | 'DISCLOSURE_TAB' | 'DISCLOSURE_ATTACHMENT' | '';
export class AssignAdminRO {
    adminPersonId;
    adminGroupId = null;
    travelDisclosureId?: '';
    opaDisclosureId?: '';
    opaDisclosureNumber?: '';
    declarationId?: '';
    declarationNumber?: '';
    disclosureId?: '';
    actionType?: 'R' | 'A';
}

export class DefaultAssignAdminDetails {
    adminPersonId = '';
    adminGroupId = null;
    adminPersonName = '';
    adminGroupName = '';
}

export class PersonProjectOrEntity {
    personFullName = '';
    projectDetails?: any = null;
    entityName? = '';
    homeUnit? = '';
    homeUnitName? = '';
    personEmail = '';
    personPrimaryTitle = '';
    unitDisplayName = '';
}

export class Disclosure {
    adminGroupId: any;
    adminPersonId: any;
    certifiedAt: any;
    conflictStatus: any;
    conflictStatusCode: any;
    createTimestamp: any;
    createUserFullName: any;
    disclosureId: any;
    disclosureNumber: any;
    dispositionStatus: any;
    dispositionStatusCode: any;
    expirationDate: any;
    homeUnit: any;
    homeUnitName: any;
    personId: any;
    reviewStatus: any;
    reviewStatusCode: any;
    updateTimestamp: any;
    updateUserFullName: any;
    versionNumber: any;
    versionStatus: any;
    type: any;
    disclosurePersonFullName: any;
    disclosureType: any;
}

export class FcoiReviseRO {
    revisionComment: string | null = null;
    disclosureId: string | number | null = null;
    homeUnit: string | null = null;
}

export class SfiObject {
    isActive = false;
    validPersonEntityRelTypes = [];
    entityType = '';
    involvementStartDate = '';
    involvementEndDate = '';
    countryName = '';
    entityId = '';
    entityNumber = '';
    entityName = '';
    canDelete: boolean;
    isFormCompleted: false;
    personRelType = [];
    updateTimestamp: number;
    updateUser: string;
    coiEntity: CoiEntity = null;
    isSignificantFinInterest = false;
    relationshipDetails: Record<string | number, any[]> = {};
    versionStatus?: string;
}

export interface CoiEntity {
    entityId: number;
    entityNumber: number;
    entityName: string;
    foreignName: any;
    priorName: any;
    shortName: any;
    dunsNumber: any;
    ueiNumber: any;
    cageNumber: any;
    websiteAddress: any;
    startDate: any;
    incorporationDate: any;
    certifiedEmail: any;
    activityText: any;
    phoneNumber: any;
    primaryAddressLine1: any;
    primaryAddressLine2: any;
    city: any;
    state: any;
    postCode: any;
    humanSubAssurance: any;
    anumalWelfareAssurance: any;
    animalAccreditation: any;
    approvedBy: any;
    approvedTimestamp: any;
    createdBy: any;
    createTimestamp: any;
    updatedBy: any;
    updateTimestamp: any;
    entityStatusTypeCode: any;
    operatingStatusTypeCode: any;
    documentStatusTypeCode: string;
    businessTypeCode: any;
    currencyCode: any;
    entitySourceTypeCode: any;
    countryCode: any;
    entityOwnershipTypeCode: any;
    incorporatedIn: any;
    congressionalDistrict: any;
    federalEmployerId: any;
    numberOfEmployees: any;
    versionNumber: any;
    versionStatus: string;
    isActive: boolean;
    isDunsMatched: any;
    originalEntityId: any;
    entityStatusType: any;
    entityOperatingStatusType: any;
    entitySourceType: any;
    country: Country;
    entityOwnershipType: EntityOwnershipType;
    entityBusinessType: any;
    entityDocumentStatusType: any;
    entityRiskId?: number;
    entityRiskCategory?: string;
    entityRiskCategoryCode?: string;
    entityRiskLevel?: string;
    entityRiskLevelCode?: string;
    isForeign?: boolean;
}
  
export interface coiReviewComment {
    documentOwnerPersonId: string;
    componentTypeCode: any;
    subModuleItemKey?: any;
    subModuleItemNumber?: any;
    sfiStatus?: any;
    selectedProject?: any;
    coiSubSectionsTitle?: any;
    headerName?: any;
    subSectionTitle?: any;
    subSectionId?: any;
}

export class DisclosureProjectData {
    title?: string = '';
    piName?: string = '';
    projectId?: string = '';
    projectType?: string = '';
    sponsorName?: string = '';
    reporterRole?: string = '';
    homeUnitName?: string = '';
    projectStatus?: string = '';
    projectNumber?: string = '';
    homeUnitNumber?: string = '';
    projectTypeCode?: string = '';
    primeSponsorName?: string = '';
    projectBadgeColour?: string = '';
    projectEndDate?: number | null = null;
    projectStartDate?: number | null = null;
    sponsorCode?: string = '';
    accountNumber?: string = '';
    documentNumber?: string = '';
    primeSponsorCode?: string = '';
    entityCount?: any;
    leadUnitName?: any;
    disclosureId?: any;
    completeCount?: any;
    keyPersonRole?: any;
    moduleCode?: number;
    keyPersonId?: string;
    leadUnitNumber?: any;
    proposalStatus?: any;
    inCompletCount?: any;
    disclsoureNeeded?: any;
    sfiCompleted?: boolean;
    keyPersonName?: string;
    conflictStatus?: string;
    projectIcon?: string = '';
    disclosureSubmitted?: any;
    conflictStatusCode?: string;
    relationShipExists?: boolean;
    questionnaireCompleted?: any;
    disclosureReviewStatus?: any;
    disclosureStatusCount?: any[] = [];
}

export interface CountModalDisclosureProjectData extends DisclosureProjectData {
    formattedLeadUnit: string;
    formattedSponsor: string;
    formattedPrimeSponsor: string;
    formattedProjectHeader: string;
    disclosureConflictBadge: string;
}

export class DisclosureProjectModalData {
    projectDetails: DisclosureProjectData | null = null;
    coiDisclosureId: number | null = null;
    needReporterRole: boolean = true;
}

export interface AssignAdminGroup {
    adminGroupId: number
    adminGroupName: string
    description: string
    email: any
    roleId: number
    role: Role
    primaryPersonId: any
    person: any
    isActive: boolean
    updateTimestamp: number
    updateUser: string
    moduleCode: number
}

export interface Role {
    roleId: number
    roleName: string
    description: string
    statusFlag: string
    roleTypeCode: string
    roleType: RoleType
    createTimeStamp: number
    createUser: string
    updateTimeStamp: number
    updateUser: string
}

export interface RoleType {
    roleTypeCode: string
    roleType: string
    isActive: boolean
}

export interface FCOIDisclosureCreateRO {
    coiProjectTypeCode?: string
    revisionComment?: string
    moduleItemKey?: string | number
    fcoiTypeCode?: string
    moduleCode?: string | number
    homeUnit: string
    personId: string
}

export interface COICountModalViewSlider {
    isOpenSlider: boolean;
    entityId: number | string;
}

export interface COICountModalClose {
    isOpenCountModal: boolean;
    content?: number | string;
}

export class COICountModal {
    inputType: AttachmentSourceSection;
    moduleCode: number | null = null;
    fcoiTypeCode: string | null = null;
    projectHeader?: string | null = null;
    projectTitle?: string | null = null;
    projectNumber?: string | null = null;
    personFullName: string | null = null;
    disclosureType: string | null = null;
    personUnit = null;
    disclosureId: number | null = null;
    reviewStatusCode?: string | null = null;
    personId: string | null = null;
    count?: number | null = null;
    isOpenCountModal = false;
}

export interface COICountModalProjectUpdate {
    projectCountList: DashboardProjectCount[];
    updatedProjectsList: CountModalDisclosureProjectData[];
}

export interface ActionListInbox {
    inboxId: number;
    moduleCode: number;
    moduleItemKey: string | number;
    messageTypeCode: string;
    message: ActionListMessage;
    userMessage: string;
    openedFlag: string;
    subjectType: string;
    toPersonId: string;
    arrivalDate: number;
    updateTimeStamp: number;
    updateUser: string;
    subModuleCode: number;
    subModuleItemKey: string;
    moduleName: ActionListModuleName;
    alertType: any;
    expirationDate: any;
    toUser: string;
}

export interface ActionListMessage {
    messageTypeCode: number;
    description: string;
    updateTimeStamp: number;
    updateUser: string;
}

export interface ActionListModuleName {
    moduleCode: number;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
    dynamicSubSectionConfigs: any;
}

export interface SfiCardCommentDetails {
    isShowComment: boolean;
    entityCommentCount: number;
}

export interface EndPointOptions {
    contextField?: string;
    formatString?: string;
    path?: string;
    defaultValue?: string;
    params?: Record<string, any>;
    filterFields?: string;
}

export interface ActionListCount {
    count: string | number;
}

export interface ExistingDisclosure {
    isExists: boolean;
    moduleCode: number;
    ModuleName: string;
}

export interface SharedBootstrapDropdownDetails {
    btnTitle: string;
    uniqueId: string;
    dropdownBtnClass?: string;
    dropdownMenuClass?: string;
    dropdownMenuBtnClass?: string;
    dropDownBtnLabel?: string
}
