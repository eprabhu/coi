import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp, removeTimeZoneFromDateObject } from '../common/utilities/date-utilities';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { ExternalReviewService } from './external-review.service';
import { setFocusToElement } from '../common/utilities/custom-utilities';
declare var $: any;
@Component({
    selector: 'app-external-review',
    templateUrl: './external-review.component.html',
    styleUrls: ['./external-review.component.css']
})
export class ExternalReviewComponent implements OnInit, OnDestroy {
    
    tabName = 'REVIEW';
    reviewList: any = [];
    reviewTypeList: any = [];
    $subscriptions: Subscription[] = [];
    description: any;
    moduleItemKey: any;
    addExternalReviewObject: any = {
        extReviewServiceTypeCode: null,
        deadlineDate: null,
        description: null
    };
    isSaving = false;
    mandatoryList = new Map();
    sendForReviewExtReviewID: any;
    emitChildResponse = new Subject();
    canCreateExternalReview = false;
    availableRights: string[] = this._commonService.externalReviewRights;
    deadLineDateValidation: string;
    isReviewEdit = false;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    tempReviewData: any = {};
    setFocusToElement = setFocusToElement;

    constructor(public _reviewService: ExternalReviewService,
        private _activatedRoute: ActivatedRoute,
        private _commonService: CommonService
    ) { }

    ngOnInit() {
        this.setExternalReviewType();
        this.getDataFromRoute();
        this.getPermissions();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getModuleItemKeyFromRoute(param) {
        this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
            this.moduleItemKey = params[param];
            this._reviewService.moduleDetails.moduleItemKey = this.moduleItemKey;
        }));
    }

    setExternalReviewType() {
        this.$subscriptions.push(this._reviewService.externalReviewType().subscribe((data: any) => {
            this.reviewTypeList = data;
        }));
    }

    saveExternalReview() {
        if (this.checkMandatoryFilled() && !this.isSaving) {
            this.isSaving = true;
            this.addExternalReviewObject.deadlineDate = parseDateWithoutTimestamp(this.addExternalReviewObject.deadlineDate);
            this.$subscriptions.push(this._reviewService
                .saveExternalReview({
                    ...this.addExternalReviewObject,
                    ...this._reviewService.moduleDetails
                }).subscribe((data: any) => {
                    this.reviewList.unshift(data);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review created successfully');
                    this.closeModal();
                    this.isSaving = false;
                    this._reviewService.collapseReview = {};
                    this._reviewService.collapseReview[data.extReviewID] = true;
                    this.deadlineDateValidation();
                }, err => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Create Review failed. Please try again.');
                }));
        }
    }

    updateReview() {
        if (this.checkMandatoryFilled() && !this.isSaving) {
            this.isSaving = true;
            this.addExternalReviewObject.deadlineDate = parseDateWithoutTimestamp(this.addExternalReviewObject.deadlineDate);
            this.$subscriptions.push(this._reviewService
                .updateExternalReview({
                    ...this.addExternalReviewObject,
                    ...this._reviewService.moduleDetails,
                    'isTypeChange': this.tempReviewData.extReviewServiceType.isScoringNeeded
                }).subscribe((data: any) => {
                    this.emitChildResponse.next(data);
                    this.isSaving = false;
                    this.closeModal();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review updated successfully');
                    this.deadlineDateValidation();
                }, err => {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Update review failed. Please try again.');
                }));
        }
    }

    getExternalReview() {
        this.$subscriptions.push(this._reviewService.getExternalReview(this._reviewService.moduleDetails.moduleItemCode, {
            'moduleSubItemCode': this._reviewService.moduleDetails.moduleSubItemCode,
            'moduleItemKey': this.moduleItemKey,
            'moduleSubItemKey': this._reviewService.moduleDetails.moduleSubItemKey
        }).subscribe((data: any) => {
            this.reviewList = data;
        }));
    }

    getDataFromRoute() {
        this.$subscriptions.push(this._activatedRoute.data
            .subscribe(data => {
                this.getProposalSectionConfig(data.dynModuleCode);
                this._reviewService.moduleDetails.moduleItemCode = data.moduleItemCode;
                this._reviewService.moduleDetails.moduleSubItemCode = data.moduleSubItemCode;
                this.setModuleItemKeyForExternalReview();
                this.getExternalReview();
            }));
    }

    getProposalSectionConfig(moduleCode: string) {
        this._commonService.getDashboardActiveModules(moduleCode).subscribe(data => {
            this._reviewService.externalSectionConfig = this._commonService.getSectionCodeAsKeys(data);
        });
    }

    setModuleItemKeyForExternalReview(): void {
        switch (this._reviewService.moduleDetails.moduleItemCode) {
            case 1: this.getModuleItemKeyFromRoute('awardId'); break;
            case 2: this.getModuleItemKeyFromRoute('instituteProposalId'); break;
            case 3: this.getModuleItemKeyFromRoute('proposalId'); break;
            default: break;
        }
    }

    checkMandatoryFilled() {
        this.mandatoryList.clear();
        if (!this.addExternalReviewObject.extReviewServiceTypeCode || this.addExternalReviewObject.extReviewServiceTypeCode === 'null') {
            this.mandatoryList.set('type', '* Please choose a review type.');
        }
        if (!this.addExternalReviewObject.description) {
            this.mandatoryList.set('description', '* Please add description.');
        }
        return this.mandatoryList.size !== 0 ? false : true;
    }

    deadlineDateValidation(): void {
        const REQ_DATE = removeTimeZoneFromDateObject(new Date());
        this.deadLineDateValidation = '';
        if (this.addExternalReviewObject.deadlineDate && compareDates(this.addExternalReviewObject.deadlineDate, REQ_DATE) === -1) {
            this.deadLineDateValidation = 'The selected date has already passed.';
        }
    }

    closeModal() {
        $('#add-reviewer-modal').modal('hide');
        this.mandatoryList.clear();
        this.addExternalReviewObject = {
            extReviewServiceTypeCode: null,
            deadlineDate: null,
            description: null
        };
        this.deadlineDateValidation();
        this.isReviewEdit = false;
        this.tempReviewData = {};
    }

    sendReview() {
        this.$subscriptions.push(this._reviewService.sendReview(this.sendForReviewExtReviewID).subscribe((data: any) => {
            this.sendForReviewExtReviewID = null;
            this.emitChildResponse.next(data);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review sent to ERM successfully');
        },
            err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Send to ERM failed. Please try again.');
            }));
    }

     sendNewReview(event) {
        $('#sendReviewModal').modal('show');
        this.sendForReviewExtReviewID = event;
    }

    setReviewTypeObj() {
        this.addExternalReviewObject.extReviewServiceType = this.reviewTypeList.find(ele =>
            this.addExternalReviewObject.extReviewServiceTypeCode == ele.extReviewServiceTypeCode);
    }

    getPermissions() {
        this.canCreateExternalReview = this.availableRights.includes('CREATE_EXT_REVIEW') ||
        this.availableRights.includes('MODIFY_EXT_REVIEW');
    }

    openReviewModal(event) {
        $('#add-reviewer-modal').modal('show');
        this.isReviewEdit = true;
        this.addExternalReviewObject = JSON.parse(JSON.stringify(event.createReviewObj));
        this.tempReviewData = JSON.parse(JSON.stringify(event.createReviewObj));
        this.addExternalReviewObject.deadlineDate = getDateObjectFromTimeStamp(this.addExternalReviewObject.deadlineDate);
        this.deadlineDateValidation();
    }
}

