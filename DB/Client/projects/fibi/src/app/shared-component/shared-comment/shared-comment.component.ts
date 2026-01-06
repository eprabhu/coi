/**
* Common comments component:
* currently using for proposal and ip
* @Input() requestId - proposal id/ip id for fetching comments;
* @Input() isEditMode - for identifying view mode/edit mode(view mode in comparison screen);
* @Input() requestModuleCode - module code of using modules (2 - ip, 3 - dev proposal);
* @Input() sequenceNumber - used only for ip, while saving used in request object of save api;
* @Input() ipNumber - used only for ip, while saving used in request object of save api;
*/

import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { ProposalComment, CommentsAndAttachmentsList, CommentType, CommentObject, Attachments } from './shared-comment-interface';
import { SharedCommentService } from './shared-comment.service';

@Component({
	selector: 'app-shared-comment',
	templateUrl: './shared-comment.component.html',
	styleUrls: ['./shared-comment.component.css'],
	providers: [SharedCommentService]
})

export class SharedCommentComponent implements OnChanges, OnDestroy {
	@Input() requestId: any;
	@Input() isEditMode: boolean;
	@Input() requestModuleCode: number;
	@Input() sequenceNumber: number = null;
	@Input() ipNumber: string = null;
	@Output() commentSaveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() commentEditEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

	comment = new ProposalComment();
    commentObject = new CommentObject();
	isEmptyTextArea: boolean;
	isInvalidCommentType: boolean;
	commentTab: string;
	totalCommentLength = 0;
	privateCommentLength = 0;
	commentTypes: Array<CommentType> = [];
	$subscriptions: Subscription[] = [];
	isSaving = false;
	commentsAndAttachmentsList: Array<CommentsAndAttachmentsList> = [];
	uploadedFile: File[] = [];
	warningMsg: string = null;
	newAttachments: Attachments[] = [];
	errorMap = new Map();

	constructor(
		private _commentsService: SharedCommentService,
		public _commonService: CommonService,
		private ref: ChangeDetectorRef
	) { }

	ngOnChanges() {
		if (this.requestId && !this.commentTypes.length) {
			this.fetchComments();
		}
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/**
	 * to fetch the comments
	 * this.comment.commentTypeCode = 3; for main panel reviewer comments
	 */
	private fetchComments(): void {
		this.$subscriptions.push(this.getFetchApi().subscribe((data: any) => {
			this.commentsAndAttachmentsList = [];
			this.commentTypes = data.commentType;
			this.setCommentsBasedOnTypes(data);
			const TYPE_WITH_COMMENTS = this.commentsAndAttachmentsList.find(ele => ele.countToDisplay > 0);
			this.commentTab = TYPE_WITH_COMMENTS ? TYPE_WITH_COMMENTS.id : null;
			this.ref.markForCheck();
		}));
	}

	private getFetchApi(): Observable<any> {
		switch (this.requestModuleCode) {
			case 3: {
				return this._commentsService.fetchProposalComments({ 'proposalId': this.requestId });
			}
			case 2: {
				return this._commentsService.getInstituteProposalComments(this.requestId);
			}
			default: {
				return of();
			}
		}
	}

	private setCommentsBasedOnTypes(data): any {
		this.commentTypes.forEach(element => {
			let tempObj: any = {};
			tempObj.id = element.commentTypeCode;
			tempObj.description = element.description;
			tempObj = {...tempObj, ...this.getComments(data, element)};
			tempObj.countToDisplay = tempObj.comments.length;
			this.commentsAndAttachmentsList.push(tempObj);
		});
	}

	private getComments(data, element): any {
		const TEMP_OBJ: any = {};
		switch (this.requestModuleCode) {
			case 3: {
				// tslint:disable-next-line:triple-equals
				TEMP_OBJ.comments = data.proposalComments.filter(comment => comment.commentTypeCode == element.commentTypeCode);
				TEMP_OBJ.proposalAttachments = TEMP_OBJ.comments.proposalCommentAttachments;
				return TEMP_OBJ;
			}
			case 2: {
				// tslint:disable-next-line:triple-equals
				TEMP_OBJ.comments = data.instituteProposalComments.filter(comment => comment.commentTypeCode == element.commentTypeCode);
				return TEMP_OBJ;
			}
			default: {
				return {};
			}
		}
	}

	/**
	 * update the comment list to the top or first element
	 */
	 private updateCommentList(): void {
		this.commentObject.commentType = this.findCommentType();
		const currentCommentObject = this.findCurrentComment();
		currentCommentObject.comments.unshift(this.commentObject);
		currentCommentObject.countToDisplay = (currentCommentObject.countToDisplay + 1);
		this.commentTab = this.comment.commentTypeCode;
	}

	private findCommentType(): any {
		return this.commentTypes.find(comment =>  comment.commentTypeCode === this.comment.commentTypeCode);
	}

	private findCurrentComment(): any {
		// tslint:disable-next-line: triple-equals
		return this.commentsAndAttachmentsList.find(comment => comment.id == this.comment.commentTypeCode);
	}

	/**
	 * sets the object to for saving the main panel
	 * @param  {} requestId
	 */
	addComment(): void {
		this.comment.proposalCommentAttachments = [];
		if (this.validateSave() && !this.isSaving) {
			this.comment.proposalId = this.requestId;
			this.isSaving = true;
			this.saveComment();
		}
	}

	private validateSave(): boolean {
		this.errorMap.clear();
		if (!this.comment.comment) {
			this.errorMap.set('comment', '* Please add a comment.');
		}
		if (!this.comment.commentTypeCode || this.comment.commentTypeCode === 'null') {
			this.errorMap.set('commentType', '* Please select a type.');
		}
		return this.errorMap.size === 0;
	}

	private saveComment(): void {
		this.$subscriptions.push(this.apiForCommentSave().subscribe((data: CommentObject) => {
				this.commentObject = data;
				this.isSaving = false;
				this.setUnsavedChanges(false);
			}, err => {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding comment failed. Please try again.');
				this.isSaving = false;
			}, () => {
				this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added successfully.');
				this.updateCommentList();
				this.clearComments();
			}
		));
	}

	private apiForCommentSave(): Observable<any> {
		switch (this.requestModuleCode) {
			case 3: {
				return this.apiForProposalSave();
			}
			case 2: {
				return this.apiForIPSave();
			}
			default: {
				return of();
			}
		}
	}

	private apiForProposalSave(): Observable<any> {
		const formData = new FormData();
		for (const file of this.uploadedFile) {
			formData.append('files', file, file.name);
		}
		formData.append('formDataJson', JSON.stringify({
			'comment': this.comment,
			'newCommentAttachments': this.newAttachments
		}));
		return this._commentsService.saveOrUpdateProposalComment(formData);
	}

	private apiForIPSave(): Observable<any> {
		const IP_REQ_OBJ: any = {
			'comment': this.comment.comment,
			'proposalId': this.requestId,
			'isPrivate': false,
			'commentTypeCode': this.comment.commentTypeCode,
			'updateTimeStamp': this.comment.updateTimeStamp,
			'updateUser': this.comment.updateUser,
			'proposalNumber': this.ipNumber,
			'sequenceNumber': this.sequenceNumber
		};
		return this._commentsService.saveOrUpdateInstituteProposalComment(
			{ 'instituteProposalComment': IP_REQ_OBJ });
	}

	private clearComments(): void {
		this.comment = new ProposalComment();
		this.newAttachments = [];
		this.uploadedFile = [];
		this.warningMsg = null;
	}

	/**
	 * @param {} tabName : name of the tab
	 * switch between comment tabs
	 */
	switchCommentTab(tabName): void {
		this.commentTab = tabName;
	}

	fileDrop(uploadedFiles): void {
		let dupCount = 0;
		for (const file of uploadedFiles) {
			if (this.checkDuplicateFiles(file)) {
				dupCount = dupCount + 1;
			} else {
				this.uploadedFile.push(file);
			}
		}
		if (dupCount > 0) {
			this.warningMsg = '* ' + dupCount + ' File(s) already added';
		}
		this.setUnsavedChanges(true);
	}

	private checkDuplicateFiles(index) {
		return this.newAttachments.find(dupFile => dupFile.fileName === index.name &&
			dupFile.mimeType === index.type) || this.uploadedFile.find(dupFile => dupFile.name === index.name &&
				dupFile.type === index.type) != null;
	}

	private deleteFromUploadedFileList(index: number): void {
		this.uploadedFile.splice(index, 1);
		this.warningMsg = null;
	}

	deleteFromCommentList(index: number): void {
		this.deleteFromUploadedFileList(index);
		this.newAttachments.splice(index, 1);
		this.setUnsavedChanges(true);
	}

	closeAttachModal(): void {
		this.uploadedFile = [];
		this.warningMsg = null;
	}

	addAttachments(): void {
		this.uploadedFile.forEach(file => {
			this.prepareAttachment(file);
		});
	}

	private prepareAttachment(file): void {
		this.newAttachments.push({
			'fileName': file.name,
			'mimeType': file.type
		});
	}

	downloadAttachment(attachmentObj): void {
		this.$subscriptions.push(
			this._commentsService.downloadProposalCommentAttachment(attachmentObj.commentAttachmentId)
				.subscribe(data => {
					fileDownloader(data, attachmentObj.fileName);
					this.isSaving = false;
				}, err => {
					this.isSaving = false;
					this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading file failed. Please try again.');
				}));
	}

	setUnsavedChanges(flag: boolean) {
		flag ? this.commentEditEvent.emit(true) : this.commentSaveEvent.emit(true);
	}
}
