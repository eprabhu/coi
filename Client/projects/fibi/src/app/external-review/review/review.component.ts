import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { compareDates, removeTimeZoneFromDateObject } from '../../common/utilities/date-utilities';
import { ExternalReviewService } from '../external-review.service';
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { setFocusToElement } from '../../common/utilities/custom-utilities';

declare var $: any;
@Component({
    selector: 'app-review-ext',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit, OnDestroy {

    @Input() reviewTypes: any;
    @Input() reviewDetails: any;
    @Input() emitChildResponse: Observable<any>;
    @Output() sendForReview: EventEmitter<any> = new EventEmitter<any>();
    @Output() createReview: EventEmitter<any> = new EventEmitter<any>();
    availableRights: string[] = this._commonService.externalReviewRights;

    isEditMode = false;
    tabName = 'QUESTIONNAIRE';
    $subscriptions: Subscription[] = [];
    tempReviewData: any;
    deadLineDateValidation: string;
    setFocusToElement = setFocusToElement;

    constructor(public _commonService: CommonService,
        public _questService: QuestionnaireService,
        public _reviewService: ExternalReviewService) { }

    ngOnInit() {
        this.setViewMode();
        this.updateUserDetailsFromParent();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    setViewMode() {
        this.isEditMode = (this.reviewDetails.extReviewStatus.extReviewStatusCode === 1 &&
        this.availableRights.includes('MODIFY_EXT_REVIEW'));
    }

    getBadgeByStatusCode() {
        if (this.reviewDetails.extReviewStatus.extReviewStatusCode === 1) {
            return 'info';
        } else if (this.reviewDetails.extReviewStatus.extReviewStatusCode === 2) {
            return 'warning';
        } else {
            return 'success';
        }
    }

    emitSendForReview() {
        this.sendForReview.emit(this.reviewDetails.extReviewID);
    }

    updateUserDetailsFromParent() {
        this.$subscriptions.push(this.emitChildResponse.subscribe((data: any) => {
            if (data && this.reviewDetails.extReviewID === data.extReviewID) {
                data.deadlineDate ? this.updateReview(data) : this.updateStatus(data);
                this.setViewMode();
            }
        }));
    }

    updateStatus(data) {
        this.reviewDetails.extReviewStatus = data.extReviewStatus;
        this.reviewDetails.extReviewStatusCode = data.extReviewStatusCode;
        this.reviewDetails.deadlineDate = data.deadlineDate;
    }

    updateReview(data) {
        this.reviewDetails = data;
    }

    setReviewTypeObj() {
        this.reviewDetails.extReviewServiceType = this.reviewTypes.find(ele =>
            this.reviewDetails.extReviewServiceTypeCode == ele.extReviewServiceTypeCode);
    }

    collapseReview(flag: boolean) {
        this._reviewService.collapseReview = {};
        this._reviewService.collapseReview[this.reviewDetails.extReviewID] = !flag;
    }

    addReviewModal() {
        this.createReview.emit({
            'operationType': 'addReview', 'createReviewObj': this.reviewDetails
        });
    }
}

