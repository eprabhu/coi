/** last updated by Ramlekshmy on 18-11-2019 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { ProposalService } from '../../services/proposal.service';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, DEFAULT_DATE_FORMAT } from '../../../app-constants';
import {
    compareDatesWithoutTimeZone, getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp
} from '../../../common/utilities/date-utilities';
import { fileDownloader, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { DataStoreService } from '../../services/data-store.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';
import { WebSocketService } from '../../../common/services/web-socket.service';

declare var $: any;

@Component({
    selector: 'app-proposal-evaluation',
    templateUrl: './proposal-evaluation.component.html',
    styleUrls: ['./proposal-evaluation.component.css'],
    providers: [WafAttachmentService]
})

export class ProposalEvaluationComponent implements OnInit, OnDestroy {

    SECTION_ID = 'proposal-evaluation-form';

    result: any = {};

    dataFlags: any = {
        isReviewSummaryWidgetOpen: true,
        isReverse: true,
    };
    isWriteReview: boolean;
    requestObject: any = {};
    proposalReviewerReview: any = {};
    elasticSearchOptions: any = {};
    questionnaireObject = {
        moduleSubitemCodes: [4],
        moduleItemKey: '',
        name: 'Evaluation Form',
        moduleSubItemKey: ''
    };
    selectedReview: any = {};
    isReviewTypeOpen = [];
    highlight = [];
    uploadedFile = [];
    userList = [];
    actualReviews: any = [];
    mandatoryList = new Map();
    errorList = new Map();

    clearField: String;
    placeholder = '';
    selectedIndex: number;
    reviewSubTab = new Array(30);
    modalData: any = {};
    actionType = null;
    deleteCommentId = null;
    assignType = 1;
    proposalRank = null;
    recommendationCode = null;
    sortBy = 'reviewStartDate';
    reverse = 'DESC';
    personId = this._commonService.getCurrentUserDetail('personID');
    departmentLevelRights: any = [];
    isAssignReview = false;
    isMaintainPrivateComments: boolean;
    isModifyProposal: boolean;
    isMaintainEvaluationForm: boolean;
    actionName = null;
    formData = new FormData();
    reviewRequest: any = {};
    reviewer = null;
    finalEvaluationStatus: any[];
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    $subscriptions: Subscription[] = [];
    versionSelected: number;
    workFlowDetails: any = {};
    workflowList: any = [];
    isSaving = false;
    unsavedChanges: any = null;
    tempTabChangeDetails: any = {};
    storeDependencies = ['proposal', 'availableRights', 'proposalReviews', 'personRoles', 'evaluationReviewStop', 'hasQuestionnaire',
        'finalEvaluationStatus', 'evaluationRecommendation', 'hasRecommendation', 'hasRank', 'dataVisibilityObj'];
    isChanged = false;
    validationMessage: any = {};

    constructor(
        private _proposalService: ProposalService,
        public _commonService: CommonService,
        private _elasticConfig: ElasticConfigService,
        private _wafAttachmentService: WafAttachmentService,
        private _dataStore: DataStoreService,
		private _autoSaveService: AutoSaveService,
        public webSocket: WebSocketService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenForGlobalSave();
        this.getSystemLevelPermissions();
        this.departmentLevelRights = this.result.availableRights;
        this.checkDepartmentLevelPermission();
        this.reviewSubTab.fill('COMMENTS');
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.fetchReviewDetails();
    }

    ngOnDestroy() {
        // this.setData(null);
        subscriptionHandler(this.$subscriptions);
        this.setUnsavedChanges(false);
        this.discardChanges();
    }

    private listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => {
            if (this.result.hasRank || this.result.hasRecommendation) {
                this.dataFlags.isRankProposal = true;
                this.setRankProposalModal();
            }
        }));
      }

    getDataFromStore(sections = this.storeDependencies) {
        sections.forEach(section => {
            Object.assign(this.result, this._dataStore.getData([section]));
        });
    }

    listenDataChangeFromStore() {
        this.$subscriptions.push(this._dataStore.dataEvent.subscribe(
            (dependencies: string[]) => {
                if (dependencies.some(dep => this.storeDependencies.includes(dep))) {
                    this.getDataFromStore(dependencies);
                }
            }));
    }

    /**setData - funstions sets common datas for review component
     * @param data
     */
    setData(data) {
        this.result.proposalReviews = data ? data.proposalReviews : data;
        this.result.personRoles = data ? data.personRoles : data;
        this.result.evaluationReviewStop = data ? data.evaluationReviewStop : data;
        this.result.hasRank = data ? data.hasRank : data;
        this.result.hasQuestionnaire = data ? data.hasQuestionnaire : data;
        this.result.finalEvaluationStatus = data ? data.finalEvaluationStatus : data;
        this.result.evaluationRecommendation = data ? data.evaluationRecommendation : data;
        this.result.hasRecommendation = data ? data.hasRecommendation : data;
        this._dataStore.updateStore(['proposalReviews', 'personRoles', 'evaluationReviewStop',
            'hasRank', 'hasQuestionnaire', 'finalEvaluationStatus', 'evaluationRecommendation', 'hasRecommendation'], this.result);
        this.proposalRank = this.result.proposal.proposalRank != null ? this.result.proposal.proposalRank : null;
        this.recommendationCode = this.result.proposal.recommendationCode != null ? this.result.proposal.recommendationCode : null;
        if (data != null) {
            this.checkIsProposalPerson();
            this.filterReviews(data);
        }
    }

    /**checkIsProposalPerson - proposal person should be able to see only GM and GA reviews
     * logic written - if the person is not the reviewer of any revie stops and doesn't have isMaintainPrivateComments right,
     * sets isProposalPerson to true
     */
    checkIsProposalPerson() {
        const proposalPerson = this.result.proposalReviews.find(person => person.reviewerPersonId === this.personId);
        if (proposalPerson == null && !this.isMaintainPrivateComments) { this.dataFlags.isProposalPerson = true; }
    }

    /** filter reviews to GM and GA if logged in person is proposal person */
    filterReviews(data) {
        this.actualReviews = data.proposalReviews;
        this.result.proposalReviews = this.dataFlags.isProposalPerson ? data.proposalReviews.filter(review => review.roleId === 100 ||
            review.roleId === 120 || review.roleId === 110) : data.proposalReviews;
        this._dataStore.updateStore(['proposalReviews'], this.result);
    }

    filterEvaluationStatus() {
        if (this.proposalReviewerReview.isFinal) {
            /**finalEvaluationStatus values -
             * 1. Not Submitted(statusCode = 30), Funding Agency Review In Progress(statusCode = 31) if Grant type external(categoryCode = 2) or
             *    Grant type others(categoryCode = 3) and proposal status Grant Manager Final Review in Progress(statusCode = 28)
             * 2. Unsucessful(statusCode = 29), Grant Manager Review in Progress(statusCode = 23) if RCBF proposal and stop is HOD(roleId = 400)
             * 3. Awarded(statusCode = 11), Unsucessful(statusCode = 29), Wihthdrawn(statusCode = 12) if Grant type is
             *    internal(categoryCode = 1) or Grant type external(categoryCode = 2) or Others (categoryCode = 3) and proposal status
             *    Funding Agency Review In Progress(statusCode = 31)
             * */
            if ((this.result.proposal.grantCallType.categoryCode === 2 || this.result.proposal.grantCallType.categoryCode === 3) &&
                this.result.proposal.statusCode === 28) {
                this.finalEvaluationStatus = this.result.finalEvaluationStatus.filter(status => status.statusCode === 30 ||
                    status.statusCode === 31);
                /** Changes 'Funding Agency Review In Progress' lookup description to 'Submitted' as it cannot be done from DB*/
                this.finalEvaluationStatus[this.finalEvaluationStatus.findIndex(status => status.statusCode === 31)]
                    .proposalStatus.description = 'Submitted';
            } else if (this.result.proposal.isRcbfProposal && this.proposalReviewerReview.roleId === 400) {
                this.finalEvaluationStatus = this.result.finalEvaluationStatus.filter(status => status.statusCode === 23 ||
                    status.statusCode === 29);
                /** Changes 'Unsuccesful' lookup description to 'Not Endorsed' as it cannot be done from DB*/
                this.finalEvaluationStatus[this.finalEvaluationStatus.findIndex(status => status.statusCode === 29)]
                    .proposalStatus.description = 'Not Endorsed';
                /** Changes 'Grant Manager Review in Progress' lookup description to 'Successful' as it cannot be done from DB*/
                this.finalEvaluationStatus[this.finalEvaluationStatus.findIndex(status => status.statusCode === 23)]
                    .proposalStatus.description = 'Endorsed';
            } else {
                this.finalEvaluationStatus = this.result.finalEvaluationStatus.filter(status =>
                    status.statusCode === 11 || status.statusCode === 29 || status.statusCode === 12);
            }
        }
    }

    fetchReviewDetails() {
        this.$subscriptions.push(
            this._proposalService.loadEvaluationDetails({ 'proposalId': this.result.proposal.proposalId, 'personId': this.personId })
                .subscribe((data: any) => {
                    this.workflowList = data.workflowList;
                    if (this.workflowList && this.workflowList.length > 0) {
                        const version = this.workflowList.find(version => version.isWorkflowActive == true);
                        this.versionSelected = version.workflowSequence;
                        this.versionChange();
                    }
                    this.setData(data);
                    this.expandInProgressReviews();
                    if (this.dataFlags.isRequestNewReview) {
                        this.showRequestNewReview();
                    }
                }));
    }

    /**
    * setting up of route log by separating workflow list w.r.t to the
    * workflow version selected
    */
    versionChange() {
        this.workFlowDetails = this.workflowList.find(workflow => workflow.workflowSequence.toString() === this.versionSelected.toString());
    }

    /** filter reviews so that in progress reviews of logged in user is expanded*/
    expandInProgressReviews() {
        this.highlight = [];
        this.result.proposalReviews.find((value, index) => {
            if (value.reviewStatus.reviewStatusCode === 1 && value.reviewerPersonId === this.personId) {
                this.isReviewTypeOpen[index] = true;
                this.highlight[index] = true;
            }
        });
    }

    /** clears all values and shows request new review popup*/
    showRequestNewReview() {
        this.clearField = new String('true');
        this.placeholder = '';
        this.errorList.clear();
        this.requestObject = {};
        this.requestObject.evaluationStop = null;
        this.requestObject.reviewDeadLineDate = null;
        $('#assignProposalReviewerModal').modal('show');
    }

    /** changes the value of placeholder in add review popup */
    setPlaceHolder() {
        this.placeholder = this.requestObject.evaluationStop != null && this.requestObject.evaluationStop !== 'null' ?
            'Search here for ' + this.requestObject.evaluationStop.description : '';
    }

    /** assign required values from elastic search
     * @param value
     */
    selected(value) {
        if (value) {
            this.requestObject.reviewerPersonId = value.prncpl_id;
            this.requestObject.reviewerFullName = value.full_name;
            this.requestObject.reviewerEmail = value.email_addr;
        } else {
            this.requestObject.reviewerPersonId = null;
            this.requestObject.reviewerFullName = null;
            this.requestObject.reviewerEmail = null;
            this.errorList.delete('reviewExist');
        }
    }

    dateValidation(date, dateType) {
        const currentDate: Date = new Date();
        this.errorList.delete('reviewdeadline');
        if (date && compareDatesWithoutTimeZone(date, currentDate, 'dateObject', 'dateObject') === -1) {
            this.errorList.set('reviewdeadline', dateType + ' date already passed. Please choose another date.');
        }
    }

    setRequestForAddingReview() {
        this.requestObject.reviewStartDate = parseDateWithoutTimestamp(new Date().getTime());
        this.requestObject.reviewDeadLineDate = parseDateWithoutTimestamp(this.requestObject.reviewDeadLineDate);
        this.requestObject.hasEndorsed = this.requestObject.evaluationStop.hasEndorsed;
        this.requestObject.hasRank = this.requestObject.evaluationStop.hasRank;
        this.requestObject.hasQuestionnaire = this.requestObject.evaluationStop.hasQuestionnaire;
        this.requestObject.isFinal = this.requestObject.evaluationStop.isFinal;
        this.requestObject.evaluationStopCode = this.requestObject.evaluationStop.evaluationStopCode;
        this.requestObject.roleId = this.requestObject.evaluationStop.roleId;
        this.requestObject.role = this.requestObject.evaluationStop.role;
        this.requestObject.hasRecommendation = this.requestObject.evaluationStop.hasRecommendation;
    }

    setDataAfterAddingReview(data) {
        this.result.proposal.proposalStatus = data.proposal.proposalStatus;
        this.result.proposal.statusCode = data.proposal.statusCode;
        this._dataStore.updateStore(['proposal'], this.result);
        this.reviewSubTab[this.result.proposalReviews.length - 1] = 'COMMENTS';
        this.dataFlags.isRequestNewReview = false;
    }

    updateRankValue(data) {
        this.result.hasRecommendation = data.hasRecommendation;
        this.result.hasRank = data.hasRank;
        this._dataStore.updateStore(['hasRecommendation', 'hasRank'], this.result);
    }

    /**checkAnyPendingReviews - one a particular stop, only one review can be assigned to a reviewer.
     * @param isReviewExist
     * @param data
     * @param actionName
     * @param date
     */
    checkAnyPendingReviews(isReviewExist, data, actionName, date) {
        if (!isReviewExist) {
            this.clearField = new String('true');
            this.updateReviewSummary(data);
            this.updateRankValue(data);
            if (actionName === 'Add Review') { this.setDataAfterAddingReview(data); }
        } else {
            this.errorList.set('reviewExist', 'Review cannot be assigned since the reviewer already has ' +
                'a review In Progress to be approved.');
            if (date) {
                date = getDateObjectFromTimeStamp(date);
            }
        }
    }

    /** assigns reviewer based on validations */
    addReview() {
        this.errorList.clear();
        let isReviewExist = false;
        if (this.requestObject.evaluationStop == null || this.requestObject.evaluationStop === 'null') {
            this.errorList.set('reviewStop', '* Please choose a Review Stop');
        }
        this.dateValidation(this.requestObject.reviewDeadLineDate, 'Review deadline');
        if (this.errorList.size === 0 && !this.isSaving) {
            this.isSaving = true;
            this.setCommonRequestObject();
            this.setRequestForAddingReview();
            this.$subscriptions.push(this._proposalService.addReview({
                'proposalIds': null, 'proposalId': this.result.proposal.proposalId,
                'newProposalReview': this.requestObject, 'personId': this.personId
            })
                .subscribe((data: any) => {
                    isReviewExist = data.proposal.isReviewExist;
                    this.checkAnyPendingReviews(isReviewExist, data, 'Add Review', this.requestObject.reviewDeadLineDate);
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Review failed. Please try again.');
                    this.isSaving = false;
                },
                    () => {
                        if (!isReviewExist) {
                            $('#assignProposalReviewerModal').modal('hide');
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review added successfully.');
                        }
                        this.isSaving = false;
                    }));
        }
    }

    setCommonRequestObject() {
        this.requestObject.proposalId = this.result.proposal.proposalId;
        this.requestObject.updateTimestamp = new Date().getTime();
        this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    }

    /**filterReviewDetails - filter the review details based on selected review
     * @param index
     */
    filterReviewDetails() {
        this.dataFlags.isReviewSelected = true;
        this.isReviewTypeOpen[this.selectedIndex] = true;
        this.highlight = [];
        this.highlight[this.selectedIndex] = true;
        this.reviewSubTab[this.selectedIndex] = 'COMMENTS';
    }

    /**showAllReviews - filter reviews based on show all reviews */
    showAllReviews() {
        this.dataFlags.isShowAllReviews = !this.dataFlags.isShowAllReviews;
        if (this.dataFlags.isShowAllReviews) {
            this.dataFlags.isReviewSelected = false;
            this.result.proposalReviews.forEach((element, index) => {
                this.highlight[index] = true;
                this.isReviewTypeOpen[index] = true;
            });
        } else {
            this.expandInProgressReviews();
        }
    }

    fileDrop(files) {
        for (let index = 0; index < files.length; index++) {
            this.uploadedFile.push(files[index]);
        }
    }

    deleteFromUploadedFileList(index) {
        this.uploadedFile.splice(index, 1);
    }

    /**setcommentRequestObject - sets common request object for add comment and complete/return review */
    setcommentRequestObject() {
        this.setCommonRequestObject();
        this.requestObject.personId = this.personId;
        this.requestObject.fullName = this._commonService.getCurrentUserDetail('fullName');
        if (!this._commonService.isWafEnabled) {
            this.formData = new FormData();
            for (let i = 0; i < this.uploadedFile.length; i++) {
                this.formData.append('files', this.uploadedFile[i], this.uploadedFile[i].name);
            }
        }
        this.reviewRequest.proposalId = this.result.proposal.proposalId,
            this.reviewRequest.reviewId = this.proposalReviewerReview.reviewId,
            this.reviewRequest.userName = this._commonService.getCurrentUserDetail('userName');
        if (this.requestObject.reviewComment != null && this.requestObject.reviewComment !== '') {
            this.reviewRequest.newReviewComment = this.requestObject;
        }
    }

    /**addReviewComment - service call to add review comments and attachments */
    addReviewComment() {
        if (this.requestObject.reviewComment == null || this.requestObject.reviewComment === '') {
            this.errorList.set('comment', '* Please add atleast one comment to Add review.');
        } else {
            this.setcommentRequestObject();
            if (!this._commonService.isWafEnabled && !this.isSaving) {
                this.isSaving = true;
                this.formData.append('formDataJson', JSON.stringify(this.reviewRequest));
                this.$subscriptions.push(this._proposalService.addReviewComment(this.formData).subscribe((data: any) => {
                    this.filterReviews(data);
                    this.clearFields();
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Add Review Comment failed. Please try again.');
                    this.isSaving = false;
                },
                    () => {
                        $('#addReviewModal').modal('hide');
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review Comment added successfully.');
                        this.isSaving = false;
                    }));
            } else {
                this._commonService.isManualLoaderOn = true;
                this._commonService.isShowOverlay = true;
                $('#addReviewModal').modal('hide');
                this.addReviewCommentWaf();
            }
        }
    }
    /**if attachments are added, set parameters and calls saveAttachment,
     * Otherwise calls saveWafRequest function in WafAttachmentService */
    async addReviewCommentWaf() {
        if (this.uploadedFile.length > 0) {
            const data = await this._wafAttachmentService.saveAttachment(this.reviewRequest, null, this.uploadedFile,
                '/addReviewCommentForWaf', 'commentEvaluation', null);
            this.checkCommentSaved(data);
        } else {
            this._wafAttachmentService.saveWafRequest(this.reviewRequest, '/addReviewCommentForWaf').then(data => {
                this.checkCommentSaved(data);
            }).catch(error => {
                this.checkCommentSaved(error);
            });
        }
        this.isSaving = false;
    }
    /**
     * @param  {} data
     * if data doesn't contain error, review comment added successfully,Otherwise shows error toast
     */
    checkCommentSaved(data) {
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
        if (data && !data.error) {
            this.filterReviews(data);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review Comment added successfully.');
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for adding Review Comment.');
        }
        this.clearFields();
    }

    /** downloads uploaded review attachments
     * @param event
     * @param selectedFileName
     * @param selectedAttachArray
     */
    downloadAttachments(event, selectedFileName, selectedAttachArray: any[]) {
        event.preventDefault();
        const attachment = selectedAttachArray.find(attachmentDetail => attachmentDetail.fileName === selectedFileName);
        if (attachment != null) {
            this.$subscriptions.push(this._proposalService.downloadReviewAttachment(attachment.attachmentId).subscribe(
                data => {
                    fileDownloader(data, attachment.fileName);
                }));
        }
    }

    clearModalFlags() {
        $('#evaluation-confirmation-modal').modal('hide');
        this.modalData = {};
        this.dataFlags.isDeleteComment = false;
        this.dataFlags.isRankProposal = false;
    }

    setQuestionnaireInputs(reviews) {
        this.questionnaireObject.moduleItemKey = reviews.proposalId ? (reviews.proposalId).toString() : '';
        this.questionnaireObject.moduleSubItemKey = reviews.reviewId ? (reviews.reviewId).toString() : '';
        this.result.dataVisibilityObj.isEvaluationFormEdittable[reviews.reviewId] = reviews.reviewStatus.reviewStatusCode === 1 &&
            (reviews.reviewerPersonId === this.personId || this.isMaintainEvaluationForm) ? true : false;
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
    }

    changeProposalStatus(event, statusCode) {
        this.reviewRequest.proposalStatusCode = event.target.checked ? statusCode : null;
    }

    /**checkCommentsAdded - checks whether atleast one comment is present in the review before approval */
    checkCommentsAdded() {
        if (this.requestObject.reviewComment == null || this.requestObject.reviewComment === '') {
            this.errorList.set('comment', '* Please add atleast one comment to ' + this.actionName + ' review');
        }
        if (this.proposalReviewerReview.isFinal && this.actionType === 'APPROVE' && ((!this.result.proposal.isRcbfProposal) ||
            (this.result.proposal.isRcbfProposal && this.proposalReviewerReview.roleId === 415))) {
            if (!this.reviewRequest.proposalStatusCode || this.reviewRequest.proposalStatusCode === 'null') {
                this.errorList.set('status', '* Please select a Proposal status to ' + this.actionName + ' review');
            }
        }
    }

    /** service call for complete/return review
     * @param actionType
     */
    completeReturnReview(actionType) {
        this.errorList.clear();
        this.mandatoryList.clear();
        this.checkCommentsAdded();
        let ipNumbers = [];
        if (this.actionType === 'DISAPPROVE') {
            this.dateValidation(this.reviewRequest.piReviewDeadLineDate, 'Deadline');
            this.reviewRequest.piReviewDeadLineDate = parseDateWithoutTimestamp(this.reviewRequest.piReviewDeadLineDate);
        }
        if (this.errorList.size === 0  && !this.isSaving) {
            this.isSaving = true;
            this.setcommentRequestObject();
            this.setActionRequestObject(actionType);
            if (!this._commonService.isWafEnabled) {
                this.formData.append('formDataJson', JSON.stringify(this.reviewRequest));
                this.$subscriptions.push(this._proposalService.approveOrDisapproveReview(this.formData).subscribe((data: any) => {
                    this.completeReturnReviewActions(actionType, data);
                    ipNumbers = data.ipNumbers;
                }, err => {
                    this.showErrorToast(actionType);
                }, () => {
                        this.reviewSubTab.fill('COMMENTS');
                        this.clearFields();
                        if (ipNumbers && ipNumbers.length > 0) {
                            this.createAwardFromProposal(ipNumbers);
                        }
                        this.isSaving = false;
                        $('#addReviewModal').modal('hide');
                        this.showSuccessToast(actionType);
                }));
            } else {
                this._commonService.isManualLoaderOn = true;
                this._commonService.isShowOverlay = true;
                $('#addReviewModal').modal('hide');
                this.completeReturnReviewWaf(actionType);
            }
        }
    }

    /** createAwardFromProposal - create award from proposal if IP is generated
  * @param ipNumbers
  */
    createAwardFromProposal(ipNumbers) {
        this._proposalService.createAwardFromProposal({
            'ipNumbers': ipNumbers, 'updateUser': localStorage.getItem('currentUser')
        })
            .subscribe(data => { });
    }

    /**
      * @param  {} actionType
      * if attachments are added, set parameters and calls saveAttachment,
      * Otherwise calls saveWafRequest function in WafAttachmentService
     */
    async completeReturnReviewWaf(actionType) {
        this.reviewRequest.isLastUploadedFile = false;
        if (this.uploadedFile.length > 0) {
            const data = await this._wafAttachmentService.saveAttachment(this.reviewRequest, null, this.uploadedFile,
                '/approveOrDisapproveReviewForWaf', 'completeEvaluation', null);
            this.checkReviewCompleted(actionType, data);
        } else {
            this._wafAttachmentService.saveWafRequest(this.reviewRequest, '/approveOrDisapproveReviewForWaf').then(data => {
                this.checkReviewCompleted(actionType, data);
            }).catch(error => {
                this.checkReviewCompleted(actionType, error);
            });
        }
    }
    /**
    * @param  {} actionType
    * @param  {} data
    * if data doesn't contain error, review completed successfully,Otherwise shows error toast
    */
    checkReviewCompleted(actionType, data) {
        let ipNumbers = [];
        this._commonService.isShowLoader.next(false);
        this._commonService.isManualLoaderOn = false;
        if (data && !data.error) {
            this.completeReturnReviewActions(actionType, data);
            ipNumbers = data.ipNumbers;
            this.reviewSubTab.fill('COMMENTS');
            this.clearFields();
            if (ipNumbers && ipNumbers.length > 0) {
                this.createAwardFromProposal(ipNumbers);
            }
            this.showSuccessToast(actionType);
        } else {
            this.showErrorToast(actionType);
        }
    }
    /**
   * @param  {} actionType
   * @param  {} data
   * actions to perform in common for both waf enabled and disabled services after getting response data
   */
    completeReturnReviewActions(actionType, data) {
        if (actionType === 'DISAPPROVE' && this.isModifyProposal) {
            this._proposalService.proposalMode = this.result.dataVisibilityObj.mode = 'edit';
            this._dataStore.updateStore(['dataVisibilityObj'], this.result);
        }
        this.filterReviews(data);
        this.setDataAfterApproval(data);
    }
    /**
   * @param  {} actionType
   * shows success toast based on action type
   */
    showSuccessToast(actionType) {
        const toastMsg = actionType === 'DISAPPROVE' ? 'Review ' + this.actionName + 'ed successfully.' :
            'Review ' + this.actionName + 'd successfully.';
        this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMsg);
    }
    /**
     * @param  {} actionType
     * shows error toast based on waf enabled or not and action type
     */
    showErrorToast(actionType) {
        let toastMsg;
        if (actionType === 'DISAPPROVE') {
            toastMsg = !this._commonService.isWafEnabled ?  this.actionName + 'Review failed. Please try again.' :
                'Waf blocked request for ' + this.actionName + 'ing review.';
        } else {
            toastMsg = !this._commonService.isWafEnabled ? this.actionName.slice(0, -1) + 'Review failed. Please try again.' :
                'Waf blocked request for' + this.actionName.slice(0, -1) + 'ing review.';
        }
        this._commonService.showToast(HTTP_ERROR_STATUS, toastMsg);
    }
    async setDataAfterApproval(data) {
        this.result.proposal.proposalStatus = data.proposal.proposalStatus;
        this.result.proposal.statusCode = data.proposal.statusCode;
        this.result.proposal.isEndorsedOnce = data.proposal.isEndorsedOnce;
        this.result.proposal.isRcbfProposal = data.proposal.isRcbfProposal;
        this.result.evaluationReviewStop = data.evaluationReviewStop;
        this.result.proposal.ipNumber = data.proposal != null ? data.proposal.ipNumber : null;
        this.result.hasRank = data.hasRank;
        this.result.hasRecommendation = data.hasRecommendation;
        this.proposalRank = this.result.proposal.proposalRank;
        this.recommendationCode = this.result.proposal.recommendationCode;
        if (this.result.proposal.statusCode == 12) {
            this.result.dataVisibilityObj.mode = 'edit';
            const isModuleLocked = await this.webSocket.isModuleLocked('Proposal', this.result.proposalId);
            this.webSocket.getLockForModule('Proposal', this.result.proposal.proposalId, this.result.proposal.title);
        } else {
            this.result.dataVisibilityObj.mode = this.result.dataVisibilityObj.mode;
        }
        // tslint:disable-next-line: max-line-length
        this.result.dataVisibilityObj.isBudgetEdittable = this.proposalReviewerReview.isFinal ? false : this.result.dataVisibilityObj.isBudgetEdittable;
        this._dataStore.updateStore(['dataVisibilityObj', 'proposal', 'evaluationReviewStop', 'hasRank', 'hasRecommendation'], this.result);
    }

    /** sets specific values of requestObject for complete/return review
     * @param actionType
     */
    setActionRequestObject(actionType) {
        this.reviewRequest.actionType = actionType;
        this.reviewRequest.completeReviewerPersonId = this._commonService.getCurrentUserDetail('personID');
        this.reviewRequest.completeReviewerFullName = this._commonService.getCurrentUserDetail('fullName');
        this.reviewRequest.completeReviewerEmail = this._commonService.getCurrentUserDetail('email');
        /** set this.reviewRequest.reviewStatusCode = 5 when
        * 1. RCBF proposal and stop is HOD(roleId = 400) and proposalstatus is chosed to be Unsucessful ie, proposalStatusCode = 29
        * 2. Grant type external(categoryCode = 2) or others (categoryCode = 3)
        *    and proposal status Grant Manager Final Review in Progress(statusCode = 28) and
        *    proposalstatus is chosed to be Not Submitted(reviewRequest.proposalStatusCode = 30)*/
        if ((this.result.proposal.isRcbfProposal && this.proposalReviewerReview.roleId === 400 &&
            this.reviewRequest.proposalStatusCode == 29) ||
            ((this.result.proposal.grantCallType.categoryCode === 2 || this.result.proposal.grantCallType.categoryCode === 3)
                && this.result.proposal.statusCode === 28 && this.reviewRequest.proposalStatusCode === 30)) {
            this.reviewRequest.reviewStatusCode = 5;
        } else { this.reviewRequest.reviewStatusCode = null; }
    }

    sortReviewTable(sortFieldBy) {
        if (this.dataFlags.isReverse) {
            this.reverse = 'DESC';
        } else {
            this.reverse = 'ASC';
        }
        this.sortBy = sortFieldBy;
        this.$subscriptions.push(this._proposalService.sortReviewerFields({
            'proposalId': this.result.proposal.proposalId,
            'sortBy': this.sortBy, 'reverse': this.reverse
        }).subscribe((data: any) => {
            this.filterReviews(data);
        }, err => { },
            () => {
                if (!this.dataFlags.isShowAllReviews) {
                    this.highlightReviewsAfterSorting();
                }
            }));
    }

    /**highlightReviewsAfterSorting - function that filters reviews that are to be highlighted after sorting */
    highlightReviewsAfterSorting() {
        /** to preserve review already selected and highlighted, after sorting */
        if (this.dataFlags.isReviewSelected) {
            this.result.proposalReviews.find((value, index) => {
                if (value.reviewId === this.selectedReview.reviewId) {
                    this.selectedIndex = index;
                }
            });
            this.filterReviewDetails();
        } else {
            /** to preserve in-progress reviews highlighted, after sorting */
            this.expandInProgressReviews();
        }
    }

    checkMandatoryFilled() {
        if (this.result.hasRecommendation && this.recommendationCode == null || this.recommendationCode === 'null') {
            this.mandatoryList.set('recommendation', 'Please choose a recommendation value to save');
        }
        if (this.result.hasRank && this.recommendationCode !== 2) {
            if (!this.proposalRank) {
                this.mandatoryList.set('rank', 'Please enter a rank to save');
            } else if (this.proposalRank < 1) {
                this.mandatoryList.set('rank', 'Please enter a valid rank');
            }
        }
    }

    /**validateRankData - checks for mandatory filled, valiadtes if ranks are already endorsed*/
    validateRankData() {
        this.mandatoryList.clear();
        if (!this.result.proposal.isEndorsedOnce || this.result.proposal.isEndorsedOnce == null) {
            this.checkMandatoryFilled();
        } else {
            if (!((this.result.hasRank && (this.proposalRank !== this.result.proposal.proposalRank)) ||
                (this.result.hasRecommendation && (this.recommendationCode !== this.result.proposal.recommendationCode)))) {
                if ((this.result.hasRank && (this.proposalRank === this.result.proposal.proposalRank)) &&
                    (this.result.hasRecommendation && (this.recommendationCode === this.result.proposal.recommendationCode))) {
                    this.mandatoryList.set('endorseWarning', 'Rank and Recommendation values is not modified, ' +
                        'saving demands DEC reviewers to endorse again. Please enter new values to save.');
                } else if (this.result.hasRecommendation && (this.recommendationCode === this.result.proposal.recommendationCode)) {
                    this.mandatoryList.set('endorseWarning', 'Recommendation value is not modified, saving recommendation demands DEC reviewers '
                        + 'to endorse again, please enter a new recommendation to save.');
                }
            } else { this.checkMandatoryFilled(); }
        }
        if (this.mandatoryList.size !== 0) { return false; }
        return true;
    }

    setRankProposalModal() {
        const isMandatoryFilled = this.validateRankData();
        if (isMandatoryFilled) {
            if (!this.result.proposal.isEndorsedOnce || this.result.proposal.isEndorsedOnce == null) {
                this.saveProposalRank();
            } else {
                this.modalData.modalMessage = 'Changing the ranking and/or recommendation requires all DEC reviewers to endorse again. '
                    + 'Are you sure you want to save your changes?';
                this.modalData.modalHeader = 'Confirmation';
                if(this.isChanged){
                    this.dataFlags.isRankProposal = true;
                }
                $('#evaluation-confirmation-modal').modal('show');
            }
        } else {
            this._autoSaveService.errorEvent(
                { name: 'Proposal Evaluation', documentId: this.SECTION_ID, type: 'VALIDATION' });
        }
    }

    setDataAfterRanking(data) {
        this.result.proposal.proposalRank = data.proposal.proposalRank;
        this.result.proposal.recommendationCode = data.proposal.recommendationCode;
        this.proposalRank = data.proposal.proposalRank;
        this.recommendationCode = data.proposal.recommendationCode;
        this.filterReviews(data);
        this.result.proposal.isEndorsedOnce = data.proposal.isEndorsedOnce;
        this.result.proposal.proposalStatus = data.proposal.proposalStatus;
        this.result.proposal.statusCode = data.proposal.statusCode;
        this._dataStore.updateStore(['proposal'], this.result);
    }

    saveProposalRank() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._proposalService.saveProposalRank({
                    'proposalId': this.result.proposal.proposalId, 'proposalRank': this.proposalRank,
                    'userName': this._commonService.getCurrentUserDetail('userName'), 'recommendationCode': this.recommendationCode
                })
                    .subscribe((data: any) => {
                        this.setDataAfterRanking(data);
                        this.setUnsavedChanges(false);
                    },
                        err => {
                            if (this.result.hasRecommendation && this.result.hasRank) {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Rank and Recommendation failed. Please try again.');
                            } else if (this.result.hasRecommendation) {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Recommendation failed. Please try again.');
                            }
                        },
                        () => {
                            this.clearModalFlags();
                            this.dataFlags.isRankProposal = false;
                            this.mandatoryList.clear();
                            if (this.result.hasRecommendation && this.result.hasRank) {
                                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Rank and Recommendation saved successfully.');
                            } else if (this.result.hasRecommendation) {
                                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Recommendation saved successfully.');
                            }
                            this.isSaving = false;
                        }));
                    }
    }

    setDeleteReviewWarning() {
        this.modalData.modalMessage = 'Are you sure you want to delete this review comment?';
        this.modalData.modalHeader = 'Delete comment';
        this.dataFlags.isDeleteComment = true;
    }

    deleteReviewComment() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._proposalService.deleteReviewComment({
                'proposalId': this.result.proposal.proposalId,
                'reviewId': this.proposalReviewerReview.reviewId, 'reviewCommentId': this.deleteCommentId
            })
                .subscribe((data: any) => { this.filterReviews(data); },
                    err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Review Comment failed. Please try again.'); },
                    () => {
                        this.clearModalFlags();
                        this.dataFlags.isDeleteComment = false;
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review Comment deleted successfully.');
                    }));
        }
    }

    checkDepartmentLevelPermission() {
        this.isMaintainPrivateComments = this.checkDepartmentLevelRightsInArray('MAINTAIN_PRIVATE_COMMENTS');
        this.isModifyProposal = this.checkDepartmentLevelRightsInArray('MODIFY_PROPOSAL');
        this.isWriteReview = this.checkDepartmentLevelRightsInArray('WRITE_REVIEW');
        this.isMaintainEvaluationForm = this.checkDepartmentLevelRightsInArray('MAINTAIN_EVALUATION_FORM');
    }

    checkDepartmentLevelRightsInArray(input) {
        if (this.departmentLevelRights != null && this.departmentLevelRights.length) {
            return this.departmentLevelRights.includes(input);
        } else {
            return false;
        }
    }

    async getSystemLevelPermissions() {
        this.isAssignReview = await this._commonService.checkPermissionAllowed('ASSIGN_REVIEW');
    }

    /**changeAssignee - set data fields based on assign or assign to me values*/
    changeAssignee() {
        this.errorList.clear();
        this.elasticSearchOptions.defaultValue = '';
        this.reviewer = null;
        this.clearField = new String('true');
        if (this.assignType === 2) {
            this.requestObject.reviewerPersonId = this.personId;
            this.requestObject.reviewerFullName = this._commonService.getCurrentUserDetail('fullName');
        }
    }

    getDateObject() {
        this.requestObject.reviewDeadLine = this.requestObject.reviewDeadLine ? getDateObjectFromTimeStamp(this.requestObject.reviewDeadLine)
            : this.proposalReviewerReview.reviewDeadLineDate ? getDateObjectFromTimeStamp(this.proposalReviewerReview.reviewDeadLineDate) : null;
    }

    addReviewer() {
        let isReviewExist = false;
        this.errorList.clear();
        if (this.requestObject.reviewerPersonId == null) {
            this.errorList.set('reviewer', '* Please choose a reviewer');
            this.dataFlags.isError = true;
        }
        this.dateValidation(this.requestObject.reviewDeadLine, 'Review deadline');
        if (this.errorList.size === 0 && !this.isSaving) {
            this.isSaving = true;
            this.requestObject.proposalId = this.result.proposal.proposalId;
            this.requestObject.reviewId = this.proposalReviewerReview.reviewId;
            this.requestObject.logginPersonId = this.personId;
            this.requestObject.reviewDeadLine = parseDateWithoutTimestamp(this.requestObject.reviewDeadLine);
            this.$subscriptions.push(this._proposalService.addReviewer(this.requestObject)
                .subscribe((data: any) => {
                    isReviewExist = data.proposal.isReviewExist;
                    this.checkAnyPendingReviews(isReviewExist, data, 'Add Reviewer', this.requestObject.reviewDeadLine);
                },
                    err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Assigning Reviewer failed. Please try again.'); },
                    () => {
                        if (!isReviewExist) {
                            $('#link-reviewer-modal').modal('hide');
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reviewer assigned successfully.');
                        }
                        this.isSaving = false;
                    }));
        }
    }

    updateReviewSummary(data) {
        this.requestObject = {};
        this.filterReviews(data);
        this.checkIsProposalPerson();
        this.expandInProgressReviews();
    }

    /**checkIfRoleIdMatches - roleId should be same to check whether the person has right in the stop */
    checkIfRoleIdMatches(review) {
        const sameRole = this.result.personRoles.find(role => review.roleId === role.roleId);
        return sameRole ? true : false;
    }

    /**checkRightToShowCompleteBtn - roleId should be same to check whether the person has right in the stop,
     * hasEndorsed = false to confirm its not endorse button
     * @param review
     */
    checkRightToShowCompleteBtn(review) {
        return this.checkIfRoleIdMatches(review) === true && review.hasEndorsed !== true ? true : false;
    }

    /**checkRightToShowEndorseBtn - hasEndorsed = true to confirm its endorse button, logged in person is same as reviewer, roleId is same
     * @param review
     */
    checkRightToShowEndorseBtn(review) {
        return review.hasEndorsed === true && review.reviewerPersonId === this.personId ? true : false;
    }

    /**checkRightToEnableButtons - disable when there is no hasEndorse, if there is hasEndorse check whther there are any in progress reviews
    * @param type
    */
    checkRightToEnableButtons(type) {
        let value = true;
        const hasEndorse = this.actualReviews.find(review => review.hasEndorsed === true);
        if (!hasEndorse) {
            value = (type === 'Complete') ? false : true;
        } else {
            this.actualReviews.find(review => {
                if (review.hasEndorsed === true && review.reviewStatus.reviewStatusCode === 1) {
                    value = false;
                }
            });
        }
        return value;
    }

    /**setStatusCode - sets pre loaded proposal status in dropdown to null */
    setStatusCode() {
        this.reviewRequest.proposalStatusCode = null;
    }

    clearFields() {
        this.requestObject = {};
        this.reviewRequest = {};
        this.uploadedFile = [];
        this.errorList.clear();
    }

    /**isShowButtonsForGrantAdmin - show buttons like request new review, assign reviewer for GA only if status is GA in progress,
     * GA final review in progress, DEC in progress for internal and external and till Pending HOD endorsement for RCBF*/
    isShowButtonsForGrantAdmin() {
        if (this.result.personRoles != null) {
            const grantAdmin = this.result.personRoles.find(role => role.roleId === 120);
            if (grantAdmin != null) {
                if (!this.result.proposal.isRcbfProposal) {
                    return (this.result.proposal.statusCode === 14 || this.result.proposal.statusCode === 17 ||
                        this.result.proposal.statusCode === 16) ? true : false;
                } else {
                    return (this.result.proposal.statusCode === 14 || this.result.proposal.statusCode === 15) ? true : false;
                }
            } return true;
        }
    }

    /**setRankValue - if recommendation value is not support, sets rank value to null */
    setRankValue() {
        this.proposalRank = this.recommendationCode === 2 ? null : this.proposalRank;
        if (this.recommendationCode === 2) {
            this.mandatoryList.delete('rank');
        }
    }

    /** fetched user names based on roles if selected stop is not DEC roleId(200)
    * @param evaluationStop
    */
    getUserList(evaluationStop) {
        this.reviewer = null;
        if (evaluationStop && evaluationStop !== 'null' && evaluationStop.roleId !== 200) {
            this.$subscriptions.push(
                this._proposalService.getEvaluationPersonsBasedOnRole(evaluationStop.roleId, this.result.proposal.homeUnitNumber)
                    .subscribe((data: any) => {
                        this.userList = data;
                    }));
        }
    }

    /** sets reviewer details from the user list chosen and remove the temperory object reviewer */
    setReviewerDetails() {
        this.requestObject.reviewerPersonId = this.reviewer.personId;
        this.requestObject.reviewerFullName = this.reviewer.fullName;
        this.requestObject.reviewerEmail = this.reviewer.emailAddress;
    }

    setUnsavedChanges(flag: boolean) {
        if (this.result.dataVisibilityObj.dataChangeFlag !== flag) {
            this._autoSaveService.setUnsavedChanges('Proposal Evaluation', this.SECTION_ID, flag, true);
        }
        this.result.dataVisibilityObj.dataChangeFlag = flag;
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
    }

    changeTab(tabName: string, index: number, reviewers?) {
        this.tempTabChangeDetails = {tabName: tabName, index: index, reviewers: reviewers} ;
        this.getUnsavedChanges();
        this.unsavedChanges ? $('#evaluation-save-modal').modal('show') : this.reviewSubTab[index] = tabName;
        if (!this.unsavedChanges && tabName === 'EVALUATION') {
            this.proposalReviewerReview = reviewers;
            this.setQuestionnaireInputs(reviewers);
        }
    }

    getUnsavedChanges() {
        this.unsavedChanges = this._autoSaveService.unSavedSections.find(ele => ele.documentId === 'proposal-common-questionnaire');
    }

    discardChanges() {
        this.unsavedChanges = null;
        this._autoSaveService.setUnsavedChanges(this.questionnaireObject.name, 'proposal-common-questionnaire', false, true);
        this.result.dataVisibilityObj.dataChangeFlag = false;
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
        this.changeTab(this.tempTabChangeDetails.tabName, this.tempTabChangeDetails.index, this.tempTabChangeDetails.reviewers);
    }
    getChangesWithOutSave() {
        if (this.isChanged && (this.recommendationCode !== this.result.proposal.recommendationCode || this.proposalRank !== this.result.proposal.proposalRank)) {
            $('#confirmation-complete-review-modal').modal('show');
        } else {
            $('#addReviewModal').modal('show');
        }
    }
    continueWithoutSave() {
        this.recommendationCode = this.result.proposal.recommendationCode;
        this.proposalRank = this.result.proposal.proposalRank;
        $('#addReviewModal').modal('show');
    }

    triggerValidationModal() {
        const validationRequest: any = {
            moduleCode: 3,
            subModuleCode: 4,
            moduleItemKey: this.result.proposal.proposalId,
            subModuleItemKey: this.proposalReviewerReview.reviewId
        };
        if (!this.isSaving) {
            this.isSaving = true;
            this.validationMessage.errorMessage = [];
            this.validationMessage.warningMessage = [];
            this.$subscriptions.push(this._commonService.evaluateValidation(validationRequest).subscribe((data) => {
                this.validationMessage.errorList = data;
                if (this.validationMessage.errorList.length > 0) {
                    this.validationMessage.errorList.forEach(element => {
                        element.validationType === 'VE' ?
                        this.validationMessage.errorMessage.push(element) :
                        this.validationMessage.warningMessage.push(element);
                        $('#ValidateApproveBudgetModal').modal('show');
                    });
                } else {
                    this.getChangesWithOutSave();
                }
            }));
            this.isSaving = false;
        } else {
            this.getChangesWithOutSave();
            this.isSaving = false;
        }
    }

}
