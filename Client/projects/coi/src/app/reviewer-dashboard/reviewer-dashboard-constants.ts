export const DISCLOSURE_CONFIGURATION_MODAL_ID = 'coi-disclosure-configuration-modal';
export const PERSON_ELIGIBILITY_MODAL_ID = 'coi-person-eligibility-modal';
export const PERSON_NOTIFICATION_SLIDER_ID = 'coi-person-notification-slider'

export const REVIEWER_MODULE_SECTION_CODE = 'RWDS';

export const REVIEWER_ADMIN_DASHBOARD_BASE_URL = '/coi/reviewer-dashboard';
export const REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS = {
    PERSON_LIST: `${REVIEWER_ADMIN_DASHBOARD_BASE_URL}/person-list`,
    DISCLOSURE_LIST: `${REVIEWER_ADMIN_DASHBOARD_BASE_URL}/disclosures-list`,
};

export const REVIEWER_DASHBOARD_DISCLOSURE_TYPES = {
    FCOI: 'FCOI',
    OPA: 'OPA',
    TRAVEL: 'TRAVEL',
    CONSULTING: 'CONSULTING'
};

export const ADVANCE_SEARCH_CRITERIA_FOR_REVIEWER_DASHBOARD = [
    'PERSON', 'ENTITY', 'EXPIRATION_DATE', 'CERTIFIED_AT', 'TRAVEL_START_DATE', 'TRAVEL_END_DATE', 'PROJECT_NUMBER', 'DISCLOSURE_STATUS_CODE',
    'DISPOSITION_STATUS_CODE', 'REVIEW_STATUS_CODE', 'DOCUMENT_STATUS_CODE', 'DISCLOSURE_CATEGORY_TYPE', 'COUNTRY', 'ADMINISTRATOR', 'PROJECT_TITLE',
    'TRIP_TITLE', 'HOME_UNIT', 'OPA_DISCLOSURE_TYPES', 'CONFLICT_STATUS_CODE'
];

export enum REVIEWER_DASHBOARD_ID_MAP {
    FCOI_REVIEW_PENDING = 'FCOI_REVIEW_PENDING',
    FCOI_EXPIRING = 'FCOI_EXPIRING',
    FCOI_EXPIRED = 'FCOI_EXPIRED',
    FCOI_APPROVED = 'FCOI_APPROVED',

    OPA_REVIEW_PENDING = 'OPA_REVIEW_PENDING',
    OPA_EXPIRING = 'OPA_EXPIRING',
    OPA_EXPIRED = 'OPA_EXPIRED',
    OPA_DELINQUENT = 'OPA_DELINQUENT',
    OPA_EXEMPT = 'OPA_EXEMPT',
    OPA_ELIGIBLE = 'OPA_ELIGIBLE',
    OPA_APPROVED = 'OPA_APPROVED',

    TRAVEL_REVIEW_PENDING = 'TRAVEL_REVIEW_PENDING',
    TRAVEL_APPROVED = 'TRAVEL_APPROVED',
}

export const REVIEWER_DASHBOARD_DISCLOSURE_TAB_TYPE: Record<REVIEWER_DASHBOARD_ID_MAP, string> = {
    [REVIEWER_DASHBOARD_ID_MAP.FCOI_REVIEW_PENDING]: 'REVIEW_PENDING',
    [REVIEWER_DASHBOARD_ID_MAP.FCOI_EXPIRING]: 'EXPIRING',
    [REVIEWER_DASHBOARD_ID_MAP.FCOI_EXPIRED]: 'EXPIRED',
    [REVIEWER_DASHBOARD_ID_MAP.FCOI_APPROVED]: 'APPROVED',

    [REVIEWER_DASHBOARD_ID_MAP.OPA_REVIEW_PENDING]: 'REVIEW_PENDING',
    [REVIEWER_DASHBOARD_ID_MAP.OPA_EXPIRING]: 'EXPIRING',
    [REVIEWER_DASHBOARD_ID_MAP.OPA_EXPIRED]: 'EXPIRED',
    [REVIEWER_DASHBOARD_ID_MAP.OPA_DELINQUENT]: 'DELINQUENT',
    [REVIEWER_DASHBOARD_ID_MAP.OPA_EXEMPT]: 'EXEMPT',
    [REVIEWER_DASHBOARD_ID_MAP.OPA_ELIGIBLE]: 'ELIGIBLE_PERSONS',
    [REVIEWER_DASHBOARD_ID_MAP.OPA_APPROVED]: 'APPROVED',

    [REVIEWER_DASHBOARD_ID_MAP.TRAVEL_REVIEW_PENDING]: 'REVIEW_PENDING',
    [REVIEWER_DASHBOARD_ID_MAP.TRAVEL_APPROVED]: 'APPROVED',
};

// *TAB_TYPE_MAPPING_FOR_FILTER
// *REVERSE_TAB_TYPE_MAPPING_FOR_FILTER
// These constants define the mapping between tab types and their corresponding filter descriptions.
// The filter description values are used to display options in the filter dropdown.
// If a new filter is introduced and if that represents a tab, it must be added to these mappings as well to set the default filter selection while entering the tab.
export const TAB_TYPE_MAPPING_FOR_FILTER = {
    'REVIEW_PENDING': 'Review Pending',
    'EXPIRING': 'Expire in 30 Days',
    'EXPIRED': 'Expired',
    'APPROVED': 'Approved',
    'DELINQUENT': 'Delinquent',
    'EXEMPTION': 'Exemption',
    'ALL_DISCLOSURES': 'All Disclosures',
    'MY_REVIEWS_PENDING': 'Disclosure Pending My Review',
    'WITHOUT_ENGAGEMENTS': 'Disclosure Without Engagement(s)',
    'HAS_ENGAGEMENTS': 'Disclosure With Engagement(s)',
    'FACULTY': 'Faculty',
    'STAFF': 'Staff'
};

export const REVERSE_TAB_TYPE_MAPPING_FOR_FILTER = {
    'Review Pending': 'REVIEW_PENDING',
    'Expire in 30 Days': 'EXPIRING',
    'Expired': 'EXPIRED',
    'Approved': 'APPROVED',
    'Delinquent': 'DELINQUENT',
    'Exemption': 'EXEMPTION',
    'All Disclosures': 'ALL_DISCLOSURES',
    'Disclosure Pending My Review': 'MY_REVIEWS_PENDING',
    'Disclosure Without Engagement(s)': 'WITHOUT_ENGAGEMENTS',
    'Disclosure With Engagement(s)': 'HAS_ENGAGEMENTS',
    'Faculty': 'FACULTY',
    'Staff': 'STAFF'
};

export const COMMON_BASE_FILTERS = [
    { code: 'REVIEW_PENDING', description: 'Review Pending' },
    { code: 'APPROVED', description: 'Approved' },
    { code: 'ALL_DISCLOSURES', description: 'All Disclosures' },
    { code: 'MY_REVIEWS_PENDING', description: 'Disclosure Pending My Review' },
    { code: 'WITHOUT_ENGAGEMENTS', description: 'Disclosure Without Engagement(s)' },
    { code: 'HAS_ENGAGEMENTS', description: 'Disclosure With Engagement(s)' },
];

export const STATUS_FILTER_CONFIG_LOOKUP = {
    FCOI: [
        ...COMMON_BASE_FILTERS,
        { code: 'EXPIRING', description: 'Expire in 30 Days' },
        { code: 'EXPIRED', description: 'Expired' }
    ],
    OPA: [
        ...COMMON_BASE_FILTERS,
        { code: 'EXPIRING', description: 'Expire in 30 Days' },
        { code: 'EXPIRED', description: 'Expired' },
        { code: 'FACULTY', description: 'Faculty' },
        { code: 'STAFF', description: 'Staff' }
    ],
    TRAVEL: [
        ...COMMON_BASE_FILTERS
    ]
};

export const ELIGIBILITY_MODAL_FIELD_ORDER = [
    'PERSON', 'ADMIN_OVERRIDE', 'EXEMPT_FROM_OPA', 'PERIOD', 'EXEMPTION_JUSTIFICATION'
];

export const RECIPIENT_TYPE_OPTIONS = {
    TO: 'TO',
    CC: 'CC',
    BCC: 'BCC'
};
