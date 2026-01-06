import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { AttachmentReplaceRO, AttachmentSaveRO, AvailableDocumentActions, Organization, Person, RolodexPerson, SharedProjectDetails, Unit } from "../../common/services/coi-common.interface";
import { EntireEntityDetails } from "../../entity-management-module/shared/entity-interface";
import {
    CMP_FIELD_CUSTOM_CLASS, CMP_NON_UNIVERSITY_MANDATORY_FIELDS, CMP_TYPE,
    CMP_UNIVERSITY_MANDATORY_FIELDS, CmpTypeValue
} from "./management-plan-constants";
import { CommonModalConfig } from '../../shared-components/common-modal/common-modal.interface';
import { EDITOR_CONFIGURATION, PAGINATION_LIMIT } from '../../app-constants';
import { COIAttachment } from '../../attachments/attachment-interface';
import { CmpTaskDetails } from '../management-plan/sub-modules/management-plan-tasks/task.interface';
import { CMP_LOCALIZE } from '../../app-locales';

export type CmpCardActionEvent = { action: 'ASSIGN_ADMIN' | 'COMMENTS', cmpDetails: null | CmpCard };
export type CmpRouteGuard = {
    CMP_HEADER: CmpPlan, SECTION_CONFIG: any, ENTITY_DATA: CmpEntity[],
    PROJECT_DATA: CmpProject[], PERSON_TASK: CmpTaskDetails[], REVIEWERS_LIST: CmpReviewLocation[]
};
export type CmpFieldKey = 'PERSON_SEARCH' | 'CMP_TYPE' | 'LAB_CENTER' | 'TEMPLATE' | 'SUB_AWARD_INSTITUTE'
    | 'ACADEMIC_DEPARTMENT' | 'ENTITY_SEARCH' | 'PROJECT_SEARCH' | 'SUB_AWARD_INVESTIGATOR' | 'PROJECT' | 'PROJECT_TYPE';
export type CmpBuilderModalType = 'SECTION_ADD' | 'SECTION_EDIT' | 'SECTION_DELETE' | 'SECTION_HISTORY'
    | 'COMPONENT_ADD' | 'COMPONENT_EDIT' | 'COMPONENT_DELETE' | 'COMPONENT_HISTORY'
    | 'RECIPIENT_ADD' | 'RECIPIENT_EDIT' | 'RECIPIENT_DELETE';
export type CmpTemplateGroup = Record<string, CmpTemplateTypeMap[]>;
export type CmpConfirmationModalFields = 'CMP_ACTION_DESCRIPTION' | 'ATTACHMENT' | 'APPROVAL_DATE' | 'EXPIRATION_DATE';
export type CmpLocationReviewType = 'START_LOCATION_REVIEW' | 'COMPLETE_LOCATION_REVIEW';
export type CmpConfirmModalType = 'CONFIRMATION' | 'GENERATE' | 'CANCEL' | 'PREVIEW' | CmpLocationReviewType | 'REGENERATE' | 'UPLOAD' | 'REPLACE';
export type CmpRecipientFieldsType = 'PERSON_SEARCH' | 'SIGNATURE_BLOCK' | 'ATTESTATION' | 'DESIGNATION';
export type CmpCreationActionType = 'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY' | 'VALIDATION_COMPLETE' | 'SAVE_COMPLETE' | 'SAVE_FAILED';
export type CmpCreationEvent = { actionType: CmpCreationActionType, content?: any };
export type CmpBuilderType = 'SECTION' | 'COMPONENT' | 'RECIPIENT';
export class CmpCard {
    cmpId: string | number | null = null;
    cmpNumber: string | number | null = null;
    cmpTypeCode: string | number | null = null;
    cmpType: string | null = null;
    cmpStatusCode: string | number | null = null;
    cmpStatus: string | null = null;
    personId: string | null = null;
    personFullName: string | null = null;
    rolodexId: string | null = null;
    rolodexFullName: string | null = null;
    homeUnit: string | null = null;
    homeUnitName: string | null = null;
    approvalDate: number | null = null;
    expirationDate: number | null = null;
    projectNumber: string | null = null;
    projectTitle: string | null = null;
    projectStartDate: number | null = null;
    projectEndDate: number | null = null;
    sponsorAwardNumber: string | null = null;
    leadUnit: string | null = null;
    leadUnitName: string | null = null;
    entityNumber: string | null = null;
    entityName: string | null = null;
    entityId: number | null = null;
    updatedBy: string | null = null;
    updateTimestamp: number | null = null;
    unitAccessType: string | null = null;
    sponsorCode: string | null = null;
    sponsorName: string | null = null;
    primeSponsorCode: string | null = null;
    primeSponsorName: string | null = null;
    cmpStatusBadgeColor: string | null = null;
    totalCommentsCount: number | null = null;
    isShowDownload = false;
    versionStatus: string | null = null;
    // frontend
    projectHeader: string | null = null;
    projectPeriod: string | null = null;
    homeUnitDisplayName: string | null = null;
    leadUnitDisplayName: string | null = null;
    sponsorDisplayName: string | null = null;
    primeSponsorDisplayName: string | null = null;
}


export class CmpDetails {
    cmpId: string | number | null = null;
    cmpNumber: number | null = null;
    cmpType = new CmpType();
    person: Person | null = null;
    rolodex: RolodexPerson | null = null;
    academicDepartment: Unit | null = null;
    labCenter: Unit | null = null;
    organization: Organization | null = null;
    cmpEntityList: CmpEntity[] = [];
    cmpProjectList: CmpProject[] = [];
    template: any;
    cmpSectionTemplates: CmpTemplateTypeMap[] = [];
    // frontend
    employeeType: 'PERSON' | 'ROLODEX' = 'PERSON';
}

export class CmpCreationRO {
    personId?: string | null = null
    rolodexId?: string | null = null;
    cmpTypeCode?: string | null = null;
    labCenterNumber?: string | null = null;
    subAwardInstituteCode?: string | null = null;
    academicDepartmentNumber?: string | null = null;
    cmpId?: string | number | undefined = undefined;
    sectionRelations?: CmpBuilderSection[] = [];
    entityRelations?: { entityNumber: number | string | null }[] = [];
    projectRelations?: { moduleCode: string | number | null, moduleItemKey: string | null }[] = [];
}

export class CmpCreationConfig {
    isEditMode = true;
    cmpDetails = new CmpDetails();
    disabledFields: Partial<Record<CmpFieldKey, boolean>> = {}
    errorMsgMap = new Map<CmpFieldKey, string>();
    fieldCustomClass: Record<CmpFieldKey, string> = CMP_FIELD_CUSTOM_CLASS;
    requestFields = new CmpCreationRO();
    mandatoryFieldsList: Record<CmpTypeValue, CmpFieldKey[]> = {
        [CMP_TYPE.UNIVERSITY]: CMP_UNIVERSITY_MANDATORY_FIELDS,
        [CMP_TYPE.NON_UNIVERSITY]: CMP_NON_UNIVERSITY_MANDATORY_FIELDS
    };
}

export class CmpCreationSliderConfig {
    cmpCreationConfig = new CmpCreationConfig();
    sliderId = 'cmp-creation-slider';
    isOpenSlider = false;
    sliderHeader = 'Create CMP';
}

export class CmpPlan {
    initiator = '';
    plan = new CmpHeader();
}

export class ManagementPlanStoreData extends CmpPlan {
    cmpEntityList: CmpEntity[] = [];
    cmpProjectList: CmpProject[] = [];
    availableActions: AvailableDocumentActions[] = [];
    cmpBuilder = new CmpBuilder();
    cmpReviewLocationList: CmpReviewLocation[] = [];
    cmpAttachmentsList: COIAttachment[] = [];
    loggedPersonTaskList: CmpTaskDetails[] = [];
    cmpCommentsCount: CmpCommentsCounts;
    cmpTaskList: CmpTaskDetails[] = [];
}

export class CmpHeader {
    cmpId: string | number | null = null;
    cmpNumber: number | null = null;
    cmpTypeCode: string | null = null;
    cmpType: CmpType | null = null;
    versionNumber: number | null = null;
    versionStatus: string | null = null;
    cmpStatusCode: string | null = null;
    statusType: CmpStatusType | null = null;
    personId: string | null = null;
    person: Person | null = null;
    rolodexId: string | null = null;
    rolodex: RolodexPerson | null = null;
    academicDepartmentNumber: string | null = null;
    academicDepartment: Unit | null = null;
    labCenterNumber: string | null = null;
    labCenter: Unit | null = null;
    subAwardInstituteCode: string | null = null;
    organization: Organization | null = null;
    createdBy: string | null = null;
    createdTimestamp: number | null = null;
    updatedBy: string | null = null;
    updateTimestamp: number | null = null;
    approvalDate: number | null = null;
    expirationDate: number | null = null;
}

export class CmpType {
    cmpTypeCode: string | null = null;
    description: string | null = null;
    updatedBy?: string | null = null;
    updatedTimestamp?: number | null = null;
}

export interface CmpStatusType {
    statusCode: string | null;
    description: string | null;
    isActive?: boolean | null;
    updateTimestamp?: number | null;
    updatedBy?: string | null;
    sortOrder?: number | null;
    badgeColor?: string | null;
}

export class CmpEntity {
    cmpId: string | number | null = null;
    entity = new EntireEntityDetails();
    entityNumber: number | string | null = null;
    personEntityNumber: number | string | null = null;
}

export class CmpProject {
    moduleItemKey: string | null = null;
    cmpId: string | number | null = null;
    moduleCode: number | string | null = null;
    projectDetails = new SharedProjectDetails();
}

export class CmpBuilderComponent {
    cmpSectionRelId: string | number | null = null;
    secCompId: string | number | null = null;
    description: string | null = null;
    sortOrder: number | null = null;
    updatedBy?: string | null = null;
    updateTimestamp?: number | null = null;
    createdBy?: string | null = null;
}

export class CmpBuilderSectionHistory {
    sectionCompHistoryId?: number | null = null;
    secCompId?: string | number | null = null;
    cmpSectionRelId?: number | null = null;
    actionType?: string | null = null;
    oldData?: string | null = null;
    newData?: string | null = null;
    updatedBy?: string | null = null;
    updatedTimestamp?: number | null = null;
}

export class CmpBuilder {
    sections: CmpBuilderSection[] = [];
    addendum: CmpBuilderSection | null = null;
    recipients: CmpBuilderRecipient[] = [];
}

export class CmpBuilderRecipient {
    cmpRecipientId: string | number | null = null;
    cmpId: string | number | null = null;
    signOrder: number | null = null;
    signatureBlock: string | null = null;
    personId: string | null = null;
    fullName: string | null = null;
    designation: string | null = null;
    attestationStatement: string | null = null;
    updateTimestamp: number | null = null;
    updatedBy: string | null = null;
}

export class CmpBuilderSection {
    sortOrder: number | null = null;
    sectionName: string | null = null;
    description: string | null = null;
    cmpId?: string | number | null = null;
    components: CmpBuilderComponent[] = [];
    cmpSectionRelId?: string | number | null = null;
    createdBy?: string | null = null;
    // frontend
    sectionType?: 'DEFAULT_SECTION' | 'ADDENDUM' = 'DEFAULT_SECTION';
}

export class CmpBuilderModalConfig {
    modalHeader = 'Add New Section';
    modalBody = '';
    actionType: CmpBuilderModalType = 'SECTION_ADD';
    isOpenModal = false;
    sectionDetails: CmpBuilderSection | null = null;
    componentDetails: CmpBuilderComponent | null = null;
    recipientDetails: CmpBuilderRecipient | null = null;
    modalConfig = new CommonModalConfig('cmp-add-section-modal', 'Add', 'Cancel', 'xl');
    errorMsgMap = new Map<'CONTENT' | 'SECTION_NAME', string>();
    sectionName = '';
    description = '';
    sortOrder: number | null = null;
    editorElement = null;
    editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIGURATION;
    constructor() {
        this.editorConfig.placeholder = 'Please enter the content.';
    }
}

export interface CmpProjectType {
    cmpProjTypeRelId: string;
    cmpTypeCode: string;
    coiProjectTypeCode: string;
    isIncluded: 'Y' | 'N';
    updatedBy: string;
    updateTimestamp: number;
}

export interface CmpTemplateTypeMap {
    tmplSecMappingId: number;
    sectionId: number;
    coiManagementPlanSection: CmpBuilderSection;
    templateId: number;
    coiManagementPlanTemplate: CmpTemplate;
    name: string;
    sortOrder: number;
    updatedBy: string;
    updateTimestamp: number;
}

export interface CmpTemplate {
    templateId: number;
    templateName: string;
    description: string;
    updatedBy: string;
    updatedTimestamp: number;
}

export class CmpConfirmationModal {
    description = '';
    uploadedFiles: any[] = [];
    descriptionLabel = 'Description';
    textAreaPlaceholder = 'Please provide the description.';
    modalHeader = 'Confirmation';
    mandatoryFieldsList: CmpConfirmationModalFields[] = [];
    visibleFieldsList: CmpConfirmationModalFields[] = [];
    errorMsgMap = new Map<CmpConfirmationModalFields, string>();
    modalBody = 'Are you sure want to confirm';
    modalConfig = new CommonModalConfig('cmp-confirmation-modal', 'Yes', 'No');
    action: CmpConfirmModalType = 'CONFIRMATION';
    actionTypeCode: string | number | null = null;
    modalHelpTextConfig: { subSectionId: string, elementId: string };
    descriptionHelpTextConfig: { subSectionId: string, elementId: string };
    additionalFooterBtns: { action: CmpConfirmModalType, event: any }[] = [];
    selectedAction: AvailableDocumentActions | null = null;
    selectedReviewLocation: CmpReviewLocation | null = null;
    approvalDate: any;
    expirationDate: any;
    warningText = '';
    InfoText = '';
    approvalDateLabel = `${CMP_LOCALIZE.TERM_CMP} Approval Date`;
    expirationDateLabel = `${CMP_LOCALIZE.TERM_CMP} Expiration Date`;
    attachmentLabel = 'Add Files';
}

export class UpdateCmpStatusRO {
    cmpId: string | number | null;
    description: string | null;
    availableActionId: string | number | null;
    approvalDate?: string | number | null;
    expirationDate?: string | number | null;
}

export interface CmpBuilderRecipientRO {
    cmpRecipientId?: string | number | null;
    cmpId?: string | number | null;
    signOrder?: number | null;
    signatureBlock?: string | null;
    personId?: string | null;
    designation?: string | null;
    attestationStatement?: string | null;
}

export interface CmpBuilderComponentRO {
    sortOrder?: number | null;
    description?: string | null;
    secCompId?: string | number | null;
    cmpSectionRelId?: string | number | null;
}

export interface CmpBuilderSectionRO {
    sortOrder?: number | null;
    description?: string | null;
    sectionName?: string | null;
    cmpId?: string | number | null;
    cmpSectionRelId?: string | number | null;
}

export class CmpRecipientConfig {
    recipient = new CmpBuilderRecipient();
    personSearchOptions: any;
    personSearchResult: Person | null = null;
    mandatoryFieldsList: CmpRecipientFieldsType[] = ['PERSON_SEARCH'];
    disabledFields: Partial<Record<CmpRecipientFieldsType, boolean>> = {};
    errorMsgMap = new Map<CmpRecipientFieldsType, string>();
}

export interface CmpAttachmentSaveFilesRO extends AttachmentSaveRO { }

export interface CmpAttachmentReplaceFilesRO extends AttachmentReplaceRO { }

export interface CmpAttachmentSaveRO {
    cmpId: string | number;
    attachments: CmpAttachmentSaveFilesRO[];
    isCmpDocumentUpload: boolean;
}

export interface CmpAttachmentReplaceRO {
    cmpId: string | number;
    attachments: CmpAttachmentReplaceFilesRO[];
    isCmpDocumentReplace: boolean;
}

export interface CmpSaveReviewRO {
    cmpId: string | number | null;
    cmpReviewId?: string | number | null;
    assigneePersonId: string | null;
    reviewStatusTypeCode: string | number | null;
    locationTypeCode: string | number | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
}

export interface CmpReviewLocation {
    cmpReviewId: string | number | null;
    cmpId: string | number | null;
    assigneePersonId: string | null;
    assigneePerson: Person | null;
    reviewStatusTypeCode: string | null;
    reviewStatusType: ReviewLocationStatusType | null;
    locationTypeCode: string | null;
    locationType: ReviewLocationType | null;
    description: string | null;
    startDate: number | null;
    endDate: number | null;
    updateTimestamp: number | null;
    updatedBy: string | null;
    createTimestamp: number | null;
    createdBy: string | null;
}

export interface ReviewLocationStatusType {
    reviewStatusCode: string | null;
    description: string | null;
    isActive: string | null;
    updatedBy: string | null;
    updateTimestamp: number | null;
}

export interface ReviewLocationType {
    locationTypeCode: string | null;
    description: string | null;
    isActive: string | null;
    updatedBy: string | null;
    updateTimestamp: number | null;
}

export class FetchReporterCmpRO {
    pageNumber = PAGINATION_LIMIT;
    currentPage: number = 1;
    sort = { updateTimeStamp: 'desc' };
    isDownload = false;
    cmpPersonId = null;
}

export class CmpCommentsCountRO {
    moduleItemKey?: number | string | null = null;
    documentOwnerPersonId: string | null = null;
    moduleCode: number | string | null = null;
    replyCommentsCountRequired = false;
}

export interface CmpCommentsCounts {
    reviewCommentsCount: CmpReviewCommentsCount[]
    totalCount: number;
}

export interface CmpReviewCommentsCount {
    componentTypeCode: string;
    subModuleItemKey?: string;
    count: number;
}

export interface CmpBuilderData {
    subModuleItemKey: string | null;
    componentTypeCode: string | number;
    componentName: string;
}
