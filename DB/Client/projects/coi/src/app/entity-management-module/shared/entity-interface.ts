import { BatchEntityAvailableInputs, Country, EntityDetailsCardConfig, State } from "../../common/services/coi-common.interface";
import { ModalActionEvent } from "../../shared-components/common-modal/common-modal.interface";
import { COIReviewCommentsConfig } from "../../shared-components/coi-review-comments/coi-review-comments.interface";
import { EntitySectionType } from "./entity-constants";

export type EntityRiskProxyController = '/organization' | '/sponsor' | '/compliance' | '';
export type EntityRiskCategoryCode = 'OR' | 'EN' | 'CO' | 'SP' | '';
export type IndustryCategoryTypeSource = 'A' | 'D' | 'S';  // A - ALL, D - D&B, S - SYSTEM
export type VerifyActionType = 'API_FAILED' | 'VIEW_DUPLICATE' | 'VIEW_SPONSOR' | 'VIEW_SUBAWARD' | 'VIEW_OVERVIEW';
export type DuplicateActionType = 'CLOSE_BTN' | 'SECONDARY_BTN' | 'PRIMARY_BTN' | 'NOT_FOUND' | 'CHECK_BOX' | 'CLOSE_SLIDER' | 'API_FAILED';
export type DataStoreEvent = { dependencies: string[], action: 'REFRESH' | 'UPDATE' };
export type CurrentTabType = 'OVERVIEW' | 'SPONSOR' | 'SUBAWARD' | 'COMPLIANCE' | 'ATTACHMENTS' | 'NOTES' | 'HISTORY' | 'CORPORATE_FAMILY';
export type VerifyModalAction = ModalActionEvent | { event?: any; action: VerifyActionType };
export const ENTITY_DUPLICATE_MATCH_MODAL_ID = 'duplicate_entity_match_found_modal';
export const ENTITY_DUPLICATE_MATCH_SLIDER_ID = 'duplicate_entity_match_found_slider';

export class EntityOwnerShip {
    description: string;
    isActive: boolean;
    ownershipTypeCode: any;
    updateTimestamp: any;
    updatedBy: any;
}

export class IndustryDetails {
    entityId: number | string;
    entityIndustryCatIds: any = [];
    primaryCatId: any;
    updatePrimaryCatId = false;
}

export class RegistrationDetails {
    entityId?: number | string;
    entityRegistrationId?: number;
    entityMailingAddressId?: number;
    regTypeCode: any = '';
    regNumber: any = '';
}

export class AdditionalAddress {
    entityId?: number | string;
    entityMailingAddressId?: number;
    addressLine1: string = '';
    addressLine2: string = '';
    city: string = '';
    state: string = '';
    postCode: string;
    countryCode: string = '';
    addressType?: any;
    addressTypeCode: string = '';
    isCopy?: boolean = false;
    entity?: EntityDetails;
    entityAddressType?: EntityAddressType;
    country?: Country;
    stateDetails?: State;
    locality?: any;
    region?: any;
    county?: any;
    updateTimestamp?: number;
    updatedBy?: string;
}

export interface EntityAddressType {
    addressTypeCode?: string;
    description?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    isActive?: boolean;
}

export class OtherDetails {
    startDate?: string = '';
    incorporationDate?: string = '';
    incorporatedIn?: string = '';
    congressionalDistrict?: string = '';
    federalEmployerId?: string = '';
    priorName?: string;
    foreignName?: string;
    shortName?: string;
    numberOfEmployees?: number = 0;
    businessTypeCode?: any;
    activityText?: string = '';
    currencyCode?: string = '';
    entityBusinessType: any;
}

export class EntityRisk {
    riskTypeCode = '';
    riskLevelCode = '';
    description = '';
    entityId: number | string | null = null;
    entityRiskId?: number | null = null;
    entity?: EntityDetails;
    riskLevel?: RiskLevel;
    updateTimestamp?: number;
    updatedBy?: string;
    riskType?: RiskType;
}
export class EntityRiskRO {
    entityId?: number | string;
    description?: string = '';
    riskTypeCode?: string = '';
    riskLevelCode?: string = '';
    entityRiskId?: number | null = null;
    riskType?: string = '';
    riskLevel?: string = '';
    oldRiskLevel?: string = '';
    oldRiskLevelCode?: string = '';
    oldDescription?: string = '';
    modificationIsInProgress? = false;
}

export class RiskType {
    riskTypeCode?: string;
    riskCategoryCode: string;
    description = '';
    updateTimestamp?: number;
    updatedBy?: string;
    isActive?: boolean;
}

export interface EntityStatusType {
    entityStatusTypeCode?: string;
    description?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    isActive?: boolean;
}

export class RiskLevel {
    riskLevelCode: string;
    description = '';
    updateTimestamp: number;
    updatedBy: string;
    isActive: boolean;
}

export class OtherReferenceId {
    externalIdTypeCode: any;
    externalId: any = '';
    description: string = '';
    entityId?: number | string;
    entityExternalMappingId?: number;
}

export class EntireEntityDetails {
    priorNames?: any[] = [];
    foreignNames?: any[] = [];
    entityRisks?: EntityRisk[] = [];
    entityRegistrations?: EntityRegistration[] = [];
    entityMailingAddresses?: AdditionalAddress[] = [];
    entityDetails? = new EntityDetails();
    attachments?: EntityAttachment[] = [];
    entityTabStatus? = new EntityTabStatus();
    entityIndustryClassifications?: EntityIndustryClassifications[] = [];
    entityExternalIdMappings?: EntityExternalIdMappings[] = [];
    originalName? = '';
    organizationId? = '';
    sponsorCode? = '';
    modificationIsInProgress? = false;
    isDunsMatchedOnActiveVersion? = false;
    complianceInfo = new EntityComplianceDetails();
    entityFamilyTreeRoles: EntityFamilyTreeRole[] = [];
    dunsRefVersionIsInProgress = false;
    hasPersonEntityLinked = false;
    // for frontend
    entityVersionList?: EntityVersion[] = [];
    commentCountList?: { [key: string]: number } = {};
    sponsorTypeCode? = '';
    organizationTypeCode? = '';
}

export interface EntityFamilyTreeRole {
    entityFamilyTreeRoleId: number;
    entityId: number | string;
    entity: any;
    familyRoleTypeCode: string;
    familyRoleType: FamilyRoleType;
    updatedBy: string;
    updateTimestamp: number;
}

export interface FamilyRoleType {
    familyRoleTypeCode: string
    description: string
    updateTimestamp: number
    updatedBy: string
    isActive: boolean
}

export class EntityRegistration {
    entityRegistrationId?: number;
    entityId?: number | string;
    entity?: EntityDetails;
    regTypeCode?: string;
    registrationType?: RegistrationType;
    regNumber?: string;
    isActive?: boolean | null;
    updateTimestamp?: number;
    updatedBy?: string;
}

export class RegistrationType {
    regTypeCode?: string;
    description?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    isActive?: boolean;
}

export class EntityTabStatus {
    entity_overview? = false;
    entity_sub_org_info? = false;
    entity_sponsor_info? = false;
    organization_feed_status: string;
    organization_id: string;
    sponsor_feed_status: string;
    sponsor_code: string;
    organization_feed_status_code: any;
    sponsor_feed_status_code: any;
}

export interface EntityAttachmentType {
    attachmentTypeCode?: string
    description?: string
    updateTimestamp?: number
    updatedBy?: string
    isActive?: boolean
    isPrivate?: boolean
}

export class EntityDetails {
    entityId?: number | string;
    entityName?: string;
    foreignName?: any;
    foreignNames?: any;
    priorName?: any;
    shortName?: string;
    dunsNumber?: any;
    ueiNumber?: any;
    cageNumber?: any;
    websiteAddress?: string;
    startDate?: any;
    incorporationDate?: any;
    certifiedEmail?: string;
    activityText?: string;
    phoneNumber?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    city?: string;
    stateDetails?: State;
    state?: string;
    postCode?: string;
    humanSubAssurance?: any;
    anumalWelfareAssurance?: any;
    animalAccreditation?: any;
    approvedBy?: string;
    approvedTimestamp?: number;
    createdBy?: string;
    createTimestamp?: number;
    updatedBy?: string;
    updateTimestamp?: number;
    entityStatusTypeCode?: string;
    operatingStatusTypeCode?: any;
    businessTypeCode?: string;
    currencyCode?: string;
    entitySourceTypeCode?: any;
    countryCode?: string;
    stateCode?: string;
    entityOwnershipTypeCode?: string;
    incorporatedIn?: string;
    congressionalDistrict?: string;
    federalEmployerId?: string;
    numberOfEmployees?: number;
    entityNumber?: number | string;
    versionNumber?: number;
    versionStatus?: string;
    isActive?: boolean;
    isDunsMatched?: boolean;
    entityStatusType?: EntityStatusType;
    entityOperatingStatusType?: any;
    entitySourceType?: any;
    originalEntityId?: any;
    documentStatusTypeCode?: any;
    country?: Country;
    entityOwnershipType?: EntityOwnershipType;
    entityDocumentStatusType?: EntityDocumentStatusType;
    sponsorCode?: string;
    organizationId?: string;
    entityBusinessType?: EntityBusinessType;
    businessEntityType?: EntityRoleDescriptionCode;
    entityFamilyTreeRoles?: EntityFamilyTreeRole[];
    isForeign?: boolean;
}

export interface CorporateLinkage {
    familytreeRolesPlayed: EntityRoleDescriptionCode[];
    globalUltimateFamilyTreeMembersCount: any;
    globalUltimate: any;
    parent: any;
}

export interface EntityDocumentStatusType {
    documentStatusTypeCode?: string
    description?: string
    updateTimestamp?: number
    updatedBy?: string
    isActive?: boolean
}

export interface EntityOwnershipType {
    ownershipTypeCode?: string
    description?: string
    updateTimestamp?: number
    updatedBy?: string
    isActive?: boolean
}

export interface EntityBusinessType {
    businessTypeCode?: string
    description?: string
    updateTimestamp?: number
    updatedBy?: string
    isActive?: boolean
}

export class EntitySponsorRisk {
    riskTypeCode?: any = '';
    riskLevelCode?: any = '';
    description?: string = '';
    entityId?: number | string;
    entityRiskId?: any;
}

export class EntityExternalIdMappings {
    entityExternalMappingId?: number;
    entityId?: number | string;
    entity?: any;
    externalIdTypeCode?: string;
    entityExternalIdType?: EntityExternalIdType;
    entityExternalIdTypeDescription?: any;
    externalId?: string;
    description?: string;
    sponsorCode?: any;
    organizationId?: any;
    updatedBy?: string;
    updateTimestamp?: number;
}

export interface EntityExternalIdType {
    externalIdTypeCode: string;
    description: string;
    updateTimestamp: number;
    updatedBy: string;
    isActive: boolean;
}

export class SubAwardOrganization {
    attachments?: any[] = [];
    entityRisks?: EntityRisk[] = [];
    subAwdOrgDetailsResponseDTO? = new SubAwardOrganizationDetails();
}

export class SubAwardOrganizationDetails {
    id?: number | null = null;
    entityId?: string | number | null = null;
    organizationId?: number | null = null;
    entityOrganizationType: EntityOrganizationType = new EntityOrganizationType();
    samExpirationDate?: any | null = null;
    subAwdRiskAssmtDate?: any | null = null;
    organizationName?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    city?: string;
    state?: string;
    stateDetails?: State;
    country?: Country;
    countryCode?: string;
    postCode?: string;
    phoneNumber?: string;
    emailAddress?: string;
    dunsNumber?: string;
    ueiNumber?: string;
    cageNumber?: string;
    isCopy?: boolean;
    animalAccreditation?: string;
    animalWelfareAssurance?: string;
    congressionalDistrict?: string;
    federalEmployerId?: string;
    humanSubAssurance?: string;
    incorporatedDate?: Date;
    incorporatedIn?: Date;
    numberOfEmployees?: number;
    isCreatedFromImportEntity: boolean;
}
export class EntitySponsor {
    attachments?: any[] = [];
    entityRisks?: EntityRisk[] = [];
    sponsorDetailsResponseDTO? = new SponsorDetails();
}

export class SponsorDetails {
    id?: number | null = null;
    acronym?: string | null = null;
    entityId?: number | string | null = null;
    sponsorCode?: string | null = null;
    sponsorType?: SponsorType = new SponsorType();
    sponsorName?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    city?: string;
    state?: string;
    stateDetails?: State;
    country?: Country;
    countryCode?: string;
    postCode?: string;
    phoneNumber?: string;
    emailAddress?: string;
    dunsNumber?: string;
    ueiNumber?: string;
    cageNumber?: string;
    translatedName?: string;
    comments?: string;
    isCopy?: boolean;
}

export class SponsorType {
    code?: string;
    description?: string;
    budgetCategoryCode?: any;
    fromGlMapping?: any;
    toGlMapping?: any;
    isActive?: boolean;
}

export class EntityOrganizationType {
    organizationTypeCode?: string;
    description?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    isActive?: boolean;
}

export class EntityRiskModalDetails {
    entityRisk = new EntityRisk();
    selectedRiskTypeLookUpList: EntityRisk[] = [];
    selectedRiskLevelLookUpList: RiskLevel[] = [];
}

export class SaveAttachmentRo {
    sectionCode: string;
    newAttachments = new NewAttachments();
}
export class NewAttachments {
    fileName?: string;
    mimeType?: string;
    attachmentTypeCode?: string;
    entityId?: number | string;
    comment?: string;
    fileDataId?: null;
    attachmentnumber?: number;
    versionNumber?: number;
}

export class OverallAttachmentList {
    General: EntityAttachment[];
    Sponsor: EntityAttachment[];
    Organization: EntityAttachment[];
    Compliance: EntityAttachment[];
}

export class EntityAttachment {
    attachmentNumber?: number = null;
    attachmentType?: string = '';
    attachmentTypeCode?: string = '';
    comment?: string = '';
    entityAttachmentId?: number = null;
    entityId?: number | string | null = null;
    fileName?: string = '';
    updateTimestamp?: number = null;
    updateUserFullname?: string = '';
    versionNumber?: number = null;
    versionList?: EntityAttachment[] = [];
}

export class EntitySectionDetails {
    sectionId = '';
    sectionName = '';
    subSectionId: number | null = null;
    sectionVisibility: 'SHOW' | 'HIDE';
}

export interface EntityRoleDescriptionCode {
    description?: string;
    dnbCode?: number | string;
    typeCode?: number | string
}

export class EntityCardDetails {
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
    postalCode?: any;
    entityId?: number | string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    duplicateEntityDetails?: EntityCardDetails;
    ownershipType: string;
    businessEntityType?: EntityRoleDescriptionCode;
    entityFamilyTreeRoles?: EntityRoleDescriptionCode[];
    priorName: string;
    foreignName: string;
    foreignNames: ForeignName[];
    isForeign?: boolean;
    mailingAddress?: string;
    entityStatusTypeCode?: string;
}

export interface ForeignName {
    foreignName: string;
    id: number;
}

export class DuplicateCheckObj {
    entityName?: string;
    countryCode?: string;
    entityNumber?: number | string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;

}

export class EntityDupCheckConfig {
    duplicateView: 'MODAL_VIEW' | 'CARD_VIEW' | 'SLIDER_VIEW' | '' = 'MODAL_VIEW';
    header?: string = 'Matching Entities Found'; //based on mode optional
    helpTextModuleCode? = '';
    primaryButton?: string = 'Create New';
    confirmationText? = '';
    hasConfirmedNoDuplicate? = false;
    entityCardDetails: EntityDetailsCardConfig;
    entityIdToFilter?: number | string | null = null;
    entityActions: Partial<BatchEntityAvailableInputs> = {};
    triggeredFrom?: 'CREATE_ENTITY' | 'ENTITY_VERIFY' | '' | 'ENTITY_DUPLICATE' = ''
    infoText?: string = `The details you entered match the following entities in our system. Please review the list below. If you still wish to create a new entity, you can skip this step and click on '${this.primaryButton}'.`;
}

export class DupMarkingModalConfig {
    modalHeader: string = 'Confirm marking entity as a Duplicate of Original';
    modalPrimaryButton: string = 'Confirm';
    modalHelpText: string = 'The entity will be marked as duplicate of the following entity. Are you sure you want to proceed?';
}

export class EntityDetailsInPopup {
    entityName: string;
    entityId: number | string;
    fullAddress: string;
    phone: any;
    website: string;
    email: string;
}

export class DuplicateMarkingAPIReq {
    originalEntityId: any;
    duplicateEntityId: any;
    description: string;
}

export class SubAwardOrgUpdateClass {
    entityId: number | string;
    subAwardOrgFields = new SubawardOrgFields();
    isChangeInAddress = false;
}

export class SubawardOrgFields {
    samExpirationDate?: any;
    organizationTypeCode?: any;
    subAwdRiskAssmtDate?: any;
    feedStatusCode?: any;
    organizationName?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    city?: string;
    state?: string;
    stateDetails?: State | null;
    stateCode?: string;
    country?: Country;
    countryCode?: string;
    postCode?: string;
    phoneNumber?: string;
    emailAddress?: string;
    dunsNumber?: string;
    ueiNumber?: string;
    cageNumber?: string;
    isCopy?: boolean;
    animalAccreditation?: string;
    animalWelfareAssurance?: string;
    congressionalDistrict?: string;
    federalEmployerId?: string;
    humanSubAssurance?: string;
    incorporatedDate?: Date;
    incorporatedIn?: number | string;
    numberOfEmployees?: number;
}

export class CancelModificationReq {
    entityId: number|string;
    entityNumber: number|string;
    description: string;
}
export class SponsorUpdateClass {
    entityId: number | string;
    entitySponsorFields = new SponsorFields();
    isChangeInAddress = false;
}

export class SponsorFields {
    sponsorCode?: any;
    sponsorTypeCode?: any;
    acronym?: string;
    feedStatusCode?: any;
    sponsorName?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    city?: string;
    state?: string;
    stateDetails?: State | null;
    stateCode?: string;
    postCode?: string;
    countryCode?: string;
    phoneNumber?: string;
    emailAddress?: string;
    dunsNumber?: string;
    ueiNumber?: string;
    cageNumber?: string;
    translatedName?: string;
    comments?: string;
    isCopy?: boolean;
}
export class DNBReqObj {
    entityId: string | number;
    entityNumber: string | number;
    sourceDataName: string;
    sourceDunsNumber: any;
    emailAddress: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string | number;
    state: string;
    countryCode: string;
}

export class OtherDetailsUpdate {
    entityId: number | string;
    otherDetailsRequestFields? = new OtherDetailsClass();
}

export class OtherDetailsClass {
    startDate?: string;
    incorporationDate?: string;
    incorporatedIn?: string;
    congressionalDistrict?: string;
    federalEmployerId?: string;
    shortName?: string;
    numberOfEmployees?: number;
    businessTypeCode?: any;
    activityText?: string;
    currencyCode?: string | number;
    entityBusinessType: any;
}

export class EntityUpdateClass {
    entityId: number | string;
    entityRequestFields? = new EntityRequestFields();
    modificationIsInProgress?: boolean;
    complianceRequestDTO?: { entityTypeCode: string };
}

export class EntityFields {
    entityName?: string;
    primaryAddressLine1?: string;
    primaryAddressLine2?: string;
    city?: string;
    state?: string;
    stateDetails?: State | null;
    stateCode?: string;
    postCode?: string;
    countryCode?: string;
    phoneNumber?: string;
    certifiedEmail?: string;
    websiteAddress?: string;
    dunsNumber?: string;
    ueiNumber?: string;
    cageNumber?: string;
    humanSubAssurance?: string;
    anumalWelfareAssurance?: string;
    animalAccreditation?: string;
    isDunsMatched?: boolean;
    entityOwnershipTypeCode?: string;
    businessTypeCode?: string;
    entityStatusTypeCode?: string;
    entitySourceTypeCode?: string;
    entityNumber?: number;
}

export class EntityRequestFields extends EntityFields {
    entityOwnershipType? = new EntityOwnerShip();
    coiEntityType?: CoiEntityType;
    country? = new Country();
}

export class Create_Entity {
    entityId: number | string;
    entityName: string = '';
    primaryAddressLine1: string = '';
    primaryAddressLine2: string = '';
    city: string = '';
    state: string = '';
    stateDetails = new State();
    stateCode: string = '';
    postCode: string;
    countryCode: string = '';
    country: Country = new Country();
    phoneNumber: any;
    certifiedEmail: any = '';
    websiteAddress: any = '';
    dunsNumber: number;
    ueiNumber: number;
    cageNumber: number;
    humanSubAssurance?: any;
    anumalWelfareAssurance?: any;
    animalAccreditation?: any;
    isDunsMatched?: any;
    entityOwnershipTypeCode: any;
    businessTypeCode: any;
    entityOwnershipType: EntityOwnerShip = new EntityOwnerShip();
    entityStatusTypeCode: string;
}

export class ElasticEntitySource {
    phone: string;
    update_timestamp: string;
    create_user_full_name: string;
    is_foreign: string;
    entity_number: number;
    entity_ownership: string;
    entity_status_code: string;
    city: string;
    state: string;
    web_url: string;
    entity_business: string;
    country_name: string;
    version_status: string;
    duns_number: string;
    entity_name: string;
    document_status_type_code: string;
    document_status_type: string;
    uei_number: string;
    version_number: number;
    zip_code: string;
    email_address: string;
    organization_id: string;
    entity_type: string;
    "@timestamp": string;
    "@version": string;
    approved_timestamp: string;
    entity_type_code: string;
    cage_number: string;
    is_active: string;
    business_type_code: string;
    entity_status: string;
    country_code: string;
    sponsor_code: string;
    entity_ownership_type_code: string;
    approved_user: string;
    primary_address_line_2: string;
    update_user_full_name: string;
    foreign_name: string;
    primary_address_line_1: string;
    prior_name: string;
    entity_id: number;
    create_timestamp: string;
    risk_category_code: string;
    risk_category: string;
    create_user: string;
    update_user: string;
    revision_reason: string;
    state_code: string;
    state_name: string;
    value?: string;
}

export class ElasticEntityResult {
    entityId: string | number;
    entityNumber: string | number;
    entityName: string;
    versionNumber: string | number;
    versionStatus: string;
    entityStatusCode: string | number;
    entityStatus: EntityStatus;
    createUser: string;
    updateUser: string;
    revisionReason: string;
    riskCategoryCode: string;
    entityRiskCategory = new RiskType();
    phone: string;
    countryCode: string;
    country: Country;
    city: string;
    address: string;
    zipCode: string;
    emailAddress: string;
    isActive: string;
    webURL: string;
    createTimestamp: string;
    updateTimestamp: string;
    approvedUser: string;
    approvedTimestamp: string;
    updatedUserFullName: string;
    createUserFullName: string;
    dunsNumber: string;
    foreignName: string;
    ueiNumber: string;
    priorName: string;
    cageNumber: string;
    organizationId: string;
    sponsorCode: string;
    primaryAddressLine1: string;
    primaryAddressLine2: string;
    state: string;
    entityOwnershipType: EntityOwnershipType;
    entityOwnershipTypeCode: string;
    coiEntityType: CoiEntityType;
    businessType: EntityBusinessType;
    isForeign: boolean;
}

export class EntityStatus {
    entityStatusCode: any;
    description: string;
}

export type EntityNumberFields = 'ueiNumber' | 'dunsNumber' | 'cageNumber';
export type VerifyEntitySection = 'overview' | 'sponsor' | 'organization';
export type VerifyValidationType = 'VE' | 'VW' | null;
export type VerifyValidation = Record<VerifyEntitySection, SectionValidation>;
export type UnifiedVerifyFieldKeys = 'city' | 'state' | 'postCode' | 'entityName' | 'countryCode' | 'primaryAddressLine1' | 'entityOwnershipTypeCode' | 'sponsorAddress' | 'sponsorTypeCode' | 'entityRisks' | 'organizationAddress' | 'organizationTypeCode' | 'sponsorName' | 'organizationName';
// Unified interface for fields
export type UnifiedVerifyFields = Partial<Record<UnifiedVerifyFieldKeys, boolean>>;

export interface SectionValidation {
    fields: UnifiedVerifyFields;
    ValidationType: VerifyValidationType;
    ValidationMessage: string;
}

export interface ErrorSubSections {
    title: string;
    ariaLabel: string;
    navigateTo: string;
    helpTextElementId: string;
    subsection: EntitySectionType;
    fieldName: UnifiedVerifyFieldKeys;
}

export interface VerifyValidationConfig {
    fields: UnifiedVerifyFields;
    section: VerifyEntitySection;
    ValidationMessage: string;
    errorSubSections?: ErrorSubSections[];
    ValidationType: VerifyValidationType;
    alertClass: 'danger' | 'warning' | 'success';
    alertText: 'Error' | 'Warning' | 'Completed';
}
export class CommonNoteInputs {
    sectionId: any;
    sectionName: string;
    subSectionId: any;
    sectionCode: any;
    isEditMode: boolean;
    entityId: number | string;;
}

export interface EntitySourceType {
    entitySourceTypeCode: string
    description: string
    updateTimestamp: number
    updatedBy: string
    isActive: boolean
}

export class FetchEntityReviewCommentRO {
    entityId?: string | number = null;
    entityNumber?: string | number = null;
    commentTypeCode?: string | number = null;
    sectionTypeCode?: string | number = null;
}

export class EntityReviewCommentsSliderConfig extends COIReviewCommentsConfig implements FetchEntityReviewCommentRO {
    sectionTypeCode?: string | number = null;
    commentTypeCode?: string | number = null;
    isOpenCommentSlider = false;
    isShowAllComments = false;
}

export interface EntityReviewComments {
    parentCommentId?: string | number;
    comment?: string;
    isPrivate?: boolean;
    commentTypeCode?: string | number;
    entityId?: string | number;
    entityNumber?: string | number;
    entityCommentId?: string | number;
    sectionCode?: string | number;
    updatedBy?: string;
    updatedByFullName?: string;
    updateTimestamp?: number;
    sectionTypeCode?: string | number;
    childComments?: EntityReviewComments[];
}

export interface AddEntityReviewCommentsRO {
    comment: string;
    isPrivate?: boolean;
    entityId: string | number;
    entityNumber: string | number;
    sectionCode: string | number;
    commentTypeCode?: string | number;
    parentCommentId?: string | number;
    entityCommentId?: string | number;
}

export interface EntityWebsiteAddress {
    url: string;
    domainName: string;
}

export interface EntityVersion {
    versionStatus: string;
    versionNumber: number;
    entityId: number | string;
}

export class EntityIndustryClassifications {
    entityIndustryClassId?: number;
    entityId?: number;
    entity?: EntityDetails;
    industryCategoryId?: number;
    industryCategoryCode?: IndustryCategoryDescription;
    isPrimary?: boolean
    updatedBy?: string
    updateTimestamp?: number
  }

export interface IndustryCategoryType {
    updatedBy?: string;
    isActive?: boolean;
    isPrimary?: boolean;
    description?: string;
    updateTimestamp?: number;
    industryCategoryTypeCode?: string;
    source?: IndustryCategoryTypeSource;
    // for frontend
    code?: string | number;
    actualDescription?: string;
    formattedIndustryCategoryType?: string;
}

export interface IndustryCategoryDescription {
    industryCategoryId?: number;
    industryCategoryCode?: string;
    industryCategoryTypeCode?: string;
    industryCategoryType?: IndustryCategoryType;
    description?: string;
    isActive?: string;
    updateTimestamp?: number;
    updatedBy?: string;
    // for frontend
    code?: string | number;
    actualDescription?: string;
    formattedIndustryCategoryDescription?: string;
}

export class EntityCompliance {
    complianceInfo = new EntityComplianceDetails();
    entityRisks: EntityRisk[] = [];
    attachments: EntityAttachment[] = [];
}

export class EntityComplianceDetails {
    id?: string | number;
    entityId?: string | number;
    coiEntityType? = new CoiEntityType();
    entity: EntityDetails;
    entityTypeCode: string;
    updateTimestamp: number;
    updatedBy: string;
}

export class ComplianceUpdateClass {
    entityId: number | string;
    entityComplianceFields = new EntityComplianceFields();
}

export class ComplianceSaveUpdateRO implements EntityComplianceFields {
    id?: number | string;
    entityTypeCode?: string;
    entityId: number | string;
}

export class EntityComplianceFields {
    entityTypeCode?: string;
}

export class CoiEntityType {
    isActive?: boolean;
    updatedBy?: string;
    description?: string;
    updateTimestamp?: number;
    entityTypeCode?: string;
    updateUser?: string;
}

export interface DunsMailingAddress {
    addressCountry: DunsMailingAddressCountry;
    addressLocality: DunsMailingAddressLocality;
    addressRegion: DunsMailingAddressRegion;
    postalCode: string;
    postalCodeExtension: string;
    streetAddress: DunsMailingStreetAddress;
}

export interface DunsMailingAddressCountry {
    isoAlpha2Code: string;
    name: string;
}

export interface DunsMailingAddressLocality {
    name: string;
}

export interface DunsMailingAddressRegion {
    name: string;
    abbreviatedName: string;
}

export interface DunsMailingStreetAddress {
    line1: string;
    line2: string;
}

export interface EntityCreationResponse {
    entityId: string | number;
    entityNumber: string | number;
}
