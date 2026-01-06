import { Component, OnInit, OnDestroy } from '@angular/core';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';

import { ProposalService } from '../services/proposal.service';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { environment } from '../../../environments/environment';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { WebSocketService } from '../../common/services/web-socket.service';
import { DataStoreService } from '../services/data-store.service';

declare var $: any;

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.css']
})
export class AttachmentComponent implements OnInit, OnDestroy {

  result: any = {};
  proposalDataBindObj: any = {};
  warningMsgObj: any = {};

  isReverse = true;
  attachmentStatus: boolean;

  sortBy: string;
  reverse = 'DESC';
  attachmentVersions = [];
  isKeyPersonnelAttachmentEdit = [];
  departmentLevelRights: any = [];
  attachmentFlags: any = {};
  replaceAttachment: any = {};
  attachmentDetails: any = {};
  $subscriptions: Subscription[] = [];
  deployMap = environment.deployUrl;
  isAdminEdit = false;
  isSaving = false;
  isReplaceAttachmentEnabled = false;
  addedCvList: [];
  isDesc: any;
  direction = 1;
  sortListBy: any;
  isFormOpen = false;
  attachmentType = '';
	dataDependencies = [ 'proposal', 'availableRights', 'proposalAttachmentTypes', 'proposalPersons',
    'addedCvList', 'proposalAttachments', 'narrativeStatus', 'dataVisibilityObj' ];
  personnelAttachTypes: any = [];
  editAttachmentDetails: any = {narrativeStatus: {description: ''}};
  editPersonnelAttachmentDetails: any = {};
  modalDropdownArray: any = [];
  textAreaEdit: any;
  isShowPersonalAttachmentStatus: any;
  editProposalIndex: number;
  editPersonalIndex: number;

  constructor(
    public _proposalService: ProposalService,
    private _commonService: CommonService,
    private _webSocket: WebSocketService,
    private _dataStore: DataStoreService
  ) { }

  ngOnInit() {
    this.getDataFromStore();
		this.listenDataChangeFromStore();
    this.fetchProposalAttachments();
    this.getAllAddedCV();
  }

  private getDataFromStore() {
		this.result = this._dataStore.getData(this.dataDependencies);
        this.departmentLevelRights = this.result.availableRights;
	}

	private listenDataChangeFromStore() {
		this.$subscriptions.push(
			this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
				if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
					this.getDataFromStore();
				}
			})
		);
	}

  getAllAddedCV() {
    this.$subscriptions.push(this._proposalService.loadProposalKeyPersonAttachments({
      'proposalId': this.result.proposal.proposalId,
      'sortBy': null, 'reverse': null
    }).subscribe((data: any) => {
      this.result.addedCvList = data;
      this._dataStore.updateStore(['addedCvList'], this.result);
    }));
  }

  sortResult(type) {
    this.isDesc = !this.isDesc;
    this.sortListBy = type;
    this.direction = this.isDesc ? 1 : -1;
  }

  downloadProposalPersonCV(attachment: any) {
    this.$subscriptions.push(this._proposalService.downloadProposalPersonAttachment(attachment.attachmentId)
      .subscribe(data => {
        fileDownloader(data, attachment.fileName);
      })
    );
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**fetchProposalAttachments - fetches proposal attachments*/
  fetchProposalAttachments() {
    this.$subscriptions.push(this._proposalService.loadProposalAttachments({
      'proposalId': this.result.proposal.proposalId,
      'proposalStatusCode': this.result.proposal.statusCode
    }).subscribe((data: any) => {
      this.result.proposalAttachments = data.proposalAttachments;
      this.result.narrativeStatus = data.narrativeStatus;
      this.isReplaceAttachmentEnabled = data.isReplaceAttachmentEnabled;
      this._dataStore.updateStore(['proposalAttachments'], this.result);
      if (!this.result.dataVisibilityObj.isProposalSummary) {
        [2, 36].includes(this.result.proposal.proposalStatus.statusCode) &&
          this.checkDepartmentLevelRightsInArray('MODIFY_PROPOSAL_ATTACHMENTS_IN_WORKFLOW') ?
          this.setAttachmentEditableForAdmin() : this.setAttachmentMode();
      }
    }));
  }

  /**setAttachmentEditableForAdmin - sets isAttachmentEditable to true if proposal status is Approval In Progress and
   * have MODIFY_PROPOSAL_ATTACHMENTS_IN_WORKFLOW Right. This is used for making Application Admin having this right
   * can able to Add/Replace/Delete Attachment during Routing
  */
  setAttachmentEditableForAdmin() {
    const lockId = 'Proposal' + '#' + this.result.proposal.proposalId;
    this.result.dataVisibilityObj.isAttachmentEditable =  this._webSocket.isLockAvailable(lockId);
    this.isAdminEdit = this._webSocket.isLockAvailable(lockId);
    this._dataStore.updateStore(['dataVisibilityObj'], this.result);
  }

  /**setAttachmentMode - sets isAttachmentEditable to true if proposal status is NOT Awarded(code = 11), Withdrawn(code = 12),
  * Unsuccessful(code = 29), Not Submitted(code = 30), Inactive(code = 35) and still proposal is in view mode and user has
  * MODIFY_PROPOSAL_ATTACHMENTS right*/
  setAttachmentMode() {
    const proposalStatus = this.result.proposal.proposalStatus.statusCode;
    if (proposalStatus !== 11 && proposalStatus !== 12 && proposalStatus !== 29 && proposalStatus !== 30 && proposalStatus !== 35
      && proposalStatus !== 37 && proposalStatus !== 38 && proposalStatus !== 40 && proposalStatus !== 2 && proposalStatus !== 8) {
      if (this.result.dataVisibilityObj.mode === 'view') {
        if (this.result.proposalAttachments.length > 0) {
          const lockId = 'Proposal' + '#' + this.result.proposal.proposalId;
          this.result.dataVisibilityObj.isAttachmentEditable = this.checkDepartmentLevelRightsInArray('MODIFY_PROPOSAL_ATTACHEMNTS') ?
            true : false;
            this.result.dataVisibilityObj.isAttachmentEditable =  this.result.dataVisibilityObj.isAttachmentEditable &&
            this._webSocket.isLockAvailable(lockId);
        } else {
          this.result.dataVisibilityObj.isAttachmentEditable = false;
        }
      }
    } else {
      this.result.dataVisibilityObj.isAttachmentEditable = false;
    }
    this._dataStore.updateStore(['dataVisibilityObj'], this.result);
  }
  /**getVersion - sets details of current version of attachment selected
  * @param documentId
  * @param fileName
  * file version is determined by documentId and documentStatusCode === 2(archive)
  */
  getVersion(documentId, fileName, attachmentType) {
    this.attachmentVersions = [];
    this.attachmentDetails.documentId = documentId;
    this.attachmentDetails.fileName = fileName;
    this.attachmentVersions = (attachmentType === 'keyPerssonel') ?
      this.result.addedCvList.filter(attachObj => attachObj.documentStatusCode === 2 && attachObj.documentId === documentId) :
      this.result.proposalAttachments.filter(attachObj => attachObj.documentStatusCode === 2 && attachObj.documentId === documentId);
  }

  /**tempSaveAttachments - saves attachment details before details
  * @param removeId
  * @param removeIndex
  * @param removeDocumentId
  */
  tempSaveAttachments(removeId, removeIndex, removeDocumentId) {
    this.attachmentDetails.id = removeId;
    this.attachmentDetails.index = removeIndex;
    this.attachmentDetails.removeDocId = removeDocumentId;
  }

  deleteAttachments() {
    if (this.attachmentDetails.id == null) {
      this.result.proposalAttachments.splice(this.attachmentDetails.index, 1);
    } else {
      this.$subscriptions.push(this._proposalService.deleteProposalAttachment({
        'proposalId': this.result.proposal.proposalId, 'attachmentId': this.attachmentDetails.id,
        'userFullName': this._commonService.getCurrentUserDetail('fullName'), 'documentId': this.attachmentDetails.removeDocId,
        'updateUser': this._commonService.getCurrentUserDetail('userName')
      }).subscribe(data => {
        this.result.proposalAttachments = this.result.proposalAttachments.filter(attachmentObject =>
          attachmentObject.documentId !== this.attachmentDetails.removeDocId);
        this._dataStore.updateStore(['proposalAttachments'], this.result);
      },
        error => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to remove Attachment.'); },
        () => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment removed successfully.');
        }));
    }
  }

  downloadProposalAttachments(attachment) {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._proposalService.downloadProposalAttachment(attachment.attachmentId)
        .subscribe(data => {
          fileDownloader(data, attachment.fileName);
          this.isSaving = false;
        }, err => { this.isSaving = false; }));
    }
  }

  /**sortAttachmentDetails - service call to sort attachment using the column selected*/
  sortAttachmentDetails(sortFieldBy) {
    this.reverse = this.isReverse === true ? 'DESC' : 'ASC';
    this.sortBy = sortFieldBy;
    this.$subscriptions.push(this._proposalService.fetchSortedAttachments({
      'proposalId': this.result.proposal.proposalId,
      'sortBy': this.sortBy, 'reverse': this.reverse
    }).subscribe((data: any) => {
      this.result.proposalAttachments = data.newAttachments;
    }));
  }

  /**updateAttachmentDetails - saves details after editing
  * @param attachment
  * @param index
  */
  updateAttachmentDetails() {
    this.updateAttachmentStatus(this.editAttachmentDetails);
    this.updateAttachmentType(this.editAttachmentDetails);
    $('#editAttachmentModal').modal('hide');
    this.editAttachmentDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.$subscriptions.push(this._proposalService.updateAttachmentDetails({
      'updateUser': this._commonService.getCurrentUserDetail('userName'),
      'proposalId': this.result.proposal.proposalId,
      'proposalAttachment': this.editAttachmentDetails,
    }).subscribe((data: any) => {
      this.result.proposalAttachments = data;
      this._dataStore.updateStore(['proposalAttachments'], this.result);
      this.openNotifyApproverModal();
    }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update Attachment. Please try again.'); },
      () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment successfully updated.');
      }));
  }

  editProposalModal(attachment: any, index: number): void {
    this.editProposalIndex = index;
    this.editAttachmentDetails = JSON.parse(JSON.stringify(attachment));
    this.modalDropdownArray =  this.result.proposalAttachmentTypes;
    this.textAreaEdit = this.editAttachmentDetails.description;
    this.isShowPersonalAttachmentStatus = true;
    this.attachmentStatus = null;
    $('#editAttachmentModal').modal('show');
  }

  clearEditAttachmentDetails(): void {
    this.editAttachmentDetails = {narrativeStatus: {description: ''}};
  }

  updateAttachmentType(attachment) {
    // tslint:disable-next-line:triple-equals
    const typeObj = this.result.proposalAttachmentTypes.find(element => element.attachmentTypeCode == attachment.attachmentTypeCode);
    attachment.attachmentType = typeObj;
  }

  loadPersonnelAttachTypes(index: number, file: any): void {
    this.editPersonalIndex = index;
    this.editAttachmentDetails = JSON.parse(JSON.stringify(file));
    $('#editAttachmentModal').modal('show');
    this.isShowPersonalAttachmentStatus = false;
    this._proposalService.loadPersonnelAttachTypes().subscribe((data: any) => {
      this.personnelAttachTypes = data;
      this.modalDropdownArray = this.personnelAttachTypes;
      this.textAreaEdit = this.editAttachmentDetails.description;
      this.isKeyPersonnelAttachmentEdit[index] = true;
    }, error => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Key Personnel Attachment types failed. Please try again.');
    });
  }


  /**updateAttachmentStatus - sets the corresponding status object to attachment as the binded value is only description
  * @param attachment
  */
  updateAttachmentStatus(attachment: any) {
    const attachmentStatusObj = this.result.narrativeStatus.find(status =>
      status.code === attachment.narrativeStatusCode);
    attachment.narrativeStatus = attachmentStatusObj;
    attachment.narrativeStatusCode = attachmentStatusObj.code;
  }
  /**openNotifyApproverModal - notifies approver if all attachment status is chnaged to complete */
  openNotifyApproverModal() {
    if (this.result.proposal.statusCode === 2 || this.result.proposal.statusCode === 27) {
      let isDocCompleted = false;
      const docStatus = this.result.proposalAttachments.find(attachObj =>
        attachObj.narrativeStatusCode === 'I' && attachObj.documentStatusCode === 1);
      isDocCompleted = docStatus != null ? false : true;
      if (isDocCompleted) {
        this.result.dataVisibilityObj.isShowNotifyApprover = true;
        document.getElementById('trigger-notify-complete-modal').click();
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
      }
    }
  }

  checkDepartmentLevelRightsInArray(input) {
    if (this.departmentLevelRights != null && this.departmentLevelRights.length) {
      return this.departmentLevelRights.includes(input);
    } else {
      return false;
    }
  }

  /**downloadAllAttachments - downloads all attachments(latest version only(documentStatusCode === 1))*/
  downloadAllAttachments() {
    const attachmentIDsArray: any = [];
    this.result.proposalAttachments.forEach(element => {
      if (element.documentStatusCode === 1) {
        attachmentIDsArray.push(element.attachmentId);
      }
    });
    this.$subscriptions.push(
      this._proposalService.downloadAllAttachments({ 'proposalId': this.result.proposal.proposalId, 'attachmentIds': attachmentIDsArray })
        .subscribe((data: any) => {
          fileDownloader(data.body, 'Proposal#' + this.result.proposal.proposalId + '-Attachments.zip');
        }));
  }

  downloadAllPersonAttachments() {
    this.$subscriptions.push(
      this._proposalService.downloadAllPersonAttachments({ 'proposalId': this.result.proposal.proposalId })
        .subscribe((data: any) => {
          fileDownloader(data.body, 'Proposal#' + this.result.proposal.proposalId + '-Attachments.zip');
        }));
  }

  /**markStatusCompleteOrIncomplete - marks all attachment statuses as a whole
  * @param status
  */
  markStatusCompleteOrIncomplete(status) {
    const narrativeStatusCode = status;
    this.$subscriptions.push(this._proposalService.updateAttachmentStatus({
      'proposalId': this.result.proposal.proposalId,
      'narrativeStatusCode': narrativeStatusCode, 'userName': this._commonService.getCurrentUserDetail('userName')
    }).subscribe((data: any) => {
      this.result.proposalAttachments = data;
    },
      err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update Status. Please try again.'); },
      () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Status successfully updated.');
      }));
  }

  /**
   * deleteKeyPerssonelAttachments() - to delete perssonel attachment list
   * documentId proposalId fileDataId attachmentId is given
   * then removed attachment is also deleted from general tab keyperssonnels(308 309)
   */
  deleteKeyPerssonelAttachments() {
    if (!this.isSaving) {
      this.isSaving = true;
      const tempDelete = {
        'attachmentId': this.attachmentDetails.attachmentId,
        'fileDataId': this.attachmentDetails.fileDataId,
        'proposalId': this.result.proposal.proposalId,
        'documentId': this.attachmentDetails.documentId
      };
      this.$subscriptions.push(this._proposalService.deleteKeyPersonnelAttachment(tempDelete
      ).subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment removed successfully.');
          const personAttach = this.result.proposalPersons
            .find(ele => ele.proposalPersonId === this.attachmentDetails.proposalPersonId);
          personAttach.proposalPersonAttachment = personAttach.proposalPersonAttachment
            .filter(A => A.documentId !== this.attachmentDetails.documentId);
            this.result.addedCvList = this.result.addedCvList.filter(A => A.documentId !== this.attachmentDetails.documentId);
            this._dataStore.updateStore(['proposalPersons', 'addedCvList'], this.result);
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to remove Attachment.');
      }));
      this.isSaving = false;
    }
  }

  /**
   * tempDeleteKeyperssonnalAttachments()-to set delete object detail
   * @param file
   * @param index
   */
  tempDeleteKeyperssonnalAttachments(file, index) {
    this.attachmentDetails = file;
    this.attachmentDetails.index = index;
  }

  /**
   * updateKeyPerssonnelAttachmentDetails-to update description when edited
   * need to find the key person attachment and then need to update the description edited.
   * to do that we are finding person from the proposal persons then finding the attachment
   * of that particular person then we update the  description.
   * @param attachment
   * @param index
   */
    updateKeyPerssonnelAttachmentDetails() {
        if (!this.isSaving) {
            this.isSaving = true;
            $('#editAttachmentModal').modal('hide');
            this.updatePersonalAttachmentType(this.editAttachmentDetails);
            this.$subscriptions.push(this._proposalService.updateKeyPersonnelAttachment(this.editAttachmentDetails)
                .subscribe((data: any) => {
                    this.updateAttachment(data);
                    const PERSON_ATTACHMENT = this.getPersonAttachment();
                    const ATTACHMENT = this.getAttachment(data, PERSON_ATTACHMENT);
                    this.updatePersonAttachment(ATTACHMENT, data);
                    this._dataStore.updateStore(['proposalPersons', 'addedCvList'], this.result);
                },
                    err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update Attachment. Please try again.'); },
                    () => {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment successfully updated.');
                        this.isKeyPersonnelAttachmentEdit[this.editPersonalIndex] = false;
                    }));
        } this.isSaving = false;
    }

  updatePersonAttachment(ATTACHMENT, data): void {
    if (ATTACHMENT) {
      ATTACHMENT.description = data.proposalPersonAttachment.description;
      ATTACHMENT.attachmentType = data.proposalPersonAttachment.attachmentType;
      ATTACHMENT.updateTimestamp = data.proposalPersonAttachment.updateTimestamp;
      ATTACHMENT.lastUpdateUserFullName = data.proposalPersonAttachment.lastUpdateUserFullName;
    }
  }

  updateAttachment(data): void {
    this.result.addedCvList[this.editPersonalIndex].attachmentType = data.proposalPersonAttachment.attachmentType;
    this.result.addedCvList[this.editPersonalIndex].attachmentTypeCode = data.proposalPersonAttachment.attachmentTypeCode;
    this.result.addedCvList[this.editPersonalIndex].description = data.proposalPersonAttachment.description;
    this.result.addedCvList[this.editPersonalIndex].updateTimestamp = data.proposalPersonAttachment.updateTimestamp;
    this.result.addedCvList[this.editPersonalIndex].lastUpdateUserFullName = data.proposalPersonAttachment.lastUpdateUserFullName;

  }

  getPersonAttachment(): any {
    return this.result.proposalPersons.find(P => P.proposalPersonId === this.editAttachmentDetails.proposalPersonId);
  }

  getAttachment(data: any, PERSON_ATTACHMENT: any): any {
    return PERSON_ATTACHMENT.proposalPersonAttachment.find(A => A.attachmentId === data.proposalPersonAttachment.attachmentId);
  }

  updatePersonalAttachmentType(attachment) {
    // tslint:disable-next-line:triple-equals
    const TYPE_OBJECT = this.personnelAttachTypes.find(element => element.attachmentTypeCode == attachment.attachmentTypeCode);
    attachment.attachmentType = TYPE_OBJECT;
  }

  /**Method to set attachment updation flags and type
   * Since same method has been called for add new attachment and replace,
   * we are setting the flags and updating the replaced attachment via this method
   * @param attachment - replaced attachment object, it will be null in case of add new attachment
   */
  setAttachmentFlagsOnAddOrReplace(attachment: any): void {
    this.attachmentFlags.isReplaceAttachment = attachment ? true : false;
    this.attachmentFlags.isShowAddAttachment = true;
    if (attachment) {
      this.replaceAttachment = attachment;
    }
    this.attachmentType = 'general';
    this.attachmentStatus = null;
  }
}
