import { CMP_LOCALIZE, DECLARATION_LOCALIZE } from "./app-locales";

export const DISCLOSURE_ENGAGEMENT_MESSAGE_LIST = {
    'ALL': `You haven't created any engagement yet.`,
    'COMPLETE': `You don't have any completed engagement.`,
    'INCOMPLETE': `You don't have any incomplete engagement.`,
    'INACTIVE': `You don't have any inactive engagement.`,
    'ACTIVE': `You don't have any active engagement.`,
    'NO_SEARCH_RESULT': `No Engagements matching your search criteria found. `,
    'ADD_NEW_ENGAGEMENT': `Click 'Add Engagement' to add one.`
};

export const PERSON_ENGAGEMENT_MESSAGE_LIST = {
    'NO_ENGAGEMENT_CREATED': `You haven't created any engagement yet. Click 'Create Engagement' to create one.`,
    'ALL': `You don't have any engagement.`,
    'COMPLETE': `You don't have any completed engagement.`,
    'INCOMPLETE': `You don't have any incomplete engagement.`,
    'INACTIVE': `You don't have any inactive engagement.`,
    'ACTIVE': `You don't have any active engagement.`,
    'NO_SEARCH_RESULT': `No Engagements matching your search criteria found.`
};

export const NOTES_NO_INFO_MESSAGE = {
    'NO_NOTES_ADDED': `You haven't added any notes yet. Click 'Add New Note' to add one.`,
    'NO_EXISTING_NOTES_IN_SLIDER': `No notes available. You have not added any notes yet.`
};

export const ATTACHMENT_NO_INFO_MESSAGE = {
    'NO_ATTACHMENT_ADDED': `You haven't added any attachments yet.`,
    'ADD_NEW_ATTACHMENT': `Click 'Add Attachment' to add one.`,
    'ATTACHMENT_VERSION_EMPTY_STATE': `No other versions for this attachment.`
};

export const ADMIN_DASHBOARD_NO_INFO_MESSAGE = {
    'ALL_DISCLOSURES': 'No disclosures available in this section.',
    'NEW_SUBMISSIONS': 'No new disclosure submission has been made.',
    'NEW_SUBMISSIONS_WITHOUT_SFI': `No new 'Disclosure without Engagements' submission has been made.`,
    'MY_REVIEWS': `No disclosures are awaiting your review.`,
    'ALL_REVIEWS': 'No disclosures are awaiting review.',
    'TRAVEL_DISCLOSURES': 'No travel disclosure submission has been made.',
    'CONSULTING_DISCLOSURES': 'No consulting disclosure submission has been made.',
    'ADVANCE_SEARCH_NO_INFO': 'No disclosure matching your search criteria found.',
    'CMP': `No ${CMP_LOCALIZE.TERM_CMP} submission has been made.`,
    'CMP_SEARCH': `No ${CMP_LOCALIZE.TERM_CMP} matching your search criteria found.`,
    'CMP_CREATION': `Click 'Create ${CMP_LOCALIZE.TERM_CMP}' to create new ${CMP_LOCALIZE.TERM_CMP}.`
};

export const PROJECT_DASHBOARD_NO_INFO_MESSAGE = {
    'AWARD': 'No awards to disclose.',
    'DEV_PROPOSAL': 'No development proposals to disclose.',
    'ADVANCE_SEARCH_NO_INFO': 'No disclosure matching your search criteria found.'
};

export const USER_DASHBOARD_NO_INFO_MESSAGE = {
    'TRAVEL_DISCLOSURES': 'No travel disclosure has been created yet.',
    'CONSULTING_DISCLOSURES': 'No consulting disclosure has been created yet.',
    'NO_SEARCH_RESULT': 'No disclosure matching your search criteria found.',
    'NO_DISCLOSURES_CREATED': 'No disclosure has been created yet.',
    'ALL_DECLARATION': `No ${DECLARATION_LOCALIZE.TERM.toLocaleLowerCase()} matching your search criteria found.`,
    'DECLARATION_TYPE': `No DECLARATION_TYPE matching your search criteria found.`,
    'CMP': `No ${CMP_LOCALIZE.TERM_CMP} matching your search criteria found.`
};

// Reporter dashboard filter specific no info message of in progress disclosure.
export const IN_PROGRESS_DISCLOSURE_NO_INFO_MESSAGE = {
    'ALL': 'No disclosures currently in progress.',
    'FCOI': 'No initial/revision disclosure currently in progress.',
    'PROJECT': 'No project disclosure currently in progress.',
    'OPA': 'No OPA disclosure currently in progress.',
    'TRAVEL': 'No travel disclosure currently in progress.',
    'CONSULTING': 'No consulting disclosure currently in progress.',
};

// Reporter dashboard filter specific no info message of in approved disclosure.
export const APPROVED_DISCLOSURE_NO_INFO_MESSAGE = {
    'ALL': 'No disclosure has been approved yet.',
    'FCOI': 'No initial/revision disclosure has been approved.',
    'PROJECT': 'No project disclosure has been approved.',
    'OPA': 'No OPA disclosure has been approved.',
    'TRAVEL': 'No travel disclosure has been approved.',
    'CONSULTING': 'No consulting disclosure has been approved.',
};

// Overall disclosure history filter specific no info messages.
export const DISCLOSURE_HISTORY_NO_INFO_MESSAGE = {
    'ALL': 'No disclosure has been created yet.',
    'FCOI': 'No initial/revision disclosure created yet.',
    'PROJECT': 'No project disclosure created yet.',
    'OPA': 'No opa disclosure created yet.',
    'TRAVEL': 'No travel disclosure created yet.',
    'CONSULTING': 'No consulting disclosure created yet.',
    'DECLARATION': `No ${DECLARATION_LOCALIZE.TERM.toLocaleLowerCase()} created yet.`,
    'CMP': `No ${CMP_LOCALIZE.TERM_CMP} created yet.`
};
// Overall disclosure history filter specific no info messages.
export const DECLARATION_TYPE_NO_INFO_MESSAGE = {
    'ALL': `No ${DECLARATION_LOCALIZE.TERM} has been created yet.`,
    'DECLARATION_TYPE': 'No DECLARATION_TYPE has been created yet.'
};

export const USER_DASHBOARD_FILTER_SPECIFIC_NO_INFO_MESSAGE = {
    'IN_PROGRESS_DISCLOSURES': IN_PROGRESS_DISCLOSURE_NO_INFO_MESSAGE,
    'APPROVED_DISCLOSURES': APPROVED_DISCLOSURE_NO_INFO_MESSAGE,
    'DISCLOSURE_HISTORY': DISCLOSURE_HISTORY_NO_INFO_MESSAGE,
    'DECLARATION': DECLARATION_TYPE_NO_INFO_MESSAGE,
    'CMP': `No ${CMP_LOCALIZE.TERM_CMP} has been created yet.`,
};

export const COMMENTS_NO_INFO_MESSAGE = {
    'NO_COMMENTS_TO_DISPLAY': `No comment has been added yet.`,
    'NO_SEARCH_RESULT': `No comments matching your search criteria found.`
};

export const REVIEWER_TAB_NO_INFO_MESSAGE = {
    'NO_REVIEWERS_ADDED': `No reviewers added. Please click the 'Add Reviewer' button to add reviewers.`,
    'NO_REVIEWERS_ASSIGNED': `There are no reviewers assigned to this disclosure.`
};

export const CMP_REVIEWER_TAB_NO_INFO_MESSAGE = {
    'NO_REVIEWERS_ADDED': `No reviewers added. Please click the 'Add Reviewer' button to add reviewers.`,
    'NO_REVIEWERS_ASSIGNED': `There are no reviewers assigned to this management plan.`
};

export const DECLARATION_ADMIN_DASHBOARD_NO_INFO_MESSAGE = {
    'ALL_DECLARATIONS': `No ${DECLARATION_LOCALIZE.TERM.toLocaleLowerCase()} available in this section.`,
    'ADVANCE_SEARCH_NO_INFO': `No ${DECLARATION_LOCALIZE.TERM.toLocaleLowerCase()} matching your search criteria found.`,
    'SINGLE_DECLARATION': `No DECLARATION_TYPE ${DECLARATION_LOCALIZE.TERM.toLocaleLowerCase()} available in this section.`,
    'NEW_SUBMISSIONS': `No new ${DECLARATION_LOCALIZE.TERM.toLocaleLowerCase()} submission has been made.`,
    'MY_REVIEWS': `No ${DECLARATION_LOCALIZE.PLURAL_TERM.toLocaleLowerCase()} are awaiting your review.`,
    'ALL_REVIEWS': `No ${DECLARATION_LOCALIZE.PLURAL_TERM.toLocaleLowerCase()} are awaiting review.`,
};

export const RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG = {
    PROJECTS: 'There are no projects associated.',
    ENGAGEMENTS: 'There are no engagements associated.',
    NO_PROJECT_SEARCH_RESULT: 'No projects matching your search criteria found.',
    NO_ENGAGEMENT_SEARCH_RESULT: 'No engagements matching your search criteria found.'
};

export const NO_FORM_CONFIGURED_MESSAGE = 'No form has been configured yet.';

export const REVIEWER_DASH_NO_INFO_MESSAGE = {
    'NO_OVERVIEW_DEPT': `No department found.`,
    'NO_OVERVIEW_DEPT_PERSON': `No person matching your search criteria found.`,
    'NO_SEARCHED_OVERVIEW_DEPT': `No department matching your search criteria found.`,
    'ADVANCE_SEARCH_NO_INFO': 'No disclosure matching your search criteria found.'
};
