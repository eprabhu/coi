import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../../app-constants';
import { ExtReviewerAttachment } from '../../reviewer-maintenance.interface';
import { ExtReviewerMaintenanceService } from '../../external-reviewer-maintenance-service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CommonService } from '../../../../common/services/common.service';
import { fileDownloader } from '../../../../common/utilities/custom-utilities';


declare var $: any;

@Component({
    selector: 'app-external-reviewer-attachment',
    templateUrl: './external-reviewer-attachment.component.html',
    styleUrls: ['./external-reviewer-attachment.component.css']
})
export class ExternalReviewerAttachmentComponent implements OnInit, OnDestroy {
    $subscriptions: Subscription[] = [];
    isReplaceAttachment = false;
    newAttachment: Array<ExtReviewerAttachment> = [];
    externalReviewerAttachmentType: any = [];
    attachmentWarningMsg = null;
    uploadedFile = [];
    deleteAttachmentId: number;
    deleteIndexId: number;
    editAttachmentDetails: any = {};
    editAttachmentIndex: number;
    externalReviewerDetails: any = {};
    isMaintainReviewer: any = {};
    isSaving = false;
    isDesc: any;
    direction = 1;
    sortListBy = 'updateTimeStamp';

    constructor(public _extReviewerMaintenanceService: ExtReviewerMaintenanceService, private _commonService: CommonService) { }

    async ngOnInit() {
        this.loadAttachmentType();
        this.getExternalReviewerAttachmentData();
        this.isMaintainReviewer = await this._extReviewerMaintenanceService.getMaintainReviewerPermission();

    }

    getExternalReviewerAttachmentData(): void {
        this.$subscriptions.push(this._extReviewerMaintenanceService.$externalReviewerDetails.subscribe((data: any) => {
            if (data) {
                this.externalReviewerDetails = JSON.parse(JSON.stringify(data));
            }
        }));
    }

    viewAttachmentModal() {
        this.isReplaceAttachment = false;
        this.uploadedFile = [];
        this.attachmentWarningMsg = null;
    }

    loadAttachmentType() {
        this.externalReviewerAttachmentType = this._extReviewerMaintenanceService.lookUpData.externalReviewerAttachmentType;
    }

    fileDrop(files) {
        this.attachmentWarningMsg = null;
        for (let index = 0; index < files.length; index++) {
            this.updateAddAttachmentDetails(files[index]);
        }

    }

    updateAddAttachmentDetails(file) {
        this.uploadedFile.push(file);
        const attachment = new ExtReviewerAttachment();
        attachment.fileName = file.name;
        attachment.mimeType = file.type;
        attachment.externalReviewerId = this.externalReviewerDetails.extReviewerId;
        this.newAttachment.push(attachment);
    }

    onAttachmentTypeChange(index: number, typeCode: number | string) {
        const TYPE = this.externalReviewerAttachmentType.find(attachmentType => attachmentType.attachmentTypeCode == typeCode);
        this.newAttachment[index].externalReviewerAttachmentType = TYPE;
    }

    addAttachments() {
        if (!this.isSaving) {
            this.checkMandatoryFilled();
            if (!this.attachmentWarningMsg) {
                this.isSaving = true;
                this.$subscriptions.push(
                    this._extReviewerMaintenanceService.addExternalReviewerAttachment(
                        this.newAttachment, this.uploadedFile).subscribe((data: any) => {
                            data.forEach((attachment: any) => {
                                if (this.externalReviewerDetails.extReviewerAttachments) {
                                    this.externalReviewerDetails.extReviewerAttachments.push(attachment);
                                } else {
                                    this.externalReviewerDetails.extReviewerAttachments = [attachment];
                                }
                            });
                            this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
                            $('#externalReviewerAttachment').modal('hide');
                            this.clearAttachmentDetails();
                            const toastMsg = 'Attachment added successfully.';
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
                            this.isSaving = false;
                        },
                            error => {
                                const toastMsg = 'Failed to add Attachment.';
                                this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
                                this.clearAttachmentDetails();
                                this.isSaving = false;
                            }));
            }
        }

    }

    clearAttachmentDetails() {
        setTimeout(() => {
            this.attachmentWarningMsg = null;
            this.uploadedFile = [];
            this.newAttachment = [];
        });
    }

    checkMandatoryFilled() {
        this.attachmentWarningMsg = null;
        if (this.uploadedFile.length === 0) {
            this.attachmentWarningMsg = '* Please choose at least one document';
        }
        this.uploadedFile.forEach((ele, uploadIndex) => {
            if (this.newAttachment[uploadIndex].attachmentTypeCode == 'null' || !this.newAttachment[uploadIndex].attachmentTypeCode) {
                this.attachmentWarningMsg = '* Please select Document Type';
            }
        });
    }

    deleteFromUploadedFileList(index: number) {
        this.uploadedFile.splice(index, 1);
        this.attachmentWarningMsg = null;
        this.newAttachment.splice(index, 1);
    }

    setAttachmentDeleteDetails(attachmentId, Index) {
        this.deleteAttachmentId = attachmentId;
        this.deleteIndexId = Index;
    }

    deleteAttachments() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._extReviewerMaintenanceService.deleteExternalReviewerAttachment(this.deleteAttachmentId).subscribe((data: any) => {
                    this.externalReviewerDetails.extReviewerAttachments.splice(this.deleteIndexId, 1);
                    this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
                    $('#deleteAttachment').modal('hide');
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
                    this.isSaving = false;
                }));
        }
    }

    editAttachment(attachments, index) {
        this.editAttachmentDetails = Object.assign({}, attachments);
        this.editAttachmentIndex = index;
    }

    updateAttachments() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._extReviewerMaintenanceService.updateAttachmentDetails(
                {
                    'externalReviewerAttachmentId': this.editAttachmentDetails.externalReviewerAttachmentId,
                    'description': this.editAttachmentDetails.description
                }
            ).subscribe((data: any) => {
                this.externalReviewerDetails.extReviewerAttachments[this.editAttachmentIndex].description = data.description;
                this._extReviewerMaintenanceService.setExternalReviewerDetails(this.externalReviewerDetails);
                $('#editAttachmentModal').modal('hide');
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment updated successfully.');
                this.clearEditAttachmentDetails();
                this.isSaving = false;
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Attachment for External Reviewer failed. Please try again.');
                    this.isSaving = false;
                }
            ));
        }

    }

    clearEditAttachmentDetails() {
        this.editAttachmentDetails = {};
    }

    downloadAttachments(attachment) {
        this.$subscriptions.push(
            this._extReviewerMaintenanceService.downloadAttachment(attachment.externalReviewerAttachmentId)
                .subscribe(data => {
                    fileDownloader(data, attachment.fileName);
                })
        );
    }

    sortResult(type) {
        this.isDesc = !this.isDesc;
        this.sortListBy = type;
        this.direction = this.isDesc ? 1 : -1;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
