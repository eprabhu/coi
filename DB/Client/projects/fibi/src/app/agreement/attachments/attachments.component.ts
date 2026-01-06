/** Last updated by Ramlekshmy on 28-01-2020 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';
import { AttachmentsService } from './attachments.service';
import { AgreementCommonDataService } from '../agreement-common-data.service';

declare var $: any;
@Component({
  selector: 'app-attachments-edit',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit, OnDestroy {

  isReplaceAttachment = false;
  isShowDeleteAttachment = false;
  isShowAttachmentVersionModal = false;
  isAttachmentListOpen = true;
  isActivityAttachmentListOpen = true;
  removeObjIndex: number;
  removeObjId: number;
  documentId: number;
  removeObjDocId: number;
  fileName: string;
  attachmentVersions = [];
  result: any = {};
  agreementAttachmentTypes: any = [];
  deployMap = environment.deployUrl;
  $subscriptions: Subscription[] = [];
  negotiationAttachments: any = [];
  isAgreementAdministrator = false;
  isGroupAdministrator = false;
  questionnaireAttachments: any = [];
  attachmentDetails: any = {};
  editAttachmentDetails: any = {};
  editAttachmentIndex: any; 
  replaceIndex: any;
  isShowAddAttachmentModal = false;


  constructor(private _attachmentsService: AttachmentsService, public _commonAgreementData: AgreementCommonDataService
    , private _commonService: CommonService, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this._commonAgreementData.isShowSaveButton = false;
    this.getAgreementGeneralData();
    this.getPermissions();
  }

  getPermissions() {
    this.isAgreementAdministrator = this.result.availableRights.includes('AGREEMENT_ADMINISTRATOR');
    this.isGroupAdministrator = this.result.availableRights.includes('VIEW_ADMIN_GROUP_AGREEMENT');
  }

  openModal(index) {
    this.isReplaceAttachment= true;
    this.replaceIndex = index;
    this.isShowAddAttachmentModal = true;
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.result.agreementAttachments = [];
        this.loadAttachments();
      }
    }));
  }

  loadAttachments() {
    this.$subscriptions.push(this._attachmentsService.loadAgreementAttachments(
      {
        'agreementRequestId': this.result.agreementHeader.agreementRequestId,
        'negotiationId': this.result.agreementHeader.negotiationId
      })
      .subscribe((data: any) => {
        this.result.agreementAttachments = data.agreementAttachments;
        this.negotiationAttachments = data.negotiationsAttachments;
        this.questionnaireAttachments = data.questionnnaireAttachment;
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /** get attachment type Code and returns corresponding type description to the table list
  */
  getAttachmentType(typeCode: any) {
    if (this.result.agreementAttachmentTypes && typeCode) {
      return String(this.result.agreementAttachmentTypes.find(type => type.agreementAttachmentTypeCode === typeCode).description);
    }
  }

  getVersion(documentId, fileName) {
    this.attachmentVersions = [];
    this.documentId = documentId;
    this.fileName = fileName;
    this.attachmentVersions = this.result.agreementAttachments.filter(attachObj =>
      attachObj.documentStatusCode === 2 && attachObj.documentId === documentId);
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
      this.result.agreementAttachments.splice(this.removeObjIndex, 1);
    } else {
      this.$subscriptions.push(
        this._attachmentsService.deleteAgreementAttachment({
          'fileDataId': this.result.agreementAttachments[this.removeObjIndex].fileDataId,
          'agreementRequestId': this._activatedRoute.snapshot.queryParamMap.get('agreementId'), 'agreementAttachmentId': this.removeObjId,
          'documentId': this.removeObjDocId
        })
          .subscribe((data: any) => {
            this.result.agreementAttachments = this.result.agreementAttachments.filter(attachmentObject =>
              attachmentObject.documentId !== this.removeObjDocId);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
          }));
    }
  }

  downloadAgreementAttachments(attachment) {
    this._attachmentsService.downloadAgreementAttachment(attachment.agreementAttachmentId)
      .subscribe(data => {
        if ((window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveBlob(new Blob([data], { type: attachment.mimeType }), attachment.fileName);
        } else {
          this.createDownloadElement(data, attachment.fileName);
        }
      });
  }

  downloadNegotiationAttachments(attachment) {
    if (attachment.negotiationsAttachmentId != null) {
      this.$subscriptions.push(this._attachmentsService.downloadAttachment(attachment.negotiationsAttachmentId)
        .subscribe(data => {
          if ((window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveBlob(new Blob([data], { type: attachment.mimeType }), attachment.fileName);
          } else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(data);
            a.download = attachment.fileName;
            document.body.appendChild(a);
            a.click();
          }
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

  updateAttachments() {
    this.$subscriptions.push(this._attachmentsService.updateAttachmentDetails({agreementAttachment: this.editAttachmentDetails}).subscribe((data: any) => {
      this.result.agreementAttachments.splice(this.editAttachmentIndex,1);
      this.result.agreementAttachments.unshift(data);
      $('#editAgreementAttachmentModal').modal('hide');
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment updated successfully.');
      this.clearEditAttachmentDetails();
    },
    err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Update attatchment action failed. Please try again.'); }
    ));    
  }

  /**downloadAllAttachments - downloads all attachments(latest version only(documentStatusCode === 1))
  */
  downloadAllAttachments() {
    const attachmentIDsArray = [];
    this.result.agreementAttachments.forEach(element => {
      if (element.documentStatusCode === 1) {
        attachmentIDsArray.push(element.agreementAttachmentId);
      }
    });
    this.$subscriptions.push(
      this._attachmentsService.exportAllAgreementAttachments(
        { 'agreementRequestId': this.result.agreementHeader.agreementRequestId, 'attachmentIds': attachmentIDsArray })
        .subscribe((data: any) => {
          const filename = 'Project#' + this.result.agreementHeader.agreementRequestId + '-Attachments.zip';
          (window.navigator as any).msSaveOrOpenBlob ? (window.navigator as any).msSaveBlob
            (new Blob([data.body], { type: 'application/octet-stream' }), filename) : this.createDownloadElement(data.body, filename);
        }));
  }

  createDownloadElement(data, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(data);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  /**downloads file added. */
  downloadQuestionnaireAttachment(attachmentId, attachmentName) {
    this.$subscriptions.push(this._attachmentsService.downloadQuestionnaireAttachment(attachmentId)
      .subscribe((data: any) => {
        const a = document.createElement('a');
        const blob = new Blob([data], { type: data.type });
        a.href = URL.createObjectURL(blob);
        a.download = attachmentName;
        a.id = 'attachment';
        document.body.appendChild(a);
        a.click();
      },
        error => console.log('Error downloading the file.', error),
        () => {
          document.body.removeChild(document.getElementById('attachment'));
    }));
  }

  /**
   * Get location and activity details of the attachment.
   */
  getAttachmentDetails(negotiationLocationId, negotiationActivityId) {
    this.$subscriptions.push(this._attachmentsService.getAttachmentActivityDetails(negotiationLocationId, negotiationActivityId)
    .subscribe((data: any) => {
      this.attachmentDetails = Object.assign({} , data);
      $('#attachment-details-modal').modal('show');
    }));
  }

  clearValues() {
    this.attachmentDetails = {};
    $('#attachment-details-modal').modal('hide');
  }

  editAgreementAttachment(attachment,index) {
    this.editAttachmentDetails = Object.assign({},attachment);
    this.editAttachmentIndex = index;
  }

  clearEditAttachmentDetails() {
    this.editAttachmentDetails = {};
  }

  updateAddedAttachments(event) {
    this.result.agreementAttachments = event.data ? event.data : this.result.agreementAttachments;
    this.isShowAddAttachmentModal = event.isShowAddAttachmentModal;
  }
}
