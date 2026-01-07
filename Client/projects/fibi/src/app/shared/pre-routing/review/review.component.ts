/**Created and last updated by Ramlekshmy on 13-11-2019 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { CommonService } from '../../../common/services/common.service';
import { ReviewService } from './review.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-review',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.css'],
    providers: [WafAttachmentService]
})

export class ReviewComponent implements OnInit, OnDestroy {

    @Input() moduleDetails: any = {};
    @Input() showRequestModal: any = {};
    @Input() preReviewReq: any = {};
    @Input() dataStoreService: any = null;

    isPreReviewSummaryWidgetOpen = true;
    isShowAllReviews = false;
    isReverse = true;
    isReviewSelected = false;
    isAddComment = false;

    reviewRequestObject: any = {};
    selectedReview: any = {};
    reviewerReview: any = {};
    formData = new FormData();
    sendObject: any = {};
    preReviews: any = {};
    isReviewTypeOpen = [];
    highlight = [];
    uploadedFile = [];

    selectedIndex: number;
    personId = this._commonService.getCurrentUserDetail('personID');
    assignReviewWarning = null;
    actionType = null;
    sortBy = 'reviewStartDate';
    reverse = 'DESC';
    userFullName = this._commonService.getCurrentUserDetail('fullName');
    departmentLevelRights: any = [];
    isMaintainPrivateComments: boolean;
    isWriteReview: boolean;
    $subscriptions: Subscription[] = [];
    isSaving = false;

    constructor(private _reviewService: ReviewService,
                public _commonService: CommonService,
                private _wafAttachmentService: WafAttachmentService) { }

    ngOnInit() {
        this.departmentLevelRights = this.moduleDetails.availableRights;
        this.checkDepartmentLevelPermission();
        this.$subscriptions.push(this._reviewService.loadPreReviews(this.preReviewReq).subscribe((data: any) => {
            this.preReviews = data.preReviews;
            this.moduleDetails.preReviewRoutingReview = data.preReviewSectionTypes;
            this.moduleDetails.preReviewTypes = data.preReviewTypes;
        }, err => { },
            () => { this.filterReviewDetails(this.preReviews); }));
        if (this.dataStoreService) {
            this.listenDataChangeFromStore();
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this.dataStoreService.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.includes('preReviews')) {
                    this.getDataFromStore();
                }
            })
        );
    }

    private getDataFromStore() {
        this.preReviews = this.dataStoreService.getData(['preReviews']).preReviews;
        this.filterReviewDetails(this.preReviews);
    }

    /** sortReviewTable - service call to sort review summary table based on the column selected
     * @param sortFieldBy
     */
    sortReviewTable(sortFieldBy) {
        if (this.isReverse) {
            this.reverse = 'DESC';
        } else {
            this.reverse = 'ASC';
        }
        this.sortBy = sortFieldBy;
        this.$subscriptions.push(this._reviewService.sortReviewerFields({
            'moduleItemCode': this.preReviewReq.moduleItemCode,
            'moduleSubItemCode': this.preReviewReq.moduleSubItemCode, 'moduleItemKey': this.preReviewReq.moduleItemKey,
            'moduleSubItemKey': this.preReviewReq.moduleSubItemKey, 'reviewTypeCode': this.preReviewReq.reviewTypeCode,
            'sortBy': this.sortBy, 'reverse': this.reverse
        }).subscribe((data: any) => {
            this.preReviews = data.preReviews;
        }, err => { },
            () => {
                if (!this.isShowAllReviews) {
                    this.highlightReviewsAfterSorting();
                }
            }));
    }

    /**highlightReviewsAfterSorting - function that filters reviews that are to be highlighted after sorting */
    highlightReviewsAfterSorting() {
        /** to preserve review already selected and highlighted, after sorting */
        if (this.isReviewSelected) {
            this.preReviews.find((value, index) => {
                if (value.preReviewId === this.selectedReview.preReviewId) {
                    this.selectedIndex = index;
                }
            });
            this.filterReviews();
        } else {
            /** to preserve in-progress reviews highlighted, after sorting */
            this.filterReviewDetails(this.preReviews);
        }
    }

    /**filterReviews - filter the review details based on selected review
     * @param index
     */
    filterReviews() {
        this.isReviewSelected = true;
        this.isReviewTypeOpen[this.selectedIndex] = true;
        this.highlight = [];
        this.highlight[this.selectedIndex] = true;
    }

    /**showAllReviews - filter reviews based on show all reviews */
    showAllReviews() {
        this.isShowAllReviews = !this.isShowAllReviews;
        if (this.isShowAllReviews) {
            this.isReviewSelected = false;
            this.preReviews.forEach((element, index) => {
                this.highlight[index] = true;
                this.isReviewTypeOpen[index] = true;
            });
        } else {
            this.filterReviewDetails(this.preReviews);
        }
    }

    /**filterReviewDetails - filter reviews so that in progress reviews(reviewStatusCode === '1') of logged in user is expanded
     * @param preReviews
     */
    filterReviewDetails(preReviews) {
        this.preReviews = preReviews;
        this.highlight = [];
        preReviews.find((value, index) => {
            if (value.preReviewStatus.reviewStatusCode === '1' && value.reviewerPersonId === this.personId) {
                this.isReviewTypeOpen[index] = true;
                this.highlight[index] = true;
            }
        });
    }

    fileDrop(files) {
        for (let index = 0; index < files.length; index++) {
            this.uploadedFile.push(files[index]);
        }
    }

    deleteFromUploadedFileList(index) {
        this.uploadedFile.splice(index, 1);
    }

    /**setRequestObject - sets common request object for add comment and approve review */
    setRequestObject() {
        this.reviewRequestObject.updateTimeStamp = new Date().getTime();
        this.reviewRequestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.reviewRequestObject.personId = this._commonService.getCurrentUserDetail('personID');
        this.reviewRequestObject.fullName = this._commonService.getCurrentUserDetail('fullName');

        if (!this._commonService.isWafEnabled) {
            this.formData = new FormData();
            for (let i = 0; i < this.uploadedFile.length; i++) {
                this.formData.append('files', this.uploadedFile[i], this.uploadedFile[i].name);
            }
        }
        this.sendObject = {
            moduleItemCode: this.preReviewReq.moduleItemCode,
            moduleSubItemCode: this.preReviewReq.moduleSubItemCode,
            moduleItemKey: this.preReviewReq.moduleItemKey,
            moduleSubItemKey: this.preReviewReq.moduleSubItemKey,
            reviewTypeCode: this.preReviewReq.reviewTypeCode,
            preNewReviewComment: this.reviewRequestObject,
            preReviewId: this.reviewerReview.preReviewId,
            userName: this._commonService.getCurrentUserDetail('userName')
        };
    }

    /**addPreReview - service call to add review comments and attachments */
    addPreReview() {
        if (this.reviewRequestObject.reviewComment == null || this.reviewRequestObject.reviewComment === '') {
            this.assignReviewWarning = '* Please add atleast one comment to add review.';
        } else if (!this.isSaving) {
            this.isSaving = true;
            this.setRequestObject();
            if (!this._commonService.isWafEnabled) {
                this.formData.append('formDataJson', JSON.stringify(this.sendObject));
                this.$subscriptions.push(this._reviewService.addPreReviewComment(this.formData).subscribe((data: any) => {
                    this.addPrereviewActions(data);
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to add review comment');
                    this.isSaving = false;
                },
                    () => { $('#reviewActionModal').modal('hide'); }));
            } else {
                $('#reviewActionModal').modal('hide');
                this.addPreReviewWaf();
            }
        }
    }

    /** checks for review comment added with or without attachments.If review added with attachments, calls the 'saveAttachment'
     *  function with parameters in waf service for splitting attachment,returns data.
     * Otherwise calls saveWafRequest function in wafAttachmentService*/
    async addPreReviewWaf() {
        this.sendObject.personId = this._commonService.getCurrentUserDetail('personID');
        if (this.uploadedFile.length > 0) {
            const data = await this._wafAttachmentService.saveAttachment(this.sendObject, null, this.uploadedFile,
                '/addPreReviewCommentForWaf', 'writeReview', null);
            this.savePrereviewWaf(data);
            this.isSaving = false;
        } else {
            this._wafAttachmentService.saveWafRequest(this.sendObject, '/addPreReviewCommentForWaf').then(data => {
                this.savePrereviewWaf(data);
                this.isSaving = false;
            }).catch(error => {
                this.savePrereviewWaf(error);
                this.isSaving = false;
            });
        }
    }
    /**
     * @param  {} data
     * if data doesn't contains error,comments and attachments are listed.Otherwise shows error toast
     */
    savePrereviewWaf(data) {
        if (data && !data.error) {
            this.addPrereviewActions(data);
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for adding review comment');
        }
    }
    /**
     * @param  {} data
     * actions need to perform after saving review comments and attachments which is common for both
     * waf enabled and disabled services.
     */
    addPrereviewActions(data) {
        this.preReviews = data.preReviews;
        this.reviewRequestObject = {};
        const reviewerReview = this.preReviews.find(review => review.preReviewId === this.reviewerReview.preReviewId);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review comment has been added successfully.');
    }

    /**downloadAttachments - downloads uploaded review attachments
     * @param event
     * @param selectedFileName
     * @param selectedAttachArray
     */
    downloadAttachments(event, selectedFileName, selectedAttachArray: any[]) {
        event.preventDefault();
        const attachment = selectedAttachArray.find(attachmentDetail => attachmentDetail.fileName === selectedFileName);
        if (attachment != null) {
            this.$subscriptions.push(this._reviewService.downloadPreReviewAttachment(attachment.preReviewAttachmentId).subscribe(
                data => {
                    fileDownloader(data, attachment.fileName);
                }));
        }
    }

    clearCommentsModal() {
        this.assignReviewWarning = null;
        this.reviewRequestObject.reviewComment = null;
        this.uploadedFile = [];
    }

    /**completeReturnReview - service call for complete/return review
     * @param actionType
     */
    completeReturnReview(actionType) {
        if ((this.reviewerReview.preReviewComments == null ||
            (this.reviewerReview.preReviewComments !== null && this.reviewerReview.preReviewComments.length === 0)) &&
            (this.reviewRequestObject.reviewComment == null || this.reviewRequestObject.reviewComment === '')) {
            this.assignReviewWarning = '* Please add atleast one comment to complete/return review.';
        } else if (!this.isSaving) {
            this.isSaving = true;
            this.setRequestObject();
            this.reviewerReview.requestDate = parseDateWithoutTimestamp(getDateObjectFromTimeStamp(this.reviewerReview.requestDate));
            this.reviewerReview.completionDate = parseDateWithoutTimestamp(new Date().getTime());
            this.sendObject.reviewerReview = this.reviewerReview;
            this.sendObject.actionType = actionType;
            this.sendObject.personId = this._commonService.getCurrentUserDetail('personID');
            if (!this._commonService.isWafEnabled) {
                this.formData.append('formDataJson', JSON.stringify(this.sendObject));
                this.$subscriptions.push(this._reviewService.approveOrDisapprovePreReview(this.formData).subscribe((data: any) => {
                    this.preReviews = data.preReviews;
                    this.isSaving = false;
                }, err => {
                    this.showErrorToast();
                    this.clearModalFlags();
                    this.isSaving = false;
                },
                    () => {
                        this.showSuccessToast();
                        this.clearModalFlags();
                        this.isSaving = false;
                    }));
            } else {
                this.completeReturnReviewWaf();
                this.isSaving = false;
            }
        }
    }
    /** checks for review completed with or without attachments.If review completed with attachments, calls the 'saveAttachment'
      *  function with parameters in waf service for splitting attachment,returns data.
      * Otherwise calls saveWafRequest function in wafAttachmentService*/
    async completeReturnReviewWaf() {
        $('#reviewActionModal').modal('hide');
        if (this.uploadedFile.length > 0) {
            const data = await this._wafAttachmentService.saveAttachment(this.sendObject, null, this.uploadedFile,
                '/approveOrDisapprovePreReviewForWaf', 'completeReview', null);
            this.savecompleteReturnReviewWaf(data);
        } else {
            this._wafAttachmentService.saveWafRequest(this.sendObject, '/approveOrDisapprovePreReviewForWaf').then(data => {
                this.savecompleteReturnReviewWaf(data);
            }).catch(error => {
                this.savecompleteReturnReviewWaf(error);
            });
        }
    }
    /**
     * @param  {} data
     * if data doesn't contains error,comments and attachments for completing review are listed.
     * Otherwise shows error toast
     */
    savecompleteReturnReviewWaf(data) {
        if (data && !data.error) {
            this.preReviews = data.preReviews;
            this.showSuccessToast();
            this.clearModalFlags();
        } else {
            this.showErrorToast();
            this.clearModalFlags();
        }
    }
    /** shows success toast based on action type that is approve or disapprove*/
    showSuccessToast() {
        if (this.actionType === 'APPROVE') {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review has been completed successfully');
        } else {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review has been returned successfully');
        }
    }
    /** shows error toast based on waf enabled or not and action type that is approve or disapprove*/
    showErrorToast() {
        let errorMsg;
        if (this.actionType === 'APPROVE') {
            errorMsg = !this._commonService.isWafEnabled ? 'Failed to complete the review' :
                'Waf blocked request for completing the review';
            this._commonService.showToast(HTTP_ERROR_STATUS, errorMsg);
        } else {
            errorMsg = !this._commonService.isWafEnabled ? 'Failed to return the review' :
                'Waf blocked request for returning the review';
            this._commonService.showToast(HTTP_ERROR_STATUS, errorMsg);
        }
    }

    clearModalFlags() {
        $('#reviewActionModal').modal('hide');
        this.actionType = null;
    }

    checkDepartmentLevelPermission() {
        this.isMaintainPrivateComments = this.checkDepartmentLevelRightsInArray('MAINTAIN_PRIVATE_COMMENTS');
        this.isWriteReview = this.checkDepartmentLevelRightsInArray('WRITE_REVIEW');
    }

    checkDepartmentLevelRightsInArray(input) {
        if (this.departmentLevelRights != null && this.departmentLevelRights.length) {
            return this.departmentLevelRights.includes(input);
        } else {
            return false;
        }
    }
    /** set private checkbox not enabled by default and clears the comments & other details that already enetered
    */
    setCommentsModalFlag() {
        this.reviewRequestObject.isPrivateComment = false;
        this.clearCommentsModal();
    }
}
