import { CoiDashboardDisclosures } from "../../admin-dashboard/admin-dashboard.interface";
import { CoiDashboardDisclosureType } from "../../common/services/coi-common.interface";
import { UserDisclosure } from "../../user-dashboard/user-disclosure/user-disclosure-interface";
import { COIReviewCommentsConfig, ModuleSectionDetails } from "../coi-review-comments/coi-review-comments.interface";

export type DisclosureDetails = UserDisclosure | CoiDashboardDisclosures;
export class FetchReviewCommentRO {
    moduleItemKey?: string | number = null;
    moduleItemNumber?: string | number = null;
    subModuleItemKey?: string | number = null;
    subModuleItemNumber?: string | number = null;
    moduleCode?: string | number = null;
    subModuleCode?: string | number = null;
    componentTypeCode?: string | number = null;
    parentCommentId?: string | number = null;
    isSectionDetailsNeeded?: boolean = true;
    documentOwnerPersonId?: string = null;
    projects?: Projects[] = [];
    formBuilderId?: string | number = null;
    formBuilderSectionId?: string | number = null;
    formBuilderComponentId?: string | number = null;
}

export class Projects {
    projectNumber: string;
    projectModuleCode: number;
}

export class COIReviewCommentsSliderConfig extends COIReviewCommentsConfig implements FetchReviewCommentRO {
    // payload
    moduleItemKey?: string | number = null;
    moduleItemNumber?: string | number = null;
    subModuleItemKey?: string | number = null;
    subModuleItemNumber?: string | number = null;
    moduleCode?: string | number;
    subModuleCode?: string | number = null;
    componentTypeCode?: string | number = null;
    parentCommentId?: string | number = null;
    isSectionDetailsNeeded?: boolean = true;
    documentOwnerPersonId?: string = null;
    projects?: Projects[] = [];
    formBuilderId?: string | number = null;
    formBuilderSectionId?: string | number = null;
    formBuilderComponentId?: string | number = null;
    // for slider
    isOpenCommentSlider = false;
    isShowAllComments = false;
    canMaintainPrivateComments = false;
    canMaintainComments = false;
    sortOrder = [];
    canResolveComments = false;
    isReviewer = false;
}

export class AddReviewCommentRO {
    documentOwnerPersonId?: string = null;
    commentPersonId?: string = null;
    commentTypeCode?: number | string = null;
    commentType?: string = null;
    componentTypeCode?: number | string = null;
    parentCommentId?: number | string = null;
    commentTags?: any[] = null;
    isPrivate?: boolean = false;
    comment?: string = null;
    moduleItemKey?: number | string = null;
    moduleItemNumber?: number | string = null;
    subModuleItemKey?: number | string = null;
    subModuleItemNumber?: number | string = null;
    moduleCode?: number | string;
    subModuleCode?: number | string = null;
    formBuilderId?: number | string = null;
    formBuilderSectionId?: number | string = null;
    formBuilderComponentId?: number | string = null;
    commentId?: number | string = null;
}

export class COIReviewCommentsWithProjects {
    comments?: COIReviewComments[];
    projectComments?: ProjectComments[];
}

export class ProjectComments {
    comments?: COIReviewComments[];
    projectNumber?: string;
    projectTitle?: string;
}

export class COIReviewComments {
    commentId?: number | string = null;
    documentOwnerPersonId?: string = null;
    commentPersonId?: string = null;
    commentTypeCode?: number | string = null;
    commentType?: string = null;
    componentTypeCode?: number | string = null;
    componentType?: ReviewCommentComponentType = null;
    parentCommentId?: number | string = null;
    commentTags?: any[] = [];
    isPrivate?: boolean = null;
    comment?: string = null;
    moduleItemKey?: number | string = null;
    moduleItemNumber?: number | string = null;
    subModuleItemKey?: number | string = null;
    subModuleItemNumber?: number | string = null;
    moduleCode?: number | string = null;
    subModuleCode?: number | string = null;
    formBuilderId?: number | string = null;
    formBuilderSectionId?: number | string = null;
    formBuilderComponentId?: number | string = null;
    updateUser?: string = null;
    updateTimestamp?: number = null;
    updateUserFullName?: string = null;
    childComments?: COIReviewComments[] = [];
    reviewAttachments?: any[] = null;
    moduleSectionDetails?: ModuleSectionDetails = null;
    isSectionDetailsNeeded?: boolean = null;
    isParentCommentResolved?: boolean = null;
}

export interface ReviewCommentComponentType {
    componentTypeCode?: string | number;
    description?: string;
    updateTimestamp?: number;
    updateUser?: string;
    isActive?: boolean;
}

export interface CommentCheckboxConfig {
    IS_SHOW_CA_COMMENTS: boolean;
    IS_SHOW_ADMINISTRATIVE_COMMENT: boolean;
    COMPONENT_TYPE_CODE: string | number;
    PROJECT?: Projects;
}

export interface CommentRights {
    canComment: boolean;
    canPrivateComment: boolean;
    canResolveComment: boolean;
    isReviewer: boolean;
}
