import { CLASS_GREEN_BADGE, CLASS_GREY_BADGE, CLASS_YELLOW_BADGE } from "../../app-constants";
import { CmpFieldKey } from "./management-plan.interface";

export const VIEW_CMP_RIGHTS = ['VIEW_CMP'];
export const MAINTAIN_CMP_RIGHTS = ['MAINTAIN_CMP'];
export const MAINTAIN_CMP_ATTACHMENT_RIGHTS = ['MAINTAIN_CMP_ATTACHMENT'];
export const CMP_REVIEW_RIGHTS = [...MAINTAIN_CMP_RIGHTS];
export const CMP_RIGHTS = [...VIEW_CMP_RIGHTS, ...MAINTAIN_CMP_RIGHTS];

export const COI_CMP_MODULE_CODE = 29;
export const COI_CMP_SUB_MODULE_CODE = 0;
export const CMP_MODULE_CONFIGURATION_CODE = 'MP29';
export const CMP_INITIAL_VERSION_NUMBER = 1;
export const CMP_GENERATE_FILE_TYPE = 'pdf, doc, docx';
export const RECIPIENT_SUBMODULE_ITEM_KEY = 0;

export const CMP_TYPE = {
    UNIVERSITY: '1',
    NON_UNIVERSITY: '2',
} as const;

export type CmpTypeValue = typeof CMP_TYPE[keyof typeof CMP_TYPE];
export type TaskActionType = 'CREATE' | 'EDIT' | 'DELETE' | 'START' | 'HOLD' | 'COMPLETE';

export const CMP_UNIVERSITY_MANDATORY_FIELDS: CmpFieldKey[] = [
    'CMP_TYPE',
    'PERSON_SEARCH',
    'ENTITY_SEARCH'
];

export const CMP_NON_UNIVERSITY_MANDATORY_FIELDS: CmpFieldKey[] = [
    'CMP_TYPE',
    'SUB_AWARD_INVESTIGATOR',
    'ENTITY_SEARCH'
];

export const CMP_FIELD_CUSTOM_CLASS: Record<CmpFieldKey, string> = {
    ENTITY_SEARCH: 'col-md-12 col-lg-12',
    PERSON_SEARCH: 'col-md-12 col-lg-12',
    SUB_AWARD_INVESTIGATOR: 'col-md-12 col-lg-12',
    SUB_AWARD_INSTITUTE: 'col-md-12 col-lg-12',
    CMP_TYPE: 'col-md-12 col-lg-12',
    PROJECT: 'col-md-12 col-lg-12',
    PROJECT_TYPE: 'col-md-12 col-lg-12',
    PROJECT_SEARCH: 'col-md-12 col-lg-12',
    TEMPLATE: 'col-md-12 col-lg-12',
    ACADEMIC_DEPARTMENT: 'col-md-12 col-lg-6',
    LAB_CENTER: 'col-md-12 col-lg-6'
};

export const CMP_VERSION_TYPE = {
    ACTIVE: 'ACTIVE',
    PENDING: 'PENDING',
    ARCHIVE: 'ARCHIVE'
} as const;

export const CMP_VERSION_STATUS_BADGE = {
    [CMP_VERSION_TYPE.ACTIVE]: CLASS_GREEN_BADGE,
    [CMP_VERSION_TYPE.PENDING]: CLASS_YELLOW_BADGE,
    [CMP_VERSION_TYPE.ARCHIVE]: CLASS_GREY_BADGE,
} as const;

export const CMP_STATUS = {
    INPROGRESS: '1',
    DRAFT: '2',
    FINAL_DRAFT: '3',
    FULLY_EXECUTED_ACTIVE: '4',
    FULLY_EXECUTED_CLOSED: '5',
    NOT_EXECUTED_CLOSED: '6',
    VOID: '7',
} as const;

export const CMP_REVIEWER_STATUS = {
    ASSIGNED: '1',
    INPROGRESS: '2',
    COMPLETED: '3'
} as const;

export const CMP_REVIEWER_STATUS_BADGE = {
    [CMP_REVIEWER_STATUS.ASSIGNED]: 'warning',
    [CMP_REVIEWER_STATUS.INPROGRESS]: 'info',
    [CMP_REVIEWER_STATUS.COMPLETED]: 'success',
} as const;

export const CMP_TYPE_PILLS = {
    [CMP_TYPE.UNIVERSITY]: 'coi-text-purple-badge',
    [CMP_TYPE.NON_UNIVERSITY]: 'coi-text-red-badge',
} as const;

export const CMP_ADMIN_DASHBOARD_URL = '/coi/admin-dashboard';
export const CMP_CREATION_URL = `/coi/create-management-plan`;
export const CMP_BASE_URL = '/coi/management-plan';

export const CMP_CHILD_ROUTE_URL = {
    TASK: 'tasks',
    REVIEW: 'reviews',
    DETAILS: 'details',
    HISTORY: 'history',
    MANAGEMENT_PLAN: 'plans',
    ATTACHMENT: 'attachments'
} as const;

export const CMP_ROUTE_URLS = {
    TASK: `${CMP_BASE_URL}/CMP_ID/${CMP_CHILD_ROUTE_URL.TASK}`,
    REVIEW: `${CMP_BASE_URL}/CMP_ID/${CMP_CHILD_ROUTE_URL.REVIEW}`,
    DETAILS: `${CMP_BASE_URL}/CMP_ID/${CMP_CHILD_ROUTE_URL.DETAILS}`,
    HISTORY: `${CMP_BASE_URL}/CMP_ID/${CMP_CHILD_ROUTE_URL.HISTORY}`,
    ATTACHMENT: `${CMP_BASE_URL}/CMP_ID/${CMP_CHILD_ROUTE_URL.ATTACHMENT}`,
    MANAGEMENT_PLAN: `${CMP_BASE_URL}/CMP_ID/${CMP_CHILD_ROUTE_URL.MANAGEMENT_PLAN}`
} as const;

export const ADVANCE_SEARCH_CRITERIA_IN_CMP_ADMIN_DASHBOARD = [
    'cmpPerson', 'cmpRolodex', 'cmpTypeCode', 'cmpStatusCode', 'approvalStartDate', 'approvalEndDate', 'expirationStartDate', 'expirationEndDate',
    'projectNumber', 'projectTitle', 'leadUnit', 'sponsorAwardNumber', 'principleInvestigator', 'sponsor', 'homeUnit'
];

export const DASHBOARD_CMP_CARD_FIELD_ORDER = [
    'DEPARTMENT',
    'APPROVAL_DATE',
    'EXPIRATION_DATE',
    'PROJECT',
    'PROJECT_SPONSOR_AWARD_NUMBER',
    'PROJECT_LEAD_UNIT',
    'PROJECT_PERIOD',
    'PROJECT_SPONSOR',
    'PROJECT_PRIME_SPONSOR'
];

export const TASK_STATUS_BADGE = {
    1: 'grey-badge',
    2: 'yellow-badge',
    3: 'red-badge',
    4: 'green-badge'
}

export const TASK_STATUS_CODES = {
    ASSIGNED: '1',
    IN_PROGRESS: '2',
    ON_HOLD: '3',
    COMPLETED: '4',
}

export const MAX_TASK_QUESTIONS = 50;
