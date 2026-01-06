/** Last updated by Aravind  on 18-11-2019 */

import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { getDateObjectFromTimeStamp, compareDates, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { OverviewService } from '../../../overview/overview.service';
import { CommonService } from '../../../../common/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { CommonDataService } from '../../../services/common-data.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, ETHICS_SAFETY_LABEL } from '../../../../app-constants';
import { setFocusToElement, scrollIntoView } from '../../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { SpecialReviews } from './special-review-interface';

declare var $: any;
@Component({
  selector: 'app-special-review-edit',
  templateUrl: './special-review-edit.component.html',
  styleUrls: ['./special-review-edit.component.css']
})
export class SpecialReviewEditComponent implements OnInit, OnChanges, OnDestroy {
    @Input() map: any = {};
    @Input() result: any = {};
    @Input() helpText: any = {};
    @Input() lookupData: any = {};

    specialReviews: SpecialReviews = new SpecialReviews();
    setFocusToElement = setFocusToElement;
    warningMsgObj: any = {};
    specialReviewData: any = [];
    removeSpecialReviewId: string;
    index: any;
    awardId: any;
    savedSpecialReviewObject: any = {};
    $subscriptions: Subscription[] = [];
    selectedReviewObject: any = null;
    viewProtocol: any;
    specialReviewViewObject: any = {};
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    isSaving = false;
    isHighlighted = false;
    isShowCollapse = true;
    isSpecialReview = true;
    isShowLinkComplianceModal = false;
    isShowReviewResultCard = false;
    isProtocolIntegrated = false;
    isViewProtocolDetails = false;
    integrationApprovalStatusDropdown: any = [];

    constructor(private _overviewService: OverviewService,
                public _commonService: CommonService,
                private route: ActivatedRoute,
                private _commonData: CommonDataService) { }

    ngOnInit() {
        this.awardId = this.route.snapshot.queryParams['awardId'];
    }

    ngOnChanges() {
        if (this.result.awardSpecialReviews) {
            this.specialReviewData = this.result.awardSpecialReviews;
            this.isHighlighted = this._commonData.checkSectionHightlightPermission('113');
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    specialReviewValidation() {
        this.map.clear();
        this.warningMsgObj.dateWarningText = null;
        if (!this.specialReviews.specialReviewCode ||
            this.specialReviews.specialReviewCode === 'null') {
                this.map.set('specialReviewCode', 'reviewCode');
        }
        if (!this.specialReviews.approvalTypeCode ||
            this.specialReviews.approvalTypeCode === 'null') {
            this.map.set('specialApprovalType', 'approvalType');
        }
        this.validateSpecialReviewDates();
    }

    setSpecialReviewObject() {
        this.specialReviews.awardId = this.result.award.awardId;
        this.specialReviews.awardNumber = this.result.award.awardNumber;
        this.setDateFormatWithoutTimeStamp();
        if (this.specialReviews.isProtocolIntegrated) {
            this.resetSpecialReviewType();
        }
    }

    resetSpecialReviewType() {
        this.specialReviews.approvalTypeCode = null;
        this.specialReviews.applicationDate = null;
        this.specialReviews.approvalDate = null;
        this.specialReviews.expirationDate = null;
    }

    setDateFormatWithoutTimeStamp() {
        this.specialReviews.applicationDate = parseDateWithoutTimestamp(this.specialReviews.applicationDate);
        this.specialReviews.approvalDate = parseDateWithoutTimestamp(this.specialReviews.approvalDate);
        this.specialReviews.expirationDate = parseDateWithoutTimestamp(this.specialReviews.expirationDate);
    }

    addSpecialReview() {
        this.specialReviewValidation();
        if (this.map.size < 1 && this.validateSpecialReviewDates() && !this.isSaving) {
            this.isSaving = true;
            this.setSpecialReviewObject();
            if (this.specialReviews.isProtocolIntegrated) {
                this.resetSpecialReviewType();
            }
            const acType = this.getType(this.specialReviews.awardSpecailReviewId);
            const REQ_OBJ = {
                'specialReview': this.specialReviews,
                'updateType': acType,
                'awardId': this.specialReviews.awardId
            };
            this.$subscriptions.push(this._overviewService.saveSpecialReview(REQ_OBJ).subscribe((data: any) => {
                this.specialReviews = data.specialReview;
                (acType === 'SAVE') ? this.specialReviewData.push(this.specialReviews) :
                                         this.specialReviewData.splice(this.index, 1, this.specialReviews);
                this.warningMsgObj.specialReviewMandatoryFieldsMsg = null;
                this.warningMsgObj.specialReviewDateWarningMsg = null;
                this.specialReviews = new SpecialReviews();
                this.setupAwardStoreData(this.specialReviewData);
                this.setRequiredFlags();
                this.index = null;
                this.resetDropdownValues();
                this.showToast(acType);
                $('#add-review-modal').modal('hide');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, (acType === 'SAVE' ? 'Adding ' : 'Updating ') + "Special Review failed. Please try again.");
                this.isSaving = false;
                this.isSpecialReview = true;
                this.specialReviews.isProtocolIntegrated =  false;
            }));
            this.resetCommentBox();
        }
    }

    setRequiredFlags(): void {
        this.isSaving = false;
        this.isSpecialReview = true;
        this.isShowReviewResultCard = false;
        this.specialReviews.isProtocolIntegrated = false;
    }

    resetDropdownValues(): void {
        this.specialReviews.specialReviewCode = null;
        this.specialReviews.approvalTypeCode = null;
    }

    showToast(acType): void {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, "Special Review " + (acType === 'SAVE' ? 'added ' : 'updated ') + 'successfully.')
    }

    /**
     *resetCommentBox()
      Reset Special review Comment box height,
      In future changes shall be done in appAutoGrow directive to overcome this issue with comment height.
     */
    resetCommentBox() {
        document.getElementById('award-special-review-comnt').style.height = '70px';
    }

    cancelSpecialReviewUpdate() {
        this.isSpecialReview = true;
        this.specialReviews = new SpecialReviews();
        this.specialReviews.specialReviewCode = '';
        this.specialReviews.approvalTypeCode = '';
        this.map.clear();
        this.warningMsgObj.specialReviewDateWarningMsg = null;
        this.warningMsgObj.approvalDate = this.warningMsgObj.expirationDate = false;
        this.resetCommentBox();
        this.resetSpecialReviewCard();
        this.resetDropdownValues();
        this.index = null;
    }

    /**
    * @param  {} typeId
    * get Id's and return type as SAVE if id is null, otherwise return type as UPDATE
    */
    getType(typeId) {
        return (typeId != null ? 'UPDATE' : 'SAVE');
    }

    /**
     * @param savedSpecialReviewObject
     * set type and comment of selected special review. To display in comment modal.
     */
    showSpecialReviewComment(savedSpecialReviewObject) {
        this.savedSpecialReviewObject.comment = savedSpecialReviewObject.comments;
        this.savedSpecialReviewObject.title = savedSpecialReviewObject.specialReview.description;
    }

    editSpecialReview(index: any) {
      this.map.clear();
      this.index = index;
      this.isShowReviewResultCard = false;
      this.isSpecialReview = false;
      this.specialReviewTypeChange(this.specialReviewData[index].specialReviewCode);
      this.specialReviews = Object.assign({}, this.specialReviewData[index]);
      this.specialReviews.applicationDate = getDateObjectFromTimeStamp(this.specialReviews.applicationDate);
      this.specialReviews.approvalDate = getDateObjectFromTimeStamp(this.specialReviews.approvalDate);
      this.specialReviews.expirationDate = getDateObjectFromTimeStamp(this.specialReviews.expirationDate);
      this.selectedReviewObject = this.specialReviews.acProtocol ? this.specialReviews.acProtocol : this.specialReviews.irbProtocol;
      if (this.specialReviews.isProtocolIntegrated) {
        this.isShowReviewResultCard = true;
      }
      scrollIntoView('special-review-form');
    }

    viewProtocolDetails(specialReview): void {
        this.specialReviewViewObject = specialReview;
        this.isViewProtocolDetails = true;
    }

    deleteSpecialReview() {
        if (this.removeSpecialReviewId != null) {
            this.$subscriptions.push(this._overviewService.deleteSpecialReview(
              { 'personId': this._commonService.getCurrentUserDetail('personID'),
                'awardSpecailReviewId': this.removeSpecialReviewId,
                'awardId': this.awardId,
                'updateUser': this._commonService.getCurrentUserDetail('userName')})
                .subscribe(data => {
                    this.specialReviewData.splice(this.index, 1);
                    this.index = null;
                    this.setupAwardStoreData(this.specialReviewData);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, `${ETHICS_SAFETY_LABEL} removed successfully.`);
                },
                err => {  this._commonService.showToast(HTTP_ERROR_STATUS, `Removing ${ETHICS_SAFETY_LABEL} failed. Please try again.`);
            }));
        }
    }

    /* Method to validate special review Application, Approval & Expiration Dates */
    validateSpecialReviewDates() {
        this.warningMsgObj.specialReviewDateWarningMsg = null;
        this.warningMsgObj.approvalDate = this.warningMsgObj.expirationDate = null;
        if (this.specialReviews.applicationDate && this.specialReviews.approvalDate &&
            compareDates(this.specialReviews.applicationDate, this.specialReviews.approvalDate) === 1) {
            this.warningMsgObj.approvalDate = '* Approval date should be on or after Application date';
        }
        if (this.specialReviews.applicationDate && this.specialReviews.expirationDate &&
            compareDates(this.specialReviews.applicationDate, this.specialReviews.expirationDate) === 1) {
            this.warningMsgObj.expirationDate = '* Expiration date should be on or after Application date';
        }
        if (this.specialReviews.approvalDate && this.specialReviews.expirationDate &&
            compareDates(this.specialReviews.approvalDate, this.specialReviews.expirationDate) === 1) {
            this.warningMsgObj.expirationDate = '* Expiration date should be on or after Approval date';
        }
        return !this.warningMsgObj.expirationDate && !this.warningMsgObj.approvalDate ? true : false;
    }

    /**
     * @param  {} data
     * setup award common data the values that changed after the service call need to be updated into the store.
     * every service call wont have all the all the details as response so
     * we need to cherry pick the changes and update them to the store.
     */
    setupAwardStoreData(data) {
        this.result.awardSpecialReviews = data;
        this.updateAwardStoreData();
    }

    updateAwardStoreData() {
        this.result = JSON.parse(JSON.stringify(this.result));
        this._commonData.setAwardData(this.result);
    }

    addNewReview() {
        // this.isShowLinkComplianceModal = true;
        this.specialReviews.approvalTypeCode =
             this.specialReviews.approvalTypeCode ? this.specialReviews.approvalTypeCode : null;
        $('#add-review-modal').modal('hide');
        this.isShowLinkComplianceModal = true;
    }

    specialReviewAdvSearchClick(event) {
      this.isShowLinkComplianceModal = false;
        if (event) {
            this.isShowReviewResultCard = true;
            this.specialReviews.isProtocolIntegrated = true;
            this.selectedReviewObject = event;
            this.specialReviews.approvalTypeCode = this.selectedReviewObject.protocolStatusCode;
            this.specialReviews.protocolNumber = this.selectedReviewObject.protocolNumber;
            this.specialReviews.applicationDate = getDateObjectFromTimeStamp(this.selectedReviewObject.initialSubmissionDate);
            this.specialReviews.approvalDate = getDateObjectFromTimeStamp(this.selectedReviewObject.approvalDate);
            this.specialReviews.expirationDate = getDateObjectFromTimeStamp(this.selectedReviewObject.expirationDate);
            if (this.specialReviews.specialReviewCode === '1') {
                this.specialReviews.irbProtocol = event;
            }
            if (this.specialReviews.specialReviewCode === '2') {
                this.specialReviews.acProtocol = event;
            }
            this.setIntegratedStatusComment();
        }
        $('#add-review-modal').modal('show');
    }

    specialReviewTypeChange(type) {
        this.clearSearch();
        if (type === 'null') {
            this.specialReviews.specialReview = null;
        } else {
            const specialReviewTypeObject = this.getSpecialReviewObject(type);
            if (specialReviewTypeObject) {
                this.specialReviews.specialReview = specialReviewTypeObject;
            }
            if (type === '1') {
                this.integrationApprovalStatusDropdown = this.lookupData.irbProtocolStatuses;
            }
            if (type === '2') {
                this.integrationApprovalStatusDropdown = this.lookupData.acProtocolStatuses;
            }
        }
        this.clearSpecialReviewCard();
    }

    clearSpecialReviewCard() {
        this.isShowReviewResultCard = false;
        this.specialReviews.isProtocolIntegrated = false;
        this.selectedReviewObject = null;
    }

    getSpecialReviewObject(type: string): any {
        return this.lookupData.reviewTypes.find(specialReviewType => specialReviewType.specialReviewTypeCode === type);
    }

    specialReviewApprovalStatusChange(statusCode) {
            if (statusCode === 'null') {
                this.specialReviews.specialReviewApprovalType = null;
            } else {
                this.specialReviews.comments = '';
                const specialReviewApprovalStatusObject = this.getApprovalStatusObject(statusCode);
                this.specialReviews.specialReviewApprovalType = specialReviewApprovalStatusObject;
                if (statusCode === '4') {
                    this.setStatusAsComment(specialReviewApprovalStatusObject);
                }
            }
    }

    getApprovalStatusObject(statusCode: string): any {
        return this.lookupData.approvalStatusTypes.find(approvalType => approvalType.approvalTypeCode === statusCode);
    }

    resetSpecialReviewCard() {
        this.isShowReviewResultCard = false;
        this.specialReviews.isProtocolIntegrated = false;
        this.selectedReviewObject = {};
        this.specialReviews.approvalTypeCode = null;
        this.specialReviews.irbProtocol = this.specialReviews.acProtocol = null;
    }

    clearSearch(): void {
        this.specialReviews.approvalTypeCode = null;
        this.specialReviews.protocolNumber = null;
        this.specialReviews.comments = null;
        this.specialReviews.applicationDate = null;
        this.specialReviews.approvalDate = null;
        this.specialReviews.expirationDate = null;
        this.integrationApprovalStatusDropdown = [];
        this.map.clear();
      }

    closeViewModal(event: boolean) {
        this.isViewProtocolDetails = event;
        this.specialReviewViewObject = {};
    }

    setIntegratedStatusComment(): void {
        const STATUS_CHANGE =
            this.integrationApprovalStatusDropdown.find(protocol => protocol.protocolStatusCode === this.specialReviews.approvalTypeCode);
        if (this.specialReviews.approvalTypeCode === '4') {
            this.setStatusAsComment(STATUS_CHANGE);
        }
    }

    setStatusAsComment(specialReviewApprovalStatusObject) {
        this.specialReviews.comments = specialReviewApprovalStatusObject.description;
    }
}
