import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommentsService } from '../comments.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { WafAttachmentService } from '../../../../common/services/waf-attachment.service';
import { CommonDataService } from '../../../../award/services/common-data.service';
import { fileDownloader } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

declare var $: any;

@Component({
    selector: 'app-add-variation-comment',
    templateUrl: './add-variation-comment.component.html',
    styleUrls: ['./add-variation-comment.component.css']
})
export class AddVariationCommentComponent implements OnInit, OnDestroy {

    @Input() serviceRequestId: any;
    @Output() cancelEdit: EventEmitter<any> = new EventEmitter();

    $subscriptions: Subscription[] = [];

    commentsAndAttachmentsList: any = [];
    comment: string;
    uploadedFile = [];
    newAttachments = [];
    warningObj: any = {};
    isPrivateComment = false;
    maintainPrivateComment = false;
    isSaving = false;
    commentMap = new Map();

    constructor(
        private _commentsService: CommentsService,
        private _commonService: CommonService,
        private _commonData: CommonDataService
    ) { }

    ngOnInit() {
        this.fetchCommentsAndAttachments();
        this.maintainPrivateComment = this._commonData.checkDepartmentLevelRightsInArray('MAINTAIN_PRIVATE_COMMENTS');
    }

    ngOnDestroy() {
        this.clearData();
        this.cancelEdit.emit(true);
        subscriptionHandler(this.$subscriptions);
    }

    private fetchCommentsAndAttachments(): void {
        this.$subscriptions.push(
            this._commentsService.getSRCommentsAndAttachments(this.serviceRequestId).subscribe((data: any) => {
                this.getCommentsAndAttachments(data);
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching comments failed. Please try again.');
            }));
    }

    private getCommentsAndAttachments(data): void {
        this.commentsAndAttachmentsList = [];
        for (const commentData of Object.values(data)) {
            this.commentsAndAttachmentsList.unshift(this.setCommentAttachmentData(commentData));
        }
    }

    private setCommentAttachmentData(commentData) {
        const commentDetails = this.getUpdateDetails(commentData);
        return {
            comment: commentData.comment[0],
            attachment: commentData.attachment,
            updateTime: commentDetails.updateTime,
            updateUser: commentDetails.updateUser,
            actionTypeDescription: commentData.actionTypeDescription,
            isPrivateComment: commentDetails.isPrivateComment,
        };
    }

    private getUpdateDetails(commentData) {
        return commentData.comment && commentData.comment.length ?
            this.commentInformation(commentData.comment[0]) : this.commentInformation(commentData.attachment[0]);
    }

    private commentInformation(details) {
        return {
            updateTime: details.updateTimestamp,
            updateUser: details.updateUserFullName,
            isPrivateComment: details.isPrivateComment,
        };
    }

    private validateComment(comment: string) {
        this.commentMap.clear();
        if (!comment) {
            this.commentMap.set('comment', 'Please enter comment');
        }
        return this.commentMap.size === 0;
    }

    addCommentAndAttachment(): void {
        if (this.validateComment(this.comment)) {
            this.setAttachments();
            this.$subscriptions.push(
                this._commentsService.addServiceRequestCommentAndAttachment(
                    this.serviceRequestId,
                    this.setCommentAttachment()).subscribe((data: any) => {
                        if (typeof data !== 'string') {
                            this.getCommentsAndAttachments(data);
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added Successfully.');
                            this.clearData();
                        } else {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Comments failed. Please try again.');
                        }
                    }, err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Comments failed. Please try again.');
                    }));
        }
    }

    private setAttachments() {
        this.uploadedFile.forEach(file => {
            this.prepareAttachment(file);
        });
    }

    private setCommentAttachment() {
        return {
            comment: this.setComment(),
            attachment: this.newAttachments,
            uploadedFile: this.uploadedFile
        };
    }

    private setComment() {
        return this.comment ?
            {
                comments: this.comment,
                isPrivateComment: this.isPrivateComment
            }
            : null;
    }

    clearData(): void {
        this.uploadedFile = [];
        this.warningObj.attachment = null;
        this.newAttachments = [];
        this.comment = null;
        this.isPrivateComment = false;
        this.commentMap.clear();
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
            this.warningObj.attachment = '* ' + dupCount + ' File(s) already added';
        }
    }

    private checkDuplicateFiles(index) {
        return this.newAttachments.find(dupFile => dupFile.fileName === index.name &&
            dupFile.contentType === index.type) || this.uploadedFile.find(dupFile => dupFile.name === index.name &&
                dupFile.type === index.type) != null;
    }

    prepareAttachment(file): void {
        this.newAttachments.push({
            'fileName': file.name,
            'contentType': file.type
        });
    }

    deleteFromUploadedFileList(index: number): void {
        this.uploadedFile.splice(index, 1);
        this.warningObj.attachment = null;
    }

    downloadAttachment(attachmentObj): void {
        this.$subscriptions.push(
            this._commentsService.downloadServiceRequestAttachment(attachmentObj.attachmentId)
                .subscribe(data => {
                    fileDownloader(data, attachmentObj.fileName);
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading file failed. Please try again.');
                }));
    }

}
