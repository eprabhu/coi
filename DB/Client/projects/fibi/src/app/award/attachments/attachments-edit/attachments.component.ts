/** Last updated by Ramlekshmy on 06 May 2020 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonDataService } from '../../services/common-data.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { environment } from '../../../../environments/environment';
import { AttachmentsService } from '../attachments.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { fileDownloader } from '../../../common/utilities/custom-utilities';
import { WebSocketService } from '../../../common/services/web-socket.service';

declare var $: any;
@Component({
  selector: 'app-attachments-edit',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css'],
  providers: [WafAttachmentService]
})
export class AttachmentsEditComponent implements OnInit, OnDestroy {

  isReplaceAttachment = false;
  isShowDeleteAttachment = false;
  isShowAttachmentVersionModal = false;
  isAttachmentListOpen = true;
  attachmentWarningMsg = null;
  isReverse = true;
  isModifyAward = false;
  isAttachmentButtonDisabled = false;
  isSaving = false;

  removeObjIndex: number;
  removeObjId: number;
  documentId: number;
  removeObjDocId: number;
  fileName: string;
  sortBy = 'attachmentTypeCode';
  reverse: number = -1;
  attachmentVersions = [];
  currentUser = this._commonService.getCurrentUserDetail('userName');
  replaceAttachment: any = {};
  uploadedFile = [];
  selectedAttachmentStatus = [];
  selectedAttachmentDescription = [];
  selectedAttachmentType: any[] = [];
  result: any = {};
  awardData: any;
  attachmentStatusList: any = [];
  deployMap = environment.deployUrl;
  isAttachmentEdit: boolean;
  $subscriptions: Subscription[] = [];
  isShowConfidentialAttachment = false;
  isAdminEdit = false;
  temporaryAttachments: any[];
  editAttachmentDetails: any = {narrativeStatus: {description: ''}};

  constructor(private _attachmentsService: AttachmentsService, private _commonService: CommonService,
    private _commonData: CommonDataService, private _activatedRoute: ActivatedRoute,
    private _wafAttachmentService: WafAttachmentService,
    public webSocket:WebSocketService
    ) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data.award;
        this.getPermissions();
        this.getSectionEditableList();
        if (this.awardData.awardId) {
          this.$subscriptions.push(this._attachmentsService.awardAttachmentLookUpData(
            {
              'awardId': this.awardData.awardId,
              'awardNumber': this.awardData.awardNumber,
              'awardSequenceNumber': this.awardData.sequenceNumber,
              'awardLeadUnitNumber': this.awardData.leadUnitNumber
            })
            .subscribe((result: any) => {
              this.result = result;
              this.checkToShowConfidentialAttachments();
              this.filterAttachments();
            }));
        }
      }
    }));
  }
  filterAttachments() {
    this.temporaryAttachments = [];
    const map = new Map();
    for (const item of this.result.newAttachments) {
      if (!map.has(item.documentId)) {
        map.set(item.documentId, true);
        this.temporaryAttachments.push(this.getMaxVersion(item.documentId));
      }
    }
  }

  getMaxVersion(documentId) {
    return this.result.newAttachments.filter(item => item.documentId === documentId)
      .reduce((p, c) => p.versionNumber > c.versionNumber ? p : c);
  }


  /** if the logged user has the right 'VIEW_CONFIDENTIAL_AWARD_ATTACHMENTS',
   * then he/she will be able to see attachments including confidential attachments.
   * For other users, there will not shows dropdown option for adding confidential attachments.*/
  checkToShowConfidentialAttachments() {
    if (!this.isShowConfidentialAttachment) {
      this.result.awardAttachmentTypes =
        this.result.awardAttachmentTypes.filter(element => !element.isPrivate);
      }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /** returns editable permission w.r.t section code
  */
  getSectionEditableList() {
    this.isAttachmentEdit = this._commonData.getSectionEditableFlag('103'); // attachment
  }

  getPermissions() {
    this.isModifyAward = this._commonData.checkDepartmentLevelRightsInArray('MODIFY_AWARD') || this._commonData.checkDepartmentLevelRightsInArray('CREATE_AWARD');
    this.isShowConfidentialAttachment = this._commonData.checkDepartmentLevelRightsInArray('VIEW_CONFIDENTIAL_AWARD_ATTACHMENTS');
    this.isAdminEdit = this._commonData.checkDepartmentLevelRightsInArray('MODIFY_AWARD_ATTACHMENTS_IN_WORKFLOW')
      && this.awardData.awardSequenceStatus === 'PENDING' && !this.awardData.serviceRequestType;
    if (this.isAdminEdit && !this.webSocket.isLockAvailable('Award' + '#' + this._activatedRoute.snapshot.queryParamMap.get('awardId'))) {
      this.isAdminEdit = false;
    }  
  }

  /** get attachment type Code and returns corresponding type description to the table list
  */
  getAttachmentType(typeCode: any) {
    if (this.result.awardAttachmentTypes && typeCode) {
      return String(this.result.awardAttachmentTypes.find(type => type.typeCode === typeCode).description);
    }
  }

  /** get attachment status code and returns corresponding type description to the table list
  */
  getAttachmentStatus(statusCode: any) {
    if (this.result.narrativeStatus && statusCode) {
      return String(this.result.narrativeStatus.find(status => status.code === statusCode).description);
    }
  }

  showAddAttachmentPopUp(attachment) {
    if (this.isReplaceAttachment) {
      this.replaceAttachment = attachment;
    }
  }

  clearAttachmentDetails() {
    this.attachmentWarningMsg = null;
    this.uploadedFile = [];
    this.isReplaceAttachment = false;
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
    if (this.checkMandatoryFilled() && !this.isSaving) {
      this.isSaving = true;
      this.isAttachmentButtonDisabled = true;
      this.setRequestObject();
      if (!this._commonService.isWafEnabled) {
        this.$subscriptions.push(
          this._attachmentsService.addAwardAttachment(this.awardData.sequenceNumber,
            this.awardData.awardId, this.awardData.awardNumber, this.result.newAttachments, this.uploadedFile,
            this.awardData.leadUnitNumber)
            .subscribe((data: any) => {
              this.result.newAttachments = data.newAttachments;
              this.isSaving = false;
              this.filterAttachments();
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
      } else {
        this.addAwardAttachmentsWaf();
      }
    }
  }
  /** sets parameters and calls the function in waf service for splitting attachment which returns data
  * this.result.newAttachments is the array which contains all attachment details such as type, description,status etc.
  * which needs to send as object (awardAttachment i.e details of each attachment, set at remaining = 0) for each file.
  */
  async addAwardAttachmentsWaf() {
    const requestForWaf = {
      'awardId': this.awardData.awardId,
      'awardNumber': this.awardData.awardNumber,
      'awardSequenceNumber': this.awardData.sequenceNumber,
      'personId': this._commonService.getCurrentUserDetail('personID')
    };
    const requestSetAtRemaining = {
      awardAttachment: null
    };
    const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining,
      this.uploadedFile, '/addAwardAttachmentsForWaf', 'awardAttachment', this.result.newAttachments);
    this.checkAttachmentAdded(data);
  }
  /**
  * @param  {} data
  * if data doesn't contains error,adds award attachments to the list.Otherwise shows error toast
  */
  checkAttachmentAdded(data) {
    if (data && !data.error) {
      this.result.newAttachments = data.newAttachments;
      this.filterAttachments();
      this.isAttachmentButtonDisabled = false;
      this.showSuccessToast();
      this.clearAttachmentDetails();
    } else {
      this.showErrorToast();
      this.isAttachmentButtonDisabled = false;
      $('#addAwardAttachment').modal('hide');
    }
  }

  checkMandatoryFilled() {
    this.attachmentWarningMsg = null;
    for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
      if (this.selectedAttachmentType[uploadIndex] === 'null' || !this.selectedAttachmentType[uploadIndex] ||
        this.selectedAttachmentStatus[uploadIndex] === 'null' || !this.selectedAttachmentStatus[uploadIndex]) {
        this.attachmentWarningMsg = '* Please fill all the mandatory fields';
      }
    }
    return !this.attachmentWarningMsg;
  }
  /**setRequestObject - sets request object for adding attachments
  */
  setRequestObject() {
    const tempArrayForAdd = [];
    for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
      const tempObjectForAdd: any = {};
      if (!this.isReplaceAttachment) {
        tempObjectForAdd.typeCode = this.result.awardAttachmentTypes.find(attachtype =>
          attachtype.typeCode === this.selectedAttachmentType[uploadIndex], 10).typeCode;
      } else {
        const attachType = this.result.awardAttachmentTypes.find(attachtype =>
          attachtype.description === this.selectedAttachmentType[uploadIndex]);
        tempObjectForAdd.typeCode = attachType.typeCode;
        tempObjectForAdd.awardAttachmentId = this.replaceAttachment.awardAttachmentId;
      }
      tempObjectForAdd.narrativeStatusCode = this.selectedAttachmentStatus[uploadIndex];
      tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
      tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
      tempObjectForAdd.updateTimestamp = new Date().getTime();
      tempObjectForAdd.updateUser = this._commonService.getCurrentUserDetail('userName');
      tempArrayForAdd[uploadIndex] = tempObjectForAdd;
    }
    this.result.newAttachments = tempArrayForAdd;
  }

  /** shows success toast based on attachment is replaced or not */
  showSuccessToast() {
    const toastMsg = this.isReplaceAttachment ? 'Attachment replaced successfully.' : 'Attachment added successfully.';
    this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
    this.isSaving = false;
  }
  /** shows error toast based on replace attachment or not and wab enabled or not */
  showErrorToast() {
    let toastMsg;
    if (this.isReplaceAttachment) {
      toastMsg = !this._commonService.isWafEnabled ? 'Failed to replace Attachment.' : 'Waf blocked request for replacing Attachment.';
    } else {
      toastMsg = !this._commonService.isWafEnabled ? 'Failed to add Attachment.' : 'Waf blocked request for uploading Attachment.';
    }
    this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
    this.isSaving = false;
  }

  getVersion(documentId, fileName, versionNumber) {
    this.attachmentVersions = [];
    this.documentId = documentId;
    this.fileName = fileName;
    this.attachmentVersions = this.result.newAttachments.filter(attachObj =>
      attachObj.versionNumber !== versionNumber && attachObj.documentId === documentId);
    this.isShowAttachmentVersionModal = true;
  }

  temprySaveAttachments(removeId, removeIndex, removeDocumentId) {
    this.removeObjId = removeId;
    this.removeObjIndex = removeIndex;
    this.isShowDeleteAttachment = true;
    this.removeObjDocId = removeDocumentId;
  }

  deleteAttachments() {
    if (this.removeObjId == null) {
      this.result.newAttachments.splice(this.removeObjIndex, 1);
    } else {
      this.$subscriptions.push(
        this._attachmentsService.deleteAwardAttachment({
          'fileDataId': this.result.newAttachments[this.removeObjIndex].fileDataId,
          'awardId': this._activatedRoute.snapshot.queryParamMap.get('awardId'), 'awardAttachmentId': this.removeObjId,
          'documentId': this.removeObjDocId,
          'awardNumber': this.awardData.awardNumber,
          'awardSequenceNumber': this.awardData.sequenceNumber,
          'awardLeadUnitNumber': this.awardData.leadUnitNumber
        }).subscribe((data: any) => {
            this.result.newAttachments = this.result.newAttachments.filter(A => A.documentId !== this.removeObjDocId);
            this.filterAttachments();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
          },err=>{
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Attachments failed. Please try again.');
          }));
    }
  }

  downloadAwardAttachments(attachment) {
    this._attachmentsService.downloadAwardAttachment(attachment.awardAttachmentId)
      .subscribe(data => {
        fileDownloader(data, attachment.fileName);
      });
  }

  sortAttachmentDetails(sortFieldBy) {
      this.reverse = this.isReverse ? 1 : -1;
      this.sortBy = sortFieldBy;
  }

  updateAttachment(): void {
    this.editAttachmentDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
    $('#editAttachmentModal').modal('hide');
    this.$subscriptions.push(this._attachmentsService.updateAttachmentDetails(
      {
        'awardAttachment': this.editAttachmentDetails,
        'awardId': this.awardData.awardId,
        'awardNumber': this.awardData.awardNumber,
        'awardSequenceNumber': this.awardData.sequenceNumber,
        'leadUnitNumber': this.awardData.leadUnitNumber
      }).subscribe((data: any) => {
        this.result.newAttachments = data;
        this.filterAttachments();
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update Attachment. Please try again.'); },
        () => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment updated successfully.');
        }));
  }

  editAwardModal(attachment: any): void {
    this.editAttachmentDetails = JSON.parse(JSON.stringify(attachment));
    $('#editAttachmentModal').modal('show');
  }

  clearEditAttachmentDetails(): void {
    $('#editAttachmentModal').modal('hide');
    this.editAttachmentDetails = {narrativeStatus: {description: ''}};
  }

  /**downloadAllAttachments - downloads all attachments(latest version only(documentStatusCode === 1))
  */
  downloadAllAttachments() {
    const attachmentIDsArray = [];
    this.result.newAttachments.forEach(element => {
      if (element.documentStatusCode === 1) {
        attachmentIDsArray.push(element.awardAttachmentId);
      }
    });
    this.$subscriptions.push(
      this._attachmentsService.exportAllAwardAttachments({ 'awardId': this.awardData.awardId, 'attachmentIds': attachmentIDsArray })
      .subscribe((data: any) => {
        const filename = 'Project#' + this.awardData.awardId + '-Attachments';
        fileDownloader(data.body, filename, 'zip');
      }));
  }

  showModificationIcons(attachment) {
    return this.isAttachmentEdit && (this.currentUser === attachment.updateUser ||
      this.currentUser === this.awardData.createUser || this.isModifyAward);
  }
}
