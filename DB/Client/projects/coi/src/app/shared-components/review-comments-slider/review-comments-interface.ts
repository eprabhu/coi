export type CommentType = 'PARENT' | 'CHILD';

export class ReviewComments {
    coiReviewCommentDto: CoiReviewComment = new CoiReviewComment();
    // documentOwnerPersonId: number;
}


export class CoiReviewComment {
    "documentOwnerPersonId": any = null;
    "commentPersonId": any = null;
    "commentTypeCode": any = null;
    "commentType": any = null;
    "componentTypeCode": any = null;
    "parentCommentId": any = null;
    "commentTags": any = null;
    "isPrivate":boolean = false;
    "comment": any = null;
    "moduleItemKey": any = null;
    "moduleItemNumber": any = null;
    "subModuleItemKey": any = null;
    "subModuleItemNumber": any = null;
    "moduleCode": number;
    "subModuleCode": any = null;
    "formBuilderId": any = null;
    "formBuilderSectionId": any = null;
    "formBuilderComponentId": any = null;
    "commentId": any = null;
}

export class CommentConfiguration {
    disclosureId: any = null;
    coiReviewId: number = null;
    coiReviewCommentId: number = null;
    coiReviewActivityId = '1';
    coiSectionsTypeCode: any = null;
    modifyIndex = -1;
    comment: any = null;
    coiParentCommentId: number = null;
    isPrivate = false;
    subSectionList: any = [];
    isSubSectionComment = false;
    coiSubSectionsId: string = null;
    coiReviewCommentTag: any = [];
    coiReviewCommentAttachment: any = [];
}
export class CompleterOptions {
    arrayList: any[];
    contextField: string;
    filterFields: string;
    formatString: string;
    defaultValue = '';
}

export class CommentFetch {
    "moduleItemKey": any = null;
    "moduleItemNumber": any = null;
    "subModuleItemKey": any = null;
    "subModuleItemNumber": any = null;
    "moduleCode" = 8;
    "subModuleCode": any = null;
    "formBuilderId": any = null;
    "formBuilderSectionId": any = null;
    "formBuilderComponentId": any = null;
    "componentTypeCode": any = null;
    "parentCommentId": any = null;
    "isSectionDetailsNeeded": boolean = false;
    "documentOwnerPersonId": any = null;
}

export class KeyPersonComment {
    commentCount: number;
    personID: string;
}
