import { Subscription } from 'rxjs';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { EDITOR_CONFIGURATION } from '../../../app-constants';
import { CoiReviewCommentsService } from '../coi-review-comments.service';
import { COIReviewCommentEditor, CardCommentDetails, CommentCardConfig } from '../coi-review-comments.interface';
import { CommonService } from '../../../common/services/common.service';
import { GlobalEventNotifier } from '../../../common/services/coi-common.interface';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../coi-review-comments-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-coi-review-comments-card',
    templateUrl: './coi-review-comments-card.component.html',
    styleUrls: ['./coi-review-comments-card.component.scss'],
})
export class CoiReviewCommentsCardComponent implements OnInit, OnChanges, OnDestroy {

    loggedPersonId = '';
    isAddComment = true;
    editCommentId = null;
    isOpenReplyEditor = false
    $subscriptions: Subscription[] = [];
    replyCommentDetails: CommentCardConfig = null;
    commentEditorConfig = new COIReviewCommentEditor();
    replyCommentsLimit: number = 2;
    isExpandReplyComment = false;
    isShowResolveComment = false;

    @Input() commentCardConfig = new CommentCardConfig();

    constructor(private _commonService: CommonService, public reviewCommentsService: CoiReviewCommentsService) {}

    ngOnInit(): void {
        this.listenToGlobalNotifier();
        this.loggedPersonId = this._commonService.getCurrentUserDetail('personID');
        this.isShowResolveComment = this.commentCardConfig?.canResolveComments ||
                (this.loggedPersonId === (this.commentCardConfig?.commentDetails?.commentPersonId || this.commentCardConfig?.commentDetails?.commentBy));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.commentCardConfig) {
            this.openAddNewCommentEditor();
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data?.uniqueId === COI_REVIEW_COMMENTS_IDENTIFIER) {
                if (['CANCEL_EDITOR', 'CLOSE_ALL_EDITOR'].includes(data.content?.action)) {
                    this.closeEditor();
                }
            }
        }));
    }

    private openAddNewCommentEditor(): void {
        if (this.commentCardConfig?.isOpenAddComment) {
            this.commentEditorConfig = new COIReviewCommentEditor();
            this.commentEditorConfig.actionType = 'ADD_COMMENT';
            this.commentEditorConfig.isReplyComment = this.commentCardConfig?.isReplyComment;
            this.commentEditorConfig.editorConfig = EDITOR_CONFIGURATION;
            this.commentEditorConfig.componentTypeCode = this.commentCardConfig?.componentTypeCode;
            this.commentEditorConfig.moduleSectionDetails = this.commentCardConfig?.moduleSectionDetails;
            this.commentEditorConfig.commentDetails = deepCloneObject(this.commentCardConfig?.commentDetails);
            this.commentEditorConfig.editorConfig.placeholder = `Please enter your ${this.commentCardConfig?.isReplyComment ? 'reply' : 'comment'}.`;
        }
        this.commentEditorConfig.checkboxConfig = this.commentCardConfig?.checkboxConfig;
    }

    editComment(commentDetails: CardCommentDetails): void {
        this.reviewCommentsService.notifyGlobalEvent('CLOSE_ALL_EDITOR');
        setTimeout(() => {
            this.commentEditorConfig = new COIReviewCommentEditor();
            this.commentEditorConfig.actionType = 'EDIT_COMMENT';
            this.commentEditorConfig.isReplyComment = this.commentCardConfig?.isReplyComment;
            this.commentEditorConfig.commentDetails = commentDetails;
            this.commentEditorConfig.componentTypeCode = this.commentCardConfig?.componentTypeCode;
            this.commentEditorConfig.moduleSectionDetails = this.commentCardConfig?.moduleSectionDetails;
            this.commentEditorConfig.commentDetails = deepCloneObject(commentDetails);
            this.commentEditorConfig.editorConfig = EDITOR_CONFIGURATION;
            this.commentEditorConfig.editorConfig.placeholder = `Please enter your ${this.commentCardConfig?.isReplyComment ? 'reply' : 'comment'}.`;
            this.editCommentId = commentDetails?.commentId;
        });
    }

    openReplyComment(commentDetails: CardCommentDetails): void {
        this.reviewCommentsService.notifyGlobalEvent('CLOSE_ALL_EDITOR');
        setTimeout(() => {
            this.replyCommentDetails = {
                checkboxConfig: [],
                isEditMode: this.commentCardConfig?.isEditMode,
                isDocumentOwner: this.commentCardConfig?.isDocumentOwner,
                canMaintainComments: this.commentCardConfig?.canMaintainComments,
                canMaintainPrivateComments: this.commentCardConfig?.canMaintainPrivateComments,
                canResolveComments: this.commentCardConfig?.canResolveComments,
                isOpenAddComment: true,
                isReplyComment: true,
                uniqueId: 'comment-card-reply-add-' + commentDetails?.commentId,
                moduleSectionDetails: this.commentCardConfig?.moduleSectionDetails,
                componentTypeCode: this.commentCardConfig?.componentTypeCode,
                commentDetails: {
                    ...commentDetails,
                    comment: '',
                    commentId: null,
                    isPrivate: commentDetails?.isPrivate,
                    parentCommentId: commentDetails?.commentId,
                    updateUserFullName: this._commonService.getCurrentUserDetail('fullName'),
                    commentPersonId: null,
                    childComments: null,
                    documentOwnerPersonId: null,
                    updateTimestamp: null
                }
            };
            this.isOpenReplyEditor = true;
        });
    }

    closeEditor(): void {
        this.commentCardConfig.isOpenAddComment = false;
        this.isOpenReplyEditor = false;
        this.editCommentId = null;
    }

    triggerDeleteComment(commentDetails: CardCommentDetails): void {
        const EMIT_DATA = {
            commentDetails: commentDetails,
            commentEditorConfig: this.commentEditorConfig,
        }
        this.reviewCommentsService.notifyGlobalEvent('DELETE_COMMENT', EMIT_DATA);
    }

    resolveComment(commentDetails: CardCommentDetails): void {
         const EMIT_DATA = {
            commentDetails: commentDetails,
        }
        this.reviewCommentsService.notifyGlobalEvent('RESOLVE_COMMENT', EMIT_DATA);
    }

}
