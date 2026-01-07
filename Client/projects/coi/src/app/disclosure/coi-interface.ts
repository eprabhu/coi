import { CoiProjectType, DisclosureCommentsCounts, Person, SharedProjectDetails, Unit } from "../common/services/coi-common.interface";
import { RiskLevel } from "../entity-management-module/shared/entity-interface";
import { CommonModalConfig } from "../shared-components/common-modal/common-modal.interface";
import { DisclosureProjectData } from "../shared-components/shared-interface";
import { WorkFlowResult } from "../shared-components/workflow-engine2/workflow-engine-interface";

export type DisclosureRelationshipProjectCard = { uniqueId: 'OPEN_REVIEW_COMMENTS', content?: any };

export const ADD_REVIEW_MODAL_ID = 'add-review-modal-trigger';
export class COI {
    coiDisclosure: CoiDisclosure;
    person: Person | null;
    numberOfSFI: number;
    numberOfProposal: number;
    numberOfAward: number;
    coiEntity: any;
    coiFinancialEntity: any;
    adminGroup: AdminGroup[];
    coiSections: any[];
    proposalIdlinkedInDisclosure: any;
    projectDetail: DisclosureProjectData;
    coiReviewerList: ReviewerList[] = [];
    documentOwnerPersonId: string;
    disclosureCommentsCount : DisclosureCommentsCounts;
    coiFinancialEntityDetails: any[] = [];
    workFlowResult = new COIWorkFlow();
}


export interface CoiConflictStatusType {
    conflictStatusCode?: string;
    description?: string;
    updateTimestamp?: number;
    updateUser?: string;
    isActive?: boolean;
}

export interface CoiDispositionStatusType {
    dispositionStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface CoiReviewStatusType {
    reviewStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export interface CoiDisclosureFcoiType {
    fcoiTypeCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export class CoiDisclosure {
    disclosureId: number;
    disclosureNumber: number;
    versionNumber: number;
    personId: string;
    conflictStatusCode: string;
    coiConflictStatusType: CoiConflictStatusType;
    dispositionStatusCode: string;
    coiDispositionStatusType: CoiDispositionStatusType;
    reviewStatusCode: string;
    coiReviewStatusType: CoiReviewStatusType;
    fcoiTypeCode: string;
    coiDisclosureFcoiType: CoiDisclosureFcoiType;
    versionStatus: string;
    certificationText?: any;
    certifiedAt?: any;
    expirationDate: number;
    certifiedBy?: any;
    createUser: string;
    createTimestamp: number;
    updateTimestamp: number;
    updateUser: string;
    isDisclosureQuestionnaire: boolean;
    person: Person;
    adminPersonId: string;
    adminPersonName: string;
    adminGroupId: number;
    adminGroupName: string;
    moduleItemKey: string;
    title: string;
    numberOfSFI: any;
    riskCategoryCode: any;
    coiRiskCategory: any;
    updateUserFullName: string;
    coiProjectType: CoiProjectType;
    personAttachmentsCount: number;
    personEntitiesCount: number;
    personNotesCount: number;
    withdrawalRequested: boolean;
    withdrawalRequestReason: string;
    isNewEngagementAdded = false;
    isExtended = false;
    coiProjectTypeCode: string;
    disclosureAttachmentsCount: number;
    isHomeUnitSubmission: boolean | null = false;
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

export class CommentConfiguration {
    disclosureId: any = null;
    coiReviewId: number = null;
    coiReviewCommentId: number = null;
    coiReviewActivityId = '1';
    coiSectionsTypeCode: any = null;
    modifyIndex = -1;
    comment: any = null;
    coiParentCommentId: number = null;
    isPrivate = false;
    subSectionList: any = [];
    isSubSectionComment = false;
    coiSubSectionsId: string = null;
    coiReviewCommentTag: any = [];
    coiReviewCommentAttachment: any = [];
}

export class CommentRequest {
    coiReviewId: number = null;
    coiReviewCommentId: number = null;
    coiReviewActivityId = '1';
    coiSectionsTypeCode: string = null;
    coiSectionsType: any;
    disclosureId: any = null;
    comment = '';
    coiParentCommentId: number = null;
    isPrivate = false;
    coiSubSectionsId: string = null;
    coiReviewCommentTag: any = [];
    coiReviewCommentAttachment: any = [];
}

export interface getApplicableQuestionnaireData {
    applicableQuestionnaire: ApplicableQuestionnaire[]
    questionnaireId: any
    moduleItemKey: string
    moduleSubItemKey: string
    moduleItemCode: number
    moduleSubItemCode: number
    questionnaireAnswerHeaderId: any
    questionnaireAnsAttachmentId: any
    questionnaireCompleteFlag: any
    actionUserId: string
    actionPersonId: any
    actionPersonName: string
    acType: any
    questionnaireName: any
    newQuestionnaireVersion: boolean
    questionEditted: boolean
    questionnaireList: any
    questionnaireGroup: any
    header: any
    questionnaire: any
    usage: any
    fileName: any
    fileContent: any
    length: any
    remaining: any
    fileTimestamp: any
    contentType: any
    personId: any
    multipartFile: any
    moduleList: any
    isInserted: any
    updateTimestamp: any
    copyModuleItemKey: any
    questionnaireNumbers: any[]
    lookUpDetails: any
    newQuestionnaireId: any
    moduleSubItemCodes: any[]
    questionnaireBusinessRules: any
    ruleId: any
    rulePassed: any
    questionnaireMode: string
}

export interface ApplicableQuestionnaire {
    NEW_QUESTIONNAIRE_LABEL: any
    MODULE_SUB_ITEM_KEY: any
    QUESTIONNAIRE_ANS_HEADER_ID: any
    QUESTIONNAIRE_COMPLETED_FLAG: any
    MODULE_SUB_ITEM_CODE: number
    MODULE_ITEM_CODE: number
    QUESTIONNAIRE_LABEL: string
    NEW_QUESTIONNAIRE: any
    IS_NEW_VERSION: string
    VERSION_NUMBER: number
    QUESTIONNAIRE_NUMBER: number
    QUESTIONNAIRE_ID: number
    QUESTIONNAIRE: string
    ANSWERED_VERSION_NUMBER: any
    NEW_QUESTIONNAIRE_ID: any
    IS_MANDATORY: string
}

export interface ReviewerList {
    coiReviewId: number;
    assigneePersonId: string;
    disclosureId: number;
    coiDisclosure: Disclosure;
    adminGroupId: any;
    adminGroup: any;
    reviewStatusTypeCode: string;
    coiReviewStatus: CoiReviewStatus;
    description: any;
    createTimestamp: number;
    createUser: any;
    updateTimestamp: number;
    updateUser: any;
    assigneePersonName: string;
}

export interface Disclosure {
    disclosureId: number;
    personId: string;
    person: Person;
    homeUnit: string;
    unit: Unit;
    disclosureNumber: number;
    versionNumber: number;
    versionStatus: string;
    fcoiTypeCode: string;
    coiDisclosureFcoiType: CoiDisclosureFcoiType;
    conflictStatusCode: string;
    coiConflictStatusType: CoiConflictStatusType;
    dispositionStatusCode: string;
    coiDispositionStatusType: CoiDispositionStatusType;
    reviewStatusCode: string;
    coiReviewStatusType: CoiReviewStatusType;
    riskCategoryCode: string;
    coiRiskCategory: CoiRiskCategory;
    moduleCode: number;
    moduleItemKey: string;
    expirationDate: number;
    certificationText: string;
    certifiedBy: string;
    certifiedAt: number;
    revisionComment: string;
    adminGroupId: any;
    adminPersonId: string;
    updateTimestamp: number;
    updateUser: string;
    createUser: any;
    createTimestamp: number;
    updateUserFullName: any;
    createUserFullName: any;
    numberOfSFI: any;
    numberOfProposals: any;
    numberOfAwards: any;
    coiProjectTypeCode: any;
    adminGroupName: any;
    adminPersonName: any;
}
export interface CoiRiskCategory {
    riskCategoryCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}
export interface CoiReviewStatus {
    reviewStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export type ModalType = 'COMPLETE' | 'START';

export interface ProjectRelationshipDetails {
    moduleCode: number;
    projectId: string;
    projectNumber: string;
    title: string;
    projectStatus: string;
    projectStartDate: number;
    projectEndDate: number;
    homeUnitNumber: string;
    homeUnitName: string;
    sponsorName: string;
    primeSponsorName: any;
    piName: string;
    keyPersonId: string;
    keyPersonName: string;
    reporterRole: string;
    conflictStatus: string;
    conflictStatusCode: string;
    entityCount: any;
    relationShipExists: boolean;
    sfiCompleted: boolean;
    disclosureStatusCount: any[];
    projectTypeCode: string;
    projectType: string;
    projectBadgeColour: string;
}

export class ApplyToAllModal {
    selectedProject: SharedProjectDetails | null = null;
    selectedEngagement: PersonEntity | null = null;
    projectConflictStatusCode = '';
    coiDisclProjectId = null;
    isOpenModal = false;
    comment = '';
}

export class AddConflictSlider {
    isOpenSlider = false;
    projectSfiRelations = new ProjectSfiRelations();
    coiDisclEntProjDetail = new CoiDisclEntProjDetail();
}

export class CoiDisclProjEngDetails {
    accountNumber?: string | null = null;
    coiDisclProjectId?: number | null = null;
    documentNumber?: string | null = null;
    homeUnitName?: string | null = null;
    homeUnitNumber?: string | null = null;
    keyPersonId?: string | null = null;
    keyPersonName?: string | null = null;
    moduleCode?: number | null = null;
    piName?: string | null = null;
    primeSponsorCode?: string | null = null;
    primeSponsorName?: string | null = null;
    projectBadgeColour?: string | null = null;
    projectEndDate?: number | null = null;
    projectIcon?: string | null = null;
    projectId?: string | null = null;
    projectNumber?: string | null = null;
    projectStartDate?: number | null = null;
    projectStatus?: string | null = null;
    projectType?: string | null = null;
    projectTypeCode?: string | null = null;
    reporterRole?: string | null = null;
    sponsorCode?: string | null = null;
    sponsorName?: string | null = null;
    title?: string | null = null;
    coiDisclProjectEntityRelId?: number | null = null;
    updatedBy?: string | null = null;
    updateTimestamp?: number | null = null;
    projectConflictStatusCode?: string | null = null;
    coiProjConflictStatusType?: any | null = null;
    personEngagementDetails: string | null = null;
}

export class ProjectSfiRelations {
    // for projects
    accountNumber?: string | null = null;
    coiDisclProjectId?: number | null = null;
    documentNumber?: string | null = null;
    homeUnitName?: string | null = null;
    homeUnitNumber?: string | null = null;
    keyPersonId?: string | null = null;
    keyPersonName?: string | null = null;
    moduleCode?: number | null = null;
    piName?: string | null = null;
    primeSponsorCode?: string | null = null;
    primeSponsorName?: string | null = null;
    projectBadgeColour?: string | null = null;
    projectEndDate?: number | null = null;
    projectIcon?: string | null = null;
    projectId?: string | null = null;
    projectNumber?: string | null = null;
    projectStartDate?: number | null = null;
    projectStatus?: string | null = null;
    projectType?: string | null = null;
    projectTypeCode?: string | null = null;
    reporterRole?: string | null = null;
    sponsorCode?: string | null = null;
    sponsorName?: string | null = null;
    title?: string | null = null;
    // for engagement
    project?: any | null = null;
    coiEntity?: any | null = null;
    entityId?: string | number | null = null;
    personEntityNumber?: number | null = null;
    personEntity?: PersonEntity | null = null;
    prePersonEntityId?: number | null = null;
    personEntityId?: number | null = null;
    coiDisclProjectEntityRelId?: number | null = null;
    // for conflict details
    conflictCount? = new ConflictCount();
    conflictStatus?: string | null = null;
    conflictStatusCode?: string | null = null;
    conflictCompleted?: boolean | null = null;
    relationShipExists?: boolean | null = null;
    // for engagement/project list
    coiDisclEntProjDetails?: CoiDisclEntProjDetail[] = [];
}

export class ConflictCount { }

export class CoiDisclEntProjDetail {
    // engagement
    project?: any | null = null;
    coiEntity?: any | null = null;
    entityId?: string | number | null = null;
    coiDisclProjectId?: number | null = null;
    personEntityNumber?: number | null = null;
    personEntity?: PersonEntity | null = null;
    prePersonEntityId?: number | null = null;
    personEntityId?: number | null = null;
    // projects
    accountNumber?: string | null = null;
    documentNumber?: string | null = null;
    homeUnitName?: string | null = null;
    homeUnitNumber?: string | null = null;
    keyPersonId?: string | null = null;
    keyPersonName?: string | null = null;
    moduleCode?: number | null = null;
    piName?: string | null = null;
    primeSponsorCode?: string | null = null;
    primeSponsorName?: string | null = null;
    projectBadgeColour?: string | null = null;
    projectEndDate?: number | null = null;
    projectIcon?: string | null = null;
    projectId?: string | null = null;
    projectNumber?: string | null = null;
    projectStartDate?: number | null = null;
    projectStatus?: string | null = null;
    projectType?: string | null = null;
    projectTypeCode?: string | null = null;
    reporterRole?: string | null = null;
    sponsorCode?: string | null = null;
    sponsorName?: string | null = null;
    title?: string | null = null;
    // relation
    updatedBy?: string | null = null;
    updateTimestamp?: number | null = null;
    coiDisclProjectEntityRelId?: number | null = null;
    projectConflictStatusCode?: string | null = null;
    coiProjConflictStatusType?: any | null = null;
    personEngagementDetails: string | null = null;
}

export interface CoiProjConflictStatusType {
    isActive?: any;
    updateUser?: any;
    description?: any;
    updateTimestamp?: any;
    projectConflictStatusCode?: any;
    defaultConflictComment?: string;
}

export interface DisclComment {
    comment?: any;
    isPrivate?: any;
    commentId?: any;
    moduleCode?: any;
    updateUser?: any;
    commentType?: any;
    commentTags?: any;
    attachments?: any;
    componentType?: any;
    moduleItemKey?: any;
    subModuleCode?: any;
    formBuilderId?: any;
    childComments?: any;
    commentPersonId?: any;
    commentTypeCode?: any;
    parentCommentId?: any;
    updateTimestamp?: any;
    moduleItemNumber?: any;
    subModuleItemKey?: any;
    componentTypeCode?: any;
    updateUserFullName?: any;
    subModuleItemNumber?: any;
    formBuilderSectionId?: any;
    moduleSectionDetails?: any;
    documentOwnerPersonId?: any;
    formBuilderComponentId?: any;
    isSectionDetailsNeeded?: any;
}

export class PersonEntity {
    entityName?: string | null = null;
    entityType?: string | null = null;
    countryName?: string | null = null;
    riskLevel?: RiskLevel | null = null;
    entityNumber?: number | null = null;
    entityRiskId?: number | null = null;
    conflictCount?: number | null = null;
    personEntityId?: number | null = null;
    entityRiskLevel?: string | null = null;
    isFormCompleted?: boolean | null = null;
    projEntRelations?: number | null = null;
    entityId?: number | string | null = null;
    conflictCompleted?: boolean | null = null;
    entityBusinessType?: string | null = null;
    entityRiskCategory?: string | null = null;
    involvementEndDate?: number | null = null;
    entityRiskLevelCode?: string | null = null;
    involvementStartDate?: number | null = null;
    entityRiskCategoryCode?: string | null = null;
    validPersonEntityRelType?: string | null = null;
    personEntityVersionStatus?: string | null = null;
    personEntityRelations?: PersonEntityRelations[] = [];     // for frontend purpose
}

export class PersonEntityRelations {
    icon? = '';
    description? = '';
    relationshipType? = '';
    relations?: string[] = [];
}

export class ProjectSfiRelationLoadRO {
    personId: string | null = null;
    disclosureId: number | null = null;
    disclosureNumber: number | null = null;
    dispositionStatusCode: string = '';
}

export class ProjectSfiRelationConflictRO {
    disclosureId: number = null;
    disclosureNumber: number = null;
    personId: string = null;
    coiDisclProjectEntityRelId: number = null;
    coiDisclProjectId: number = null;
    projectConflictStatusCode: string = null;
    projectEngagementDetails: string = null;
    personEntityId: number = null;
    relationshipSFIMode: boolean = false;
    applyAll: boolean = false;

    constructor(init?: Partial<ProjectSfiRelationConflictRO>) {
        Object.assign(this, init);
    }
}

export interface CoiStatus {
    projectConflictStatusCode: string;
    description: string;
    updateTimestamp: number;
    updateUser: string;
    isActive: boolean;
}

export class DefineRelationshipDataStore {
    coiDisclProjectEntityRelId?: string | number | null = null;
    personEntityId: string | number | 'ALL' | null = null;
    projectId: string | number | 'ALL' | null = null;
    updatedKeys: string[] = [];
    searchChanged = false;
}

export interface RelationshipConflictType {
    color: string;
    statusCode: string;
    projectConflictStatus: string;
    projectConflictStatusCode: string;
}

export interface CertifyDisclosureRO {
    disclosureId: number;
    certificationText: string;
    conflictStatusCode: string;
}

export interface UpdateProjectRelationshipRO {
    comment: string;
    disclosureId: number;
    conflictStatusCode: string;
    documentOwnerPersonId: string;
    coiDisclProjectEntityRelId: number;
}

export class ExpandCollapseSummaryBySection {
    COI801 = true;
    COI802 = true;
    COI803 = false;
    COI804 = true;
    COI805 = false;
}

export interface FormattedConflictData {
    conflictCount: { [key: string]: number },
    conflictCompleted: boolean,
    conflictStatusCode: string | null,
    conflictStatus: string | null,
}

export interface SaveProjectSfiConflict {
    updateTimestamp: number;
    updateUserFullName: string;
    disclConflictStatusType: CoiConflictStatusType;
    conflictDetails: ProjectSfiRelationConflictRO[];
}

export class Note {
    entityId?: number | string;
    personId?: number | string;
    noteId: number;
    title: string = '';
    content: string = '';
    sectionCode?: string;
    updateTimestamp: number;
    updatedBy: string;
    updatedByFullName: string;
    needReadMore: boolean;
    isExpanded: boolean;
    isEditable = true;
}

export class ValidationDockModalConfiguration {
    modalHeader: string = 'Validation';
    modalId: string = 'validation-dock-modal';
    modalConfiguration: CommonModalConfig = new CommonModalConfig(this.modalId, 'Return', 'Deny', 'lg');
    modalBodyMsg: string | null = null;
    validationType = 'Recall Request';
    additionalBtns: string[] = [];
    validationHelpText = 'Requested to recall the disclosure';
    validationDockText = 'Recall Request Pending';
}

export interface ProjectVoidConfirmRO {
    moduleCode: number | string,
    moduleItemId: string| number,
}

export interface DisclosureCommentCountDetails {
    componentTypeCode: string;
    subModuleItemKey?: string;
    count: number;
    subModuleItemNumber?: string;
}

export interface AdminsAndAdminGroupDetails {
    persons: Person[];
    adminGroups: AdminGroup[];
}

export interface DisclosureCompleteFinalReviewRO {
    description: string;
    disclosureId: string | number;
    disclosureNumber: string | number;
}

export class COIApproveOrRejectWorkflowRO {
    coiDisclosureId: number | string | null = null;
    coiDisclosureNumber: number | string | null = null;
    personId: string | null = null;
    workFlowPersonId: string | null = null;
    updateUser: string | null = null;
    approverStopNumber: number | null = null;
    actionType: 'A' | 'R' | null = null;
    approveComment: string | null = null;
}

export class COIWorkFlow extends WorkFlowResult {
    coiDisclosure: CoiDisclosure | null = null;
}

export interface COIWorkFlowResponse extends WorkFlowResult {
    disclosureId?: number | string | null;
    disclosureNumber?: string | null;
    adminGroupName?: string | null;
    adminPersonName?: string | null;
    reassignedAdminPersonName?: string | null;
    comment?: string | null;
    description?: string | null;
    updateUserFullName?: string | null;
    reviewerFullName?: string | null;
    reviewLocationType?: any;
    reviewStatus?: string | null;
    reviewStatusCode?: string | number | null;
    reviewStatusType?: CoiReviewStatusType | null;
    coiDispositionStatusType?: CoiDispositionStatusType | null;
    updateTimestamp?: number | null;
}
