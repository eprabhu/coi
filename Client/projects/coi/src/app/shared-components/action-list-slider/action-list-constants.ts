import { environment } from "../../../environments/environment";
import { AWARD_LABEL, COI_MODULE_CODE, GLOBAL_ENTITY_MODULE_CODE, OPA_MODULE_CODE, TRAVEL_MODULE_CODE } from "../../app-constants";
import { DECLARATION_LOCALIZE } from "../../app-locales";
import { COI_DECLARATION_MODULE_CODE } from "../../declarations/declaration-constants";

export const DEFAULT_ACTION_ICON = { text: 'Default', icon: 'demography' };
export const ACTION_BANNER_TYPE_CODE = 'B';

export const ACTION_LIST_ICON = {
    [COI_MODULE_CODE]: { text: 'Disclosure', icon: 'article' },
    [GLOBAL_ENTITY_MODULE_CODE]: { text: 'Entity', icon: 'domain' },
    [OPA_MODULE_CODE]: { text: 'OPA', icon: 'pending_actions' },
    [TRAVEL_MODULE_CODE]: { text: 'Travel', icon: 'flight' },
    [COI_DECLARATION_MODULE_CODE]: { text: DECLARATION_LOCALIZE.TERM, svg: `${environment.deployUrl}assets/images/coi-declaration.svg` }
}

// Action log codes
export const ACTION_LIST_MSG_TYPE_CODE = {
    DISCLOSURE_REQUIRED: '8001',
    COI_ANNUAL_DISCLOSURE_SUBMITTED: '147',
    COI_ANNUAL_DISCLOSURE_RETURNED: '148',
    COI_ADMIN_REVIEW: '149',
    COI_WAITING_FOR_REVIEW: '150',
    COI_RENEWAL_REQUIRED: '151',
    PROJECT_DISCLOSURE_SUBMITTED: '152',
    PROJECT_DISCLOSURE_RETURNED: '153',
    PROJECT_ADMIN_REVIEW: '154',
    PROJECT_WAITING_FOR_REVIEW: '155',
    ENTITY_INACTIVATED: '156',
    ENTITY_MODIFICATION_REQUIRED: '157',
    ENTITY_VERIFICATION_REQUIRED: '158',
    REQUEST_DISCLOSURE_WITHDRAWAL: '159',
    WITHDRAWAL_REQUEST_DENIED: '160',
    DISCLOSURE_REVISION_WITHDRAWAL_REQUIRED: '161',
    FCOI_ENGAGEMENT_CREATE: '163',
    FCOI_ENGAGEMENT_REVISE: '164',
    FCOI_ENGAGEMENT_WITHDRAW: '165',
    OPA_ENGAGEMENT_CREATE: '166',
    TRAVEL_ENGAGEMENT_CREATE: '167',
    FCOI_FROM_TRAVEL_DISCLOSURE_REQUIRED: '162',
    TRAVEL_RETURN: '170',
    TRAVEL_WAITING_FOR_REVIEW: '169',
    TRAVEL_SUBMITTED_FOR_REVIEW: '168',
    INBOX_ENTITY_REFRESH_UNVERIFIED: '8026',
    OPA_DISCLOSURE_WAITING_FOR_APPROVAL: '8027',
    OPA_DISCLOSURE_RETURNED: '8028',
    OPA_DISCLOSURE_SUBMITTED_FOR_REVIEW: '8029',
    REVISE_EXPIRED_DECLARATION: '8033',
    OPA_RENEWAL_REQUIRED: '8035',
};

// Button mapping
export const ACTION_LIST_BTN_MAP = {
    [ACTION_LIST_MSG_TYPE_CODE.DISCLOSURE_REQUIRED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.COI_ANNUAL_DISCLOSURE_SUBMITTED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.COI_ANNUAL_DISCLOSURE_RETURNED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.COI_ADMIN_REVIEW]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.COI_WAITING_FOR_REVIEW]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.COI_RENEWAL_REQUIRED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.PROJECT_DISCLOSURE_SUBMITTED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.PROJECT_DISCLOSURE_RETURNED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.PROJECT_ADMIN_REVIEW]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.PROJECT_WAITING_FOR_REVIEW]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.ENTITY_INACTIVATED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.ENTITY_MODIFICATION_REQUIRED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.ENTITY_VERIFICATION_REQUIRED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.REQUEST_DISCLOSURE_WITHDRAWAL]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.WITHDRAWAL_REQUEST_DENIED]: { icon: 'visibility', name: 'View' },
    [ACTION_LIST_MSG_TYPE_CODE.DISCLOSURE_REVISION_WITHDRAWAL_REQUIRED]: { icon: 'visibility', name: 'View' }
};

export const MODULE_CONSTANTS = {
    paths: {
        2: { name: 'Institute Proposal', path: '#/fibi/instituteproposal/overview?instituteProposalId=', class: 'text-warning' },
        3: { name: 'Development Proposal', path: '#/fibi/proposal?proposalId=', class: 'text-success' },
        5: { name: 'Negotiation', path: '#/fibi/negotiation/negotiationhome?negotiationId=', class: 'text-secondary' },
        6: { name: 'Delegation', path: '#/fibi/person/delegation?personId=', class: 'text-warning' },
        10: { name: `${AWARD_LABEL}`, path: '#/fibi/award/overview?awardId=', class: 'text-primary' },
        11: { name: `${AWARD_LABEL}`, path: '#/fibi/award/overview?awardId=', class: 'text-primary' },
        12: { name: `${AWARD_LABEL} Task`, path: '#/fibi/award/task/details?awardId=', subPath: '&&taskId=', class: 'text-info' },
        13: { name: 'Agreement', path: '#/fibi/agreement/form?agreementId=', class: 'text-info' },
        14: { name: 'Claims', path: '#/fibi/claims/endorsement?claimId=', class: 'text-danger' },
        16: { name: 'Progress Report', path: '#/fibi/progress-report/overview?progressReportId=', class: 'text-secondary' },
        20: { name: 'Service Request', path: '#/fibi/service-request/overview?serviceRequestId=', class: 'text-primary' },
    }
};

export const TRAVEL_VIEW_ARR = [ACTION_LIST_MSG_TYPE_CODE.TRAVEL_RETURN, ACTION_LIST_MSG_TYPE_CODE.TRAVEL_SUBMITTED_FOR_REVIEW, ACTION_LIST_MSG_TYPE_CODE.TRAVEL_WAITING_FOR_REVIEW];

/*
  8.  COI Disclosure
 23.  OPA  
 24.  COI Travel Disclosure  
 26.  Global Entity  
 27.  Consulting Disclosure  
 28.  Declaration  
*/
export const ACTION_LIST_MODULES = [8, 23, 24, 26, 27, 28];
export const FCOI_CREATE_REVISE_ARR = [ACTION_LIST_MSG_TYPE_CODE.DISCLOSURE_REQUIRED, ACTION_LIST_MSG_TYPE_CODE.COI_RENEWAL_REQUIRED, ACTION_LIST_MSG_TYPE_CODE.FCOI_FROM_TRAVEL_DISCLOSURE_REQUIRED];
