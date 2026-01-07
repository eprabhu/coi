import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { environment } from '../../../../../../environments/environment';
import { CommonService } from '../../../../../common/services/common.service';
import { ManagementPlanReviewsService } from '../management-plan-reviews.service';
import { ManagementPlanService } from '../../../services/management-plan.service';
import { deepCloneObject } from '../../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { CMP_REVIEWER_TAB_NO_INFO_MESSAGE } from '../../../../../no-info-message-constants';
import { ElasticConfigService } from '../../../../../common/services/elastic-config.service';
import { SharedComponentModule } from '../../../../../shared-components/shared-component.module';
import { setPersonObjectFromElasticResult } from '../../../../../common/utilities/elastic-utilities';
import { ManagementPlanHeaderCardComponent } from '../../../../shared/management-plan-header-card/management-plan-header-card.component';
import { ManagementPlanDataStoreService } from '../../../services/management-plan-data-store.service';
import { DATE_PLACEHOLDER, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../../app-constants';
import { DataStoreEvent, ElasticPersonSource, LookUpClass } from '../../../../../common/services/coi-common.interface';
import { CMP_REVIEW_RIGHTS, CMP_REVIEWER_STATUS, CMP_REVIEWER_STATUS_BADGE, CMP_STATUS } from '../../../../shared/management-plan-constants';
import { compareDates, getDateObjectFromTimeStamp, getDuration, parseDateWithoutTimestamp } from '../../../../../common/utilities/date-utilities';
import { CmpLocationReviewType, CmpReviewLocation, CmpSaveReviewRO, ManagementPlanStoreData } from '../../../../shared/management-plan.interface';
import { FetchReviewCommentRO } from '../../../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { CMP_REVIEW_COMMENTS } from '../../../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig } from '../../../../../shared-components/coi-review-comments/coi-review-comments.interface';
@Component({
    selector: 'app-management-plan-reviews-location',
    templateUrl: './management-plan-reviews-location.component.html',
    styleUrls: ['./management-plan-reviews-location.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, SharedComponentModule, ManagementPlanHeaderCardComponent]
})
export class ManagementPlanReviewsLocationComponent implements OnInit, OnDestroy {

    private $subscriptions: Subscription[] = [];

    modifyIndex = -1;
    isExpanded = true;
    hasMaintainReviewRights = false;
    isShowCommentBtn = false;
    reviewerList: CmpReviewLocation[] = [];
    validationMap = new Map();
    reviewDetails: any = {};
    personElasticOptions: any = {};
    assigneeClearField: String;
    reviewActionConfirmation: any = {};
    isReviewMode = false;
    isAllowStartComplete = false;
    cmpReviewLocation = 'COI_CMP_REVIEW_LOCATION_TYPE#LOCATION_TYPE_CODE#false#false';
    cmpReviewStatus = 'COI_CMP_REVIEW_REVIEWER_STATUS_TYPE#REVIEW_STATUS_CODE#false#false';
    locationType: any = [];
    reviewStatusType: any = [];
    reviewStartDate: any;
    reviewEndDate: any;
    collapseViewMore = {};
    editReviewerHelpText = 'You are about to edit the review.';
    addReviewerHelpText = 'You are about to add a review.';
    deleteReviewHelpText = 'You are about to delete the review.'
    addReviewModalId = 'add-review-modal-trigger';
    managementPlan = new ManagementPlanStoreData();
    commentCounts: { [moduleId: string]: number } = {};
    loginPersonId = this._commonService.getCurrentUserDetail('personID');
    deployMap = environment.deployUrl;
    datePlaceHolder = DATE_PLACEHOLDER;
    CMP_REVIEWER_STATUS = CMP_REVIEWER_STATUS;
    noDataMessage = CMP_REVIEWER_TAB_NO_INFO_MESSAGE;
    CMP_REVIEWER_STATUS_BADGE = CMP_REVIEWER_STATUS_BADGE;

    constructor(private _elasticConfigService: ElasticConfigService,
        public managementPlanReviewsService: ManagementPlanReviewsService,
        private _managementPlanDataStore: ManagementPlanDataStoreService,
        public _commonService: CommonService,
        public _managementPlanService: ManagementPlanService) {
    }

    ngOnInit(): void {
        this.personElasticOptions = this._elasticConfigService.getElasticForPerson();
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.isExpanded = true;
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private fetchCmpReviews(): void {
        this.$subscriptions.push(
            this.managementPlanReviewsService.fetchCmpReviews(this.managementPlan?.plan?.cmpId)
                .subscribe({
                    next: (res: CmpReviewLocation[]) => {
                        this.reviewerList = res || [];
                        this.setCommentCount(this.reviewerList);
                        this._managementPlanDataStore.updateStore(['cmpReviewLocationList'], { cmpReviewLocationList: res });
                    },
                    error: () => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching review details.');
                    }
                })
        );
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        this.managementPlan.plan = MANAGEMENT_PLAN.plan;
        if (storeEvent.action === 'REFRESH') {
            this.fetchCmpReviews();
        }
        this.reviewerList = MANAGEMENT_PLAN.cmpReviewLocationList;
        this.setReviewActionVisibility(MANAGEMENT_PLAN);
        this.setCommentCount(this.reviewerList);
    }
    
    private setReviewActionVisibility(managementPlan: ManagementPlanStoreData): void {
        const STATUS_TYPE_CODE = managementPlan.plan?.statusType?.statusCode;
        const IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL = this._managementPlanDataStore.getIsAdminOrCanManageAffiliatedDiscl();
        const HAS_ANY_RIGHTS = this._commonService.getAvailableRight(CMP_REVIEW_RIGHTS) && IS_ADMIN_OR_CAN_MANAGE_AFFILIATED_DISCL;
        this.isReviewMode = STATUS_TYPE_CODE === String(CMP_STATUS.DRAFT);
        this.hasMaintainReviewRights = HAS_ANY_RIGHTS;
        this.isShowCommentBtn = this._managementPlanDataStore.getCommentButtonVisibility();
    }

    private setCommentCount(reviewerList: any[]): void {
        reviewerList.forEach((item: any) => {
            const COMMENT_COUNT = this.getCommentCount(item?.cmpReviewId);
            this.commentCounts[item?.cmpReviewId] = COMMENT_COUNT;
        });
    }

    private getCommentCount(subModuleItemKey: string | number): number {
        const CMP_DETAILS = this._managementPlanDataStore.getData();
        const REVIEW_COMMENTS = CMP_DETAILS?.cmpCommentsCount?.reviewCommentsCount || [];
        const COMMENT_DETAILS = REVIEW_COMMENTS.find(item => String(item.subModuleItemKey) === String(subModuleItemKey));
        return COMMENT_DETAILS?.count ?? 0;
    }

    private clearActionData(): void {
        this.reviewActionConfirmation = {};
        this.modifyIndex = -1;
    }

    private getCmpSaveReviewRO(): CmpSaveReviewRO {
        this.reviewDetails.startDate = parseDateWithoutTimestamp(this.reviewStartDate);
        this.reviewDetails.endDate = parseDateWithoutTimestamp(this.reviewEndDate);
        return {
            cmpId: this.managementPlan.plan.cmpId,
            assigneePersonId: this.reviewDetails.assigneePersonId,
            reviewStatusTypeCode: this.reviewDetails.reviewStatusTypeCode,
            description: this.reviewDetails.description,
            startDate: this.reviewDetails.startDate,
            endDate: this.reviewDetails.endDate,
            locationTypeCode: this.reviewDetails.locationTypeCode,
            cmpReviewId: this.reviewDetails.cmpReviewId || undefined
        }
    }

    /** Build review object with updated nested fields */
    private prepareReviewDetails(review: CmpReviewLocation): CmpReviewLocation {
        const REVIEW_DETAILS: CmpReviewLocation = deepCloneObject(review);
        REVIEW_DETAILS.assigneePerson = this.reviewDetails?.assigneePerson;
        REVIEW_DETAILS.locationType = this.reviewDetails?.locationType;
        REVIEW_DETAILS.reviewStatusType = this.reviewDetails?.reviewStatusType;
        return REVIEW_DETAILS;
    }

    /** Add or update reviewer list */
    private addOrUpdateReviewInList(reviewDetails: CmpReviewLocation): void {
        const REVIEW_DETAILS = this.prepareReviewDetails(reviewDetails);
        if (this.modifyIndex === -1) {
            this.reviewerList.push(REVIEW_DETAILS);
        } else {
            this.reviewerList.splice(this.modifyIndex, 1, REVIEW_DETAILS);
        }
        this.reviewDetails = {};
        this.managementPlan.plan.updateTimestamp = reviewDetails?.updateTimestamp;
        this.managementPlan.plan.updatedBy = reviewDetails?.updatedBy;
        this._managementPlanDataStore.updateStore(['plan', 'cmpReviewLocationList'], { plan: this.managementPlan?.plan, cmpReviewLocationList: this.reviewerList });
    }

    private validateReview(): boolean {
        this.validationMap.clear();
        this.isEndDateInValid();
        if (this.reviewDetails.assigneePersonId && this.hasDuplicateReviewer()) {
            this.assigneeClearField = 'true';
            this.validationMap.set('reviewer', 'Reviewer already added.');
        }
        if (!this.reviewDetails.locationTypeCode) {
            this.validationMap.set('location', 'Please select a location.');
        }
        if (!this.reviewStartDate) {
            this.validationMap.set('REVIEW_START_DATE', 'Please select a review start date.');
        }
        if (!this.reviewEndDate && String(this.reviewDetails.reviewStatusTypeCode) === String(CMP_REVIEWER_STATUS.COMPLETED)) {
            this.validationMap.set('REVIEW_END_DATE', 'Please select a review end date.');
        }
        if (!this.reviewDetails.reviewStatusTypeCode) {
            this.validationMap.set('reviewStatus', 'Please select a status.');
        }
        return this.validationMap.size === 0;
    }

    private hasDuplicateReviewer(): boolean {
        return this.reviewerList.some((reviewer, index) => {
            const IS_MATCH =
                reviewer.assigneePersonId === this.reviewDetails.assigneePersonId &&
                reviewer.locationTypeCode === this.reviewDetails.locationTypeCode &&
                String(reviewer.reviewStatusTypeCode) !== String(CMP_REVIEWER_STATUS.COMPLETED);

            return this.modifyIndex !== -1
                ? IS_MATCH && index !== this.modifyIndex
                : IS_MATCH;
        });
    }

    private isEndDateInValid(): void {
        if (this.reviewStartDate && this.reviewEndDate && (compareDates(this.reviewStartDate, this.reviewEndDate) === 1)) {
            this.validationMap.set('REVIEW_END_DATE', 'Please provide a valid review end date.');
        }
    }

    saveOrUpdateCoiReview(): void {
        if (this.validateReview()) {
            this.$subscriptions.push(
                this.managementPlanReviewsService
                    .saveOrUpdateCoiReview(this.getCmpSaveReviewRO())
                    .subscribe({
                        next: (reviewDetails: CmpReviewLocation) => {
                            const ACTION = this.modifyIndex === -1 ? 'added' : 'updated';
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Reviewer ${ACTION} successfully.`);
                            this.addOrUpdateReviewInList(reviewDetails);
                            document.getElementById(this.addReviewModalId)?.click();
                            this.isExpanded = true;
                        },
                        error: (error: any) => {
                            if (error.status === 405) {
                                this._commonService.showToast('Action you are trying to perform is not valid for current state, please refresh.');
                            } else {
                                const ACTION = this.modifyIndex === -1 ? 'adding' : 'updating';
                                const MSG = typeof error.error === 'string' ? error.error : `Error in ${ACTION} review.`;
                                this._commonService.showToast(HTTP_ERROR_STATUS, MSG);
                            }
                        }
                    })
            );
        }
    }

    deleteReview(): void {
        this.$subscriptions.push(
            this.managementPlanReviewsService.deleteReview(this.reviewActionConfirmation.cmpReviewId)
                .subscribe((res: any) => {
                    this.reviewerList.splice(this.modifyIndex, 1);
                    this._managementPlanDataStore.updateStore(['cmpReviewLocationList'], { cmpReviewLocationList: this.reviewerList });
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, `Review deleted successfully.`);
                    this.clearActionData();
                }, _err => {
                    if (_err.status === 405) {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Action you are trying to perform is not valid for current state, please refresh.');
                    } else {
                        this.clearActionData();
                        this._commonService.showToast(HTTP_ERROR_STATUS, `Error in deleting review.`);
                    }
                }));
    }

    modifyReviewComment(reviewDetails: any): void {
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: CMP_REVIEW_COMMENTS?.componentTypeCode,
            moduleItemKey: this.managementPlan.plan?.cmpId,
            moduleItemNumber: this.managementPlan.plan?.cmpNumber,
            subModuleCode: null,
            subModuleItemKey: reviewDetails?.cmpReviewId,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: this.managementPlan.plan?.personId,
        };
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId: reviewDetails?.cmpReviewId,
                sectionName: reviewDetails?.locationType?.description,
                sectionKey: reviewDetails?.cmpReviewId + reviewDetails?.locationType?.description
            },
            componentDetails: {
                componentName: CMP_REVIEW_COMMENTS?.componentName,
                componentTypeCode: CMP_REVIEW_COMMENTS?.componentTypeCode
            }
        };
        this._managementPlanService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
    }

    compareDates(type: 'REVIEW_START_DATE' | 'REVIEW_END_DATE'): void {
        this.validationMap.delete('REVIEW_END_DATE');
        this.validationMap.delete(type);
        this.isEndDateInValid();
    }

    clearReviewModal(): void {
        this.reviewDetails = {};
        this.modifyIndex = -1;
        this.validationMap.clear();
        this.assigneeClearField = new String('true');
        this.reviewStartDate = new Date();
        this.reviewStartDate.setHours(0, 0, 0, 0);
        this.reviewEndDate = '';
        this.locationType = [];
        this.reviewStatusType = [];
    }

    updateReviewLocation(index: number, reviewerDetails: CmpReviewLocation, action: CmpLocationReviewType): void {
        this.modifyIndex = index;
        this._managementPlanService.openReviewConfirmationModal(action, reviewerDetails);
    }

    getDaysAtLocation(startDate: any, endDate: any): number {
        if (startDate) {
            const currentDate = new Date();
            return getDuration(getDateObjectFromTimeStamp(startDate), endDate ? getDateObjectFromTimeStamp(endDate) : getDateObjectFromTimeStamp(currentDate)).durInDays;
        } else {
            return null;
        }
    }

    collapseViewMoreOption(id: number, flag: boolean): void {
        this.collapseViewMore[id] = !flag;
    }

    openAddReviewModal(): void {
        this.clearReviewModal();
        document.getElementById(this.addReviewModalId).click();
    }

    onLocationSelect(event: LookUpClass[] | null): void {
        this.validationMap.delete('location');
        if (event && event.length) {
            this.reviewDetails.locationTypeCode = event[0].code;
            this.reviewDetails.locationType = {};
            this.reviewDetails.locationType['description'] = event[0].description;
            this.reviewDetails.locationType['locationTypeCode'] = event[0].code;
        } else {
            this.reviewDetails.locationTypeCode = null;
            this.reviewDetails.locationType = {};
        }
    }

    onStatusSelect(event: LookUpClass[] | null): void {
        this.reviewEndDate = '';
        this.validationMap.delete('REVIEW_END_DATE');
        this.validationMap.delete('reviewStatus');
        if (event && event.length) {
            this.reviewDetails.reviewStatusTypeCode = event[0].code;
            this.reviewDetails.reviewStatusType = {};
            this.reviewDetails.reviewStatusType['description'] = event[0].description;
            this.reviewDetails.reviewStatusType['reviewStatusCode'] = event[0].code;
            if (this.reviewDetails.reviewStatusTypeCode === '3') {
                this.reviewEndDate = new Date();
                this.reviewEndDate.setHours(0, 0, 0, 0);
            }
        } else {
            this.reviewDetails.reviewStatusTypeCode = null;
            this.reviewDetails.reviewStatusType = {};
        }
    }

    assigneeSelect(person: ElasticPersonSource): void {
        this.reviewDetails.assigneePersonId = person ? person.prncpl_id : null;
        this.reviewDetails.assigneePerson = person ? setPersonObjectFromElasticResult(person) : null
    }

    editReview(review: any, index: number): void {
        this.clearReviewModal();
        this.reviewDetails = deepCloneObject(review);
        this.reviewDetails.currentReviewStatusTypeCode = this.reviewDetails.reviewStatusType.reviewStatusCode;
        this.reviewDetails.currentLocationTypeCode = this.reviewDetails.locationType.locationTypeCode;
        this.reviewStartDate = getDateObjectFromTimeStamp(this.reviewDetails.startDate);
        if (this.reviewDetails.endDate) {
            this.reviewEndDate = getDateObjectFromTimeStamp(this.reviewDetails.endDate);
        }
        if (this.reviewDetails.locationType) {
            this.locationType.push({
                'code': this.reviewDetails.locationType.locationTypeCode,
                'description': this.reviewDetails.locationType.description
            });
        }
        if (this.reviewDetails.reviewStatusType) {
            this.reviewStatusType.push({
                'code': this.reviewDetails.reviewStatusType.reviewStatusCode,
                'description': this.reviewDetails.reviewStatusType.description
            });
        }
        this.modifyIndex = index;
        this.personElasticOptions.defaultValue = review.assigneePerson?.fullName;
        this.assigneeClearField = new String(false);
    }

}
