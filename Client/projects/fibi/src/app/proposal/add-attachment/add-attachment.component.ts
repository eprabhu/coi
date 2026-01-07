// Last Updated By Ramlekshmy I on 23-11-2019
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { ProposalService } from '../services/proposal.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { WafAttachmentService } from '../../common/services/waf-attachment.service';
import { DataStoreService } from '../services/data-store.service';
import { ProposalAttachmentTypes } from '../interface/proposal.interface';

@Component({
    selector: 'app-add-attachment',
    templateUrl: './add-attachment.component.html',
    styleUrls: ['./add-attachment.component.css'],
    providers: [WafAttachmentService]
})

export class AddAttachmentComponent implements OnInit, OnDestroy {

    @Input() addAttachment: any = {};
    @Input() attachment: any = {};
    @Input() result: any = {};
    @Input() dataVisibilityObj: any = {};
    @Input() attachmentType: string;

    attachmentWarningMsg = null;
    uploadedFile = [];
    selectedAttachmentDescription = [];
    selectedAttachmentType: any[] = [];
    selectedAttachmentStatus: any[] = [];
    selectedKeyPersonnel: any[] = [];
    statusSelected: boolean;
    $subscriptions: Subscription[] = [];
    isSaving = false;
    keypersonnal = null;
    personnelAttachTypes = null;
    attachType = null;
    isShowConfidentialAttachment = false;
    isAttachmentHelpText = true;

    constructor(
        private _proposalService: ProposalService,
        private _commonService: CommonService,
        private _wafAttachmentService: WafAttachmentService,
        private _dataStore: DataStoreService
    ) { }

    ngOnInit() {
        document.getElementById('trigger-add-attachment-modal').click();
        this.isShowConfidentialAttachment = this.result.availableRights.includes('VIEW_CONFIDENTIAL_PROPOSAL_ATTACHMENTS');
        this.result.proposalAttachmentTypes = this.checkAndFilterPrivateAttachmentTypes(this.result.proposalAttachmentTypes);
        this.loadPersonnelAttachTypes();
        this.loadProposalKeyPersonnelPerson();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    fileDrop(files) {
        this.attachmentWarningMsg = null;
        for (let index = 0; index < files.length; index++) {
            if (!this.addAttachment.isReplaceAttachment) {
                this.updateAddAttachmentDetails(files, index);
            } else if (this.addAttachment.isReplaceAttachment) {
                this.updateReplaceAttachmentDetails(files, index);
            }
        }
    }

    /**updateAddAttachmentDetails - clears attachment details for Adding attachments
     * @param files
     * @param index
     */
    updateAddAttachmentDetails(files, index) {
        this.uploadedFile.push(files[index]);
        this.selectedAttachmentType[this.uploadedFile.length - 1] = null;
        this.selectedKeyPersonnel[this.uploadedFile.length - 1] = null;
        this.selectedAttachmentDescription[this.uploadedFile.length - 1] = '';
        this.selectedAttachmentStatus[this.uploadedFile.length - 1] = this.result.narrativeStatus[0];
    }

    /**updateReplaceAttachmentDetails - sets attachment details for replacing attachment
     * @param files
     * @param index
     */
    updateReplaceAttachmentDetails(files, index) {
        if (files.length === 1) {
            this.uploadedFile = [];
            this.uploadedFile.push(files[index]);
            this.selectedKeyPersonnel[this.uploadedFile.length - 1] = this.attachment.proposalPersonName;
            this.selectedAttachmentType[this.uploadedFile.length - 1] = this.attachment.attachmentType.description;
            this.selectedAttachmentDescription[this.uploadedFile.length - 1] = this.attachment.description;
            if (this.attachment.narrativeStatus) {
                this.selectedAttachmentStatus[this.uploadedFile.length - 1] = this.getAttachmentStatus(this.attachment.narrativeStatus.code);
            }
        } else {
            this.attachmentWarningMsg = '* Choose only one document to replace';
        }
    }
    getAttachmentStatus(statusCode: any) {
        if (this.result.narrativeStatus && statusCode) {
            return this.result.narrativeStatus.find(type => type.code === statusCode);
        }
    }

    deleteFromUploadedFileList(index) {
        this.selectedAttachmentType.splice(index, 1);
        this.selectedAttachmentDescription.splice(index, 1);
        this.selectedAttachmentStatus.splice(index, 1);
        this.uploadedFile.splice(index, 1);
        this.attachmentWarningMsg = null;
    }

    /**checkMandatoryFilled - Checks for mandatory fields
     * Attachment Type-> for general and for keyperssonel
     * Status -> for general
     * Person -> for keyperssonel
     * returns  attachmentWarningMsg if there any data is missing
     */
    checkMandatoryFilled() {
        this.attachmentWarningMsg = null;
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            if (this.selectedAttachmentType[uploadIndex] === 'null' || this.selectedAttachmentType[uploadIndex] == null) {
                this.attachmentWarningMsg = '* Please fill all the mandatory fields';
            }
            if (this.attachmentType == 'general') {
                if (this.selectedAttachmentStatus[uploadIndex] === 'null' || this.selectedAttachmentStatus[uploadIndex] == null) {
                    this.attachmentWarningMsg = '* Please fill all the mandatory fields';
                }
            }
            if (this.attachmentType == 'keyPerssonel') {
                if (this.selectedKeyPersonnel[uploadIndex] === 'null' || this.selectedKeyPersonnel[uploadIndex] == null) {
                    this.attachmentWarningMsg = '* Please fill all the mandatory fields';
                }
            }
        }
        return !this.attachmentWarningMsg;
    }

    /**setRequestObject - sets request object for adding attachments
     * @param tempArrayForAdd
     */
    setRequestObject(tempArrayForAdd) {
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            const tempObjectForAdd: any = {};
            if (!this.addAttachment.isReplaceAttachment) {
                tempObjectForAdd.attachmentType = this.result.proposalAttachmentTypes.find(attachtype =>
                    attachtype.attachmentTypeCode === parseInt(this.selectedAttachmentType[uploadIndex], 10));
            } else {
                tempObjectForAdd.attachmentType = this.result.proposalAttachmentTypes.find(attachtype =>
                    attachtype.description === this.selectedAttachmentType[uploadIndex]);
                tempObjectForAdd.attachmentId = this.attachment.attachmentId;
            }
            tempObjectForAdd.attachmentTypeCode = tempObjectForAdd.attachmentType.attachmentTypeCode;
            tempObjectForAdd.narrativeStatus = this.selectedAttachmentStatus[uploadIndex];
            tempObjectForAdd.narrativeStatusCode = tempObjectForAdd.narrativeStatus.code;
            tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
            tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
            tempObjectForAdd.updateTimeStamp = new Date().getTime();
            tempObjectForAdd.updateUser = this._commonService.getCurrentUserDetail('userName');
            tempArrayForAdd[uploadIndex] = tempObjectForAdd;
        }
    }

    /**addAttachments -  checks whether all mandatory fields are filled, call service to add attachments */
    addAttachments() {
        const tempArrayForAdd = [];
        if (this.checkMandatoryFilled() && !this.isSaving) {
            this.isSaving = true;
            this.setRequestObject(tempArrayForAdd);
            this.result.newAttachments = tempArrayForAdd;
            this.result.proposal.updateUser = this._commonService.getCurrentUserDetail('userName');
            if (!this._commonService.isWafEnabled) {
                this.$subscriptions.push(
                    this._proposalService.addProposalAttachment(this.uploadedFile, this.result.proposal.proposalId, this.result.newAttachments)
                        .subscribe((success: any) => {
                            this.result.proposalAttachments = success.proposalAttachments;
                            this._dataStore.updateStore(['proposalAttachments'], this.result);
                            this.isSaving = false;
                        },
                            error => {
                                this.showErrorToast();
                                this.isSaving = false;
                            },
                            () => {
                                this.closeAttachmentModal();
                                this.showSuccessToast();
                                this.isSaving = false;
                            }));
            } else {
                this.addProposalAttachmentWaf();
            }
        }
    }
    /** sets parameters and calls the function in waf service for splitting attachment which returns data
     * this.result.newAttachments is the array which contains all attachment details such as type, description,status etc.
     * which needs to send as object (proposalAttachment i.e details of each attachment, set at remaining = 0) for each file.
     */
    async addProposalAttachmentWaf() {
        const requestForWaf = {
            proposalId: this.result.proposal.proposalId,
            userFullName: this._commonService.getCurrentUserDetail('fullName'),
            personId: this._commonService.getCurrentUserDetail('personID')
        };
        const requestSetAtRemaining = {
            proposalAttachment: null
        };
        this.closeAttachmentModal();
        const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining,
            this.uploadedFile, '/addProposalAttachmentForWaf', 'proposalAttachment', this.result.newAttachments);
        this.saveProposalAttachmentsWaf(data);
        this.isSaving = false;
    }
    /**
     * @param  {} data
     * if data doesn't contains error,adds proposal attachments to the list.Otherwise shows error toast
     */
    saveProposalAttachmentsWaf(data) {
        if (data && !data.error) {
            this.result.proposalAttachments = data.proposalAttachments;
            this.showSuccessToast();
        } else {
            this.showErrorToast();
        }
    }

    /** shows success toast based on replace attachment or not */
    showSuccessToast() {
        const toastMsg = this.addAttachment.isReplaceAttachment ? 'Attachment replaced successfully.' : 'Attachment added successfully.';
        this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
    }

    /** shows error toast based on replace attachment or not and wab enabled or not */
    showErrorToast() {
        let toastMsg;
        if (this.addAttachment.isReplaceAttachment) {
            toastMsg = this._commonService.isWafEnabled ? 'Waf blocked request for replacing Attachment.' :
                'Failed to replace Attachment.';
        } else {
            toastMsg = this._commonService.isWafEnabled ? 'Waf blocked request for adding the Attachment.' :
                'Failed to add Attachment.';
        }
        this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
    }


    closeAttachmentModal() {
        document.getElementById('prop-doc-popup-dismiss-btn').click();
        this.addAttachment.isShowAddAttachment = false;
    }

    /**markStatusCompleteOrIncomplete - marks all attachment status to choosed value (Complete/Incomplete)*/
    markStatusCompleteOrIncomplete() {
        let statusCode;
        statusCode = this.statusSelected ? 'C' : 'I';
        this.selectedAttachmentStatus.fill(this.getAttachmentStatus(statusCode));
    }

    /*addPerssonnalAttachment()- for adding perssonnal Attachment
     * gives new attachment and proposalId for inserting
     * returns details of new attachment and it is inserted into corresponding array
     * for replacing use replaceFile(element) and for adding new addFile(element)
     * while replacing concerned attachment in index is removed and replaced with new attachment
    */
    addPerssonnalAttachment() {
        const tempArrayForAdd = [];
        if (this.checkMandatoryFilled() && !this.isSaving) {
            this.isSaving = true;
            this.setRequestObjectForPersonnelAttachment(tempArrayForAdd);
            this.result.newAttachments = tempArrayForAdd;
            this.$subscriptions.push(
                this._proposalService.uploadProposalPersonAttachment(this.result.newAttachments, this.uploadedFile, this.result.proposal.proposalId)
                    .subscribe((data: any) => {
                        this.isSaving = false;
                        this.result.addedCvList = data.proposalPersonAttachments;
                        data.newPersonAttachments.forEach(element => {
                            this.addAttachment.isReplaceAttachment ? this.replaceFile(element) : this.addFile(element);
                        });
                        this._dataStore.updateStore(['proposalPersons', 'addedCvList'], this.result);
                    },
                        error => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, this.addAttachment.isReplaceAttachment ?
                                'Updating Personnel Attatchments failed. Please try again.' : 'Adding Personnel Attatchments failed. Please try again.');
                            this.isSaving = false;
                        },
                        () => {
                            this.closeAttachmentModal();
                            this.showSuccessToast();
                            this.isSaving = false;
                        }));
        }
    }

    /**setRequestObjectForPersonnelAttachment - Sets object for attachment upload
     * for replace case attachment type is copied from concern attachment
     * for insert case attachment type is taken from the loop with compared with list and selected object
     * PersonName is set from the array comparing with selected 'proposalPersonId'
     * proposalPersonId set from selected for added case and from added from already data for replace case
     */
    setRequestObjectForPersonnelAttachment(tempArrayForAdd) {
        for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
            const tempObjectForAdd: any = {};
            if (!this.addAttachment.isReplaceAttachment) {
                tempObjectForAdd.attachmentType = this.personnelAttachTypes.find(attachtype =>
                    attachtype.attachmentTypeCode === parseInt(this.selectedAttachmentType[uploadIndex], 10));
            } else {
                tempObjectForAdd.attachmentType = this.personnelAttachTypes.find(attachtype =>
                    attachtype.description === this.selectedAttachmentType[uploadIndex]);
                tempObjectForAdd.attachmentId = this.attachment.attachmentId;
            }
            tempObjectForAdd.proposalPersonName = this.addAttachment.isReplaceAttachment ? this.selectedKeyPersonnel[uploadIndex] : (this.keypersonnal.find(attachtype =>
                attachtype.proposalPersonId === parseInt(this.selectedKeyPersonnel[uploadIndex], 10))).fullName;
            tempObjectForAdd.attachmentTypeCode = tempObjectForAdd.attachmentType.attachmentTypeCode;
            tempObjectForAdd.proposalPersonId = this.addAttachment.isReplaceAttachment ? this.attachment.proposalPersonId : this.selectedKeyPersonnel[uploadIndex];
            tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
            tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
            tempArrayForAdd[uploadIndex] = tempObjectForAdd;
        }
    }

    /**loadProposalKeyPersonnelPerson()- for loading person added in keyperssonel
     * It is fetched on the basis of proposalId
     * and list of person with proposalpersonId is returned
     */
    loadProposalKeyPersonnelPerson() {
        if (!this.keypersonnal && this.attachmentType === 'keyPerssonel') {
            this._proposalService.loadProposalKeyPersonnelPersons(this.result.proposal.proposalId).subscribe((data: any) => {
                this.keypersonnal = data;
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Key Personnel details failed. Please try again.');
            });
        }
    }

    /**loadPersonnelAttachTypes()- for loading person attachment Types
     * and list of person with proposalpersonId is returned
     */
    loadPersonnelAttachTypes() {
        if (!this.personnelAttachTypes && this.attachmentType === 'keyPerssonel') {
            this._proposalService.loadPersonnelAttachTypes().subscribe((data: any) => {
                this.personnelAttachTypes = this.checkAndFilterPrivateAttachmentTypes(data);
            }, error => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Key Personnel Attachment types failed. Please try again.');
            });
        }
    }

    checkAndFilterPrivateAttachmentTypes(attachmentTypes: Array<ProposalAttachmentTypes>): Array<ProposalAttachmentTypes> {
        if (this.isShowConfidentialAttachment) {
            return attachmentTypes;
        } else {
            return attachmentTypes.filter(element => !element.isPrivate);
        }
    }

    /**
     * replaceFile()- after when replace is sucessfull
     * @param newAttachment
     * Updated the list in attachment tab from the data.proposalPersonAttachments
     * in general tab keyperssonel with corresponding personid
     */
    replaceFile(newAttachment) {
        const personAttach = (this.result.proposalPersons).find(ele => ele.proposalPersonId == newAttachment.proposalPersonId).proposalPersonAttachment;
        personAttach.splice(this.result.addedCvList.find(attachtype =>
            attachtype.attachmentId === newAttachment.attachmentId), 1, newAttachment);
    }

    /**
     * addFile() after when adding a attachment is sucessfull
     * @param newAttachment
     * Updated the list in attachment tab from the data.proposalPersonAttachments
     * after replacing it is also updated in general tab component
     */
    addFile(newAttachment) {
        const personAttach = (this.result.proposalPersons).find(ele => ele.proposalPersonId == newAttachment.proposalPersonId).proposalPersonAttachment;
        personAttach.push(newAttachment);
    }

}
