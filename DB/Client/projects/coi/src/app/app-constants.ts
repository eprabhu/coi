// size in bytes for splitting attachment in waf enabled environment ( 1 kb = 1000 bytes, 800 kb = 800000 bytes)

import { ENGAGEMENT_LOCALIZE } from "./app-locales";
import { COIEngagementMigrationModal, LookUpClass } from "./common/services/coi-common.interface";

export const CHUNK_SIZE = 800000;
export const HTTP_SUCCESS_STATUS = 'success';
export const HTTP_ERROR_STATUS = 'error';
export const LEAD_UNIT_OUTPUT_FORMAT = 'unitNumber - unitName';
export const NO_DATA_FOUND_MESSAGE = '--';
export const APPLICATION_FULL_LOADER_ID = 'coi-full-loader';
export const APPLICATION_MAIN_ROUTER_ID = 'app-main-router';

export const CREATE_DISCLOSURE_ROUTE_URL = '/coi/create-disclosure/screening';
export const POST_CREATE_DISCLOSURE_ROUTE_URL = '/coi/disclosure/summary';
export const CREATE_DISCLOSURE_RELATIONSHIP_ROUTE_URL = '/coi/create-disclosure/relationship';
export const CREATE_DISCLOSURE_ENGAGEMENT_ROUTE_URL = '/coi/create-disclosure/sfi';
export const CREATE_TRAVEL_DISCLOSURE_ROUTE_URL = '/coi/create-travel-disclosure/engagements';
export const TRAVEL_DISCLOSURE_FORM_ROUTE_URL = '/coi/create-travel-disclosure/travel-details';
export const TRAVEL_CREATE_BASE_URL = '/coi/create-travel-disclosure';
export const POST_CREATE_TRAVEL_DISCLOSURE_ROUTE_URL = '/coi/travel-disclosure/summary';
export const REPORTER_HOME_URL = '/coi/user-dashboard';
export const ADMIN_DASHBOARD_URL = '/coi/admin-dashboard';
export const PROJECT_DASHBOARD_URL = 'coi/project-dashboard';
export const ENTITY_DASHBOARD_URL = '/coi/entity-dashboard';
export const DEFAULT_UNIT_FORMAT = 'unitNumber - unitName';
export const CONSULTING_REDIRECT_URL = '/coi/consulting/form';
export const POST_CREATE_ENTITY_ROUTE_URL = '/coi/manage-entity/entity-overview';
export const ENGAGEMENT_ROUTE_URL = '/coi/entity-details/entity';
export const ENGAGEMENT_CREATE_URL = '/coi/create-sfi/create';

export const USER_DASHBOARD_ROUTE_URL = '/coi/user-dashboard';
export const USER_DASHBOARD_CHILD_ROUTE_URLS = {
    MY_HOME_ROUTE_URL: USER_DASHBOARD_ROUTE_URL + '/home',
    MY_ENGAGEMENTS_ROUTE_URL: USER_DASHBOARD_ROUTE_URL + '/entities',
    MY_DISCLOSURES_ROUTE_URL: USER_DASHBOARD_ROUTE_URL + '/disclosures',
    MY_PROJECTS_ROUTE_URL: USER_DASHBOARD_ROUTE_URL + '/awards',
    MY_NOTES_ROUTE_URL: USER_DASHBOARD_ROUTE_URL + '/notes',
    MY_ATTACHMENTS_ROUTE_URL: USER_DASHBOARD_ROUTE_URL + '/attachments',
};

export const OPA_DASHBOARD_ROUTE_URL = '/coi/opa-dashboard';
export const OPA_ROUTE_URL = '/coi/opa';
export const OPA_CHILD_ROUTE_URLS = {
    ROUTE_LOG: OPA_ROUTE_URL + '/route-log',
    FORM: OPA_ROUTE_URL + '/form',
    HISTORY: OPA_ROUTE_URL + '/history',
    REVIEW: OPA_ROUTE_URL + '/review',
};

export const CONSULTING_FORM_ROUTE_URL = '/coi/consulting';
export const CONSULTING_FORM_CHILD_ROUTE_URL = {
    FORM: CONSULTING_FORM_ROUTE_URL + '/form',
    HISTORY: CONSULTING_FORM_ROUTE_URL + '/history',
};

export const FCOI_DISCLOSURE_CREATE_MODE_BASE_URL = '/coi/create-disclosure';
export const FCOI_DISCLOSURE_CHILD_ROUTE_URLS = {
    SCREENING: FCOI_DISCLOSURE_CREATE_MODE_BASE_URL + '/screening',
    ENGAGEMENT: FCOI_DISCLOSURE_CREATE_MODE_BASE_URL + '/sfi',
    RELATIONSHIP: FCOI_DISCLOSURE_CREATE_MODE_BASE_URL + '/relationship',
    CERTIFICATION: FCOI_DISCLOSURE_CREATE_MODE_BASE_URL + '/certification',
    ATTACHMENT: FCOI_DISCLOSURE_CREATE_MODE_BASE_URL + '/disclosure-attachment',
};

export const FCOI_DISCLOSURE_VIEW_MODE_BASE_URL = 'coi/disclosure';
export const FCOI_DISCL_VIEW_MODE_CHILD_ROUTE_URLS = {
    DISCLOSURE: FCOI_DISCLOSURE_VIEW_MODE_BASE_URL + '/summary',
    REVIEW: FCOI_DISCLOSURE_VIEW_MODE_BASE_URL + '/review',
    ROUTE_LOG: FCOI_DISCLOSURE_VIEW_MODE_BASE_URL + '/route-log',
    ATTACHMENT: FCOI_DISCLOSURE_VIEW_MODE_BASE_URL + '/disclosure-attachment',
    HISTORY: FCOI_DISCLOSURE_VIEW_MODE_BASE_URL + '/history'
};

export const COI_ERROR_BASE_URL = '/coi/error-handler';
export const COI_ERROR_ROUTE_URLS = {
    FORBIDDEN: `${COI_ERROR_BASE_URL}/403`,
    NOT_FOUND: `${COI_ERROR_BASE_URL}/404`,
    UNAUTHORIZED: `${COI_ERROR_BASE_URL}/401`,
    MAINTENANCE: `${COI_ERROR_BASE_URL}/maintenance`,
};

export const COI_USER_HELP_BASE_URL = '/coi/user';
export const COI_USER_HELP_ROUTE_URLS = {
    FAQ: `${COI_USER_HELP_BASE_URL}/faq`,
    SUPPORT: `${COI_USER_HELP_BASE_URL}/support`,
};

export const ELASTIC_FIBI_PERSON_OUTPUT_FORMAT = 'full_name | prncpl_nm';
export const ELASTIC_ENTITY_FORMAT = 'entity_name | primary_address_line_1 primary_address_line_2 | city | state | country_name';
export const ELASTIC_AWARD_OUTPUT_FORMAT = ' award_number | account_number | title | sponsor | lead_unit_name | pi_name | grant_call_name';
export const ELASTIC_ROLODEX_PERSON_OUTPUT_FORMAT = 'rolodex_id | full_name | organization | email_address';
export const ELASTIC_ORGANIZATION_OUTPUT_FORMAT = 'rolodex_id | full_name | organization | email_address | address';
export const ELASTIC_IP_OUTPUT_FORMAT = 'proposal_number | title | sponsor | lead_unit_name | activity_type | proposal_type | pi_full_name | status';
export const ELASTIC_PROPOSAL_OUTPUT_FORMAT = 'proposal_id | title | full_name | category | type | status | sponsor | lead_unit_name';
export const ELASTIC_GRANT_OUTPUT_FORMAT = 'grant_header_id | title | grant_type | sponsor | funding_scheme | status';
export const ELASTIC_COI_OUTPUT_FORMAT = 'coi_disclosure_number | full_name | disclosure_disposition |disclosure_status | module_item_key';
export const ELASTIC_IACUC_OUTPUT_FORMAT = 'protocol_number | title | lead_unit_name | status | person_name | protocol_type';
export const ELASTIC_IRB_OUTPUT_FORMAT = 'protocol_number | title | lead_unit_name | status | person_name';
export const ELASTIC_AGREEMENT_OUTPUT_FORMAT = 'agreement_request_id | title | agreement_type | unit_name | agreement_status | principal_person_full_name | aa_person_full_name | sponsor_name | requestor_full_name';
export const ELASTIC_EXTERNAL_REVIEWER_OUTPUT_FORMAT = 'full_name | email_addr | Academic Rank : academic_rank | H-Index: hindex';

export const ELASTIC_ENTITY_DISPLAY_FIELDS = { entity_name: {}, country_name: {}, primary_address_line_1: {}, primary_address_line_2: {}, city: {}, state: {} };
export const ELASTIC_ENTITY_SEARCH_FIELDS = { entity_name: {} };

export const ADMIN_DASHBOARD_RIGHTS = ['MANAGE_FCOI_DISCLOSURE', 'VIEW_FCOI_DISCLOSURE', 'MANAGE_PROJECT_DISCLOSURE', 'VIEW_PROJECT_DISCLOSURE',
    'MANAGE_TRAVEL_DISCLOSURE', 'VIEW_TRAVEL_DISCLOSURE', 'MANAGE_CONSULTING_DISCLOSURE', 'VIEW_CONSULTING_DISCLOSURE', 'MAINTAIN_CMP'];

export const APPLICATION_ADMINISTRATOR_RIGHT = 'APPLICATION_ADMINISTRATOR';

export const COI_CONFIGURATIONS_RIGHTS = [
    APPLICATION_ADMINISTRATOR_RIGHT,
    'MAINTAIN_QUESTIONNAIRE',
    'MAINTAIN_USER_ROLES',
    'MAINTAIN_ROLE',
    'MAINTAIN_PERSON',
    'MAINTAIN_TRAINING',
    'VIEW_KEY_PERSON_TIMESHEET',
    'MAINTAIN_KEY_PERSON_TIMESHEET',
    'MAINTAIN_DELEGATION',
    'MAINTAIN_ORCID_WORKS'
];

export const COI_DISCLOSURE_SUPER_ADMIN_RIGHTS = ['COI_ADMINISTRATOR', 'VIEW_ADMIN_GROUP_COI'];

export const PROJECT_DASHBOARD_RIGHTS = ['MANAGE_PROJECT_DISCLOSURE_OVERVIEW', 'CONTRACT_ADMINISTRATOR'];
export const TRAVEL_DISCLOSURE_MANAGE_RIGHTS = ['MANAGE_TRAVEL_DISCLOSURE'];
export const TRAVEL_DISCLOSURE_RIGHTS = [...TRAVEL_DISCLOSURE_MANAGE_RIGHTS, 'VIEW_TRAVEL_DISCLOSURE'];
export const CONSULTING_DISCLOSURE_MANAGE_RIGHTS = ['MANAGE_CONSULTING_DISCLOSURE'];
export const CONSULTING_DISCLOSURE_RIGHTS = [...CONSULTING_DISCLOSURE_MANAGE_RIGHTS, 'VIEW_CONSULTING_DISCLOSURE'];

export const FCOI_DISCLOSURE_RIGHTS = ['MANAGE_FCOI_DISCLOSURE', 'VIEW_FCOI_DISCLOSURE'];
export const PROJECT_DISCLOSURE_RIGHTS = ['MANAGE_PROJECT_DISCLOSURE', 'VIEW_PROJECT_DISCLOSURE'];
export const FCOI_PROJECT_DISCLOSURE_RIGHTS = ['MANAGE_FCOI_DISCLOSURE', 'VIEW_FCOI_DISCLOSURE', 'MANAGE_PROJECT_DISCLOSURE', 'VIEW_PROJECT_DISCLOSURE'];
export const MAINTAIN_DISCL_FROM_AFFILIATED_UNITS = ['MAINTAIN_DISCLOSURES_FROM_AFFILIATED_UNITS'];

export const OPA_DISCLOSURE_RIGHTS = ['MANAGE_OPA_DISCLOSURE', 'VIEW_OPA_DISCLOSURE'];
export const OPA_DISCLOSURE_ADMIN_RIGHTS = ['OPA_ADMINISTRATOR', 'VIEW_ADMIN_GROUP_OPA'];
export const OPA_MAINTAIN_REVIEWER_RIGHT = 'MAINTAIN_OPA_REVIEWER';
export const OPA_DEPT_ADMIN_RIGHT = 'OPA_DEPARTMENT_ADMINISTRATOR';
export const OPA_REVIEW_RIGHTS = [...OPA_DISCLOSURE_ADMIN_RIGHTS, 'MANAGE_OPA_DISCLOSURE'];

export const ENTITY_RIGHTS = ['MANAGE_ENTITY', 'VIEW_ENTITY', 'MANAGE_ENTITY_SPONSOR', 'MANAGE_ENTITY_ORGANIZATION', 'MANAGE_ENTITY_COMPLIANCE', 'VERIFY_ENTITY'];
export const ENTITY_SPONSOR_RIGHT = ['MANAGE_ENTITY_SPONSOR'];
export const ENTITY_ORGANIZATION_RIGHT = ['MANAGE_ENTITY_ORGANIZATION'];
export const ENTITY_COMPLIANCE_RIGHT = ['MANAGE_ENTITY_COMPLIANCE'];
export const ENTITY_MANAGE_RIGHT = ['MANAGE_ENTITY', 'MANAGE_ENTITY_SPONSOR', 'MANAGE_ENTITY_ORGANIZATION', 'MANAGE_ENTITY_COMPLIANCE'];
export const IMPORT_ENTITY_VIEW_RIGHTS = ['VIEW_IMPORT_ENTITY'];
export const IMPORT_ENTITY_MANAGE_RIGHTS = ['MANAGE_IMPORT_ENTITY'];
export const IMPORT_ENTITY_RIGHTS = [...IMPORT_ENTITY_VIEW_RIGHTS, ...IMPORT_ENTITY_MANAGE_RIGHTS];
export const ENTITY_DASHBOARD_RIGHTS = [...ENTITY_RIGHTS, ...IMPORT_ENTITY_RIGHTS];

export const DISCLOSURE_NOTES_RIGHT = ['MANAGE_DISCLOSURE_NOTES', 'VIEW_DISCLOSURE_NOTES'];

export const SFI_ADDITIONAL_DETAILS_SECTION_NAME = 'Engagements Details';
export const RELATIONSHIP_DETAILS_SECTION_NAME = 'Relationship Details';
export const RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME = 'Relationship Questionnaire';
export const FINANCIAL_DETAILS_SECTION_NAME = 'Financial Details';
export const MATRXI_FORM = 'Financial Details';

export type  NOTE_ADD_API = '/entity/notes/save' | '/notes/save';
export type  NOTE_EDIT_API = '/entity/notes/update' | '/notes/update';
export type  NOTE_DELETE_API = '/entity/notes/delete'| '/notes/delete/';

export const DATE_PLACEHOLDER = 'MM/dd/YYYY';
export const DEFAULT_DATE_FORMAT = 'MM/dd/yyyy';
export const LONG_DATE_FORMAT = 'MM/dd/yyyy h:mm:ss a';
export const TIME_FORMAT = 'h:mm:ss a';

//  Angular Material date picker
export const DATE_PICKER_FORMAT_MATERIAL = {
    parse: {
        dateInput: 'MM/DD/YYYY HH:mm:ss',
    },
    display: {
        dateInput: 'MM/DD/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

export const EDITOR_CONFIGURATION = {
    link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'http://'
    },
    removePlugins: ['imageUpload', 'mediaEmbed'],
    toolbar: {
        removeItems: ['imageUpload', 'mediaEmbed', 'uploadImage']
    },
    image: {},
    mediaEmbed: {},
    height: 60,
    placeholder: 'Please enter the description',
};

export const COI_MODULE_CODE = 8;
export const OPA_MODULE_CODE = 23;
export const TRAVEL_MODULE_CODE = 24;
export const CONSULTING_MODULE_CODE = 27;
export const GLOBAL_ENTITY_MODULE_CODE = 26;
export const GLOBAL_ENTITY_SPONSOR_SUBMODULE_CODE = 1;
export const GLOBAL_ENTITY_ORGANIZATION_SUBMODULE_CODE = 2;
export const GLOBAL_ENTITY_COMPLIANCE_SUBMODULE_CODE = 3;
export const ENGAGEMENT_SUB_MODULE_CODE = 801;
export const FCOI_SUB_MODULE_ITEM_KEY = 0;
export const CONSULTING_SUB_MODULE_CODE = 0;
export const TRAVEL_SUB_MODULE_CODE = 0;
export const OPA_SUB_MODULE_CODE = 0;
export const ENGAGEMENT_SUB_ITEM_KEY = 0;
// Proposal Certification Questionaire Sub Module Code
export const EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE = 802;

export const DISCLOSURE_MODULE_MAP = {
    'FCOI': COI_MODULE_CODE,
    'TRAVEL': TRAVEL_MODULE_CODE,
    'OPA': OPA_MODULE_CODE,
    'CONSULTING': CONSULTING_MODULE_CODE
};

export const OPA_REVIEW_STATUS = {
    PENDING: '1',
    SUBMITTED: '2',
    REVIEW_IN_PROGRESS: '3',
    COMPLETED: '4',
    RETURNED: '5',
    WITHDRAWN: '6',
    REVIEW_ASSIGNED: '7',
    ASSIGNED_REVIEW_COMPLETED: '8',
    ROUTING_IN_PROGRESS: '9'
};

export const OPA_DISPOSITION_STATUS = {
    PENDING: '1',
    VOID: '2',
    APPROVED: '3',
    EXPIRED: '4'
};

export const COI_DISPOSITION_STATUS = {
    PENDING: '1',
    VOID: '2',
    APPROVED: '3',
    EXPIRED: '4'
};

export const CONSULTING_REVIEW_STATUS = {
    PENDING: '1',
    SUBMITTED:'2',
    REVIEW_IN_PROGRESS: '3',
    REVIEW_ASSIGNED: '4',
    ASSIGNED_REVIEW_COMPLETED: '5',
    COMPLETED: '6',
    WITHDRAWN: '7',
    RETURNED: '8',
    ROUTING_IN_PROGRESS: '9'
};

export const CONSULTING_DISPOSITION_STATUS = {
    PENDING: '1',
    APPROVED: '2',
    VOID: '3',
}

export const DISCLOSURE_REVIEW_STATUS = {
    PENDING: '1',
    RETURNED: '5',
    WITHDRAWN: '6',
    REVIEW_ASSIGNED:'7',
    SUBMITTED:'2',
    REVIEW_IN_PROGRESS: '3',
    COMPLETED: '4',
    ASSIGNED_REVIEW_COMPLETED: '8',
    ROUTING_IN_PROGRESS: '9'
};

export const FCOI_DISCLOSURE_EDIT_MODE_REVIEW_STATUS = [
    DISCLOSURE_REVIEW_STATUS.PENDING,
    DISCLOSURE_REVIEW_STATUS.RETURNED,
    DISCLOSURE_REVIEW_STATUS.WITHDRAWN
];

export const FCOI_REVIEWER_REVIEW_STATUS_TYPE = {
    ASSIGNED: '1',
    COMPLETED: '2',
    IN_PROGRESS: '3'
} as const;

export const OPA_REVIEWER_REVIEW_STATUS = {
    ASSIGNED: '1',
    IN_PROGRESS: '2',
    COMPLETED: '3'
} as const;

export const GRAPH_ID = {
    ENTITY_GRAPH_ID: 101
};

export const DISCLOSURE_RISK = {
    HIGH: '1',
    MEDIUM: '2',
    LOW: '3',
}

// sso timeout related variables
export const SSO_TIMEOUT_ERROR_MESSAGE = 'Your session has been expired.';
export const SSO_TIMEOUT_ERROR_CODE = 0;
export const SSO_LOGOUT_URL = '';

export const AWARD_EXTERNAL_RESOURCE_URL = '#/fibi/award/overview?awardId={projectId}';
export const PROPOSAL_EXTERNAL_RESOURCE_URL = '#/fibi/proposal/overview?proposalId={projectId}';
export const IP_EXTERNAL_RESOURCE_URL = '#/fibi/instituteproposal/overview?instituteProposalId={projectId}';

export const PERSON_EXTERNAL_RESOURCE_URL = '#/fibi/person/person-details?personId={personId}';
export const ROLODEX_PERSON_EXTERNAL_RESOURCE_URL = '#/fibi/rolodex';

export const URL_FOR_DISCLOSURE_PROJECT = '/fcoiDisclosure/projects/{disclosureId}';

export const CLASS_RED_BADGE = 'red-badge';
export const CLASS_GREEN_BADGE = 'green-badge';
export const CLASS_BLUE_BADGE = 'blue-badge';
export const CLASS_BROWN_BADGE = 'brown-badge';
export const CLASS_YELLOW_BADGE = 'yellow-badge';
export const CLASS_GREY_BADGE = 'grey-badge';
export const CLASS_ORANGE_BADGE = 'orange-badge';
export const CLASS_BRIGHT_RED_BADGE = 'bright-red-badge';

export const HIGHT_RISK_BADGE = 'high-risk';
export const MEDIUM_RISK_BADGE = 'medium-risk';
export const LOW_RISK_BADGE = 'low-risk';

export const SUBMISSION_STATUS_BADGE: { [key: string]: string } = {
    'Pending': CLASS_YELLOW_BADGE,
    'Not Required': CLASS_GREY_BADGE,
    'Completed': CLASS_GREEN_BADGE,
    'Approved': CLASS_GREEN_BADGE,
    'N/A': CLASS_GREY_BADGE,
};

export const PROJECT_CONFLICT_STATUS_TYPE = {
    NO_CONFLICT: '100',
    POTENTIAL_CONFLICT: '200',
    CONFLICT_IDENTIFIED: '300',
    NO_CONFLICT_WITHOUT_ENGAGEMENTS: '400'
};

export const CONFLICT_STATUS_TYPE: { [key: string]: string } = {
    NO_CONFLICT: '1',
    POTENTIAL_CONFLICT: '2',
    CONFLICT_IDENTIFIED: '3',
    NO_CONFLICT_WITHOUT_ENGAGEMENTS: '4',
    NO_CONFLICT_WITHOUT_PROJECTS: '5',
    NO_CONFLICT_WITHOUT_PROJECTS_AND_ENGAGEMENTS: '6'
} as const;

export const PROJECT_CONFLICT_STATUS_BADGE: { [key: string]: string } = {
    [PROJECT_CONFLICT_STATUS_TYPE.NO_CONFLICT]: CLASS_GREEN_BADGE,
    [PROJECT_CONFLICT_STATUS_TYPE.POTENTIAL_CONFLICT]: CLASS_BROWN_BADGE,
    [PROJECT_CONFLICT_STATUS_TYPE.CONFLICT_IDENTIFIED]: CLASS_RED_BADGE,
    [PROJECT_CONFLICT_STATUS_TYPE.NO_CONFLICT_WITHOUT_ENGAGEMENTS]: CLASS_GREEN_BADGE
};

export const PROJECT_CONFLICT_STATUS_COUNT_COLOR: { [key: string]: string } = {
    [PROJECT_CONFLICT_STATUS_TYPE.NO_CONFLICT]: 'text-success',
    [PROJECT_CONFLICT_STATUS_TYPE.POTENTIAL_CONFLICT]: 'text-warning',
    [PROJECT_CONFLICT_STATUS_TYPE.CONFLICT_IDENTIFIED]: 'text-danger',
} as const;

export const CONFLICT_STATUS_TO_PROJECT_STATUS_MAP: { [key: string]: string } = {
    [CONFLICT_STATUS_TYPE.NO_CONFLICT]: PROJECT_CONFLICT_STATUS_TYPE.NO_CONFLICT,
    [CONFLICT_STATUS_TYPE.POTENTIAL_CONFLICT]: PROJECT_CONFLICT_STATUS_TYPE.POTENTIAL_CONFLICT,
    [CONFLICT_STATUS_TYPE.CONFLICT_IDENTIFIED]: PROJECT_CONFLICT_STATUS_TYPE.CONFLICT_IDENTIFIED,
} as const;

export const DISCLOSURE_CONFLICT_STATUS_BADGE: { [key: string]: string } = {
    '1': CLASS_GREEN_BADGE,
    '2': CLASS_BROWN_BADGE,
    '3': CLASS_RED_BADGE,
    '4': CLASS_GREEN_BADGE,
    '5': CLASS_GREEN_BADGE,
    '6': CLASS_GREEN_BADGE,
};

export const BATCH_ENTITY_REVIEW_STATUS_BADGE: { [key: string]: string } = {
    '1': CLASS_YELLOW_BADGE, // PENDING
    '2': CLASS_GREEN_BADGE,  // COMPLETED
    '3': CLASS_RED_BADGE,    // ERROR
    '4': CLASS_YELLOW_BADGE   // PROCESSING
};

export const BATCH_ENTITY_BATCH_STATUS_BADGE: { [key: string]: string } = {
    '1': CLASS_YELLOW_BADGE, // PENDING
    '2': CLASS_YELLOW_BADGE,  // INITIALIZE
    '3': CLASS_GREEN_BADGE,    // COMPLETED
    '4': CLASS_RED_BADGE   // ABORT
};


export const OPA_DISPOSITION_STATUS_BADGE: { [key: string]: string } = {
    [OPA_DISPOSITION_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [OPA_DISPOSITION_STATUS.VOID]: CLASS_GREY_BADGE,
    [OPA_DISPOSITION_STATUS.APPROVED]: CLASS_GREEN_BADGE,
    [OPA_DISPOSITION_STATUS.EXPIRED]: CLASS_RED_BADGE,
};

export const COI_DISPOSITION_STATUS_BADGE: { [key: string]: string } = {
    [COI_DISPOSITION_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [COI_DISPOSITION_STATUS.VOID]: CLASS_GREY_BADGE,
    [COI_DISPOSITION_STATUS.APPROVED]: CLASS_GREEN_BADGE,
    [COI_DISPOSITION_STATUS.EXPIRED]: CLASS_RED_BADGE,
};

export const OPA_REVIEW_STATUS_BADGE: { [key: string]: string } = {
    [OPA_REVIEW_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [OPA_REVIEW_STATUS.SUBMITTED]: CLASS_BLUE_BADGE,
    [OPA_REVIEW_STATUS.REVIEW_IN_PROGRESS]: CLASS_YELLOW_BADGE,
    [OPA_REVIEW_STATUS.COMPLETED]: CLASS_GREEN_BADGE,
    [OPA_REVIEW_STATUS.RETURNED]: CLASS_RED_BADGE,
    [OPA_REVIEW_STATUS.WITHDRAWN]: CLASS_RED_BADGE,
    [OPA_REVIEW_STATUS.REVIEW_ASSIGNED]: CLASS_BLUE_BADGE,
    [OPA_REVIEW_STATUS.ASSIGNED_REVIEW_COMPLETED]: CLASS_GREEN_BADGE,
    [OPA_REVIEW_STATUS.ROUTING_IN_PROGRESS]: CLASS_RED_BADGE,
};

export const CONSULTING_DISPOSITION_STATUS_BADGE: { [key: string]: string } = {
    [CONSULTING_DISPOSITION_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [CONSULTING_DISPOSITION_STATUS.APPROVED]: CLASS_GREEN_BADGE,
    [CONSULTING_DISPOSITION_STATUS.VOID]: CLASS_GREY_BADGE,
};

export const CONSULTING_REVIEW_STATUS_BADGE: { [key: string]: string } = {
    [CONSULTING_REVIEW_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [CONSULTING_REVIEW_STATUS.SUBMITTED]: CLASS_BLUE_BADGE,
    [CONSULTING_REVIEW_STATUS.REVIEW_IN_PROGRESS]: CLASS_YELLOW_BADGE,
    [CONSULTING_REVIEW_STATUS.REVIEW_ASSIGNED]: CLASS_BLUE_BADGE,
    [CONSULTING_REVIEW_STATUS.ASSIGNED_REVIEW_COMPLETED]: CLASS_GREEN_BADGE,
    [CONSULTING_REVIEW_STATUS.COMPLETED]: CLASS_GREEN_BADGE,
    [CONSULTING_REVIEW_STATUS.WITHDRAWN]: CLASS_RED_BADGE,
    [CONSULTING_REVIEW_STATUS.RETURNED]: CLASS_RED_BADGE,  
};
export const COI_REVIEW_STATUS_BADGE: { [key: string]: string } = {
    [DISCLOSURE_REVIEW_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [DISCLOSURE_REVIEW_STATUS.SUBMITTED]: CLASS_BLUE_BADGE,
    [DISCLOSURE_REVIEW_STATUS.REVIEW_IN_PROGRESS]: CLASS_YELLOW_BADGE,
    [DISCLOSURE_REVIEW_STATUS.COMPLETED]: CLASS_GREEN_BADGE,
    [DISCLOSURE_REVIEW_STATUS.RETURNED]: CLASS_RED_BADGE,
    [DISCLOSURE_REVIEW_STATUS.WITHDRAWN]: CLASS_RED_BADGE,
    [DISCLOSURE_REVIEW_STATUS.REVIEW_ASSIGNED]: CLASS_BLUE_BADGE,
    [DISCLOSURE_REVIEW_STATUS.ASSIGNED_REVIEW_COMPLETED]: CLASS_GREEN_BADGE,
    [DISCLOSURE_REVIEW_STATUS.ROUTING_IN_PROGRESS]: CLASS_RED_BADGE,
};

export const DISCLOSURE_RISK_BADGE: { [key: string]: string } = {
    [DISCLOSURE_RISK.HIGH]: HIGHT_RISK_BADGE,
    [DISCLOSURE_RISK.MEDIUM]: MEDIUM_RISK_BADGE,
    [DISCLOSURE_RISK.LOW]: LOW_RISK_BADGE,
};

export const RISK_ICON_COLOR_MAPPING: { [key: string]: string } = {
    '1': 'text-success',
    '2': 'text-warning',
    '3': 'text-danger',
    'NA': 'text-muted'
};

export const REVIEWER_STATUS_MAP: { [key: string]: string } = {
    '1': 'coi-reviewer-pill-warning',
    '2': 'coi-reviewer-pill-info',
    '3': 'coi-reviewer-pill-success',
    null: 'coi-reviewer-pill-danger'
} as const;

export const COMMON_ERROR_TOAST_MSG = 'Something went wrong, please try again.';

export const ENTITY_DOCUMENT_STATUS_TYPE = {
    ACTIVE: '1',
    INACTIVE: '2',
    DUPLICATE: '3',
};

export const ENGAGEMENT_VERSION_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVE: 'ARCHIVE',
};

export const ENGAGEMENT_TYPE_ICONS = {
    [ENGAGEMENT_LOCALIZE.TERM_COMMITMENT_FOR_REL_PILLS]: 'handshake',
    [ENGAGEMENT_LOCALIZE.TERM_TRAVEL_FOR_REL_PILLS]: 'flight',
    [ENGAGEMENT_LOCALIZE.TERM_FINANCIAL_FOR_REL_PILLS]: 'paid',
    [ENGAGEMENT_LOCALIZE.TERM_CONSULTING_FOR_REL_PILLS]: 'supervisor_account'
};

export const RELATIONS_TYPE_SUMMARY = {
    FINANCIAL: 1,
    COMMITMENT: 2,
    TRAVEL: 3,
    CONSULTING: 4
};

export const ENGAGEMENT_REL_TYPE_ICONS = {
    [RELATIONS_TYPE_SUMMARY.FINANCIAL]: 'paid',
    [RELATIONS_TYPE_SUMMARY.COMMITMENT]: 'handshake',
    [RELATIONS_TYPE_SUMMARY.TRAVEL]: 'flight',
    [RELATIONS_TYPE_SUMMARY.CONSULTING]: 'supervisor_account'
};

export const ENGAGEMENT_FLOW_TYPE = {
    FLOW_1: 'REL_SUB_DIVISION',
    FLOW_2: 'REL_SUMMARY',
    FLOW_3: 'REL_COMP',
};

export const ENTITY_VERIFICATION_STATUS = {
    VERIFIED: '1',
    UNVERIFIED: '2',
    MODIFYING: '3',
    DUNS_REFRESH: '4'
};

export const DISCLOSURE_TYPE = {
    INITIAL: '1',
    PROJECT: '2',
    REVISION: '3'
};

export const OPA_VERSION_TYPE = {
    ACTIVE: 'ACTIVE',
    PENDING: 'PENDING'
}

export const FCOI_VERSION_TYPE = {
    ACTIVE: 'ACTIVE',
    PENDING: 'PENDING'
}

export const OPA_INITIAL_VERSION_NUMBER = 1;

export const PROJECT_TYPE = {
    AWARD: '1',
    IP: '2',
    DEV_PROPOSAL: '3'
} as const;

export const PROJECT_TYPE_LABEL = {
    [PROJECT_TYPE.AWARD]: 'Award',
    [PROJECT_TYPE.IP]: 'Institute Proposal',
    [PROJECT_TYPE.DEV_PROPOSAL]: 'Development Proposal'
};

export type ProjectTypeCodes = (typeof PROJECT_TYPE)[keyof typeof PROJECT_TYPE];

export const PROJECT_DASHBOARD_SORT_TITLES = {
    AWARD : 'Award Title',
    DEV_PROPOSAL: 'Proposal Title'
};

export const COI_COEUS_SUB_MODULE = {
    [PROJECT_TYPE.AWARD]: 1,
    [PROJECT_TYPE.DEV_PROPOSAL]: 2,
    [PROJECT_TYPE.IP]: 10,
    ANNUAL_DISCLOSURE: 14
} as const;

export const FEED_STATUS_CODE = {
    READY_TO_FEED: '2',
    SUCCESS: '3',
    ERROR: '4',
    NOT_READY_TO_FEED: '1'
};

export const ENTITY_ADDRESS_TYPE_CODE = {
    OTHER_ADDRESS: '1',
    MAILING_ADDRESS: '2',
    SPONSOR: '3',
    ORGANIZATION: '4'
};

export const ENTITY_SOURCE_TYPE_CODE = {
    SPONSOR: '1',
    ORGANIZATION: '2',
    DISCLOSURE_REPORTER: '3',
    COMPLIANCE: '4',
    DST: '5',
    ENTITY_ADMIN: '6',
    CMP: '7'
};

export const BATCH_STATUS_TYPE_CODE = {
    PENDING: 1,
    INITIALIZE: 2,
    COMPLETED: 3,
    ABORT: 4
};

export const BATCH_REVIEW_STATUS_TYPE_CODE = {
    PENDING: 1,
    COMPLETED: 2,
    ERROR: 3,
    PROCESSING: 4,
};

export const BATCH_REVIEW_ACTION_TYPE_CODE = {
    MARK_AS_DUPLICATE_INCLUDE: 1,
    SOURCE_SELECTED: 2,
    CREATE_WITH_DUNS: 3,
    MARK_AS_EXCLUDE: 4,
    CREATE_WITHOUT_DUNS: 5,
    MARK_AS_DUPLICATE_EXCLUDE: 6,
};

export const COMPONENT_TYPE_CODE = {
    CA_COMMENTS : '12',
    GENERAL_COMMENTS : '3'
};

export const PROJECT_DASHBOARD_TABS = {
    AWARD : 'AWARD',
    DEV_PROPOSAL : 'DEV_PROPOSAL'
};

export const DISCLOSURE_MANDATORY_FLAGS = {
    SELF : 'SELF',
    HIERARCHY : 'HIERARCHY',
    DEFAULT : 'NULL'
};

export const AWARD_DETAILS_ORDER_WITHOUT_ROLE = [
    'PI',
    'LEAD_UNIT',
    'PROJECT_STATUS',
    'ACCOUNT_NUMBER',
    'SPONSOR',
    'PRIME_SPONSOR',
    'PERIOD'
];

export const PROPOSAL_DETAILS_ORDER_WITHOUT_ROLE = [
    'PI',
    'LEAD_UNIT',
    'PROJECT_STATUS',
    'SPONSOR',
    'PRIME_SPONSOR',
    'PERIOD'
];

export const PROPOSAL_DETAILS_ORDER = [
    'PI',
    'REPORTER_ROLE',
    'LEAD_UNIT',
    'PROJECT_STATUS',
    'SPONSOR',
    'PRIME_SPONSOR',
    'PERIOD'
];

export const AWARD_DETAILS_ORDER = [
    'PI',
    'REPORTER_ROLE',
    'LEAD_UNIT',
    'PROJECT_STATUS',
    'ACCOUNT_NUMBER',
    'SPONSOR',
    'PRIME_SPONSOR',
    'PERIOD'
];

export const PROJECT_DETAILS_ORDER = {
    1: AWARD_DETAILS_ORDER,
    2: PROPOSAL_DETAILS_ORDER,
    3: PROPOSAL_DETAILS_ORDER,
    undefined: PROPOSAL_DETAILS_ORDER,
    null: PROPOSAL_DETAILS_ORDER,
};

export const PROJECT_DETAILS_ORDER_WITHOUT_ROLE = {
    1: AWARD_DETAILS_ORDER_WITHOUT_ROLE,
    2: PROPOSAL_DETAILS_ORDER_WITHOUT_ROLE,
    3: PROPOSAL_DETAILS_ORDER_WITHOUT_ROLE,
    undefined: PROPOSAL_DETAILS_ORDER_WITHOUT_ROLE,
    null: PROPOSAL_DETAILS_ORDER_WITHOUT_ROLE,
};

export const TRAVEL_FUNDING_TYPE_CODE = {
    INTERNAL: '1',
    EXTERNAL: '2'
};

export const ENTITY_BATCH_CARD_ORDER = [
    'BATCH_ID',
    'SOURCE',
    // 'BATCH_STATUS',
    'REVIEW_STATUS',
    'COMPLETION_DATE'
];

export const BATCH_ENTITY_DETAILS_CARD_ORDER = [
    'ADDRESS',
    'CITY',
    'STATE',
    'ZIP_CODE',
    'COUNTRY',
    'DUNS_NUMBER',
    'UEI_NUMBER',
    'SPONSOR_CODE',
    'ORGANIZATION_ID'
];

export const BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER = [
    'ADDRESS',
    'CITY',
    'STATE',
    'ZIP_CODE',
    'COUNTRY',
    'DUNS_NUMBER',
    'UEI_NUMBER',
    'CAGE_NUMBER',
    'WEBSITE',
    'SPONSOR_CODE',
    'ORGANIZATION_ID',
    'PRIOR_NAME',
    'FOREIGN_NAME',
];

export const BATCH_DUNS_ENTITY_DETAILS_CARD_ORDER = [
    'ADDRESS',
    'CITY',
    'STATE',
    'ZIP_CODE',
    'COUNTRY',
    'DUNS_NUMBER',
    'UEI_NUMBER',
    'CAGE_NUMBER',
    'WEBSITE',
    'MAILING_ADDRESS'
];

export const NEW_ENTITY_DETAILS_CARD_ORDER = [
    'ADDRESS',
    'CITY',
    'STATE',
    'ZIP_CODE',
    'COUNTRY',
    'DUNS_NUMBER',
    'UEI_NUMBER',
    'CAGE_NUMBER',
    'WEBSITE'
];

export const ENGAGMENT_HEADER_CARD_ORDER = [
    'ADDRESS',
    'CITY',
    'STATE',
    'ZIP_CODE',
    'COUNTRY',
    'DUNS_NUMBER',
    'WEBSITE',
    'PHONE'
];

export const ENGAGEMENT_SLIDER_ID ='admin-dashboard-entity-slider-';

export const DUNS_ENTITY_DETAILS_CARD_ORDER = [...BATCH_DUNS_ENTITY_DETAILS_CARD_ORDER];
export const DB_ENTITY_DETAILS_CARD_ORDER = [...BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER];
export const DASHBOARD_ENTITY_DETAILS_CARD_ORDER = [...BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER];
export const ENTITY_MODAL_DETAILS_CARD_ORDER = [...DB_ENTITY_DETAILS_CARD_ORDER];

export const DASHBOARD_VERIFY_ENTITY_ADVANCED_SEARCH_ORDER = [
    'ENTITY_NAME',
    'OWNERSHIP_TYPE',
    'ENTITY_STATUS',
    'ENTITY_VERIFICATION_STATUS',
    ...BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER,
    'TRANSLATED_NAME'
];

export const DASHBOARD_UN_VERIFY_ENTITY_ADVANCED_SEARCH_ORDER = [
    'ENTITY_NAME',
    'OWNERSHIP_TYPE',
    'ENTITY_STATUS',
    'ENTITY_SOURCE_TYPE',
    ...BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER,
    'TRANSLATED_NAME'
];

export const DASHBOARD_DUNS_REFRESH_ENTITIES_ADVANCED_SEARCH_ORDER = [
    'ENTITY_NAME',
    'OWNERSHIP_TYPE',
    'ENTITY_STATUS',
    ...BATCH_SYSTEM_ENTITY_DETAILS_CARD_ORDER,
    'TRANSLATED_NAME'
];

export const DASHBOARD_IMPORT_ENTITY_ADVANCED_SEARCH_ORDER = [
    'BATCH_ID',
    // 'BATCH_STATUS',
    'REVIEW_STATUS',
];

export const ADVANCE_SEARCH_CRITERIA_IN_ADMIN_DASHBOARD = [
    'personIdentifier', 'property1', 'property2', 'property3', 'property4', 'property5', 'property6', 'property7', 'property8', 'property9', 'property10', 'property11',
    'property12', 'property13', 'property14', 'property15', 'property16', 'property17', 'property18', 'property19', 'property20',
    'property21', 'property22', 'property23','property24','property25','property26', 'accountNumber', 'piPersonIdentifier', 'coiSubmissionStatus', 'caPersonIdentifier'
];

export const ADVANCE_SEARCH_CRITERIA_IN_OPA_DASHBOARD = [
    'personIdentifier', 'unitIdentifier', 'reviewStatusCodes' , 'dispositionStatusCodes' , 'submissionTimestamp', 'designationStatusCodes',
    'periodEndDate', 'periodStartDate', 'expirationDate', 'adminPersonIds', 'opaDisclosureTypes', 'entityIdentifier'
];

export const ADVANCE_SEARCH_CRITERIA_IN_ENTITY_DASHBOARD = [
    'PRIMARY_NAME', 'OWNERSHIP_TYPE_CODE', 'ENTITY_STATUS_TYPE_CODE', 'VERIFICATION_STATUS', 'ENTITY_SOURCE_TYPE_CODE', 'PRIMARY_ADDRESS', 'CITY', 'STATE', 'COUNTRY',
    'SPONSOR_CODE', 'ORGANIZATION_ID', 'FOREIGN_NAME', 'PRIOR_NAME', 'DUNS_NUMBER', 'UEI_NUMBER', 'WEBSITE_ADDRESS', 'CAGE_NUMBER', 'batchId' , 'batchStatusCodes', 'reviewStatusCodes','TRANSLATED_NAME'
];

export const PROJECT_DASHBOARD_ADV_SEARCH_COMMON_ORDER = [
    'PRINCIPAL_INVESTIGATOR',
    'PERSON_NAME',
    'DEPARTMENT_NAME',
    'CA_ADMIN_NAME',
    'SPONSOR',
    'PRIME_SPONSOR',
    'PROJECT_STATUS',
    'SUBMISSION_STATUS',
    'START_DATE',
    'END_DATE'
];

export const PROJECT_DASHBOARD_ADV_SEARCH_ORDER = {
  AWARD: ['PROJECT_NUMBER', 'PROJECT_TITLE', 'ACCOUNT_NUMBER', ...PROJECT_DASHBOARD_ADV_SEARCH_COMMON_ORDER],
  DEV_PROPOSAL: ['PROJECT_NUMBER', 'PROJECT_TITLE', ...PROJECT_DASHBOARD_ADV_SEARCH_COMMON_ORDER]
};

export const ENTITY_DASHBOARD_ADVANCED_SEARCH_ORDER = {
    IMPORT: DASHBOARD_IMPORT_ENTITY_ADVANCED_SEARCH_ORDER,
    ALL_ENTITY: DASHBOARD_VERIFY_ENTITY_ADVANCED_SEARCH_ORDER,
    UNVERIFIED: DASHBOARD_UN_VERIFY_ENTITY_ADVANCED_SEARCH_ORDER,
    DUNS_REFRESH_ENTITIES: DASHBOARD_DUNS_REFRESH_ENTITIES_ADVANCED_SEARCH_ORDER
};

export const BATCH_ENTITY_DETAILS_CARD_FOOTER_ORDER = ['REVIEW_ACTION', 'REVIEW_STATUS'];

export const BATCH_MATCH_TYPE = {
    IS_EXACT_DUNS_MATCH: 'Exact D&B Match',
    IS_MULTIPLE_DUNS_MATCH: 'D&B Matches',
    IS_NO_DUNS_MATCH: 'No D&B Matches',
    IS_DUPLICATE_IN_BATCH: 'Duplicates in Batch',
    IS_DUPLICATE_IN_ENTITY_DB: 'Duplicate in Entity Database'
};

export const ENTITY_BATCH_MATCH_LOOKUP = Object.values(BATCH_MATCH_TYPE).map((value) => ({
    code: value,
    description: value
}));

export const PAGINATION_LIMIT = 20;

export enum RelationshipType {
    Parent = 'P',
    Child = 'C'
};

export const DISCLOSURE_CREATE_MODE_PATHS = [
    FCOI_DISCLOSURE_CHILD_ROUTE_URLS.SCREENING,
    FCOI_DISCLOSURE_CHILD_ROUTE_URLS.ENGAGEMENT,
    FCOI_DISCLOSURE_CHILD_ROUTE_URLS.RELATIONSHIP,
    FCOI_DISCLOSURE_CHILD_ROUTE_URLS.CERTIFICATION,
];

export const AWARD_LABEL = PROJECT_TYPE_LABEL[PROJECT_TYPE.AWARD];

export const AUTO_SAVE_DEBOUNCE_TIME = 750;

export const CAROUSEL_INTERVAL = 8000;

export const SFI_TARGET_AMOUNT = 5000;

export const SFI_MAX_RANGE = '$5000 or more';

export const INVALID_COMPENSATION = 'Uncompensated';

export const SFI_MIN_RANGE = '$1 to $4999';

export const SFI_YES_CHECKING_QUEST_IDS = [1, 2];

export const NOTES_SECTIONS_LIST = {
    OVERVIEW: '5',
    SPONSOR: '6',
    SUB_AWARD: '7',
    COMPLIANCE: '8'
};

export type NotesSectionValue = typeof NOTES_SECTIONS_LIST[keyof typeof NOTES_SECTIONS_LIST];

export type NotesAPI = { add?: NOTE_ADD_API, delete?: NOTE_DELETE_API, edit?: NOTE_EDIT_API };

export type NoteStickyClass = 'sticky-top-slider' | 'sticky-top-51';

export const DISCLOSURE_CREATE_UNIT_HELP_TEXT = `To disclose at any other unit, please click on the 'Edit' icon near the unit field, and proceed to disclosure creation. To revert to the original unit, click on the 'Reset' button.`;

export const TRAVEL_FORM_UNSAVED_WARNING_MESSAGE = 'You have unsaved changes in Travel Details. Please save your changes before proceeding to the Certification section.';

export const FINANCIAL_SUB_TYP_CODES = [1, 2, 3];

export const UPDATED_BY_SYSTEM = 'system';

export const PERSON_DETAILS_CARD_ORDER = [
    'FIRST_NAME',
    'MIDDLE_NAME',
    'LAST_NAME',
    'FULL_NAME',
    'DESIGNATION',
    'ADDRESS_LINE_1',
    'ADDRESS_LINE_2',
    'ADDRESS_LINE_3',
    'CITY',
    'POSTAL_CODE',
    'STATE',
    'COUNTRY',
    'EMAIL_ADDRESS',
    'PHONE_NUMBER',
    'FAX',
    'HOME_UNIT',
    'DIRECTORY_TITLE',
];

export const ROLODEX_DETAILS_CARD_ORDER = [
    'FIRST_NAME',
    'MIDDLE_NAME',
    'LAST_NAME',
    'FULL_NAME',
    'DESIGNATION',
    'ADDRESS_LINE_1',
    'ADDRESS_LINE_2',
    'ADDRESS_LINE_3',
    'CITY',
    'POSTAL_CODE',
    'STATE',
    'COUNTRY',
    'EMAIL_ADDRESS',
    'PHONE_NUMBER',
    'FAX',
    'ORGANIZATION',
];

export const DISCLOSURE_TYPE_CODE = {
    FINANCIAL_DISCLOSURE_TYPE_CODE: '1',
    OPA_DISCLOSURE_TYPE_CODE: '2',
    TRAVEL_DISCLOSURE_TYPE_CODE: '3',
    CONSULTING_DISCLOSURE_TYPE_CODE: '4'
};

export const LEAVE_PAGE_MODAL_MSG = 'Are you sure you want to leave the <strong>${pageName}</strong> page without saving?';
export const LEAVE_PAGE_PRIMARY_BUTTON ='Stay On Page';
export const LEAVE_PAGE_SECONDARY_BUTTON ='Leave Page';

export const NEW_FORM_VERSION_MSG = 'The administrator has updated this form. Please review the changes and update your responses.';
export const NEW_FORM_HEADER_MSG = 'Form version updated';

export const DISCL_PROJ_REL_DEFAULT_DESCRIPTION = 'None';

export const DEFAULT_ENDPOINT_FETCH_LIMIT = 20;

export const INITIAL_MODAL_TEXT: COIEngagementMigrationModal = {
    header: 'Welcome to the New MyCOI/OPA+',
    message: `You are now in the new MyCOI/OPA+ disclosure module replacing the old legacy My COI disclosure module in CoeusLite.
    Your old legacy disclosure data will be archived, and you will create a new FCOI disclosure in MyCOI-OPA+. To alleviate some of
    the administrative burden as part of this transition, we’ve identified your existing SFI entities from the old legacy disclosure
    module and prepared them for review in MyCOI/OPA+. A critical first step (one time only) is to complete the transfer and ensure
    your records are accurate. Please take a moment to review and confirm these entities.`,
    proceedText: 'start the review',
    closingText: 'Thank you for your cooperation and support during this important transition.'
};

export const REMINDER_MODAL_TEXT: COIEngagementMigrationModal = {
    header: 'Reminder: Complete Your Engagement Review',
    message: `You began reviewing your existing engagements as part of the transition from CoeusLite to MyCOI/OPA+, but the process is still incomplete.
      To finalize the transfer of your remaining engagements, please complete your review at your earliest convenience.`,
    proceedText: 'resume where you left off',
    closingText: 'Thank you for your attention to this important step.'
};

export const DASHBOARD_TRAVEL_DISCLOSURE_FIELD_ORDER = [
    'TRIP_TITLE',
    'TRAVEL_DATE',
    'COUNTRY',
    'PURPOSE',
    'REIMBURSED_COST',
    'CERTIFICATION_DATE',
    'ADMINISTRATOR',
    'ADMIN_GROUP'
];

export const DASHBOARD_TRAVEL_DISCLOSURE_COLLAPSED_FIELD_ORDER = [
    'TRIP_TITLE',
    'TRAVEL_DATE',
    'COUNTRY'
];

export const DASHBOARD_FCOI_DISCLOSURE_FIELD_ORDER = [
    'DEPARTMENT',
    'SUBMISSION_DATE',
    'EXPIRATION_DATE',
    'ADMINISTRATOR',
    'ADMIN_GROUP',
    'REVIEWER',
];

export const DASHBOARD_FCOI_DISCLOSURE_COLLAPSED_FIELD_ORDER = [
    'DEPARTMENT',
    'SUBMISSION_DATE',
    'EXPIRATION_DATE',
    'DISCLOSURE_STATUS'
];

export const DASHBOARD_OPA_DISCLOSURE_FIELD_ORDER = [
    'DEPARTMENT',
    'SUBMISSION_DATE',
    'EXPIRATION_DATE',
    'ADMINISTRATOR',
    'ADMIN_GROUP',
    'REVIEWER'
];

export const DASHBOARD_OPA_DISCLOSURE_COLLAPSED_FIELD_ORDER = [
    'DEPARTMENT',
    'SUBMISSION_DATE',
    'EXPIRATION_DATE',
];

export const DISCLOSURE_CERTIFICATION_SECTION_DETAILS = {
    SECTION_ID: 'COI806',
    SUB_SECTION_ID: 812,
    ELEMENT_ID: 'coi-discl-cert-cnfrm-text'
};

export const TRAVEL_CERTIFICATION_SECTION_DETAILS = {
    SECTION_ID: 'TD2402',
    SUB_SECTION_ID: 2402,
    ELEMENT_ID: 'coi-travel-cert-cnfrm-text'
};

export const SECTION_DETAILS_OF_CONFIGURED_INFO_TEXT = {
    FCOI_DISCLOSURE_CERTIFICATION: DISCLOSURE_CERTIFICATION_SECTION_DETAILS,
    TRAVEL_DISCLOSURE_CERTIFICATION: TRAVEL_CERTIFICATION_SECTION_DETAILS
};

export const EMPLOYEE_LOOKUP: LookUpClass[] = [
    { code: 'PERSON', description: 'Employee' },
    { code: 'ROLODEX', description: 'Non-Employee' }
];