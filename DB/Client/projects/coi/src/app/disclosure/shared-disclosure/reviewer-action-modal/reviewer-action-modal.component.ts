import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { CoiService } from '../../services/coi.service';
import { DataStoreService } from '../../services/data-store.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { hideModal } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';

@Component({
    selector: 'app-reviewer-action-modal',
    templateUrl: './reviewer-action-modal.component.html',
    styleUrls: ['./reviewer-action-modal.component.scss']
})

export class ReviewerActionModalComponent implements OnInit, OnDestroy {

    reviewDescription = '';
    currentReviewer: any = {};
    reviewerList: any = [];
    $subscriptions: Subscription[] = [];
    completeReviewHelpText = 'You are about to complete the review.';
    startReviewHelpText = 'You are about to start the review.';

    private timeoutRef: ReturnType<typeof setTimeout>;

    constructor(private _coiService: CoiService,
        private _dataStore: DataStoreService,
        private _commonService: CommonService) { }

    ngOnInit() {
        this.getReviewerDetails();
        const DATA = this._dataStore.getData();
        this.reviewerList = DATA.coiReviewerList || [];
        document.getElementById(this._coiService.actionButtonId).click();
    }

    ngOnDestroy() {
        clearTimeout(this.timeoutRef);
        subscriptionHandler(this.$subscriptions);
    }

    getReviewerDetails() {
        this.$subscriptions.push(this._coiService.$SelectedReviewerDetails.subscribe((res: any) => {
            this.currentReviewer = res;
        }));
    }

    startCOIReview() {
        this.$subscriptions.push(this._coiService.startCOIReview({
            coiReviewId: this.currentReviewer.coiReviewId,
            assigneePersonName: this.currentReviewer.assigneePersonName,
            disclosureId: this.currentReviewer.disclosureId,
            description: this.reviewDescription
        }).subscribe((res: any) => {
            this.updateDataStore(res);
            this.currentReviewer = {};
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Review started successfully.`);
        }, err => {
            this.closeModal();
            if (err.status === 405) {
                this._coiService.concurrentUpdateAction = 'Start Review';
            } else {
                this.currentReviewer = {};
                this._commonService.showToast(HTTP_ERROR_STATUS, `Error in starting review.`);
            }
        }));
    }

    completeReview() {
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        this.$subscriptions.push(this._coiService.completeReview({
            coiReviewId: this.currentReviewer.coiReviewId,
            assigneePersonName: this.currentReviewer.assigneePersonName,
            endDate: parseDateWithoutTimestamp(currentDate),
            disclosureId: this.currentReviewer.disclosureId,
            description: this.reviewDescription
        }).subscribe((res: any) => {
            this.updateDataStore(res);
            this.startOrCompleteReview();
            this.currentReviewer = {};
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Review completed successfully.`);
        }, err => {
            hideModal('coi-complete-review-modal');
            if (err.status === 405) {
                this._coiService.concurrentUpdateAction = 'Complete Review';
            } else {
                this.currentReviewer = {};
                this._commonService.showToast(HTTP_ERROR_STATUS, `Error in completing review.`);
            }
        }));
    }

    closeModal() {
        this.timeoutRef = setTimeout(() => {
            this.reviewDescription = '';
            this._coiService.isEnableReviewActionModal = false;
        }, 200);
    }

    updateDataStore(reviewer) {
        this._coiService.$SelectedReviewerDetails.next(reviewer);
        const DATA = this._dataStore.getData();
        this.reviewerList = DATA.coiReviewerList || [];
        const index = this.reviewerList.findIndex(ele => ele.coiReviewId === reviewer.coiReviewId);
        this.reviewerList[index] = reviewer;
        DATA.coiDisclosure.coiReviewStatusType = reviewer.coiDisclosure.coiReviewStatusType;
        DATA.coiDisclosure.updateTimestamp = reviewer.updateTimestamp;
        DATA.coiDisclosure.updateUserFullName = reviewer.updateUserFullName;
        this._coiService.isReviewActionCompleted = this._coiService.isAllReviewsCompleted(this.reviewerList);
        this.updateReviewActions(reviewer);
        this._coiService.isEnableReviewActionModal = false;
        this._dataStore.updateStore(['coiReviewerList', 'coiDisclosure'], { coiReviewerList: this.reviewerList, coiDisclosure: DATA.coiDisclosure });
    }

    updateReviewActions(reviewer) {
        this._coiService.isDisclosureReviewer = (reviewer.assigneePersonId === this._commonService.currentUserDetails.personID && reviewer.coiReviewId == this._coiService.currentReviewForAction.coiReviewId);
        if (reviewer.reviewStatusTypeCode === '3' && this._coiService.isDisclosureReviewer) {
            this._coiService.isStartReview = false;
            this._coiService.isCompleteReview = true;
        } else if (reviewer.reviewStatusTypeCode === '2' && this._coiService.isDisclosureReviewer) {
            this._coiService.isStartReview = false;
            this._coiService.isCompleteReview = false;
        }
    }

    startOrCompleteReview() {
        this._coiService.isStartReview = false;
        this._coiService.isCompleteReview = false;
        let nextAssignedReview = this.getNextAssignedReview();
        if (nextAssignedReview) {
            this._coiService.currentReviewForAction = nextAssignedReview;
            if (nextAssignedReview.reviewStatusTypeCode == 1)
                this._coiService.isStartReview = true;
            else if (nextAssignedReview.reviewStatusTypeCode == 3)
                this._coiService.isCompleteReview = true;
        }

    }

    private getNextAssignedReview(): any {
        return this.reviewerList.find(ele =>
            ele.assigneePersonId === this._commonService.currentUserDetails.personID
            && ele.reviewStatusTypeCode !== '2');
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            this.closeModal();
        }
    }

}
