import { ReviewCommentSection } from "./coi-review-comments.interface";

export const COI_REVIEW_COMMENTS_IDENTIFIER = 'COI_REVIEW_COMMENTS';

export const MANAGE_FCOI_DISCLOSURE_COMMENT = ['MAINTAIN_COI_COMMENTS'];
export const MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT = ['MAINTAIN_COI_PRIVATE_COMMENTS'];
export const MANAGE_TRAVEL_DISCLOSURE_COMMENT = ['MAINTAIN_TRAVEL_COMMENTS'];
export const MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT = ['MAINTAIN_TRAVEL_PRIVATE_COMMENTS'];
export const MANAGE_OPA_DISCLOSURE_COMMENT = ['MAINTAIN_OPA_COMMENTS'];
export const MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT = ['MAINTAIN_OPA_PRIVATE_COMMENTS'];
export const MANAGE_CMP_COMMENT = ['MAINTAIN_CMP_COMMENTS'];
export const MANAGE_PRIVATE_CMP_COMMENT = ['MAINTAIN_CMP_PRIVATE_COMMENTS'];
export const MANAGE_CMP_RESOLVE_COMMENTS = ['MAINTAIN_CMP_RESOLVE_COMMENTS'];
export const MAINTAIN_COI_RESOLVE_COMMENTS = ['MAINTAIN_COI_RESOLVE_COMMENTS'];
export const MANAGE_TRAVEL_RESOLVE_COMMENTS = ['MANAGE_TRAVEL_RESOLVE_COMMENTS'];
export const MANAGE_OPA_RESOLVE_COMMENTS = ['MANAGE_OPA_RESOLVE_COMMENTS'];

export const OPA_COMMENTS_RIGHTS = ['VIEW_OPA_COMMENTS', ...MANAGE_OPA_DISCLOSURE_COMMENT, 'VIEW_OPA_PRIVATE_COMMENTS', ...MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT];
export const FCOI_COMMENTS_RIGHTS = ['VIEW_COI_COMMENTS', ...MANAGE_FCOI_DISCLOSURE_COMMENT, 'VIEW_COI_PRIVATE_COMMENTS', ...MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT];
export const TRAVEL_COMMENTS_RIGHTS = ['VIEW_TRAVEL_COMMENTS', ...MANAGE_TRAVEL_DISCLOSURE_COMMENT, 'VIEW_TRAVEL_PRIVATE_COMMENTS', ...MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT];
export const CMP_COMMENTS_RIGHTS = ['VIEW_CMP_COMMENTS', ...MANAGE_CMP_COMMENT, 'VIEW_CMP_PRIVATE_COMMENTS', ...MANAGE_PRIVATE_CMP_COMMENT];

// need to change

export const FCOI_GENERAL_COMMENTS: ReviewCommentSection = {
    componentName: 'General',
    componentTypeCode: '3',
    commentSectionName: '',
    commentTypeCode: '3',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '3'
}

export const FCOI_QUESTIONNAIRE_COMMENTS: ReviewCommentSection = {
    componentName: 'Questionnaire',
    componentTypeCode: '4',
    commentSectionName: '',
    commentTypeCode: '4',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '4'
}

export const FCOI_ENGAGEMENT_COMMENTS: ReviewCommentSection = {
    componentName: 'Engagement',
    componentTypeCode: '5',
    commentSectionName: '',
    commentTypeCode: '5',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '5'
}

export const FCOI_RELATIONSHIP_COMMENTS: ReviewCommentSection = {
    componentName: 'Project relationships',
    componentTypeCode: '6',
    commentSectionName: '',
    commentTypeCode: '6',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '6'
}

export const FCOI_PROJECT_COMMENTS: ReviewCommentSection = {
    componentName: 'Project',
    componentTypeCode: '14',
    commentSectionName: '',
    commentTypeCode: '14',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '14'
}

export const FCOI_CERTIFICATION_COMMENTS: ReviewCommentSection = {
    componentName: 'Certification',
    componentTypeCode: '7',
    commentSectionName: '',
    commentTypeCode: '7',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '7'
}

export const FCOI_REVIEW_COMMENTS: ReviewCommentSection = {
    componentName: 'Review Comment',
    componentTypeCode: '8',
    commentSectionName: '',
    commentTypeCode: '8',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '8'
}

export const FCOI_ADMINISTRATOR_COMMENTS: ReviewCommentSection = {
    componentName: 'Administrative Comments',
    componentTypeCode: 'FCOI_ADMINISTRATOR_COMMENTS',
    commentSectionName: '',
    commentTypeCode: '1',
    rights: {
        view: [],
        viewPrivate: [],
        manage: ['MAINTAIN_COI_COMMENTS'],
        managePrivate: ['MAINTAIN_COI_PRIVATE_COMMENTS'],
        canDocumentOwnerManage: false,
    },
    uniqueId: 'FCOI_ADMINISTRATOR_COMMENTS'
}

export const CA_COMMENTS: ReviewCommentSection = {
    componentName: 'CA Comment',
    componentTypeCode: '12',
    commentSectionName: '',
    commentTypeCode: '12',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_FCOI_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_FCOI_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: false,
    },
    uniqueId: '12'
}

export const OPA_GENERAL_COMMENTS: ReviewCommentSection = {
    componentName: 'OPA General Comment',
    componentTypeCode: '9',
    commentSectionName: '',
    commentTypeCode: '9',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_OPA_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '9'
}

export const OPA_REVIEW_COMMENTS: ReviewCommentSection = {
    componentName: 'OPA Review Comment',
    componentTypeCode: '11',
    commentSectionName: '',
    commentTypeCode: '11',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_OPA_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '11'
}

export const OPA_FORM_COMMENTS: ReviewCommentSection = {
    componentName: 'OPA Form Comment',
    componentTypeCode: '10',
    commentSectionName: '',
    commentTypeCode: '10',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_OPA_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_OPA_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '10'
}

export const TRAVEL_GENERAL_COMMENTS: ReviewCommentSection = {
    componentName: 'Travel General',
    componentTypeCode: '13',
    commentSectionName: '',
    commentTypeCode: '13',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_TRAVEL_DISCLOSURE_COMMENT,
        managePrivate: MANAGE_PRIVATE_TRAVEL_DISCLOSURE_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '13'
}

export const CMP_GENERAL_COMMENTS: ReviewCommentSection = {
    componentName: 'CMP Comment',
    componentTypeCode: '17',
    commentSectionName: '',
    commentTypeCode: '17',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_CMP_COMMENT,
        managePrivate: MANAGE_PRIVATE_CMP_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '17'
}

export const CMP_SECTION_COMMENTS: ReviewCommentSection = {
    componentName: 'CMP Section Comments',
    componentTypeCode: '18',
    commentSectionName: '',
    commentTypeCode: '18',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_CMP_COMMENT,
        managePrivate: MANAGE_PRIVATE_CMP_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '18'
}

export const CMP_COMPONENT_COMMENTS: ReviewCommentSection = {
    componentName: 'CMP Section Component Comments',
    componentTypeCode: '19',
    commentSectionName: '',
    commentTypeCode: '19',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_CMP_COMMENT,
        managePrivate: MANAGE_PRIVATE_CMP_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '19'
}

export const CMP_RECIPIENT_COMMENTS: ReviewCommentSection = {
    componentName: 'CMP Section Comments',
    componentTypeCode: '20',
    commentSectionName: '',
    commentTypeCode: '20',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_CMP_COMMENT,
        managePrivate: MANAGE_PRIVATE_CMP_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '20'
}

export const CMP_REVIEW_COMMENTS: ReviewCommentSection = {
    componentName: 'CMP Review Comments',
    componentTypeCode: '21',
    commentSectionName: '',
    commentTypeCode: '21',
    rights: {
        view: [],
        viewPrivate: [],
        manage: MANAGE_CMP_COMMENT,
        managePrivate: MANAGE_PRIVATE_CMP_COMMENT,
        canDocumentOwnerManage: true,
    },
    uniqueId: '21'
}

export const CMP_REVIEW_COMMENTS_COMPONENT_SORT = [CMP_GENERAL_COMMENTS.componentTypeCode];
export const CMP_REVIEW_COMMENTS_COMPONENT_GROUP: Record<string, ReviewCommentSection> = {
    [CMP_GENERAL_COMMENTS.componentTypeCode]: CMP_GENERAL_COMMENTS
};

export const FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT = [FCOI_GENERAL_COMMENTS.componentTypeCode,FCOI_ADMINISTRATOR_COMMENTS.componentTypeCode];
export const TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT = [TRAVEL_GENERAL_COMMENTS.componentTypeCode];
export const OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_SORT = [OPA_GENERAL_COMMENTS.componentTypeCode];
export const CMP_COMMENTS_COMPONENT_SORT = [CMP_GENERAL_COMMENTS.commentTypeCode];

export const FCOI_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP: Record<string, ReviewCommentSection> = {
    [FCOI_GENERAL_COMMENTS.componentTypeCode]: FCOI_GENERAL_COMMENTS
};

export const TRAVEL_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP: Record<string, ReviewCommentSection> = {
    [TRAVEL_GENERAL_COMMENTS.componentTypeCode]: TRAVEL_GENERAL_COMMENTS
};

export const OPA_DISCLOSURE_REVIEW_COMMENTS_COMPONENT_GROUP: Record<string, ReviewCommentSection> = {
    [OPA_GENERAL_COMMENTS.componentTypeCode]: OPA_GENERAL_COMMENTS
};
