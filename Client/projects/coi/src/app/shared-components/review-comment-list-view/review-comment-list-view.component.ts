import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { CoiReviewComment, CommentType } from '../review-comments-slider/review-comments-interface';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ReviewCommentsService } from '../review-comments-slider/review-comments.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { EDITOR_CONFIURATION } from '../../../../../fibi/src/app/app-constants';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { COI } from '../../disclosure/coi-interface';
import { closeCommonModal, openCommonModal } from '../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';

@Component({
	selector: 'app-review-comment-list-view',
	templateUrl: './review-comment-list-view.component.html',
	styleUrls: ['./review-comment-list-view.component.scss']
})
export class ReviewCommentListViewComponent implements OnInit, OnDestroy, OnChanges {

	@Input() isViewMode = false;
	@Input() commentReviewerList: any = [];
	@Input() reviewTypeList: any = [];
	@Input() disclosureDetails: any;
	@Input() selectedReviewType:any;
	@Input() disclosureType:any;
	@Input() reviewCommentDetails:any;
	@Input() isHeaderNeeded:any = false;
	@Input() searchText: string;
	@Input() coiData = new COI();
	@Input() hasMaintainCoiComments: boolean;
	@Input() hasMaintainPrivateComments: boolean;
	@Input() showAddComment: boolean;

	@Output() deleteReviewComment: EventEmitter<any> = new EventEmitter<any>();
	@Output() editReviewParentComment: EventEmitter<any> = new EventEmitter<any>();
	@Output() emitReplayCommentDetails: EventEmitter<any> = new EventEmitter<any>();
	@Output() deleteChidReviewComment: EventEmitter<any> = new EventEmitter<any>();
	@Output() groupedCommentsListChange = new EventEmitter<any[]>();

	public Editor = DecoupledEditor;
    editorConfig = EDITOR_CONFIURATION;
	isEditComment = false;
	isEditParentComment = false;
	commentDetails: CoiReviewComment = new CoiReviewComment();
	$subscriptions: Subscription[] = [];
	isReplyComment = false;
	mandatoryMap = new Map();
	selectedCommentIdList:any = [];
	isShowReplyComment = false;
	readMoreCommentIdList:any = [];
	groupedCommentsList: any = {};
	initialVisibleComments = 2;
	showReplyArray: any[] = [];
	currentLoggedInUserId: any;
	deleteCommentModalId = 'disc-comment-delete-confirm-modal'
	modalConfig = new CommonModalConfig(this.deleteCommentModalId, 'Delete', 'Cancel');
	deleteCommentdetails = new CoiReviewComment();
	deleteCommentIndex = null;
	isDeletingChildComment: boolean;
	selectedSectionToNavigate: string;
	isDisclosureOwner: boolean;

	constructor(private _commonService: CommonService,
				public reviewCommentsService: ReviewCommentsService) { }

	ngOnInit() {
		this.modalConfig.dataBsOptions.focus = false;
		this.currentLoggedInUserId = this._commonService.getCurrentUserDetail('personID');
		this.isDisclosureOwner = this.disclosureDetails.personId === this.currentLoggedInUserId;
		this.scrollToSection();
	}

	ngOnChanges() {
		setTimeout(() => {
		this.groupedCommentsList = {};
		if(this.commentReviewerList && this.commentReviewerList.length) {
			this.groupedCommentsList = this.disclosureType === 'COI' ?
			this.nestedGroupBy(this.commentReviewerList, 'componentTypeCode', 'subModuleItemKey') :
			this.opaGroupBy(this.commentReviewerList, 'formBuilderSectionId' , 'subModuleItemKey');
			if (this.searchText) {
				this.groupedCommentsList = this.searchComments(this.groupedCommentsList, this.searchText);
			}
			this.groupedCommentsListChange.emit(this.groupedCommentsList);
		}
		}, 300);
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	private searchComments(data: any, searchText: string): any {
		const LOWER_SERACH_TEXT = searchText.toLowerCase();
		return Object.entries(data).reduce((filteredResults, [componentKey, subModule]) => {
		  const FILTERED_SUB_MODULE = Object.entries(subModule).reduce((acc, [subModuleKey, commentsArray]) => {
			if (Array.isArray(commentsArray)) {
				const FILTERED_COMMENTS = commentsArray.map(commentObj => {
					const IS_MATCHES_PARENT = commentObj.comment?.toLowerCase().includes(LOWER_SERACH_TEXT);
					const FILTERED_CHILD_COMMENTS = commentObj.childComments?.filter(child =>
					  child.comment?.toLowerCase().includes(LOWER_SERACH_TEXT)
					) || [];
					return (IS_MATCHES_PARENT || FILTERED_CHILD_COMMENTS.length > 0) 
					  ? { ...commentObj, childComments: FILTERED_CHILD_COMMENTS }
					  : null;
				  }).filter(Boolean);
				  (FILTERED_COMMENTS.length > 0) && (acc[subModuleKey] = FILTERED_COMMENTS);
			}
			return acc;
		  }, {});
	  
		  if (Object.keys(FILTERED_SUB_MODULE).length > 0) {
			filteredResults[componentKey] = FILTERED_SUB_MODULE;
		  }
		  return filteredResults;
		}, {});
	  }
	  

	private nestedGroupBy(commentList: any[], primaryKey: string, secondaryKey: string) {
		const PRIMARY_GROUPED = this.groupBy(commentList, primaryKey);
		const NESTED_GROUPED = Object.entries(PRIMARY_GROUPED).reduce((acc, [primaryKeyValue, items]) => {
			acc[primaryKeyValue] = this.groupBy(items, secondaryKey);
			return acc;
		}, {});
		return NESTED_GROUPED;
	}

	groupBy(items, key) {
        return items.reduce((relationsTypeGroup, item) => {
            (relationsTypeGroup[item[key]] = relationsTypeGroup[item[key]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

	opaGroupBy(commentList, formKey, subsectionKey) {
        return commentList.reduce((relationsTypeGroup, item) => {
			let key = item[formKey] != null ? formKey : item[subsectionKey] != null ? subsectionKey : formKey;
			(relationsTypeGroup[item[key]] = relationsTypeGroup[item[key]] || []).push(item);
            return relationsTypeGroup;
        }, {});
    }

	postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteComment(this.deleteCommentdetails, this.deleteCommentIndex);
        } 
        closeCommonModal(this.deleteCommentModalId);
    }

	triggerDeleteConfirmationModal(details: CoiReviewComment , Index: number , commentType: 'childComment' | 'parentComment'): void {
		this.deleteCommentdetails = details;
		this.deleteCommentIndex = Index;
		this.isDeletingChildComment = commentType === 'childComment';
		openCommonModal(this.deleteCommentModalId);
	}

	private deleteComment(details, index): void {
		if (this.reviewCommentDetails.componentTypeCode != '10') {
			this.$subscriptions.push(this.reviewCommentsService.deleteReviewComments(details.commentId, details.moduleCode).subscribe
			((res: any) => {
				details.parentCommentId ? this.deleteReplyComment(details,index) : this.deleteReviewComment.emit(index);
				this.isShowReplyComment = false;
				this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment deleted successfully');
			}, (error: any) => {
				this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)
			}));
		}
		if (this.reviewCommentDetails.componentTypeCode == '10') {
			this.$subscriptions.push(this.reviewCommentsService.deleteFormBuilderReviewComments(details.commentId, details.moduleCode).subscribe
			((res: any) => {
				details.parentCommentId ? this.deleteReplyComment(details,index) : this.deleteReviewComment.emit(index);
				this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment deleted successfully');
				this.isShowReplyComment = false;
			}, (error: any) => {
				this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG)
			}));
		}	
	}

	editParentComment(details, index): void {
		this.mandatoryMap.clear();
		if (!this.reviewCommentsService.isEditParentComment && !this.isEditComment && !this.isReplyComment) {
			this.reviewCommentsService.isEditParentComment = true;
			this.reviewCommentsService.editParentCommentId = details.commentId;
			this.commentDetails.comment = details.comment;
		}
		this.reviewCommentsService.isEditOrReplyClicked = true;
	}

	addEditComment(details): void {
		if(!this.validateComment()) {
			details.comment = this.commentDetails.comment;
			this.editReviewParentComment.emit(details);
		}
	}

	replyComment(commentDetails): void {
		this.mandatoryMap.clear();
		this.reviewCommentsService.isEditParentComment = false;
		this.commentDetails = new CoiReviewComment();
		this.getReviewerActionDetails();
		this.commentDetails.parentCommentId = commentDetails.commentId;
		this.commentDetails.isPrivate = commentDetails.isPrivate;
		this.isReplyComment = true;
		this.reviewCommentsService.isEditOrReplyClicked = true;

	}

	private getReviewerActionDetails(): void {
		this.$subscriptions.push(this._commonService.$commentConfigurationDetails.subscribe((res: any) => {
			this.commentDetails.documentOwnerPersonId = res.documentOwnerPersonId;
			this.commentDetails.moduleItemKey = this.disclosureDetails.disclosureId ||  this.disclosureDetails.opaDisclosureId;
			this.commentDetails.subModuleItemKey = res.subModuleItemKey;
			this.commentDetails.formBuilderId = res.formBuilderId;
			this.commentDetails.formBuilderSectionId = res.formBuilderSectionId;
			this.commentDetails.formBuilderComponentId = res.formBuilderComponentId;
			this.commentDetails.componentTypeCode = res.componentTypeCode;
		}));
	}

	editReplyComment(replayComment): void {
		if( !this.isEditComment  &&  !this.reviewCommentsService.isEditParentComment && !this.isReplyComment) {
			this.isEditComment = true;
			this.commentDetails.moduleItemKey = replayComment.componentReferenceId
			this.commentDetails.commentId = replayComment.commentId;
			this.commentDetails.comment = replayComment.comment;
			this.commentDetails.parentCommentId = replayComment.parentCommentId;
			this.commentDetails.componentTypeCode = replayComment.componentTypeCode;
			this.commentDetails.subModuleItemKey = replayComment.subModuleItemKey;
			this.commentDetails.formBuilderId = replayComment.formBuilderId;
			this.commentDetails.formBuilderSectionId = replayComment.formBuilderSectionId;
			this.commentDetails.formBuilderComponentId = replayComment.formBuilderComponentId;
		}
		this.reviewCommentsService.isEditOrReplyClicked = true;
	}

	private deleteReplyComment(replayComment, index): void {
		this.deleteChidReviewComment.emit({commentId:replayComment.commentId, index: index})
	}

	cancelOrClearCommentsDetails(): void {
		this.commentDetails = new CoiReviewComment();
		if (this.isEditComment) {
			this.isEditComment = false;
		}
		if(this.isReplyComment) {
			this.isReplyComment = false;
		}
		if (this.reviewCommentsService.isEditParentComment) {
            this.reviewCommentsService.isEditParentComment = false;
        }
        if (this.reviewCommentsService.editParentCommentId) {
            this.reviewCommentsService.editParentCommentId = null;
        }
		this.getReviewerActionDetails();
		this.reviewCommentsService.isEditOrReplyClicked = false;
		this.mandatoryMap.clear();
	}

	addReplayCommentsDetails(details: any , action: 'edit' | 'reply'): void {
		if(!this.validateComment()) {
			this.isEditComment = action === 'edit';
			this.commentDetails.moduleItemKey = this.disclosureDetails.disclosureId || this.disclosureDetails.opaDisclosureId;
			this.commentDetails.componentTypeCode = details.componentTypeCode;
			this.commentDetails.subModuleItemKey = details.subModuleItemKey;
			this.commentDetails.documentOwnerPersonId = details.documentOwnerPersonId
            this.emitReplayCommentDetails.emit({
				details:this.commentDetails,
				isEditComment: this.isEditComment,
				isReplyComment :  this.isReplyComment
			});
            this.cancelOrClearCommentsDetails();
            }
	}

	private validateComment(): boolean {
        this.mandatoryMap.clear();
        if (!this.commentDetails.comment ) {
            this.mandatoryMap.set('comment', 'Please add comment');
        }
        return this.mandatoryMap.size > 0;
    }

	public onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }

	getComponentName(componentDetails: any): string {
		if (typeof componentDetails === 'object' && !Array.isArray(componentDetails)) {
			for (const key in componentDetails) {
				const COMPONENT_DETAILS_RESPONSE = componentDetails[key]?.find(
					ele => ele?.moduleSectionDetails?.sectionName || ele?.moduleSectionDetails?.otherDetails
				);
				if (COMPONENT_DETAILS_RESPONSE) {
					return COMPONENT_DETAILS_RESPONSE?.componentType?.description ||
						   COMPONENT_DETAILS_RESPONSE?.moduleSectionDetails?.otherDetails?.location ||
						   'General Comments';
				}
			}
		}
		return 'General Comments';
	}

	getSectionName(sectionDetails: any): string {
		const COMMENTS = sectionDetails?.find((ele: any) => {
			if (ele?.componentType?.description === 'CA Comments' || ele?.componentType?.code === 12) {
				return '';
			}
			return ele?.moduleSectionDetails?.sectionName != null || ele?.moduleSectionDetails?.otherDetails?.location != null;
		});
		return COMMENTS?.moduleSectionDetails?.sectionName || COMMENTS?.moduleSectionDetails?.otherDetails?.location || '';
	}
	

	getSubSectionName(subSectionDetails: any): string {
		return subSectionDetails?.find((ele: any) => ele.moduleSectionDetails?.subsectionName)?.moduleSectionDetails?.subsectionName || '';
	}
	

	viewMoreReplies(index): void {
		this.showReplyArray.push(index);
	}

	viewLessReplies(index): void {
		const ITEM_INDEX = this.showReplyArray.indexOf(index);
		if (ITEM_INDEX > -1) {
			this.showReplyArray.splice(ITEM_INDEX, 1);
		}
	}

	private scrollToSection(): void {
		this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
			if (data.uniqueId === 'DISCLOSURE_COMMENTS_SECTION_NAVIGATION'){
				this.selectedSectionToNavigate = data?.content?.uniqueId;	
			}
		}));
	}

	isReviewComment(code): boolean {
        return this.reviewCommentDetails.componentTypeCode == code;
    }

	isGroupedCommentsListEmpty(): boolean {
		return Object.keys(this.groupedCommentsList).length === 0;
	}

	isCommentActionVisible(comment: any , commentType: CommentType): boolean {
		const COMMENT_OWNER = this.currentLoggedInUserId === comment?.commentPersonId;
		return (
			(commentType === 'PARENT' 
				? this.reviewCommentsService.editParentCommentId !== comment?.commentId 
				: this.commentDetails.commentId !== comment?.commentId
			) &&
			((COMMENT_OWNER && this.isDisclosureOwner) ||
				(COMMENT_OWNER && (comment?.isPrivate ? this.hasMaintainPrivateComments : (this.hasMaintainCoiComments || this.hasMaintainPrivateComments)))
			) &&
			!this.isViewMode &&
			!this.isReplyComment &&
			!this.showAddComment
		)
	}	  
}
