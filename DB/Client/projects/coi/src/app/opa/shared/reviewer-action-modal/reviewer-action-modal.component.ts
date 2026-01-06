import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataStoreService } from '../../services/data-store.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import {OpaService} from '../../services/opa.service';
import {isEmptyObject} from '../../../../../../fibi/src/app/common/utilities/custom-utilities';
import {OPA} from '../../opa-interface';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';

@Component({
    selector: 'app-reviewer-action-modal',
    templateUrl: './reviewer-action-modal.component.html',
    styleUrls: ['./reviewer-action-modal.component.scss']
})

export class ReviewerActionModalComponent implements OnInit, OnDestroy {

    currentReviewer: any = {};
    $subscriptions: Subscription[] = [];
    reviewerList: any = [];
    reviewDescription = '';
    completeReviewHelpText = 'You are about to complete the review.';
    startReviewHelpText = 'You are about to start the review.';

    private timeoutRef: ReturnType<typeof setTimeout>;

    constructor( private _opaService: OpaService,
                 private _dataStore: DataStoreService,
                 private _commonService: CommonService ) { }

    ngOnInit() {
        this.getReviewerDetails();
        const DATA = this._dataStore.getData();
        this.reviewerList = DATA.opaReviewerList || [];
        document.getElementById(this._opaService.actionButtonId).click();
    }

    ngOnDestroy() {
        clearTimeout(this.timeoutRef);
        subscriptionHandler(this.$subscriptions);
    }

    getReviewerDetails() {
        this.$subscriptions.push(this._opaService.$SelectedReviewerDetails.subscribe((res: any) => {
            if (!isEmptyObject(res)) {
                this.currentReviewer = res;
            }
        }, _err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching reviewer details. Please try again.')
        }));
    }

    startCOIReview() {
        this.$subscriptions.push(this._opaService.startReviewerReview({
            opaReviewId: this.currentReviewer.opaReviewId,
            opaDisclosureId: this.currentReviewer.opaDisclosureId,
            description: this.reviewDescription
        })
            .subscribe((res: any) => {
            this.updateDataStore(res);
            this.currentReviewer = {};
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Review started successfully.`);
        }, error => {
            this.closeModal();
            if (error.status === 405) {
                this._commonService.concurrentUpdateAction = 'Start Review';
            } else {
                this.currentReviewer = {};
                this._commonService.showToast(HTTP_ERROR_STATUS, `Error in starting review.`);
            }
        }));
    }

    completeReview() {
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        this.$subscriptions.push(this._opaService.completeReviewerReview(({
            opaReviewId: this.currentReviewer.opaReviewId,
            endDate: parseDateWithoutTimestamp(currentDate),
            opaDisclosureId: this.currentReviewer.opaDisclosureId,
            description: this.reviewDescription
        })).subscribe((res: any) => {
            this.updateDataStore(res);
            this.startOrCompleteReview();
            this.currentReviewer = {};
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Review completed successfully.`);
        }, error => {
            this.closeModal();
            if (error.status === 405) {
                this._commonService.concurrentUpdateAction = 'Complete Review';
            } else {
                this.currentReviewer = {};
                this._commonService.showToast(HTTP_ERROR_STATUS, `Error in completing review.`);
            }
        }));
    }

    closeModal() {
        this.timeoutRef = setTimeout(() => {
            this.reviewDescription = '';
            this._opaService.isEnableReviewActionModal = false;
        }, 200);
    }

    updateDataStore(reviewer) {
        const {opaDisclosure, ...review} = reviewer;
        this._opaService.$SelectedReviewerDetails.next(review);
        const DATA: OPA = this._dataStore.getData();
        this.reviewerList = DATA.opaReviewerList || [];
        const index = this.reviewerList.findIndex(ele => ele.opaReviewId === reviewer.opaReviewId);
        this.reviewerList[index] = reviewer;
        DATA.opaDisclosure.reviewStatusCode  = opaDisclosure.reviewStatusCode;
        DATA.opaDisclosure.reviewStatusType = opaDisclosure.reviewStatusType;
        DATA.opaDisclosure.updateTimestamp = reviewer.updateTimestamp;
        DATA.opaDisclosure.updateUserFullName = reviewer.updateUserFullName;
        this._opaService.isReviewActionCompleted = this._opaService.isAllReviewsCompleted(this.reviewerList);
        this.updateReviewActions(reviewer);
        this._opaService.isEnableReviewActionModal = false;
        this._dataStore.updateStore(['opaReviewerList', 'opaDisclosure'], { opaReviewerList: this.reviewerList, opaDisclosure: DATA.opaDisclosure });
    }

    updateReviewActions(reviewer) {
        this._opaService.isDisclosureReviewer = (reviewer.assigneePersonId === this._commonService.currentUserDetails.personID && reviewer.opaReviewId == this._opaService.currentOPAReviewForAction.opaReviewId);
        if (reviewer.reviewStatusTypeCode === '2' && this._opaService.isDisclosureReviewer) {
            this._opaService.isStartReview = false;
            this._opaService.isCompleteReview = true;
        } else if (reviewer.reviewStatusTypeCode === '3' && this._opaService.isDisclosureReviewer) {
            this._opaService.isStartReview = false;
            this._opaService.isCompleteReview = false;
        }
    }

    startOrCompleteReview() {
        this._opaService.isStartReview = false;
        this._opaService.isCompleteReview = false;
        let nextAssignedReview = this.getNextAssignedReview();
        if (nextAssignedReview) {
            this._opaService.currentOPAReviewForAction = nextAssignedReview;
            if(nextAssignedReview.reviewStatusTypeCode == 1)
                this._opaService.isStartReview = true;
            else if (nextAssignedReview.reviewStatusTypeCode == 2)
                this._opaService.isCompleteReview = true;
        }

    }

    private getNextAssignedReview(): any {
        return this.reviewerList.find(ele =>
            ele.assigneePersonId === this._commonService.currentUserDetails.personID
            && ele.reviewStatusTypeCode != 3);
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.closeModal();
        }
    }
}
