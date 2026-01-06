import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ServiceRequest } from '../service-request.interface';
import { CommonDataService } from '../services/common-data.service';
import { ServiceRequestService } from '../services/service-request.service';
import { CommentsService } from './comments.service';

declare var $: any;

@Component({
    selector: 'app-comments-and-attachments',
    templateUrl: './comments-and-attachments.component.html',
    styleUrls: ['./comments-and-attachments.component.css']
})
export class CommentsAndAttachmentsComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];

    serviceRequest: ServiceRequest = new ServiceRequest();
    commentsAndAttachmentsList: any = [];
    newComment: string;
    isPrivateComment = false;
    uploadedFile = [];
    newAttachments = [];

    warningObj: any = {};
    isSaving = false;
    isEditable = false;

    constructor(
        private _commonService: CommonService,
        private _commentsService: CommentsService,
        private _commonData: CommonDataService,
        private _serviceRequestService: ServiceRequestService
    ) { }

    ngOnInit() {
        this.getGeneralDetails();
        this.getServiceRequestDetails();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getServiceRequestDetails(): void {
        this.$subscriptions.push(
            this._commonData.dataEvent.subscribe((data: any) => {
                if (data.includes('serviceRequest')) {
                    this.getGeneralDetails();
                }
            })
        );
    }

    private getGeneralDetails(): void {
        const data: any = this._commonData.getData(['serviceRequest']);
        this.serviceRequest = data.serviceRequest;
        this.isEditable = this.serviceRequest.statusCode !== 5;
        this.fetchCommentsAndAttachments();
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

    private fetchCommentsAndAttachments(): void {
        this.$subscriptions.push(
            this._commentsService.getSRCommentsAndAttachments(this.serviceRequest.serviceRequestId)
                .subscribe((data: any) => {
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

    addCommentAndAttachment(): void {
        if (this.newComment || this.newAttachments.length) {
            this.$subscriptions.push(
                this._commentsService.addServiceRequestCommentAndAttachment(
                    this.serviceRequest.serviceRequestId,
                    this.setCommentAttachment()).subscribe((data: any) => {
                        if (typeof data !== 'string') {
                            this.getCommentsAndAttachments(data);
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added Successfully.');
                            this._serviceRequestService.isServiceRequestDataChange = false;
                            this.clearData();
                        } else {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding comments failed. Please try again.');
                        }
                    }, err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding comments failed. Please try again.');
                    }));
        }
    }

    private setCommentAttachment() {
        return {
            comment: this.setComment(),
            attachment: this.newAttachments,
            uploadedFile: this.uploadedFile
        };
    }

    private setComment() {
        return this.newComment ?
            {
                comments: this.newComment,
                isPrivateComment: this.isPrivateComment
            }
            : null;
    }

    addAttachments(): void {
        this._serviceRequestService.isServiceRequestDataChange = true;
        this.uploadedFile.forEach(file => {
            this.prepareAttachment(file);
        });
    }

    deleteFromUploadedFileList(index: number): void {
        this.uploadedFile.splice(index, 1);
        this.warningObj.attachment = null;
    }

    deleteFromCommentList(index: number): void {
        this.deleteFromUploadedFileList(index);
        this.newAttachments.splice(index, 1);
    }

    closeAttachModal(): void {
        this.uploadedFile = [];
        this.warningObj.attachment = null;
    }

    private clearData(): void {
        this.uploadedFile = [];
        this.warningObj.attachment = null;
        this.newAttachments = [];
        this.newComment = null;
        this.isPrivateComment = false;
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
