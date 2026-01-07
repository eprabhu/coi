import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, ETHICS_SAFETY_LABEL } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { scrollIntoView, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { InstituteProposal, SpecialReview, SpecialReviewApprovalType, SpecialReviewType } from '../../institute-proposal-interfaces';
import { DataStoreService } from '../../services/data-store.service';
import { SpecialReviewService } from './special-review.service';

declare var $: any;
@Component({
    selector: 'app-special-review',
    templateUrl: './special-review.component.html',
    styleUrls: ['./special-review.component.css']
})
export class SpecialReviewComponent implements OnInit, OnDestroy {

    @Input() isViewMode = true;

    $subscriptions: Subscription[] = [];
    specialReviews: Array<SpecialReview> = [];
    reviewTypes: Array<SpecialReviewType> = [];
    specialReviewApprovalTypes: Array<SpecialReviewApprovalType> = [];
    errorMap = new Map();
    specialReview: SpecialReview = new SpecialReview();
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    editIndex = -1;
    deleteIndex = -1;
    isSaving = false;
    comment: string;
    title: string;
    instProposalId: any;
    isSpecialReviewWidgetOpen = true;
    isShowReviewResultCard = false;
    isShowLinkComplianceModal = false;
    selectedReviewObject: any = {};
    specialReviewViewObject: any = {};
    isViewProtocolDetails = false;
    setFocusToElement = setFocusToElement;
    integrationApprovalStatusDropdown: any = [];
    acProtocolStatuses: any = [];
    irbProtocolStatuses: any = [];
    ETHICS_SAFETY_LABEL = ETHICS_SAFETY_LABEL;

    constructor(private _dataStore: DataStoreService,
                public _commonService: CommonService,
                private _reviewService: SpecialReviewService,
                private _route: ActivatedRoute) { }

    ngOnInit() {
        this.getSpecialReview();
        this.getDataStoreEvent();
        this.getProposalIdFromUrl();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getDataStoreEvent() {
        this.$subscriptions.push(this._dataStore.dataEvent
            .subscribe((data: any) => {
                if (data.includes('instProposal')) {
                    this.getSpecialReview();
                }
            }));
    }

    getSpecialReview() {
        const data: InstituteProposal = this._dataStore.getData(['instituteProposalSpecialReviews',
            'specialReviewApprovalTypes', 'reviewTypes', 'irbProtocolStatuses', 'acProtocolStatuses', 'instProposal']);
        this.specialReviews = data.instituteProposalSpecialReviews;
        this.specialReviewApprovalTypes = data.specialReviewApprovalTypes;
        this.reviewTypes = data.reviewTypes;
        this.acProtocolStatuses = data.acProtocolStatuses;
        this.irbProtocolStatuses = data.irbProtocolStatuses;
    }

    private getProposalIdFromUrl() {
		this.$subscriptions.push(this._route.queryParams.subscribe(params => {
			this.instProposalId = params.instituteProposalId;
			this.specialReview.proposalId = Number(this.instProposalId);
		}));
	}

    specialReviewTypeChange(): void {
        this.clearSearch();
        this.protocolStatusChange();
        this.clearSpecialReviewCard();
    }

    clearSpecialReviewCard() {
        this.isShowReviewResultCard = false;
        this.specialReview.isProtocolIntegrated = false;
        this.selectedReviewObject = null;
    }

    specialReviewApprovalTypeChange(): void {
        this.specialReview.comments = null;
        this.specialReview.specialReviewApprovalType =
            this.specialReviewApprovalTypes.find(S => S.approvalTypeCode === this.specialReview.approvalTypeCode);
        if (this.specialReview.approvalTypeCode === '4') {
            this.setCommentWhenExemptInIntegration(this.specialReview.specialReviewApprovalType);
        }
    }

    approvalDateValidation(): void {
        this.errorMap.delete('approval_date');
        if (this.specialReview.applicationDate != null && this.specialReview.approvalDate != null) {
            if (compareDates(this.specialReview.approvalDate, this.specialReview.applicationDate) === -1) {
                this.errorMap.set('approval_date', '* Approval date must be on or after application date.');
            }
        }
    }

    expirationDateValidation(): void {
        this.errorMap.delete('expiration_date');
        if (this.specialReview.applicationDate != null && this.specialReview.expirationDate != null) {
            if (compareDates(this.specialReview.expirationDate, this.specialReview.applicationDate) === -1) {
                this.errorMap.set('expiration_date', '* Expiration Date should be on or after Application Date.');
            }
        }
    }

    convertDateToDateObject() {
        this.specialReview.approvalDate = this.specialReview.approvalDate ?
            getDateObjectFromTimeStamp(this.specialReview.approvalDate) : null;
        this.specialReview.expirationDate = this.specialReview.expirationDate ?
            getDateObjectFromTimeStamp(this.specialReview.expirationDate) : null;
        this.specialReview.applicationDate = this.specialReview.applicationDate ?
            getDateObjectFromTimeStamp(this.specialReview.applicationDate) : null;
    }

    convertDateToDateString() {
        this.specialReview.approvalDate = this.specialReview.approvalDate ?
            parseDateWithoutTimestamp(this.specialReview.approvalDate) : null;
        this.specialReview.expirationDate = this.specialReview.expirationDate ?
            parseDateWithoutTimestamp(this.specialReview.expirationDate) : null;
        this.specialReview.applicationDate = this.specialReview.applicationDate ?
            parseDateWithoutTimestamp(this.specialReview.applicationDate) : null;
    }

    validateSpecialReview(): boolean {
        this.errorMap.clear();
        this.approvalDateValidation();
        this.expirationDateValidation();
        if (!this.specialReview.approvalTypeCode || this.specialReview.approvalTypeCode === 'null') {
            this.errorMap.set('approvalStatus', '* Please provide a type');
        }
        if (!this.specialReview.specialReviewCode || this.specialReview.specialReviewCode === 'null') {
            this.errorMap.set('specialReviewType', '* Please provide a status');
        }
        return this.errorMap.size > 0 ? false : true;
    }

    saveOrUpdateSpecialReview(): void {
        if (this.validateSpecialReview() && !this.isSaving) {
            this.convertDateToDateString();
            if (this.specialReview.isProtocolIntegrated) {
                this.clearSpecialReviewType();
            }
            this.saveSpecialReview();
        }
    }

    private clearSpecialReviewType() {
        this.specialReview.approvalTypeCode = null;
        this.specialReview.applicationDate = null;
        this.specialReview.approvalDate = null;
        this.specialReview.expirationDate = null;
        this.specialReview.specialReviewApprovalType = null;
    }

    saveSpecialReview(): void {
        this.isSaving = true;
        if (this.specialReview.isProtocolIntegrated) {
            this.clearSpecialReviewType();
        }
        this.$subscriptions.push(this._reviewService.saveOrUpdateSpecialReview(
            { instituteProposalSpecialReview: this.specialReview})
            .subscribe((data: InstituteProposal) => {
                this.isSaving = false;
                this.updateSpecialReviews(data);
                this._dataStore.updateStoreData({ instituteProposalSpecialReviews: this.specialReviews });
                this.showToast();
                this.resetSpecialReview();
                $('#add-review-modal').modal('hide');
            }, err => {
                this.isSaving = false;
                this.specialReview.isProtocolIntegrated = false;
                this.isShowReviewResultCard = false;
                this._commonService.showToast(HTTP_ERROR_STATUS, (this.editIndex === -1) ?
                    (`Adding ${ETHICS_SAFETY_LABEL} failed. Please try again.`) : (`Updating ${ETHICS_SAFETY_LABEL} failed. Please try again.`));
                $('#add-special-review-modal').modal('hide');
            }));
    }

    updateSpecialReviews(data: any): void {
        if (this.editIndex > -1) {
            this.specialReviews.splice(this.editIndex, 1, data.instituteProposalSpecialReview);
        } else {
            this.specialReviews.push(data.instituteProposalSpecialReview);
        }
    }

    showToast(): void {
        if (this.editIndex === -1) {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `${ETHICS_SAFETY_LABEL} added successfully.`);
        } else {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `${ETHICS_SAFETY_LABEL} updated successfully.`);
        }
    }

    editSpecialReview(index: number): void {
        this.specialReview = JSON.parse(JSON.stringify(this.specialReviews[index]));
        this.convertDateToDateObject();
        this.editIndex = index;
        this.isShowReviewResultCard = false;
        if (this.specialReview.isProtocolIntegrated) {
            this.isShowReviewResultCard = true;
        }
        this.selectedReviewObject = this.specialReview.acProtocol ? this.specialReview.acProtocol : this.specialReview.irbProtocol;
        scrollIntoView('special-review-form');
        this.protocolStatusChange();
    }

    protocolStatusChange() {
        this.specialReview.specialReviewType = this.reviewTypes.find(R =>
            R.specialReviewTypeCode === this.specialReview.specialReviewCode);
        if (this.specialReview.specialReviewCode === '1') {
            this.integrationApprovalStatusDropdown = this.irbProtocolStatuses;
        }
        if (this.specialReview.specialReviewCode === '2') {
            this.integrationApprovalStatusDropdown = this.acProtocolStatuses;
        }
    }

    resetSpecialReview() {
        this.specialReview = new SpecialReview();
        this.specialReview.proposalId = this.instProposalId;
        this.editIndex = -1;
        this.deleteIndex = -1;
        this.resetCommentBox();
        this.resetSpecialReviewCard();
        this.errorMap.clear();
    }

    /**
    *resetCommentBox()
    Reset Special review Comment box height,
    In future changes shall be done in appAutoGrow directive to overcome this issue with comment height.
    */
    resetCommentBox() {
        document.getElementById('prop-special-revw-comnt').style.height = '50px';
    }

    showComment(review: SpecialReview): void {
        this.comment = review.comments;
        this.title = review.specialReviewType.description;
    }

    deleteSpecialReview() {
        if (!this.isSaving) {
            this.isSaving = true;
            const reviewID = this.specialReviews[this.deleteIndex].specialReviewId;
            this.$subscriptions.push(this._reviewService.deleteSpecialReview(this.instProposalId, reviewID)
                .subscribe((data: InstituteProposal) => {
                    this.specialReviews.splice(this.deleteIndex, 1);
                    this._dataStore.updateStoreData({ instituteProposalSpecialReviews: this.specialReviews });
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, `${ETHICS_SAFETY_LABEL} removed successfully.`);
                    this.deleteIndex = -1;
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Removing ${ETHICS_SAFETY_LABEL} failed. Please try again.`);
            }));
        }
    }

    specialReviewAdvSearchClick(event): void {
        this.isShowLinkComplianceModal = false;
        if (event) {
            this.isShowReviewResultCard = true;
            this.selectedReviewObject = event;
            this.specialReview.isProtocolIntegrated = true;
            this.specialReview.protocolNumber = this.selectedReviewObject.protocolNumber;
            this.specialReview.approvalTypeCode = this.selectedReviewObject.protocolStatusCode;
            this.specialReview.applicationDate = getDateObjectFromTimeStamp(this.selectedReviewObject.initialSubmissionDate);
            this.specialReview.approvalDate = getDateObjectFromTimeStamp(this.selectedReviewObject.approvalDate);
            this.specialReview.expirationDate = getDateObjectFromTimeStamp(this.selectedReviewObject.expirationDate);
            if (this.specialReview.specialReviewCode === '1') {
                this.specialReview.irbProtocol = event;
            }
            if (this.specialReview.specialReviewCode === '2') {
                this.specialReview.acProtocol = event;
            }
            this.integratedApprovalTypeChange();
        }
        $('#add-review-modal').modal('show');
    }

    viewProtocolDetails(specialReview): void {
        this.specialReviewViewObject = specialReview;
        this.isViewProtocolDetails = true;
    }

    resetSpecialReviewCard() {
        this.isShowReviewResultCard = false;
        this.specialReview.isProtocolIntegrated = false;
        this.selectedReviewObject = {};
        this.specialReview.approvalTypeCode = null;
        this.specialReview.irbProtocol = null;
        this.specialReview.acProtocol = null;
        this.specialReview.comments = null;
    }

    clearSearch(): void {
        this.specialReview.approvalTypeCode = null;
        this.specialReview.protocolNumber = null;
        this.specialReview.comments = null;
        this.specialReview.applicationDate = null;
        this.specialReview.approvalDate = null;
        this.specialReview.expirationDate = null;
        this.integrationApprovalStatusDropdown = [];
    }

    closeViewModal(event): void {
        this.isViewProtocolDetails = event;
        this.specialReviewViewObject = {};
    }

    integratedApprovalTypeChange(): void {
       const STATUS_CHANGE =
            this.integrationApprovalStatusDropdown.find(S => S.protocolStatusCode === this.specialReview.approvalTypeCode);
        if (this.specialReview.approvalTypeCode === '4') {
            this.setCommentWhenExemptInIntegration(STATUS_CHANGE);
        }
    }

    setCommentWhenExemptInIntegration(specialReviewApprovalStatusObject) {
        this.specialReview.comments = specialReviewApprovalStatusObject.description;
    }

    addNewReview() {
        $('#add-review-modal').modal('hide');
        this.isShowLinkComplianceModal = true;
    }

}

