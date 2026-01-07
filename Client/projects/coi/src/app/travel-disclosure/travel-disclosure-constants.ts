import { CLASS_BLUE_BADGE, CLASS_BRIGHT_RED_BADGE, CLASS_GREEN_BADGE, CLASS_ORANGE_BADGE, CLASS_YELLOW_BADGE } from "../app-constants";

export const TRAVEL_CERTIFICATION_TEXT = `I agree to abide by the University COI policy guidelines and certify that the information provided for the Financial conflict of interest, including, responses to screening questions, list of my pertinent Engagements and possible relationship to my sponsored activity is an accurate and current statement of my reportable outside interests and activities.`;
export const TRAVEL_CERTIFICATION_INFO = `University policy requires that university officers, faculty, and staff and others acting on its
    behalf avoid ethical, legal, financial, and other conflicts of interest and ensure that their activities and
    interests do not conflict with their obligations to the University. Disclosure of financial interests enables
    the University to determine if a financial interest creates a conflict of interest or the appearance of a
    conflict of interest. The existence of a conflict or the appearance of one does not imply wrongdoing and
    does not necessarily mean that a researcher may not retain his or her financial interest and undertake the
    affected research. Often the University can work with the researcher to manage a conflict or the appearance
    of a conflict so that the research can continue in a way that minimizes the possibility of bias and preserves
    the objectivity of the research. Proper management depends on full and prompt disclosure. COI provides the ability
    to disclose and maintain your Engagements; identify potential areas of concern related to your
    proposals and awards; and, disclose reimbursed travel (for NIH compliance).`;

export const TRAVEL_DISCL_REVIEW_STATUS_TYPE = {
    PENDING: '1',
    SUBMITTED: '2',
    REVIEW_IN_PROGRESS: '3',
    RETURNED: '4',
    WITHDRAWN: '5',
    COMPLETED: '6',
    APPROVED: '7',
};

export const TRAVEL_DOCUMENT_STATUS = {
    PENDING:'1',
    SUBMITTED:'2',
    APPROVED:'3',
};

export const CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS = [
    TRAVEL_DISCL_REVIEW_STATUS_TYPE.PENDING,
    TRAVEL_DISCL_REVIEW_STATUS_TYPE.RETURNED,
    TRAVEL_DISCL_REVIEW_STATUS_TYPE.WITHDRAWN
];

export const TRAVEL_DISCLOSURE_EXTERNAL_INFO = `Select the sponsor for your travel from your list of engagements, or add a new engagement.`;
export const TRAVEL_DISCLOSURE_INTERNAL_INFO = `This travel is funded by the University.`;
export const TRAVEL_DISCLOSURE_INTERNAL_CONFIRM_TEXT = `You have selected <strong>Internal</strong> as the funding type. This will replace the previously selected <strong>External</strong> funding type.<br/> Confirm to proceed?`;
export const TRAVEL_DISCLOSURE_EXTERNAL_CONFIRM_TEXT = `You have selected <strong>External</strong> as the funding type. This will replace the previously selected <strong>Internal</strong> funding type.<br/> Confirm to proceed?`;

export const TRAVEL_ENGAGEMENT_VALIDATION_MODAL = 'travel-engagements-validation-modal';
export const CREATE_OR_REVISE_FCOI_MODAL = 'create-or-revise-fcoi-modal';

export const TRAVEL_DISCLOSURE_PATHS =  {
    ENGAGEMENTS: 'coi/create-travel-disclosure/engagements',
    TRAVEL_DETAILS: 'coi/create-travel-disclosure/travel-details',
    CERTIFY: 'coi/create-travel-disclosure/certification',
    HISTORY_CREATE: 'coi/create-travel-disclosure/history',
    HISTORY_VIEW: 'coi/travel-disclosure/history',
    SUMMARY: 'coi/travel-disclosure/summary',
    RELATED_DISCLOSURES: 'coi/travel-disclosure/related-disclosures'
};

export interface TravelSection {
    reviewSectionCode: number;
    reviewSectionDescription: string;
    documentId: string;
    subSectionCode?: string;
    isShowProjectList?: boolean;
    isExpanded?: boolean;
}

export const COISection: Array<TravelSection> = [
    { reviewSectionCode: 2401, reviewSectionDescription: 'Travel Details', documentId: 'TD2401' },
    { reviewSectionCode: 2402, reviewSectionDescription: 'Certification', documentId: 'TD2402' }
];

export const TRAVEL_REVIEW_STATUS_BADGE: { [key: string]: string }  = {
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.PENDING]: CLASS_YELLOW_BADGE,
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.SUBMITTED]: CLASS_BLUE_BADGE,
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.REVIEW_IN_PROGRESS]: CLASS_GREEN_BADGE,
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.RETURNED]: CLASS_ORANGE_BADGE,
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.WITHDRAWN]: CLASS_BRIGHT_RED_BADGE,
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.COMPLETED]: CLASS_GREEN_BADGE,
    [TRAVEL_DISCL_REVIEW_STATUS_TYPE.APPROVED]: CLASS_GREEN_BADGE
};

export const TRAVEL_DOCUMENT_STATUS_BADGE: { [key: string]: string } = {
    [TRAVEL_DOCUMENT_STATUS.PENDING]: CLASS_YELLOW_BADGE,
    [TRAVEL_DOCUMENT_STATUS.SUBMITTED]: CLASS_GREEN_BADGE,
};

