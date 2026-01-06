import { Component, OnInit, OnDestroy } from '@angular/core';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { environment } from '../../../environments/environment';
import { AttachmentsService } from './attachments.service';
import { GrantCommonDataService } from '../services/grant-common-data.service';
import { WafAttachmentService } from '../../common/services/waf-attachment.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
declare var $: any;

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css'],
  providers: [WafAttachmentService]
})
export class AttachmentsComponent implements OnInit, OnDestroy {
  fileName: any;
  result: any;
  attachmentWarningMsg = null;
  isShowAttachmentList = true;
  isShowAddAttachment = false;
  uploadedFile = [];
  attachmentVersions = [];
  selectedAttachmentDescription = [];
  selectedAttachmentType: any[] = [];
  replaceAttachmentObject: any = {};
  isReplaceAttachment = false;
  $subscriptions: Subscription[] = [];
  deployMap = environment.deployUrl;
  removeObjectDocId: any;
  attachmentId: any;
  isShowAttachmentVersionModal = false;
  isSaving = false;

  constructor(private _attachmentService: AttachmentsService,
    public _commonService: CommonService, public _commonData: GrantCommonDataService,
    private _wafAttachmentService: WafAttachmentService) { }

  ngOnInit() {
    this.getGrantCallGeneralData();
    if (this.result && this.result.grantCallAttachments.length > 0) {
      this.sortGrantCallAttachments(this.result.grantCallAttachments);
    }
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  showAddAttachmentPopUp(attachment) {
    this.isShowAddAttachment = true;
    this.isReplaceAttachment = true;
    this.uploadedFile = [];
    if (this.isReplaceAttachment) {
      this.replaceAttachmentObject = attachment;
    }
  }

  getVersion(documentId, fileName) {
    this.attachmentVersions = [];
    this.fileName = fileName;
    this.attachmentVersions = this.result.grantCallAttachments.filter(attachObj =>
      attachObj.documentStatusCode === 2 && attachObj.documentId === documentId);
    this.isShowAttachmentVersionModal = true;
  }

  clearAttachmentDetails() {
    this.attachmentWarningMsg = null;
    this.uploadedFile = [];
    this.isShowAddAttachment = false;
    this.isReplaceAttachment = false;
  }
  // look at a the possibility of a spliting into funcution for replace attachement true another one
  // for fasle pass the details as argument and make comments thus others can easily understand
  fileDrop(files) {
    this.attachmentWarningMsg = null;
    for (let index = 0; index < files.length; index++) {
      if (!this.isReplaceAttachment) {
        this.uploadedFile.push(files[index]);
        this.selectedAttachmentType[this.uploadedFile.length - 1] = null;
        this.selectedAttachmentDescription[this.uploadedFile.length - 1] = '';
      } else if (this.isReplaceAttachment === true) {
        if (files.length === 1) {
          this.uploadedFile = [];
          this.uploadedFile.push(files[index]);
          this.selectedAttachmentType[this.uploadedFile.length - 1] = this.replaceAttachmentObject.grantCallAttachType.description;
          this.selectedAttachmentDescription[this.uploadedFile.length - 1] = this.replaceAttachmentObject.description;
        } else {
          this.attachmentWarningMsg = '* Choose only one document to replace';
        }
      }
    }
  }

  deleteFromUploadedFileList(index) {
    this.selectedAttachmentType.splice(index, 1);
    this.selectedAttachmentDescription.splice(index, 1);
    this.uploadedFile.splice(index, 1);
    this.attachmentWarningMsg = null;
  }

  // error condition and completion function create a function and
  // remove the code duplication and commment the  function properly
  addAttachments() {
    this.attachmentWarningMsg = null;
    if (this.checkMandatory() && !this.isSaving) {
      this.isSaving = true;
      this.setAttachmentObject();
      this.result.grantCall.updateUser = this._commonService.getCurrentUserDetail('userName');
      if (!this._commonService.isWafEnabled) {
        this.$subscriptions.push(this._attachmentService.addGrantCallAttachment
          (this.uploadedFile, this.result.grantCall, this.result.newAttachments).subscribe((data: any) => {
            this.addAttachmentActions(data);
          }, error => {
            this.isShowAttachmentList = true;
            this.isShowAddAttachment = false;
            this.clearAttachmentDetails();
            $('#addGrantAttachment').modal('hide');
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Attatchment failed. Please try again.');
            this.isSaving = false;
          }, () => {
            this.isShowAttachmentList = true;
            this.isShowAddAttachment = false;
            this.clearAttachmentDetails();
            $('#addGrantAttachment').modal('hide');
            this.isSaving = false;
          }));
      } else {
        this.addAttachmentsWaf();
      }
    }
  }

  checkMandatory() {
    for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
      if (this.selectedAttachmentType[uploadIndex] === 'null' || !this.selectedAttachmentType[uploadIndex]) {
        this.attachmentWarningMsg = '* Please fill all the mandatory fields';
      }
    }
    return !this.attachmentWarningMsg;
  }

  // this function looks big should be seperated into functions nyMahesh @aravind
  setAttachmentObject() {
    const tempArrayForAdd = [];
    for (let uploadIndex = 0; uploadIndex < this.uploadedFile.length; uploadIndex++) {
      const tempObjectForAdd: any = {};
      if (!this.isReplaceAttachment) {
        const attachTypeObj = this.result.grantCallAttachTypes.find(attachtype =>
          attachtype.grantAttachmentTypeCode === parseInt(this.selectedAttachmentType[uploadIndex], 10));
        tempObjectForAdd.grantCallAttachType = attachTypeObj;
        tempObjectForAdd.grantAttachmentTypeCode = attachTypeObj.grantAttachmentTypeCode;
      } else {
        const attachTypeObj = this.result.grantCallAttachTypes.find(attachtype =>
          attachtype.description === this.selectedAttachmentType[uploadIndex]);
        tempObjectForAdd.grantCallAttachType = attachTypeObj;
        tempObjectForAdd.grantAttachmentTypeCode = attachTypeObj.grantAttachmentTypeCode;
        tempObjectForAdd.attachmentId = this.replaceAttachmentObject.attachmentId;
      }
      tempObjectForAdd.description = this.selectedAttachmentDescription[uploadIndex];
      tempObjectForAdd.fileName = this.uploadedFile[uploadIndex].name;
      tempObjectForAdd.updateTimeStamp = new Date().getTime();
      tempObjectForAdd.updateUser = this._commonService.getCurrentUserDetail('userName');
      tempArrayForAdd[uploadIndex] = tempObjectForAdd;
    }
    this.result.newAttachments = tempArrayForAdd;
  }
  /** sets parameters and calls saveAttachment function in wafAttachmentService and returns response data  */
  async addAttachmentsWaf() {
    $('#addGrantAttachment').modal('hide');
    const requestForWaf = {
      loginPersonId: this._commonService.getCurrentUserDetail('personID')
    };
    const requestSetAtRemaining = {
      grantCall: this.result.grantCall,
      newAttachment: null
    };
    const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining, this.uploadedFile,
      '/addGrantCallAttachmentForWaf', 'grantAttachment', this.result.newAttachments);
    this.checkAttachmentAdded(data);
  }
  /**
   * @param  {} data
   * if data doesn't contains error, attachment added successfully ,otherwise shows error toast
   */
  checkAttachmentAdded(data) {
    if (data && !data.error) {
      this.addAttachmentActions(data);
      this.isShowAttachmentList = true;
      this.isShowAddAttachment = false;
      this.clearAttachmentDetails();
    } else {
      const toastmsg = (!this.isReplaceAttachment) ? 'Waf blocked request for adding attachment' :
        'Waf blocked request for replacing attachment';
      this._commonService.showToast(HTTP_ERROR_STATUS, toastmsg);
      this.isSaving = false;
    }
  }
  /**
   * @param  {} data
   * actions to perform in common for both waf enabled and disabled services after getting response data
   */
  addAttachmentActions(data) {
    this.result.grantCallAttachments = data.grantCallAttachments;
    this.sortGrantCallAttachments(this.result.grantCallAttachments);
    this.updateGrantCallStoreData();
    (!this.isReplaceAttachment) ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment added successfully.') :
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment replaced successfully.');
    this.isSaving = false;
  }

  // please change this to new utility download. by Mahesh @Aravind
  downloadAttachments(attachment) {
    if (attachment.attachmentId != null) {
      this.$subscriptions.push(this._attachmentService.downloadAttachment(attachment.attachmentId)
        .subscribe(data => {
          fileDownloader(data, attachment.fileName);
        }));
    } else {
      const URL = 'data:' + attachment.mimeType + ';base64,' + attachment.attachment;
      const a = document.createElement('a');
      a.href = URL;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
    }
  }

  downloadFundingSchemeAttachments(attachment) {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._attachmentService.downloadFundingSchemeAttachment(attachment.fundingSchemeAttachmentId)
        .subscribe(data => {
          fileDownloader(data, attachment.fileName);
        }, err => { this.isSaving = false; }));
    }
  }

  setGrantAttachmentObject(attachment) {
    this.attachmentId = attachment.attachmentId;
    this.removeObjectDocId = attachment.documentId;
  }

  deleteGrantCallAttachment() {
    this.$subscriptions.push(this._attachmentService.deleteGrantCallAttachment({
      'grantCallId': this.result.grantCall.grantCallId, 'attachmentId': this.attachmentId,
      'userFullName': this._commonService.getCurrentUserDetail('fullName'), 'documentId': this.removeObjectDocId
    }).subscribe((data: any) => {
      this.result.grantCallAttachments = data.grantCallAttachments;
      this.updateGrantCallStoreData();
    },
    err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Attachment failed. Please try again.');
    },
    () => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment removed successfully.');
    }));
  }

  /**
  * setup grant call common data the values that changed after the service call need to be updatedinto the store.
  * every service call wont have all the all the details as reponse so
  * we need to cherry pick the changes and update them to the store.
  */
  updateGrantCallStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setGrantCallData(this.result);
  }

  /**
   * For sorting attachments according to timestamp
   * @param  {} grantCallAttachments
   */
  sortGrantCallAttachments(grantCallAttachments) {
    grantCallAttachments.sort(function (a, b) {
      return b.updateTimeStamp - a.updateTimeStamp;
    });
  }
}
