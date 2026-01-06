import { COICommentRightsType, ReviewCommentSection } from '../../shared-components/coi-review-comments/coi-review-comments.interface';
import { UnifiedVerifyFieldKeys } from './entity-interface';

export type CompanyDetailsSubSectionType = 'INDUSTRY_DETAILS' | 'REGISTRATION_DETAILS' | 'ADDITIONAL_ADDRESS' | 'OTHER_DETAILS';
export type OverviewTabSectionType = 'BASIC_DETAILS' | 'COMPANY_DETAILS' | 'ENTITY_RISK' | 'OTHER_REFERENCE_IDS' | 'ENTITY_ATTACHMENTS' | 'ADDITIONAL_INFORMATION' | 'ENTITY_NOTES';
export type SponsorSubSection = 'SPONSOR_DETAILS' | 'SPONSOR_RISK' | 'SPONSOR_ATTACHMENTS' | 'SPONSOR_QUESTIONNAIRE' | 'SPONSOR_NOTES';
export type SubawardTabSectionType = 'SUB_AWARD_ORGANIZATION' | 'SUB_AWARD_RISK' | 'SUB_AWARD_ATTACHMENTS' | 'SUB_AWARD_QUESTIONNAIRE' | 'SUB_AWARD_NOTES';
export type ComplianceTabSectionType = 'COMPLIANCE_DETAILS' | 'COMPLIANCE_RISK' | 'COMPLIANCE_ATTACHMENTS' | 'COMPLIANCE_QUESTIONNAIRE' | 'COMPLIANCE_NOTES';
export type AttachmentTabSectionType = 'ATT_ENTITY_ATTACHMENTS' | 'ATT_SPONSOR_ATTACHMENTS' | 'ATT_ORGANIZATION_ATTACHMENTS' | 'ATT_COMPLIANCE_ATTACHMENTS';
export type CorporateFamilyTabSectionType = 'CORPORATE_FAMILY';
export type NotesTabSectionType = 'NOTES';
export type HistoryTabSectionType = 'HISTORY';

export interface EntitySectionType {
    sectionName: string;
    sectionIcon?: string;
    sectionId: string | number;
    subSectionId?: string | number;
    subSections?: Map<string, EntitySectionType>;
    sectionTypeCode?: string;
    commentTypeCode?: string;
    commentRights?: COICommentRightsType;
    sectionVisibility: 'SHOW' | 'HIDE';
}

export const ENTITY_OVERVIEW_COMMENT_RIGHTS: COICommentRightsType = {
    view: ['VIEW_ENTITY_OVERVIEW_COMMENTS'],
    manage: ['MANAGE_ENTITY_OVERVIEW_COMMENTS'],
    resolve: ['MANAGE_ENTITY_OVERVIEW_RESOLVE_COMMENTS']
};

export const ENTITY_SPONSOR_COMMENT_RIGHTS: COICommentRightsType = {
    view: ['VIEW_ENTITY_SPONSOR_COMMENTS'],
    manage: ['MANAGE_ENTITY_SPONSOR_COMMENTS'],
    resolve: ['MANAGE_ENTITY_SPONSOR_RESOLVE_COMMENTS']
};

export const ENTITY_ORGANIZATION_COMMENT_RIGHTS: COICommentRightsType = {
    view: ['VIEW_ENTITY_ORGANIZATION_COMMENTS'],
    manage: ['MANAGE_ENTITY_ORGANIZATION_COMMENTS'],
    resolve: ['MANAGE_ENTITY_ORGANIZATION_RESOLVE_COMMENTS']
};

export const ENTITY_COMPLIANCE_COMMENT_RIGHTS: COICommentRightsType = {
    view: ['VIEW_ENTITY_COMPLIANCE_COMMENTS'],
    manage: ['MANAGE_ENTITY_COMPLIANCE_COMMENTS'],
    resolve: ['MANAGE_ENTITY_COMPLIANCE_RESOLVE_COMMENTS']
};

export const ENTITY_CORPORATE_FAMILY_COMMENT_RIGHTS: COICommentRightsType = {
    view: ['VIEW_ENTITY_CORPORATE_FAMILY_COMMENTS'],
    manage: ['MANAGE_ENTITY_CORPORATE_FAMILY_COMMENTS'],
    resolve: ['MANAGE_ENTITY_CORPORATE_FAMILY_RESOLVE_COMMENTS']
};

export const ALL_ENTITY_RESOLVE_COMMENT_RIGHTS: string[] = [
    ...ENTITY_OVERVIEW_COMMENT_RIGHTS.resolve,
    ...ENTITY_SPONSOR_COMMENT_RIGHTS.resolve,
    ...ENTITY_ORGANIZATION_COMMENT_RIGHTS.resolve,
    ...ENTITY_COMPLIANCE_COMMENT_RIGHTS.resolve,
    ...ENTITY_CORPORATE_FAMILY_COMMENT_RIGHTS.resolve
];

export const ALL_ENTITY_COMMENT_RIGHTS: string[] = [
    ...ENTITY_OVERVIEW_COMMENT_RIGHTS.view,
    ...ENTITY_OVERVIEW_COMMENT_RIGHTS.manage,
    ...ENTITY_SPONSOR_COMMENT_RIGHTS.view,
    ...ENTITY_SPONSOR_COMMENT_RIGHTS.manage,
    ...ENTITY_ORGANIZATION_COMMENT_RIGHTS.view,
    ...ENTITY_ORGANIZATION_COMMENT_RIGHTS.manage,
    ...ENTITY_COMPLIANCE_COMMENT_RIGHTS.view,
    ...ENTITY_COMPLIANCE_COMMENT_RIGHTS.manage,
    ...ENTITY_CORPORATE_FAMILY_COMMENT_RIGHTS.view,
    ...ENTITY_CORPORATE_FAMILY_COMMENT_RIGHTS.manage,
];

export const ENTITY_GENERAL_COMMENT_RIGHTS: COICommentRightsType = {
    view: ALL_ENTITY_COMMENT_RIGHTS,
    manage: ALL_ENTITY_COMMENT_RIGHTS,
    resolve: ALL_ENTITY_RESOLVE_COMMENT_RIGHTS
};

export const GENERAL_COMMENTS = { sectionName: 'General', sectionTypeCode: '31', commentTypeCode: '23', commentRights: ENTITY_GENERAL_COMMENT_RIGHTS };

export const BASIC_DETAILS: EntitySectionType = { sectionName: 'Basic Details', sectionIcon: 'newspaper', sectionId: 'EO101', sectionVisibility: 'SHOW', sectionTypeCode: '9', commentTypeCode: '1', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS, subSectionId: '2602' };
// company details sub sections
export const INDUSTRY_DETAILS: EntitySectionType = { sectionName: 'Industry Details', sectionId: 2603, sectionVisibility: 'SHOW' };
export const REGISTRATION_DETAILS: EntitySectionType = { sectionName: 'Registration Details', sectionId: 2604, sectionVisibility: 'SHOW' };
export const ADDITIONAL_ADDRESS: EntitySectionType = { sectionName: 'Additional Addresses', sectionId: 2605, sectionVisibility: 'SHOW' };
export const OTHER_DETAILS: EntitySectionType = { sectionName: 'Other Details', sectionId: 2606, sectionVisibility: 'SHOW' };

export const COMPANY_DETAILS_SUB_SECTION = new Map<CompanyDetailsSubSectionType, EntitySectionType>([
    ['INDUSTRY_DETAILS', INDUSTRY_DETAILS],
    ['REGISTRATION_DETAILS', REGISTRATION_DETAILS],
    ['ADDITIONAL_ADDRESS', ADDITIONAL_ADDRESS],
    ['OTHER_DETAILS', OTHER_DETAILS]
]);

export const COMPANY_DETAILS: EntitySectionType = { sectionName: 'Company Details', sectionIcon: 'apartment', sectionId: 'EO102', subSections: COMPANY_DETAILS_SUB_SECTION, sectionVisibility: 'SHOW', sectionTypeCode: '10', commentTypeCode: '2', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS };
export const ENTITY_RISK: EntitySectionType = { sectionName: 'Entity Risk', sectionIcon: 'warning', sectionId: 'EO103', sectionVisibility: 'SHOW', sectionTypeCode: '11', commentTypeCode: '3', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS };
export const OTHER_REFERENCE_IDS: EntitySectionType = { sectionName: 'Other Reference IDs', sectionIcon: 'library_books', sectionId: 'EO104', sectionVisibility: 'SHOW', sectionTypeCode: '12', commentTypeCode: '4', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS };
export const ADDITIONAL_INFORMATION_SUB_SECTION_ID = '2633';
export const ADDITIONAL_INFORMATION: EntitySectionType = {
    sectionName: 'Additional Information', sectionId: 'EO105',
    subSectionId: ADDITIONAL_INFORMATION_SUB_SECTION_ID, sectionVisibility: 'SHOW',
    sectionTypeCode: '14', commentTypeCode: '6', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS
};
export const ENTITY_ATTACHMENTS: EntitySectionType = { sectionName: 'Entity Attachments', sectionId: 'EO106', sectionVisibility: 'SHOW', sectionTypeCode: '13', commentTypeCode: '5', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS };
export const ENTTIY_OVERVIEW_NOTES_SECTION_ID = '2635';
export const ENTITY_NOTES: EntitySectionType = { sectionName: 'Entity Notes', sectionId: ENTTIY_OVERVIEW_NOTES_SECTION_ID, sectionVisibility: 'SHOW', sectionTypeCode: '15', commentTypeCode: '7', commentRights: ENTITY_OVERVIEW_COMMENT_RIGHTS };

export const SPONSOR_DETAILS: EntitySectionType = { sectionName: 'Sponsor Details', sectionIcon: 'newspaper', sectionId: 'ES201', sectionVisibility: 'SHOW', sectionTypeCode: '16', commentTypeCode: '8', commentRights: ENTITY_SPONSOR_COMMENT_RIGHTS, subSectionId: '2609' };
export const SPONSOR_RISK: EntitySectionType = { sectionName: 'Sponsor Risk', sectionIcon: 'warning', sectionId: 'ES202', sectionVisibility: 'SHOW', sectionTypeCode: '17', commentTypeCode: '9', commentRights: ENTITY_SPONSOR_COMMENT_RIGHTS };
export const SPONSOR_ATTACHMENTS: EntitySectionType = { sectionName: 'Sponsor Attachments', sectionId: 'ES203', sectionVisibility: 'SHOW', sectionTypeCode: '18', commentTypeCode: '10', commentRights: ENTITY_SPONSOR_COMMENT_RIGHTS };
export const SPONSOR_QUESTIONNAIRE_SECTION_ID = 'ES204';
export const SPONSOR_QUESTIONNAIRE_SUB_SECTION_ID = 2624;
export const SPONSOR_QUESTIONNAIRE: EntitySectionType = {
    sectionName: 'Sponsor Questionnaire',
    sectionId: SPONSOR_QUESTIONNAIRE_SECTION_ID, subSectionId: SPONSOR_QUESTIONNAIRE_SUB_SECTION_ID,
    sectionVisibility: 'SHOW', sectionTypeCode: '19', commentTypeCode: '11', commentRights: ENTITY_SPONSOR_COMMENT_RIGHTS
};
export const ENTTIY_SPONSOR_NOTES_SECTION_ID = '2636';
export const SPONSOR_NOTES: EntitySectionType = { sectionName: 'Sponsor Notes', sectionId: ENTTIY_SPONSOR_NOTES_SECTION_ID, sectionVisibility: 'SHOW', sectionTypeCode: '20', commentTypeCode: '12', commentRights: ENTITY_SPONSOR_COMMENT_RIGHTS };

export const SUB_AWARD_ORGANIZATION: EntitySectionType = { sectionName: 'Sub-award Organization Details', sectionIcon: 'newspaper', sectionId: 'ES301', sectionVisibility: 'SHOW', sectionTypeCode: '21', commentTypeCode: '13', commentRights: ENTITY_ORGANIZATION_COMMENT_RIGHTS };
export const SUB_AWARD_RISK: EntitySectionType = { sectionName: 'Sub-award Organization Risk', sectionIcon: 'warning', sectionId: 'ES302', sectionVisibility: 'SHOW', sectionTypeCode: '22', commentTypeCode: '14', commentRights: ENTITY_ORGANIZATION_COMMENT_RIGHTS };
export const SUB_AWARD_ATTACHMENTS: EntitySectionType = { sectionName: 'Sub-award Organization Attachments', sectionId: 'ES303', sectionVisibility: 'SHOW', sectionTypeCode: '23', commentTypeCode: '15', commentRights: ENTITY_ORGANIZATION_COMMENT_RIGHTS };
export const SUB_AWARD_QUESTIONNAIRE_SECTION_ID = 'ES304';
export const SUB_AWARD_QUESTIONNAIRE_SUB_SECTION_ID = 2625;
export const SUB_AWARD_QUESTIONNAIRE: EntitySectionType = {
    sectionName: 'Sub-award Organization Questionnaire',
    sectionId: SUB_AWARD_QUESTIONNAIRE_SECTION_ID, subSectionId: SUB_AWARD_QUESTIONNAIRE_SUB_SECTION_ID,
    sectionVisibility: 'SHOW', sectionTypeCode: '24', commentTypeCode: '16', commentRights: ENTITY_ORGANIZATION_COMMENT_RIGHTS
};
export const ENTITY_SUB_AWARD_NOTES_SECTION_ID = '2637';
export const SUB_AWARD_NOTES: EntitySectionType = { sectionName: 'Sub-award Organization Notes', sectionId: ENTITY_SUB_AWARD_NOTES_SECTION_ID, sectionVisibility: 'SHOW', sectionTypeCode: '25', commentTypeCode: '17', commentRights: ENTITY_ORGANIZATION_COMMENT_RIGHTS };

export const COMPLIANCE_DETAILS: EntitySectionType = { sectionName: 'Compliance Details', sectionIcon: 'newspaper', sectionId: 'EC404', sectionVisibility: 'SHOW', sectionTypeCode: '32', commentTypeCode: '24', commentRights: ENTITY_COMPLIANCE_COMMENT_RIGHTS };
export const COMPLIANCE_RISK: EntitySectionType = { sectionName: 'Compliance Risk', sectionIcon: 'warning', sectionId: 'EC401', sectionVisibility: 'SHOW', sectionTypeCode: '26', commentTypeCode: '18', commentRights: ENTITY_COMPLIANCE_COMMENT_RIGHTS };
export const COMPLIANCE_ATTACHMENTS: EntitySectionType = { sectionName: 'Compliance Attachments', sectionId: 'EC402', sectionVisibility: 'SHOW', sectionTypeCode: '27', commentTypeCode: '19', commentRights: ENTITY_COMPLIANCE_COMMENT_RIGHTS };
export const COMPLIANCE_QUESTIONNAIRE_SECTION_ID = 'EC403';
export const COMPLIANCE_QUESTIONNAIRE_SUB_SECTION_ID = 2626;
export const COMPLIANCE_QUESTIONNAIRE: EntitySectionType = {
    sectionName: 'Compliance Questionnaire',
    sectionId: COMPLIANCE_QUESTIONNAIRE_SECTION_ID, subSectionId: COMPLIANCE_QUESTIONNAIRE_SUB_SECTION_ID,
    sectionVisibility: 'SHOW', sectionTypeCode: '28', commentTypeCode: '20', commentRights: ENTITY_COMPLIANCE_COMMENT_RIGHTS
};
export const ENTITY_COMPLIANCE_NOTES_SECTION_ID = '2638';
export const COMPLIANCE_NOTES: EntitySectionType = { sectionName: 'Compliance Notes', sectionId: ENTITY_COMPLIANCE_NOTES_SECTION_ID, sectionVisibility: 'SHOW', sectionTypeCode: '29', commentTypeCode: '21', commentRights: ENTITY_COMPLIANCE_COMMENT_RIGHTS };


const ATT_ENTITY_ATTACHMENTS: EntitySectionType = { sectionName: 'Entity Attachments', sectionId: 'EA501', sectionVisibility: 'SHOW' };
const ATT_SPONSOR_ATTACHMENTS: EntitySectionType = { sectionName: 'Sponsor Attachments', sectionId: 'EA502', sectionVisibility: 'SHOW' };
const ATT_ORGANIZATION_ATTACHMENTS: EntitySectionType = { sectionName: 'Organization Attachments', sectionId: 'EA503', sectionVisibility: 'SHOW' };
const ATT_COMPLIANCE_ATTACHMENTS: EntitySectionType = { sectionName: 'Compliance Attachments', sectionId: 'EA504', sectionVisibility: 'SHOW' };

export const CORPORATE_FAMILY: EntitySectionType = { sectionName: 'Corporate Family', sectionId: 'ECA01', sectionVisibility: 'SHOW', sectionTypeCode: '30', commentTypeCode: '22', commentRights: ENTITY_CORPORATE_FAMILY_COMMENT_RIGHTS };

const NOTES: EntitySectionType = { sectionName: 'Notes', sectionId: 'EN01', subSectionId: 2634, sectionVisibility: 'SHOW' };

const HISTORY: EntitySectionType = { sectionName: 'History', sectionId: 'EH01', sectionVisibility: 'SHOW' };

export const OverviewTabSection = new Map<OverviewTabSectionType, EntitySectionType>([
    ['BASIC_DETAILS', BASIC_DETAILS],
    ['COMPANY_DETAILS', COMPANY_DETAILS],
    ['ENTITY_RISK', ENTITY_RISK],
    ['OTHER_REFERENCE_IDS', OTHER_REFERENCE_IDS],
    ['ENTITY_ATTACHMENTS', ENTITY_ATTACHMENTS],
    ['ADDITIONAL_INFORMATION', ADDITIONAL_INFORMATION],
    ['ENTITY_NOTES', ENTITY_NOTES]
]);

export const SponsorTabSection = new Map<SponsorSubSection, EntitySectionType>([
    ['SPONSOR_DETAILS', SPONSOR_DETAILS],
    ['SPONSOR_RISK', SPONSOR_RISK],
    ['SPONSOR_ATTACHMENTS', SPONSOR_ATTACHMENTS],
    ['SPONSOR_QUESTIONNAIRE', SPONSOR_QUESTIONNAIRE],
    ['SPONSOR_NOTES', SPONSOR_NOTES]
]);

export const SubawardOrganizationTab = new Map<SubawardTabSectionType, EntitySectionType>([
    ['SUB_AWARD_ORGANIZATION', SUB_AWARD_ORGANIZATION],
    ['SUB_AWARD_RISK', SUB_AWARD_RISK],
    ['SUB_AWARD_ATTACHMENTS', SUB_AWARD_ATTACHMENTS],
    ['SUB_AWARD_QUESTIONNAIRE', SUB_AWARD_QUESTIONNAIRE],
    ['SUB_AWARD_NOTES', SUB_AWARD_NOTES]
    // ['Additional_Information' , ADDITIONAL_INFORMATION],
]);

export const ComplianceTab = new Map<ComplianceTabSectionType, EntitySectionType>([
    ['COMPLIANCE_DETAILS', COMPLIANCE_DETAILS],
    ['COMPLIANCE_RISK', COMPLIANCE_RISK],
    ['COMPLIANCE_ATTACHMENTS', COMPLIANCE_ATTACHMENTS],
    ['COMPLIANCE_QUESTIONNAIRE', COMPLIANCE_QUESTIONNAIRE],
    ['COMPLIANCE_NOTES', COMPLIANCE_NOTES]
]);

export const AttachmentTab = new Map<AttachmentTabSectionType, EntitySectionType>([
    ['ATT_ENTITY_ATTACHMENTS', ATT_ENTITY_ATTACHMENTS],
    ['ATT_SPONSOR_ATTACHMENTS', ATT_SPONSOR_ATTACHMENTS],
    ['ATT_ORGANIZATION_ATTACHMENTS', ATT_ORGANIZATION_ATTACHMENTS],
    ['ATT_COMPLIANCE_ATTACHMENTS', ATT_COMPLIANCE_ATTACHMENTS]
]);

export const CorporateFamilyTab = new Map<CorporateFamilyTabSectionType, EntitySectionType>([
    ['CORPORATE_FAMILY', CORPORATE_FAMILY]
]);

export const NotesTab = new Map<NotesTabSectionType, EntitySectionType>([
    ['NOTES', NOTES]
]);

export const HistoryTab = new Map<HistoryTabSectionType, EntitySectionType>([
    ['HISTORY', HISTORY]
]);

export const DUPLICATE_MARK_CONFIRMATION_TEXT = 'I confirm that the duplicates are not exact matches.';

//Verify help text
export const DUPLICATE_MARK_INFORMATION_TEXT = 'Potential duplicates have been found. If any of these matches are correct, please select the appropriate one and Set as Original. The current entity then will be marked as duplicate of the original entity. If none of the matches are accurate, you can confirm that there are no exact duplicates and proceed with verification.';

//Status Change / validation help text
export const DUPLICATE_MARK_INFORMATION_TEXT_WITHOUT_VERIFY = 'Potential duplicates have been found. If any of these matches are correct, please select the appropriate one and Set as Original. The current entity then will be marked as duplicate of the original entity.';

export const ENTITY_ADDRESS_MANDATORY_DEFAULT_FIELD = ['countryCode', 'primaryAddressLine1', 'city'];
export const ENTITY_ADDRESS_MANDATORY_SPECIFIC_FIELD = [...ENTITY_ADDRESS_MANDATORY_DEFAULT_FIELD, 'state', 'postCode'];
export const ENTITY_MANDATORY_FIELDS = ['entityName', ...ENTITY_ADDRESS_MANDATORY_SPECIFIC_FIELD];
export const ENTITY_ADDRESS_FIELDS = ['primaryAddressLine1', 'primaryAddressLine2', 'city', 'state', 'postCode', 'countryCode']; // used for field order
export const ENTITY_MANDATORY_REPORTER_FIELDS = ['entityName', 'countryCode', 'city'];
export const ENTITY_MANDATORY_WITHOUT_ADDRESS = ['entityName', ...ENTITY_ADDRESS_MANDATORY_DEFAULT_FIELD]
export const ADDITIONAL_ADDRESS_FIELDS = ['addressLine1', 'addressLine2', 'city', 'state', 'postCode', 'countryCode']; // used for field order
export const ADDITIONAL_ADDRESS_REQUIRED_FIELDS_SPECIFIC = ['addressLine1', 'city', 'state', 'postCode', 'countryCode'];
export const ADDITIONAL_ADDRESS_REQUIRED_FIELDS_DEFAULT = ['countryCode', 'addressLine1', 'city'];
export const ENTITY_SPONSOR_MANDATORY_SPECIFIC_FIELD = ['sponsorName', 'sponsorTypeCode', ...ENTITY_ADDRESS_MANDATORY_SPECIFIC_FIELD];
export const ENTITY_SPONSOR_MANDATORY_DEFAULT_FIELD = ['sponsorName', 'sponsorTypeCode', ...ENTITY_ADDRESS_MANDATORY_DEFAULT_FIELD];
export const ENTITY_ORGANIZATION_MANDATORY_SPECIFIC_FIELD = ['organizationName', 'organizationTypeCode', ...ENTITY_ADDRESS_MANDATORY_SPECIFIC_FIELD];
export const ENTITY_ORGANIZATION_MANDATORY_DEFAULT_FIELD = ['organizationName', 'organizationTypeCode', ...ENTITY_ADDRESS_MANDATORY_DEFAULT_FIELD];
export const COUNTRY_SPECIFIC_REPORTER_FIELDS = [...ENTITY_MANDATORY_REPORTER_FIELDS, 'state'];
export const COUNTRY_CODE_FOR_MANDATORY_CHECK = ['CAN', 'CA', 'USA', 'US'];
export const COUNTRY_CODE_FOR_ALLOW_LOOKUP_ONLY = ['CAN', 'USA'];

export const ENTITY_VERIFY_FIELD_TAB_SECTION: Record<UnifiedVerifyFieldKeys, EntitySectionType> = {
    city: BASIC_DETAILS,
    state: BASIC_DETAILS,
    postCode: BASIC_DETAILS,
    entityName: BASIC_DETAILS,
    countryCode: BASIC_DETAILS,
    primaryAddressLine1: BASIC_DETAILS,
    entityOwnershipTypeCode: BASIC_DETAILS,
    sponsorAddress: { ...SPONSOR_DETAILS, sectionName: 'Sponsor Address'},
    sponsorTypeCode: SPONSOR_DETAILS,
    sponsorName: SPONSOR_DETAILS,
    entityRisks: SUB_AWARD_RISK,
    organizationTypeCode: SUB_AWARD_ORGANIZATION,
    organizationName: SUB_AWARD_ORGANIZATION,
    organizationAddress: { ...SUB_AWARD_ORGANIZATION, sectionName: 'Sub-award Organization Address' },
};

export const ENTITY_VERIFY_FIELD_SECTION_URL: Record<UnifiedVerifyFieldKeys, string> = {
    city: 'entity-overview',
    state: 'entity-overview',
    postCode: 'entity-overview',
    entityName: 'entity-overview',
    countryCode: 'entity-overview',
    primaryAddressLine1: 'entity-overview',
    entityOwnershipTypeCode: 'entity-overview',
    sponsorAddress: 'entity-sponsor',
    sponsorTypeCode: 'entity-sponsor',
    sponsorName: 'entity-sponsor',
    entityRisks: 'entity-subaward',
    organizationTypeCode: 'entity-subaward',
    organizationName: 'entity-subaward',
    organizationAddress: 'entity-subaward',
};

export const ENTITY_VERIFY_FIELD_ERROR_HELP_TEXT_ID: Record<UnifiedVerifyFieldKeys, string> = {
    city: 'coi-GE-verify-basic-error',
    state: 'coi-GE-verify-basic-error',
    postCode: 'coi-GE-verify-basic-error',
    entityName: 'coi-GE-verify-basic-error',
    countryCode: 'coi-GE-verify-basic-error',
    primaryAddressLine1: 'coi-GE-verify-basic-error',
    entityOwnershipTypeCode: 'coi-GE-verify-basic-error',
    sponsorAddress: 'coi-GE-verify-sp-addr-error',
    sponsorTypeCode: 'coi-GE-verify-sp-error',
    sponsorName: 'coi-GE-verify-sp-error',
    entityRisks: 'coi-GE-verify-org-risk-error',
    organizationTypeCode: 'coi-GE-verify-org-error',
    organizationName: 'coi-GE-verify-org-error',
    organizationAddress: 'coi-GE-verify-org-addr-error',
};

export const ENTITY_VERIFY_FIELD_WARNING_HELP_TEXT_ID: Record<UnifiedVerifyFieldKeys, string> = {
    city: 'coi-GE-verify-basic-info',
    state: 'coi-GE-verify-basic-info',
    postCode: 'coi-GE-verify-basic-info',
    entityName: 'coi-GE-verify-basic-info',
    countryCode: 'coi-GE-verify-basic-info',
    primaryAddressLine1: 'coi-GE-verify-basic-info',
    entityOwnershipTypeCode: 'coi-GE-verify-basic-info',
    sponsorAddress: 'coi-GE-verify-sp-addr-info',
    sponsorTypeCode: 'coi-GE-verify-sp-info',
    sponsorName: 'coi-GE-verify-sp-info',
    entityRisks: 'coi-GE-verify-org-risk-info',
    organizationTypeCode: 'coi-GE-verify-org-info',
    organizationName: 'coi-GE-verify-org-info',
    organizationAddress: 'coi-GE-verify-org-addr-info',
};

export const ENTITY_NOTES_RIGHTS = ['MANAGE_ENTITY_OVERVIEW_NOTES', 'VIEW_ENTITY_OVERVIEW_NOTES'];
export const SPONSOR_NOTES_RIGHTS = ['MANAGE_ENTITY_SPONSOR_NOTES', 'VIEW_ENTITY_SPONSOR_NOTES'];
export const SUB_AWARD_ORGANIZATION_NOTES_RIGHTS = ['VIEW_ENTITY_ORGANIZATION_NOTES', 'MANAGE_ENTITY_ORGANIZATION_NOTES'];
export const COMPLIANCE_NOTES_RIGHTS = ['MANAGE_ENTITY_COMPLIANCE_NOTES', 'VIEW_ENTITY_COMPLIANCE_NOTES'];

export const CHECK_FOR_DUNS_MATCHES_INFO = `Click 'Check for D&B Matches' button for available D&B matches based on the entered entity details.`;
export const UNLINK_DUNS_MATCHES_INFO = `This entity is currently linked to a D&B record. Click the 'Unlink D&B Match' button to remove the association.`;
export const ENTITY_VALIDATE_DUPLICATE_API = 'entity/validateDuplicate';

export const ENTITY_REVIEW_COMMENTS_COMPONENT_GROUP: Record<string, ReviewCommentSection> = {
    [BASIC_DETAILS.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: BASIC_DETAILS.sectionTypeCode,
        commentSectionName: BASIC_DETAILS.sectionName,
        commentTypeCode: BASIC_DETAILS.commentTypeCode,
        rights: BASIC_DETAILS.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [COMPANY_DETAILS.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: COMPANY_DETAILS.sectionTypeCode,
        commentSectionName: COMPANY_DETAILS.sectionName,
        commentTypeCode: COMPANY_DETAILS.commentTypeCode,
        rights: COMPANY_DETAILS.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [ENTITY_RISK.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: ENTITY_RISK.sectionTypeCode,
        commentSectionName: ENTITY_RISK.sectionName,
        commentTypeCode: ENTITY_RISK.commentTypeCode,
        rights: ENTITY_RISK.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [OTHER_REFERENCE_IDS.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: OTHER_REFERENCE_IDS.sectionTypeCode,
        commentSectionName: OTHER_REFERENCE_IDS.sectionName,
        commentTypeCode: OTHER_REFERENCE_IDS.commentTypeCode,
        rights: OTHER_REFERENCE_IDS.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [ENTITY_ATTACHMENTS.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: ENTITY_ATTACHMENTS.sectionTypeCode,
        commentSectionName: ENTITY_ATTACHMENTS.sectionName,
        commentTypeCode: ENTITY_ATTACHMENTS.commentTypeCode,
        rights: ENTITY_ATTACHMENTS.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [ADDITIONAL_INFORMATION.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: ADDITIONAL_INFORMATION.sectionTypeCode,
        commentSectionName: ADDITIONAL_INFORMATION.sectionName,
        commentTypeCode: ADDITIONAL_INFORMATION.commentTypeCode,
        rights: ADDITIONAL_INFORMATION.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [ENTITY_NOTES.sectionTypeCode]: {
        componentName: 'Overview',
        componentTypeCode: ENTITY_NOTES.sectionTypeCode,
        commentSectionName: ENTITY_NOTES.sectionName,
        commentTypeCode: ENTITY_NOTES.commentTypeCode,
        rights: ENTITY_NOTES.commentRights,
        uniqueId: 'OVERVIEW'
    },
    [SPONSOR_DETAILS.sectionTypeCode]: {
        componentName: 'Sponsor',
        componentTypeCode: SPONSOR_DETAILS.sectionTypeCode,
        commentSectionName: SPONSOR_DETAILS.sectionName,
        commentTypeCode: SPONSOR_DETAILS.commentTypeCode,
        rights: SPONSOR_DETAILS.commentRights,
        uniqueId: 'SPONSOR'
    },
    [SPONSOR_RISK.sectionTypeCode]: {
        componentName: 'Sponsor',
        componentTypeCode: SPONSOR_RISK.sectionTypeCode,
        commentSectionName: SPONSOR_RISK.sectionName,
        commentTypeCode: SPONSOR_RISK.commentTypeCode,
        rights: SPONSOR_RISK.commentRights,
        uniqueId: 'SPONSOR'
    },
    [SPONSOR_ATTACHMENTS.sectionTypeCode]: {
        componentName: 'Sponsor',
        componentTypeCode: SPONSOR_ATTACHMENTS.sectionTypeCode,
        commentSectionName: SPONSOR_ATTACHMENTS.sectionName,
        commentTypeCode: SPONSOR_ATTACHMENTS.commentTypeCode,
        rights: SPONSOR_ATTACHMENTS.commentRights,
        uniqueId: 'SPONSOR'
    },
    [SPONSOR_QUESTIONNAIRE.sectionTypeCode]: {
        componentName: 'Sponsor',
        componentTypeCode: SPONSOR_QUESTIONNAIRE.sectionTypeCode,
        commentSectionName: SPONSOR_QUESTIONNAIRE.sectionName,
        commentTypeCode: SPONSOR_QUESTIONNAIRE.commentTypeCode,
        rights: SPONSOR_QUESTIONNAIRE.commentRights,
        uniqueId: 'SPONSOR'
    },
    [SPONSOR_NOTES.sectionTypeCode]: {
        componentName: 'Sponsor',
        componentTypeCode: SPONSOR_NOTES.sectionTypeCode,
        commentSectionName: SPONSOR_NOTES.sectionName,
        commentTypeCode: SPONSOR_NOTES.commentTypeCode,
        rights: SPONSOR_NOTES.commentRights,
        uniqueId: 'SPONSOR'
    },
    [SUB_AWARD_ORGANIZATION.sectionTypeCode]: {
        componentName: 'Sub-award Organization',
        componentTypeCode: SUB_AWARD_ORGANIZATION.sectionTypeCode,
        commentSectionName: SUB_AWARD_ORGANIZATION.sectionName,
        commentTypeCode: SUB_AWARD_ORGANIZATION.commentTypeCode,
        rights: SUB_AWARD_ORGANIZATION.commentRights,
        uniqueId: 'ORGANIZATION'
    },
    [SUB_AWARD_RISK.sectionTypeCode]: {
        componentName: 'Sub-award Organization',
        componentTypeCode: SUB_AWARD_RISK.sectionTypeCode,
        commentSectionName: SUB_AWARD_RISK.sectionName,
        commentTypeCode: SUB_AWARD_RISK.commentTypeCode,
        rights: SUB_AWARD_RISK.commentRights,
        uniqueId: 'ORGANIZATION'
    },
    [SUB_AWARD_ATTACHMENTS.sectionTypeCode]: {
        componentName: 'Sub-award Organization',
        componentTypeCode: SUB_AWARD_ATTACHMENTS.sectionTypeCode,
        commentSectionName: SUB_AWARD_ATTACHMENTS.sectionName,
        commentTypeCode: SUB_AWARD_ATTACHMENTS.commentTypeCode,
        rights: SUB_AWARD_ATTACHMENTS.commentRights,
        uniqueId: 'ORGANIZATION'
    },
    [SUB_AWARD_QUESTIONNAIRE.sectionTypeCode]: {
        componentName: 'Sub-award Organization',
        componentTypeCode: SUB_AWARD_QUESTIONNAIRE.sectionTypeCode,
        commentSectionName: SUB_AWARD_QUESTIONNAIRE.sectionName,
        commentTypeCode: SUB_AWARD_QUESTIONNAIRE.commentTypeCode,
        rights: SUB_AWARD_QUESTIONNAIRE.commentRights,
        uniqueId: 'ORGANIZATION'
    },
    [SUB_AWARD_NOTES.sectionTypeCode]: {
        componentName: 'Sub-award Organization',
        componentTypeCode: SUB_AWARD_NOTES.sectionTypeCode,
        commentSectionName: SUB_AWARD_NOTES.sectionName,
        commentTypeCode: SUB_AWARD_NOTES.commentTypeCode,
        rights: SUB_AWARD_NOTES.commentRights,
        uniqueId: 'ORGANIZATION'
    },
    [COMPLIANCE_DETAILS.sectionTypeCode]: {
        componentName: 'Compliance',
        componentTypeCode: COMPLIANCE_DETAILS.sectionTypeCode,
        commentSectionName: COMPLIANCE_DETAILS.sectionName,
        commentTypeCode: COMPLIANCE_DETAILS.commentTypeCode,
        rights: COMPLIANCE_DETAILS.commentRights,
        uniqueId: 'COMPLIANCE'
    },
    [COMPLIANCE_RISK.sectionTypeCode]: {
        componentName: 'Compliance',
        componentTypeCode: COMPLIANCE_RISK.sectionTypeCode,
        commentSectionName: COMPLIANCE_RISK.sectionName,
        commentTypeCode: COMPLIANCE_RISK.commentTypeCode,
        rights: COMPLIANCE_RISK.commentRights,
        uniqueId: 'COMPLIANCE'
    },
    [COMPLIANCE_ATTACHMENTS.sectionTypeCode]: {
        componentName: 'Compliance',
        componentTypeCode: COMPLIANCE_ATTACHMENTS.sectionTypeCode,
        commentSectionName: COMPLIANCE_ATTACHMENTS.sectionName,
        commentTypeCode: COMPLIANCE_ATTACHMENTS.commentTypeCode,
        rights: COMPLIANCE_ATTACHMENTS.commentRights,
        uniqueId: 'COMPLIANCE'
    },
    [COMPLIANCE_QUESTIONNAIRE.sectionTypeCode]: {
        componentName: 'Compliance',
        componentTypeCode: COMPLIANCE_QUESTIONNAIRE.sectionTypeCode,
        commentSectionName: COMPLIANCE_QUESTIONNAIRE.sectionName,
        commentTypeCode: COMPLIANCE_QUESTIONNAIRE.commentTypeCode,
        rights: COMPLIANCE_QUESTIONNAIRE.commentRights,
        uniqueId: 'COMPLIANCE'
    },
    [COMPLIANCE_NOTES.sectionTypeCode]: {
        componentName: 'Compliance',
        componentTypeCode: COMPLIANCE_NOTES.sectionTypeCode,
        commentSectionName: COMPLIANCE_NOTES.sectionName,
        commentTypeCode: COMPLIANCE_NOTES.commentTypeCode,
        rights: COMPLIANCE_NOTES.commentRights,
        uniqueId: 'COMPLIANCE'
    },
    [CORPORATE_FAMILY.sectionTypeCode]: {
        componentName: '',
        componentTypeCode: CORPORATE_FAMILY.sectionTypeCode,
        commentSectionName: CORPORATE_FAMILY.sectionName,
        commentTypeCode: CORPORATE_FAMILY.commentTypeCode,
        rights: CORPORATE_FAMILY.commentRights,
        uniqueId: 'CORPORATE_FAMILY'
    },
    [GENERAL_COMMENTS.sectionTypeCode]: {
        componentName: '',
        componentTypeCode: GENERAL_COMMENTS.sectionTypeCode,
        commentSectionName: GENERAL_COMMENTS.sectionName,
        commentTypeCode: '23',
        rights: GENERAL_COMMENTS.commentRights,
        uniqueId: 'GENERAL'
    }
};

export const ENTITY_VERSION_STATUS = {
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED',
    ARCHIVE: 'ARCHIVE',
    PENDING: 'PENDING'
};

export const ENTITY__STATUS_TYPE = {
    MODIFICATION_IN_PROGRESS: 'Modification in Progress',
    CONFIRMED: 'Confirmed'
};

export const ENTITY_REVIEW_COMMENTS_COMPONENT_SORT = ['GENERAL', 'OVERVIEW', 'SPONSOR', 'ORGANIZATION', 'COMPLIANCE', 'CORPORATE_FAMILY'];

export const INDUSTRY_CATEGORY_TYPE_SOURCE = {
    DUNS: 'D',
    SYSTEM: 'S'
};

export const INDUSTRY_CATEGORY_TYPE_FORMAT = 'DESCRIPTION';
export const INDUSTRY_CATEGORY_DESCRIPTION_FORMAT = 'CODE - DESCRIPTION';

export const CORPORATE_TREE_CONFIRMED_INFO_TEXT = 'Modifications to this corporate family can only be made from the active version of the entity.';
export const CORPORATE_TREE_UNCONFIRMED_INFO_TEXT = 'The corporate family can be added only after confirming entity.';

//changes during modification in the following fields need to update feed status of sponsor
export const SPONSOR_FIELDS = [
    'sponsorName',
    'sponsorTypeCode',
    'acronym',
    'countryCode',
    'primaryAddressLine1',
    'primaryAddressLine2',
    'city',
    'state',
    'postCode',
    'phoneNumber',
    'emailAddress',
    'dunsNumber',
    'ueiNumber',
    'cageNumber',
    'translatedName',
    'comments'
];

//changes during modification in the following fields need to update feed status of organization
export const ORGANIZATION_FIELDS = [
    'organizationName',
    'organizationTypeCode',
    'countryCode',
    'primaryAddressLine1',
    'primaryAddressLine2',
    'city',
    'state',
    'postCode',
    'phoneNumber',
    'dunsNumber',
    'ueiNumber',
    'cageNumber',
    'humanSubAssurance',
    'animalWelfareAssurance',
    'animalAccreditation',
    'numberOfEmployees',
    'federalEmployerId',
    'incorporatedIn',
    'incorporationDate',
    'congressionalDistrict',
    'samExpirationDate',
    'subAwdRiskAssmtDate'
];

export const ENTITY_RIGHT_PANEL_SECTION_ID = 'coi-entity-right-panel';
export const ENTITY_RIGHT_PANEL_TOGGLE_BTN_ID = 'coi-entity-right-panel-toggle-btn';
