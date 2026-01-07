/** Last updated by Ayush on 09 Nov 2020 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { AttachmentsService } from './attachments.service';
import { CommonDataService } from '../services/common-data.service';
import { environment } from '../../../environments/environment';
import { fileDownloader } from '../../common/utilities/custom-utilities';


declare var $: any;

@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.css'],
    providers: [AttachmentsService]
})
export class AttachmentsComponent implements OnInit, OnDestroy {

    claimId: any = null;
    claimAttachmentTypes: any[] = [];
    claimAttachments: any[] = [];

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
    isEditAttachment = [];
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
        this.$subscriptions.push(this._commonData.$claimData.subscribe((data: any) => {
            if (data && data.claim) {
                this.claimId = data.claim.claimId;
                this.awardLeadUnitNumber = data.claim.award.leadUnitNumber;
                this.awardId = data.claim.awardId;
                this.checkEditMode(data.claim.claimStatus.claimStatusCode);
                this.fetchAllAttachments();
            }
            this.getPermissions(data.availableRights);
              }));
    }

    fetchAllAttachments() {
        this.$subscriptions.push(
            this._attachmentsService.loadClaimAttachments({claimId: this.claimId,
            awardLeadUnitNumber: this.awardLeadUnitNumber, awardId: this.awardId}).subscribe((res: any) => {
                if (res) {
                    this.claimAttachmentTypes = res.claimAttachmentType;
                    this.claimAttachments = res.claimAttachments;
                    this.checkToShowConfidentialAttachments();
                }
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching attachments failed. Please try again.'))
        );
    }

    getPermissions(rights){
        this.isShowConfidentialAttachment = rights.includes('VIEW_CONFIDENTIAL_CLAIM_ATTACHMENTS');

    }
    /** if the logged user has the right 'VIEW_CONFIDENTIAL_CLAIM_ATTACHMENTS',
  * then he/she will be able to see attachments including confidential attachments.
  * For other users, there will not shows dropdown option for adding confidential attachments.*/
    checkToShowConfidentialAttachments() {
        if (!this.isShowConfidentialAttachment) {
            this.claimAttachmentTypes = this.claimAttachmentTypes.filter(element => !element.isPrivate);
            }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    /**
     * @param  {string} claimStatusCode
     * claimStatusCode 4 = Completed
     */
    checkEditMode(claimStatusCode: string) {
        this.isAttachmentEdit = !['4'].includes(claimStatusCode);
    }

    /** get attachment type Code and returns corresponding type description to the table list
     */
    getAttachmentType(typeCode: any) {
        if (this.claimAttachmentTypes && typeCode) {
            return String(this.claimAttachmentTypes.find(type => type.typeCode === typeCode).description);
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
            this.selectedAttachmentType[this.uploadedFile.length - 1] = this.getAttachmentType(this.replaceAttachment.typeCode);
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
        this.checkMandatoryFilled();
        if (this.addAttachmentConditionCheck()) {
            this.isAttachmentButtonDisabled = true;
            this.$subscriptions.push(
                this._attachmentsService.saveOrUpdateClaimAttachment(this.prepareAddRequestObject(), this.uploadedFile)
                    .subscribe((data: any) => {
                            const userUserName = this._commonService.getCurrentUserDetail('fullName');
                            if (this.isReplaceAttachment) {
                                const attachment = data.claimAttachments[0];
                                attachment.updateUserName = userUserName;
                                this.claimAttachments.splice(this.replaceIndex, 1);
                                this.claimAttachments.unshift(attachment);
                            } else {
                                data.claimAttachments.forEach((attchment: any) => {
                                    attchment.updateUserName = userUserName;
                                    this.claimAttachments.unshift(attchment);
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
                tempObjectForAdd.typeCode = this.selectedAttachmentType[uploadIndex];
                tempObjectForAdd.attachmentType = this.claimAttachmentTypes.find(attachtype =>
                    attachtype.typeCode === this.selectedAttachmentType[uploadIndex], 10);
                tempObjectForAdd.documentId = null;
                tempObjectForAdd.fileDataId = null;
                tempObjectForAdd.versionNumber = null;
                tempObjectForAdd.mimeType = this.uploadedFile[uploadIndex].type || null;
            } else {
                tempObjectForAdd.typeCode = this.replaceAttachment.typeCode;
                tempObjectForAdd.attachmentType = this.replaceAttachment.attachmentType;
                tempObjectForAdd.claimAttachmentId = this.replaceAttachment.claimAttachmentId;
                tempObjectForAdd.documentId = this.replaceAttachment.documentId;
                tempObjectForAdd.fileDataId = this.replaceAttachment.fileDataId;
                tempObjectForAdd.versionNumber = this.replaceAttachment.versionNumber;
                tempObjectForAdd.mimeType = this.uploadedFile[uploadIndex].type || this.replaceAttachment.mimeType;
            }
            tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
            tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
            tempObjectForAdd.claimId = this.claimId;
            tempObjectForAdd.updateUser = this.updateUser;
            tempArrayForAdd[uploadIndex] = tempObjectForAdd;
        }
        return {
            claimAttachments: tempArrayForAdd, acType: this.isReplaceAttachment ? 'R' : 'I',
            updateUser: this.updateUser
        };
    }

    checkMandatoryFilled() {
        this.attachmentWarningMsg = null;
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            if (this.selectedAttachmentType[uploadIndex] === 'null' || !this.selectedAttachmentType[uploadIndex]) {
                this.attachmentWarningMsg = '* Please fill all the mandatory fields';
            }
        }
    }

    addAttachmentConditionCheck() {
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

    getVersion(documentId, claimId, fileName) {
        this.isShowAttachmentVersionModal = true;
        this.attachmentVersions = [];
        this.fileName = fileName;
        this.$subscriptions.push(this._attachmentsService.loadClaimAttachments({claimId, documentId}).subscribe((res: any) => {
            if (res) {
                this.attachmentVersions = res.claimAttachments;
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
            this.claimAttachments.splice(this.removeObjIndex, 1);
        } else {
            const requestObject = {claimAttachments: [this.removeObj], acType: 'D', updateUser: this.updateUser};
            this.$subscriptions.push(
                this._attachmentsService.saveOrUpdateClaimAttachment(requestObject)
                    .subscribe((data: any) => {
                        this.claimAttachments = this.claimAttachments.filter(attachmentObject =>
                            attachmentObject.claimAttachmentId !== this.removeObjId);
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
                    }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting attachment failed. Please try again.')));
        }
    }

    downloadAwardAttachments(attachment) {
        this._attachmentsService.downloadClaimAttachment(attachment.claimAttachmentId)
            .subscribe((data: any) => {
                fileDownloader(data, attachment.fileName);
            }, err => this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading attachment failed. Please try again.'));
    }

    updateAttachment(attachment, index) {
        attachment.updateUser = this.updateUser;
        const requestObject = {claimAttachments: [attachment], acType: 'U', updateUser: attachment.updateUser};
        this.$subscriptions.push(this._attachmentsService.saveOrUpdateClaimAttachment(requestObject).subscribe((data: any) => {
                this.claimAttachments.splice(index, 1);
                this.claimAttachments.unshift(data.claimAttachments[0]);
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Update attachment failed. Please try again.');
            },
            () => {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment successfully updated.');
                this.isEditAttachment[index] = false;
            }));
    }

    sortBy(property) {
        this.column = property;
        this.direction = this.isDesc ? 1 : -1;
    }
}
