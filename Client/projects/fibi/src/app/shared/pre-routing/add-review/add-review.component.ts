/**Created and last updated by Ramlekshmy on 13-11-2019 */
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { ReviewService } from '../review/review.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';

declare var $: any;

@Component({
    selector: 'app-add-review',
    templateUrl: './add-review.component.html',
    styleUrls: ['./add-review.component.css'],
})
export class AddReviewComponent implements OnInit, OnDestroy {

    @Input() moduleDetails: any = {};
    @Input() showRequestModal: any = {};
    @Input() preReviews: any = {};
    @Input() preReviewReq: any = {};
    @Input() dataStoreService: any = null;
    @Output() filterResults: EventEmitter<any> = new EventEmitter<any>();

    preReviewRequest: any = {};
    elasticSearchOptions: any = {};
    mandatoryList = new Map();

    clearField: String;
    isError = false;
    $subscriptions: Subscription[] = [];
    isSaving = false;

    constructor(private _reviewService: ReviewService, private _elasticConfig: ElasticConfigService,
        public _commonService: CommonService) { }

    ngOnInit() {
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.showRequestNewReview();
        this.preReviewRequest.preReviewType = this.moduleDetails.preReviewTypes[0];
        this.preReviewRequest.reviewTypeCode = this.moduleDetails.preReviewTypes[0].reviewTypeCode;
        this.preReviewRequest.moduleItemCode = this.preReviewReq.moduleItemCode;
        this.preReviewRequest.moduleSubItemCode = this.preReviewReq.moduleSubItemCode;
        this.preReviewRequest.moduleItemKey = this.preReviewReq.moduleItemKey;
        this.preReviewRequest.moduleSubItemKey = this.preReviewReq.moduleSubItemKey;
        this.preReviewRequest.reviewTypeCode = this.preReviewReq.reviewTypeCode;
        $('#app-generic-pre-review-modal').modal('show');
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
    /**showRequestNewReview - clears all values and shows request new review popup*/
    showRequestNewReview() {
        this.clearField = new String('true');
        this.mandatoryList.clear();
        this.preReviewRequest = {};
        this.preReviewRequest.preReviewSectionType = null;
    }

    /**selected - assign required values from elastic search
     * @param value
     */
    selected(value) {
        if (value != null) {
            this.preReviewRequest.reviewerPersonId = value.prncpl_id;
            this.preReviewRequest.reviewerFullName = value.full_name;
            this.preReviewRequest.reviewerEmailAddress = value.email_addr;
        } else {
            this.preReviewRequest.reviewerPersonId = null;
            this.preReviewRequest.reviewerFullName = null;
            this.preReviewRequest.reviewerEmailAddress = null;
        }
    }

    checkMandatoryFilled() {
        this.mandatoryList.clear();
        this.isError = false;
        this.clearField = new String('false');
        if (this.preReviewRequest.preReviewSectionType == null || this.preReviewRequest.preReviewSectionType === 'null') {
            this.mandatoryList.set('type', '* Please choose a review type.');
        }
        if (this.preReviewRequest.requestorComment == null || this.preReviewRequest.requestorComment === '') {
            this.mandatoryList.set('comment', '* Please add a comment.');
        }
        if (this.preReviewRequest.reviewerPersonId == null) {
            this.mandatoryList.set('person', '* Please choose a reviewer.');
            this.isError = true;
        }
        return this.mandatoryList.size !== 0 ? false : true;
    }

    /**addReviewer - assigns reviewer based on validations */
    addReviewer() {
        if (this.checkMandatoryFilled() && !this.isSaving) {
            this.isSaving = true;
            this.preReviewRequest.reviewSectionTypeCode = this.preReviewRequest.preReviewSectionType.reviewSectionTypeCode;
            this.preReviewRequest.requestorPersonId = this._commonService.getCurrentUserDetail('personID');
            this.preReviewRequest.requestorFullName = this._commonService.getCurrentUserDetail('fullName');
            this.preReviewRequest.requestorEmailAddress = this._commonService.getCurrentUserDetail('email');
            this.preReviewRequest.requestDate = parseDateWithoutTimestamp(new Date().getTime());
            this.preReviewRequest.updateTimeStamp = new Date().getTime();
            this.preReviewRequest.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.$subscriptions.push(this._reviewService.createPreReview({
                'newPreReview': this.preReviewRequest,
                'personId': this._commonService.getCurrentUserDetail('personID')
            })
                .subscribe((data: any) => {
                    this.clearField = new String('true');
                    this.isError = false;
                    this.preReviews = data.preReviews;
                    this.preReviewRequest = {};
                    this.filterResults.emit(this.preReviews);
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, "Review requested successfully.");
                    if (this.dataStoreService) {
                        this.dataStoreService.updateStore(['preReviews'], this);
                    }
                }, err => {this._commonService.showToast(HTTP_ERROR_STATUS, "Requesting Review failed. Please try again."); },
                    () => {
                        $('#app-generic-pre-review-modal').modal('hide');
                        this.showRequestModal.isRequestNewReview = false;
                        this.isSaving = false;
                    }));
        }
    }
}
