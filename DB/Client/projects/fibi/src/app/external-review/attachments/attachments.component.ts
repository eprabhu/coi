import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { GrantCommonDataService } from '../../grant-call/services/grant-common-data.service';
import { AttachmentsService } from './attachments.service';
import { ExternalReviewService } from '../external-review.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

declare var $: any;
@Component({
    selector: 'app-attachments-ext',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit, OnDestroy {

    @Input() extReviewID: any;
    @Input() isEditMode: boolean;

    fileName: any;
    uploadedFile = [];
    selectedAttachmentDescription = [];
    selectedAttachmentType: any[] = [];
    externalReviewAttachmentTypes = [];
    externalReviewAttachments: any = [];
    $subscriptions: Subscription[] = [];
    grantCallAttachments: any = [1, 2];
    tabName = 'PROPOSAL_GRANT_CALL_ATTACHMENTS';
    isShowAttachmentList: boolean;
    reviewAttachmentIndex: number;
    extReviewAttachmentId: any;
    isProposalChecked = {};
    isGrantCallChecked = {};
    proposalGrantCallAttachments: any = {};
    isSaving = false;
    isShowFooter = false;
    isShowAddAttachment = false;
    attachmentWarningMsg = null;

    constructor(public _commonService: CommonService,
        public _commonData: GrantCommonDataService,
        public _reviewService: ExternalReviewService,
        private attachmentService: AttachmentsService) { }

    ngOnInit() {
        this.getExtReviewAttachmentTypes();
        this.getExternalReviewAttachments();
        this.getProposalGrantCallAttachments();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    clearAttachmentDetails() {
        this.attachmentWarningMsg = null;
        this.uploadedFile = [];
        this.isShowAddAttachment = false;
        this.tabName = this._reviewService.externalSectionConfig['352'].isActive ?
            'PROPOSAL_GRANT_CALL_ATTACHMENTS' : 'UPLOADED_ATTACHMENTS';
        this.isProposalChecked = {};
        this.isGrantCallChecked = {};
        this.isShowFooter = false;
    }

    fileDrop(files) {
        this.attachmentWarningMsg = null;
        for (let index = 0; index < files.length; index++) {
            this.uploadedFile.push(files[index]);
            this.selectedAttachmentType[this.uploadedFile.length - 1] = null;
            this.selectedAttachmentDescription[this.uploadedFile.length - 1] = '';
        }
        this.canShowAddFooter();
    }

    deleteFromUploadedFileList(index) {
        this.selectedAttachmentType.splice(index, 1);
        this.selectedAttachmentDescription.splice(index, 1);
        this.uploadedFile.splice(index, 1);
        this.attachmentWarningMsg = null;
    }

    checkMandatory() {
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            if (this.selectedAttachmentType[uploadIndex] === 'null' || !this.selectedAttachmentType[uploadIndex]) {
                this.attachmentWarningMsg = '* Please fill all the mandatory fields';
                break;
            }
        }
        return !this.attachmentWarningMsg;
    }

    sortAttachments(attachments) {
        attachments.sort(function (a, b) {
            return b.updateTimeStamp - a.updateTimeStamp;
        });
    }

    getExternalReviewAttachments() {
        this.$subscriptions.push(this.attachmentService.getExternalReviewAttachments(this.extReviewID)
            .subscribe((data: any) => {
                this.externalReviewAttachments = data;
            }));
    }

    uploadExternalReviewAttachment() {
        this.attachmentWarningMsg = null;
        if (this.checkMandatory() && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this.attachmentService.uploadExternalReviewAttachment(
                this.setAttachmentObject(),
                this.uploadedFile,
                this.checkProposalGrantCallAttachments()
            )
                .subscribe((data: any) => {
                    this.addAttachmentActions(data);
                    this.isShowAttachmentList = true;
                    this.isShowAddAttachment = false;
                    this.clearAttachmentDetails();
                    $('#addReviewAttachment').modal('hide');
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment added successfully.');
                }, err => {
                    this.isShowAttachmentList = true;
                    this.isShowAddAttachment = false;
                    this.clearAttachmentDetails();
                    $('#addReviewAttachment').modal('hide');
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Attachment failed. Please try again.');
                    this.isSaving = false;
                }));
        }
    }

    setAttachmentObject() {
        const tempArrayForAdd = [];
        this.uploadedFile.forEach((element, index) => {
            const tempObjectForAdd: any = {};
            tempObjectForAdd.fileDataId = null;
            tempObjectForAdd.attachmentTypeCode = this.selectedAttachmentType[index];
            tempObjectForAdd.extReviewAttachmentType = this.getTypeObject(this.selectedAttachmentType[index]);
            tempObjectForAdd.fileName = element.name;
            tempObjectForAdd.description = this.selectedAttachmentDescription[index];
            tempObjectForAdd.extReviewID = this.extReviewID;
            tempArrayForAdd.push(tempObjectForAdd);
        });
        return tempArrayForAdd;
    }

    getTypeObject(type) {
        return this.externalReviewAttachmentTypes.find(ele => type == ele.attachmentTypeCode);
    }

    checkProposalGrantCallAttachments() {
        const attachmentImportList = [];
        if (Object.values(this.isGrantCallChecked).some(e => e)) {
            this.setAttachmentArray(attachmentImportList, this.proposalGrantCallAttachments.grantCallAttachments, this.isGrantCallChecked);
        }
        if (Object.values(this.isProposalChecked).some(e => e)) {
            this.setAttachmentArray(attachmentImportList, this.proposalGrantCallAttachments.proposalAttachments, this.isProposalChecked);
        }
        return attachmentImportList;
    }

    addAttachmentActions(data) {
        this.externalReviewAttachments = this.externalReviewAttachments.concat(data);
        this.sortAttachments(this.externalReviewAttachments);
        this.isSaving = false;
        this.isProposalChecked = {};
        this.isGrantCallChecked = {};
    }

    getExtReviewAttachmentTypes() {
        this.$subscriptions.push(this.attachmentService.getExtReviewAttachmentTypes()
            .subscribe((data: any) => {
                this.externalReviewAttachmentTypes = data;
            }));
    }

    getProposalGrantCallAttachments() {
        this.$subscriptions.push(this.attachmentService.getProposalGrantCallAttachments(this._reviewService.moduleDetails.moduleItemKey)
            .subscribe((data: any) => {
                this.proposalGrantCallAttachments = data;
            }));
    }

    downloadReviewAttachment(attachment) {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this.attachmentService.downloadReviewAttachment(attachment.extReviewAttachmentId)
                .subscribe((data: any) => {
                    fileDownloader(data, attachment.fileName);
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading Attachment failed. Please try again.');
                }));
        }
    }

    deleteExternalReviewAttachment() {
        this.$subscriptions.push(this.attachmentService.deleteExternalReviewAttachment(this.extReviewAttachmentId)
            .subscribe((data: any) => {
                this.externalReviewAttachments.splice(this.reviewAttachmentIndex, 1);
                this.reviewAttachmentIndex = null;
                this.extReviewAttachmentId = null;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
            },
                err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Attachment failed. Please try again.');
                }));
    }

    canShowAddFooter() {
        this.isShowFooter = Object.values(this.isGrantCallChecked).some(e => e) ||
            Object.values(this.isProposalChecked).some(e => e) ||
            this.uploadedFile.length ? true : false;
    }

    private setAttachmentArray(attachmentImportList: any[], attachmentList, selectedAttachment) {
        Object.keys(selectedAttachment).forEach(ele => {
            if (selectedAttachment[ele]) {
                const attachment = attachmentList.find(attach => attach.attachmentId == ele);
                attachmentImportList.push({
                    fileDataId: attachment.fileDataId,
                    attachmentTypeCode: 1,
                    fileName: attachment.fileName,
                    description: attachment.description,
                    extReviewID: this.extReviewID
                });
            }
        });
    }
}
