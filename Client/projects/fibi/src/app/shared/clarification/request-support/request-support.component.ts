import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { SupportService } from '../support/support.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';

declare var $: any;

@Component({
  selector: 'app-request-support',
  templateUrl: './request-support.component.html',
  styleUrls: ['./request-support.component.css']
})
export class RequestSupportComponent implements OnInit, OnDestroy {

  @Input() result: any = {};
  @Input() showRequestModal: any = {};
  @Input() clarifications: any = {};
  @Input() supportReq: any = {};
  @Output() emitClarification: EventEmitter<any> = new EventEmitter<any>();

  supportRequestObj: any = {};
  supportReqWarning = null;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(private _supportService: SupportService, public _commonService: CommonService) { }

  ngOnInit() {
    this.supportRequestObj.preReviewSectionType = null;
    if (this.result.preReviewTypes != null && this.result.preReviewTypes.length > 0) {
      this.supportRequestObj.preReviewType = this.result.preReviewTypes[1];
      this.supportRequestObj.reviewTypeCode = this.result.preReviewTypes[1].reviewTypeCode;
    }
    this.supportRequestObj.moduleItemCode = this.supportReq.moduleItemCode;
    this.supportRequestObj.moduleSubItemCode = this.supportReq.moduleSubItemCode;
    this.supportRequestObj.moduleItemKey = this.supportReq.moduleItemKey;
    this.supportRequestObj.moduleSubItemKey = this.supportReq.moduleSubItemKey;
    this.supportRequestObj.reviewTypeCode = this.supportReq.reviewTypeCode;
    if (this.result.preReviewClarifications.length > 0) {
      const activePreReviewClarifications = this.result.preReviewClarifications.filter(e => e.isActive);
      this.supportRequestObj.preReviewSectionType = activePreReviewClarifications.length ? activePreReviewClarifications[0] : null;
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  selected(value) {
    if (value != null) {
      this.supportRequestObj.reviewerPersonId = value.prncpl_id;
      this.supportRequestObj.reviewerFullName = value.full_name;
      this.supportRequestObj.reviewerEmailAddress = value.email_addr;
    } else {
      this.supportRequestObj.reviewerPersonId = null;
      this.supportRequestObj.reviewerFullName = null;
      this.supportRequestObj.reviewerEmailAddress = null;
    }
  }

  /** assigns reviewer based on validations */
  requestSupport() {
    this.supportReqWarning = null;
    if (this.supportRequestObj.preReviewSectionType == null || this.supportRequestObj.preReviewSectionType === 'null') {
      this.supportReqWarning = '* Please choose a section for support.';
    } else if (this.supportRequestObj.requestorComment == null || this.supportRequestObj.requestorComment === '') {
      this.supportReqWarning = '* Please raise a question for support.';
    }
    if (this.supportReqWarning == null && !this.isSaving) {
      this.isSaving = true;
      this.supportRequestObj.reviewSectionTypeCode = this.supportRequestObj.preReviewSectionType.reviewSectionTypeCode;
      this.supportRequestObj.requestorPersonId = this._commonService.getCurrentUserDetail('personID');
      this.supportRequestObj.requestorFullName = this._commonService.getCurrentUserDetail('fullName');
      this.supportRequestObj.requestorEmailAddress = this._commonService.getCurrentUserDetail('email');
      this.supportRequestObj.requestDate = new Date().getTime();
      this.supportRequestObj.updateTimeStamp = new Date().getTime();
      this.supportRequestObj.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.$subscriptions.push(this._supportService.createSupportQuestion({
        'newPreReview': this.supportRequestObj, 'personId': this._commonService.getCurrentUserDetail('personID')
      })
        .subscribe((data: any) => {
          this.clarifications = data.preReviews;
          this.emitClarification.emit(this.clarifications);
          this.supportRequestObj = {};
          this.isSaving = false;
        }, err => { },
          () => { $('#app-generic-support-modal').modal('hide'); this.showRequestModal.isRequestSupport = false; this.isSaving = false; }));
    }
  }

}
