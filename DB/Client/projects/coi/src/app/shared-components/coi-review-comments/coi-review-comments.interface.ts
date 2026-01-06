import { EDITOR_CONFIGURATION } from '../../app-constants';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

export type COICommentRightsType = { view?: string[]; manage?: string[]; managePrivate?: string[], viewPrivate?: string[], canDocumentOwnerManage?: boolean, resolve?: string[]};
export type COIReviewCommentsActions = 'ADD_COMMENT' | 'EDIT_COMMENT' | 'COMMENT_CHANGES' | 'DELETE_COMMENT' | 'CANCEL_EDITOR' | 'CLOSE_ALL_EDITOR' | 'API_FAILED_ON_INITIAL_LOAD' | 'CLOSE_REVIEW_SLIDER' | 'SEARCH_TEXT_CHANGED' | 'RESOLVE_COMMENT';
export interface ReviewCommentSection {
    componentName?: string;
    commentSectionName?: string;
    commentTypeCode?: string | number;
    componentTypeCode?: string | number;
    uniqueId?: string;
    rights?: COICommentRightsType;
}

export class COIReviewCommentsConfig {
    uniqueId? = '';
    searchText? = '';
    isEditMode? = false;
    isDocumentOwner? = false;
    canAddAllComments? = false;
    sliderHeader? = '';
    componentTypeCode?: string | number = null;
    componentDetails?: ReviewCommentSection = null;
    triggeredSource?: COIReviewCommentSource = null;
    checkboxConfig?: COIReviewCommentCheckbox[] = [];
    addAllCommentsConfig?: COIReviewCommentList[] = [];
    moduleSectionDetails?: ModuleSectionDetails = null;
    selectedAddCommentSection?: ComponentComments = null;
    filteredReviewCommentsList?: COIReviewCommentList[] = [];
    reviewCommentsSections?: Record<string | number, ReviewCommentSection> = {};
    projects?: {
        projectNumber: string;
        projectModuleCode: number;
    }[];
}

export class COIReviewCommentList {
    componentName = '';
    canMaintainComments = false;
    canMaintainPrivateComments = false;
    canResolveComments = false;
    componentTypeCode: number | string = null;
    componentComments: ComponentComments[] = [];
}

export interface ComponentComments {
    moduleSectionDetails?: ModuleSectionDetails;
    reviewCommentsList: CommentCardConfig[];
}

export interface COIReviewCommentCheckbox {
    label: string;
    defaultValue: boolean;
    values: {
        true: Record<string, any> | null;
        false: Record<string, any> | null;
    };
    hideComponentTypes?: (string | number)[];
}

export interface COIReviewCommentSource {
    from: string;
    isTriggeredFromSlider: boolean;
    scrollElementId: string;
}

export class COIReviewCommentEditor {
    triggeredFrom = '';
    isReplyComment = false;
    editor = DecoupledEditor;
    editorConfig: any = EDITOR_CONFIGURATION;
    checkboxConfig: COIReviewCommentCheckbox[] = [];
    commentDetails = new CardCommentDetails();
    componentTypeCode: number | string = null;
    moduleSectionDetails: ModuleSectionDetails = null;
    actionType: 'ADD_COMMENT' | 'EDIT_COMMENT' = 'ADD_COMMENT';
}
export interface ModuleSectionDetails {
    sectionId?: string | number;
    sectionName?: string;
    subsectionId?: string | number;
    subsectionName?: string;
    otherDetails?: ModuleSectionOtherDetails;
    // for frontend binding
    sectionKey?: string | number;
    canMaintainPrivateComments?: boolean;
    canMaintainComments?: boolean;
    canResolveComments?: boolean;
}

export interface ModuleSectionOtherDetails {
    location?: string;
    reviewerStatus?: string;
}

export class CardCommentDetails {
    commentId: string | number = null;
    parentCommentId: string | number = null;
    commentPersonId: string = null;
    comment = '';
    documentOwnerPersonId?: string = null;
    isPrivate = false;
    childComments: CommentCardConfig[] = [];
    updateUserFullName = '';
    updateTimestamp: number = null;
    [key: string]: any;
    isResolved?: boolean;
    resolvedBy?: string;
    resolvedTimestamp?: number;
}

export class CommentCardConfig {
    uniqueId: string | number = null;
    isReplyComment = false;
    isEditMode = false;
    isOpenAddComment = false;
    canMaintainPrivateComments = false;
    canMaintainComments = false;
    canResolveComments = false;
    isDocumentOwner = false;
    componentTypeCode: number | string = null;
    moduleSectionDetails?: ModuleSectionDetails = null;
    commentDetails = new CardCommentDetails();
    checkboxConfig: COIReviewCommentCheckbox[];
}
