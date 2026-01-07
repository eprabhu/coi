import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { SupportService } from './support.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit, OnDestroy {

  @Input() result: any = {};
  @Input() showRequestModal: any = {};
  @Input() supportReq: any = {};

  addSupportObj: any = {};
  clarificationData: any = {};
  isClarificationOpen = [];
  uploadedFile = [];
  clarifications: any = {};

  addSupportWarning = null;
  isResearcher = (this._commonService.getCurrentUserDetail('unitAdmin') === 'false');
  isPreReviewSummaryWidgetOpen;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(private _supportService: SupportService,

  public _commonService: CommonService) { }

  ngOnInit() {
    this.$subscriptions.push(this._supportService.loadSupportQuestions(this.supportReq).subscribe((data: any) => {
      this.clarifications = data.preReviews;
    }, err => { },
      () => {
        this.clarifications.forEach((element, index) => {
          this.isClarificationOpen[index] = true;
        });
      }));
    this.isPreReviewSummaryWidgetOpen = true;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  fileDrop(files) {
    for (let index = 0; index < files.length; index++) {
      this.uploadedFile.push(files[index]);
    }
  }

  deleteFromUploadedFileList(index) {
    this.uploadedFile.splice(index, 1);
  }

  getUpdatedClarifications(data) {
    this.clarifications = data;
    this.clarifications.forEach((element, index) => { this.isClarificationOpen[index] = true; });
  }

  /** service call to add review comments and attachments */
  addClarification() {
    if (this.addSupportObj.reviewComment == null || this.addSupportObj.reviewComment === '') {
      this.addSupportWarning = '* Please add atleast one comment to add review.';
    } else if (!this.isSaving) {
      this.isSaving = true;
      this.addSupportObj.updateTimeStamp = new Date().getTime();
      this.addSupportObj.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.addSupportObj.personId = this._commonService.getCurrentUserDetail('personID');
      this.addSupportObj.fullName = this._commonService.getCurrentUserDetail('fullName');
      const formData = new FormData();
      for (let i = 0; i < this.uploadedFile.length; i++) {
        formData.append('files', this.uploadedFile[i], this.uploadedFile[i].name);
      }
      const sendObject = {
        moduleItemCode: this.supportReq.moduleItemCode,
        moduleSubItemCode: this.supportReq.moduleSubItemCode,
        moduleItemKey: this.supportReq.moduleItemKey,
        moduleSubItemKey: this.supportReq.moduleSubItemKey,
        reviewTypeCode: this.supportReq.reviewTypeCode,
        preNewReviewComment: this.addSupportObj,
        preReviewId: this.clarificationData.preReviewId,
        userName: this._commonService.getCurrentUserDetail('userName')
      };
      formData.append('formDataJson', JSON.stringify(sendObject));
      this.$subscriptions.push(this._supportService.addSupportComment(formData).subscribe((data: any) => {
        this.clarifications = data.preReviews;
        this.addSupportObj = {};
        this.isSaving = false;
      }, err => { this.isSaving = false; },
        () => { $('#addSupportModal').modal('hide'); this.isSaving = false; }));
    }
  }

  /** downloads uploaded review attachments
   * @param event
   * @param selectedFileName
   * @param selectedAttachArray
   */
  downloadAttachments(event, selectedFileName, selectedAttachArray: any[]) {
    event.preventDefault();
    const attachment = selectedAttachArray.find(attachmentDetail => attachmentDetail.fileName === selectedFileName);
    if (attachment != null) {
      this.$subscriptions.push(this._supportService.downloadSupportAttachment(attachment.preReviewAttachmentId).subscribe(
        data => {
          fileDownloader(data, selectedFileName);
        }));
    }
  }

  showSupportRequestModal(){
    this.showRequestModal.isRequestSupport = true;
    setTimeout(() => {
        $('#app-generic-support-modal').modal('show'); 
    });      
  }
}
