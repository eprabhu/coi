/** Last updated by Ayush on 08 Jan 2021 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { AttachmentsService } from './attachments.service';
import { environment } from '../../../environments/environment';
import { CommonDataService } from '../services/common-data.service';
import {deepCloneObject, fileDownloader} from '../../common/utilities/custom-utilities';



declare var $: any;

@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.css'],
    providers: [AttachmentsService]
})
export class AttachmentsComponent implements OnInit, OnDestroy {

    progressReportId: any = null;
    progressReportAttachmentTypes: any[] = [];
    progressReportAttachments: any[] = [];

    isReplaceAttachment = false;
    replaceIndex = null;
    isShowDeleteAttachment = false;
    isShowAttachmentVersionModal = false;
    isAttachmentListOpen = true;
    attachmentWarningMsg = null;
    isAttachmentButtonDisabled = false;

    removeObjIndex: number;
    removeObjId: number;
    removeObj: any = {};
    documentId: number;
    removeObjDocId: number;
    fileName: string;
    attachmentVersions = [];
    updateUser = this._commonService.getCurrentUserDetail('userName');

    replaceAttachment: any = {};
    uploadedFile = [];
    selectedAttachmentStatus = [];
    selectedAttachmentDescription = [];
    selectedAttachmentType: any[] = [];
    deployMap = environment.deployUrl;
    isAttachmentEdit = true;
    editedAttachment: any = {};
    editIndex = null;
    $subscriptions: Subscription[] = [];
    isShowConfidentialAttachment = false;
    awardLeadUnitNumber = null;
    awardId = null;
    column = 'attachmentTypeCode';
    direction: number = -1;
    isDesc: any;

    constructor(private _attachmentsService: AttachmentsService,
                public _commonService: CommonService,
                public _commonData: CommonDataService) {
    }

    ngOnInit() {
        this.$subscriptions.push(this._commonData.getProgressReportData().subscribe((data: any) => {
            if (data && data.awardProgressReport) {
                this.progressReportId = data.awardProgressReport.progressReportId;
                this.awardLeadUnitNumber = data.awardProgressReport.award.leadUnitNumber;
                this.awardId = data.awardProgressReport.awardId;
                this.checkEditMode(data.awardProgressReport.progressReportStatus.progressReportStatusCode, data.availableRights);
                this.fetchAllAttachments();
            }
            this.getPermissions(data.availableRights);
        }));
    }

    fetchAllAttachments() {
        this.$subscriptions.push(
            this._attachmentsService.loadProgressReportAttachments({progressReportId: this.progressReportId,
                awardLeadUnitNumber: this.awardLeadUnitNumber, awardId: this.awardId}).subscribe((res: any) => {
                if (res) {
                    this.progressReportAttachmentTypes = res.progressReportAttachmentTypes;
                    this.progressReportAttachments = res.awardProgressReportAttachments;
                    this.checkToShowConfidentialAttachments()
                }
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching attachments failed. Please try again.'))
        );
    }

    getPermissions(rights){
        this.isShowConfidentialAttachment = rights.includes('VIEW_CONFIDENTIAL_PROGRESS_REPORT_ATTACHMENTS');
    }

    /** if the logged user has the right 'VIEW_CONFIDENTIAL_CLAIM_ATTACHMENTS',
   * then he/she will be able to see attachments including confidential attachments.
   * For other users, there will not shows dropdown option for adding confidential attachments.*/
    checkToShowConfidentialAttachments() {
        if (!this.isShowConfidentialAttachment) {
            this.progressReportAttachmentTypes = this.progressReportAttachmentTypes.filter(element => !element.isPrivate);
            }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    /**
     * @param  {string} progressReportStatusCode
     * progressReportStatusCode
     * 1 = In progress
     * 2 = Revision Requested
     * 3 = Approval In progress
     * 4 = Approved
     * 5 = Hold for Funding Agency Review
     * 6 = Completed
     */
    checkEditMode(progressReportStatusCode: string, rights: string[]) {
        this.isAttachmentEdit = ['1', '2'].includes(progressReportStatusCode) ||
            (['3', '4', '5'].includes(progressReportStatusCode) && rights.includes('MODIFY_PROGRESS_REPORT'));
    }

    /** get attachment type Code and returns corresponding type description to the table list
     */
    getAttachmentType(attachmentTypeCode: any) {
        if (this.progressReportAttachmentTypes && attachmentTypeCode) {
            return String(this.progressReportAttachmentTypes.find(type => type.attachmentTypeCode === attachmentTypeCode).description);
        }
    }

    showAddAttachmentPopUp(attachment, index) {
        if (this.isReplaceAttachment) {
            this.replaceAttachment = attachment;
            this.replaceIndex = index;
        }
    }

    clearAttachmentDetails() {
        this.attachmentWarningMsg = null;
        this.uploadedFile = [];
        this.isReplaceAttachment = false;
        this.replaceIndex = null;
        $('#addAwardAttachment').modal('hide');
    }

    fileDrop(files) {
        this.attachmentWarningMsg = null;
        for (let index = 0; index < files.length; index++) {
            this.isReplaceAttachment ? this.updateReplaceAttachmentDetails(files, index) : this.updateAddAttachmentDetails(files, index);
        }
    }

    /**updateAddAttachmentDetails - clears attachment details for Adding attachments
     */
    updateAddAttachmentDetails(files, index) {
        this.uploadedFile.push(files[index]);
        this.selectedAttachmentType[this.uploadedFile.length - 1] = null;
        this.selectedAttachmentStatus[this.uploadedFile.length - 1] = 'C';
        this.selectedAttachmentDescription[this.uploadedFile.length - 1] = '';
    }

    /**updateReplaceAttachmentDetails - sets attachment details for replacing attachment
     */
    updateReplaceAttachmentDetails(files, index) {
        if (files.length === 1) {
            this.uploadedFile = [];
            this.uploadedFile.push(files[index]);
            this.selectedAttachmentType[this.uploadedFile.length - 1] = this.getAttachmentType(this.replaceAttachment.attachmentTypeCode);
            this.selectedAttachmentDescription[this.uploadedFile.length - 1] = this.replaceAttachment.description;
            this.selectedAttachmentStatus[this.uploadedFile.length - 1] = this.replaceAttachment.narrativeStatusCode;
        } else {
            this.attachmentWarningMsg = '* Choose only one document to replace';
        }
    }

    deleteFromUploadedFileList(index) {
        this.selectedAttachmentType.splice(index, 1);
        this.selectedAttachmentDescription.splice(index, 1);
        this.selectedAttachmentStatus.splice(index, 1);
        this.uploadedFile.splice(index, 1);
        this.attachmentWarningMsg = null;
    }

    /**addAttachments -  checks whether all mandatory fields are filled, call service to add attachments */
    addAttachments() {
        if (this.checkMandatoryFilled()) {
            this.isAttachmentButtonDisabled = true;
            this.$subscriptions.push(
                this._attachmentsService.saveOrUpdateProgressReportAttachment(this.prepareAddRequestObject(), this.uploadedFile)
                    .subscribe((data: any) => {
                            const userUserName = this._commonService.getCurrentUserDetail('fullName');
                            if (this.isReplaceAttachment) {
                                const attachment = data.awardProgressReportAttachments[0];
                                attachment.updateUserName = userUserName;
                                this.progressReportAttachments.splice(this.replaceIndex, 1);
                                this.progressReportAttachments.unshift(attachment);
                            } else {
                                data.awardProgressReportAttachments.forEach((attchment: any) => {
                                    attchment.updateUserName = userUserName;
                                    this.progressReportAttachments.unshift(attchment);
                                });
                            }
                            $('#addAwardAttachment').modal('hide');
                            this.isAttachmentButtonDisabled = false;
                        },
                        error => {
                            this.showErrorToast();
                            this.isAttachmentButtonDisabled = false;
                        },
                        () => {
                            this.showSuccessToast();
                            this.clearAttachmentDetails();
                        }));
        }
    }

    /**
     * returns request object dynamically for both insert and replace.
     */
    prepareAddRequestObject() {
        const tempArrayForAdd = [];
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            const tempObjectForAdd: any = {};
            if (!this.isReplaceAttachment) {
                tempObjectForAdd.attachmentTypeCode = this.selectedAttachmentType[uploadIndex];
                tempObjectForAdd.progressReportAttachmentType = this.progressReportAttachmentTypes.find(attachtype =>
                    attachtype.attachmentTypeCode === this.selectedAttachmentType[uploadIndex], 10);;
                tempObjectForAdd.documentId = null;
                tempObjectForAdd.fileDataId = null;
                tempObjectForAdd.versionNumber = null;
                tempObjectForAdd.mimeType = this.uploadedFile[uploadIndex].type || null;
            } else {
                tempObjectForAdd.attachmentTypeCode = this.replaceAttachment.attachmentTypeCode;
                tempObjectForAdd.progressReportAttachmentType = this.replaceAttachment.progressReportAttachmentType;
                tempObjectForAdd.progressReportAttachmentId = this.replaceAttachment.progressReportAttachmentId;
                tempObjectForAdd.documentId = this.replaceAttachment.documentId;
                tempObjectForAdd.fileDataId = this.replaceAttachment.fileDataId;
                tempObjectForAdd.versionNumber = this.replaceAttachment.versionNumber;
                tempObjectForAdd.mimeType = this.uploadedFile[uploadIndex].type || this.replaceAttachment.mimeType;
            }
            tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
            tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
            tempObjectForAdd.progressReportId = this.progressReportId;
            tempArrayForAdd[uploadIndex] = tempObjectForAdd;
        }
        return {
            awardProgressReportAttachments: tempArrayForAdd, actionType: this.isReplaceAttachment ? 'R' : 'I',
        };
    }

    checkMandatoryFilled() {
        this.attachmentWarningMsg = null;
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            if (this.selectedAttachmentType[uploadIndex] === 'null' || !this.selectedAttachmentType[uploadIndex]) {
                this.attachmentWarningMsg = '* Please fill all the mandatory fields';
            }
        }
        return !this.attachmentWarningMsg;
    }
    /** shows success toast based on attachment is replaced or not */
    showSuccessToast() {
        const toastMsg = this.isReplaceAttachment ? 'Attachment replaced successfully' : 'Attachment added successfully';
        this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
    }

    /** shows error toast based on replace attachment or not and wab enabled or not */
    showErrorToast() {
        let toastMsg;
        if (this.isReplaceAttachment) {
            toastMsg = 'Failed to replace attachment';
        } else {
            toastMsg = 'Failed to add attachment';
        }
        this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
    }

    getVersion(documentId, progressReportId, fileName) {
        const requestObject = {
            'progressReportId' : progressReportId,
            'awardId' : this.awardId,
            'awardLeadUnitNumber' : this.awardLeadUnitNumber,
            'documentId' : documentId,
        };
        this.isShowAttachmentVersionModal = true;
        this.attachmentVersions = [];
        this.fileName = fileName;
        this.$subscriptions.push(this._attachmentsService
            .loadProgressReportAttachments(requestObject).subscribe((res: any) => {
            if (res) {
                this.attachmentVersions = res.awardProgressReportAttachments;
                $('#award-doc-version-btn').click();
            }
        }));
    }

    temprySaveAttachments(removeId, removeIndex, removeDocumentId, removeObj) {
        this.removeObjId = removeId;
        this.removeObjIndex = removeIndex;
        this.removeObj = removeObj;
        this.isShowDeleteAttachment = true;
        this.removeObjDocId = removeDocumentId;
    }

    deleteAttachments() {
        if (this.removeObjId == null) {
            this.progressReportAttachments.splice(this.removeObjIndex, 1);
        } else {
            const requestObject = {awardProgressReportAttachments: [this.removeObj], actionType: 'D'};
            this.$subscriptions.push(
                this._attachmentsService.saveOrUpdateProgressReportAttachment(requestObject)
                    .subscribe((data: any) => {
                        this.progressReportAttachments = this.progressReportAttachments.filter(attachmentObject =>
                            attachmentObject.progressReportAttachmentId !== this.removeObjId);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
                    }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting attachment failed. Please try again.')));
        }
    }

    downloadAwardAttachments(attachment) {
        this._attachmentsService.downloadProgressReportAttachment (attachment.progressReportAttachmentId)
            .subscribe((data: any) => {
                fileDownloader(data, attachment.fileName);
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading attachment failed. Please try again.'));
    }

    editAttachment(index: number, attachment) {
        this.editIndex = index;
        this.editedAttachment = deepCloneObject(attachment);
        $('#progressReportEditAttachmentModal').modal('show');
    }

    cancelAttachmentEdit() {
        this._commonData.isDataChange = false;
        this.editedAttachment = {};
        this.editIndex = null;
        $('#progressReportEditAttachmentModal').modal('hide');
    }

    updateAttachment() {
        this.editedAttachment.updateUser = this.updateUser;
        this.editedAttachment.updateTimeStamp = new Date().getTime();
        const requestObject = {awardProgressReportAttachments: [this.editedAttachment], actionType: 'U'};
        this.$subscriptions.push(this._attachmentsService.saveOrUpdateProgressReportAttachment(requestObject).subscribe((data: any) => {
            this.progressReportAttachments.splice(this.editIndex, 1);
            this.progressReportAttachments.unshift(data.awardProgressReportAttachments[0]);
            this._commonData.isDataChange = false;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update attachment! Please try again.');
            },
            () => {
                $('#progressReportEditAttachmentModal').modal('hide');
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment successfully updated.');
                this.editIndex = null;
            }));
    }

    createDownloadElement(data, filename) {
        const a = document.createElement('a');
        const blob = new Blob([data], {type: data.type});
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    sortBy(property) {
        this.column = property;
        this.direction = this.isDesc ? 1 : -1;
    }
}
