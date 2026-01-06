import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { EvaluationApproverPopupService } from './evaluation-approver-popup.service';

@Component({
    selector: 'app-evaluation-approver-popup',
    templateUrl: './evaluation-approver-popup.component.html',
    styleUrls: ['./evaluation-approver-popup.component.css']
})
export class EvaluationApproverPopupComponent implements OnChanges, OnDestroy {

    @Output() selectedResult: EventEmitter<any> = new EventEmitter<any>();
    $subscriptions: Subscription[] = [];
    @Input() result: any;
    scoringCriteriaList: any = [];
    criteriaDataList: any = [];
    criteriaSupportData: any = [];
    uploadedFile: any = [];
    submitTryCount = 0;
    isAllCriteriaVisited = true;
    tempScoringCriteriaList = [];
    isExpandall = false;
    isSaving = false;

    constructor(private _evaluationApproverPopupService: EvaluationApproverPopupService,
        public _commonService: CommonService) { }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    ngOnChanges(changes: SimpleChanges) {
        const curResult: SimpleChange = changes.result;
        if (curResult !== undefined) {
            this.fetchScoringCriterias();
        }
    }

    fetchScoringCriterias() {
        this.$subscriptions.push(this._evaluationApproverPopupService.fetchScoringCriteriaByProposal(
            {
                grantCallId: this.result.grantCall.grantCallId,
                personId: this.result.personId,
                proposalId: this.result.proposal.proposalId,
                updateUser: this._commonService.getCurrentUserDetail('userName')
            }).subscribe((data: any) => {
                this.scoringCriteriaList = data.workflowReviewerScores || [];
                this.tempScoringCriteriaList = JSON.parse(JSON.stringify(data.workflowReviewerScores));
                this.setCriteriaDataList();
            }));
    }

    setCriteriaDataList() {
        this.criteriaDataList = [];
        this.criteriaSupportData = [];
        this.submitTryCount = 0;
        this.isAllCriteriaVisited = true;
        this.scoringCriteriaList.forEach((element, index) => {
            element.score = this.tempScoringCriteriaList[index].score;
            this.criteriaDataList.push({ ...this.getCriteriaData() });
            this.criteriaSupportData.push({ ...this.getCriteriaSupportData() });
        });
    }


    getCriteriaData() {
        const CRITERIA_DATA = {
            comment: null,
            isPrivate: true,
            updateTimeStamp: null,
            updateUser: null,
            workflowReviewerAttachments: []
        };
        return CRITERIA_DATA;
    }

    getCriteriaSupportData() {
        const SUPPORT_DATA = {
            isOpen: false,
            attachmentWarningMessage: null,
            isScoreInvalid: false,
            editIndex: null,
            isCommentValid: true,
            uploadedFile: []
        };
        return SUPPORT_DATA;
    }

    /**
  * @param  {any} event
  * restricts inputs other than numbers
  */
    inputRestriction(event: any) {
        const PATTERN = /[0-9\+\/\.\ ]/;
        if (!PATTERN.test(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    validateCurrentCriteria(criteriaIndex: number) {
        if (!this.criteriaSupportData[criteriaIndex].isScoreInvalid) {
            this.validateComment(criteriaIndex);
            if (this.criteriaSupportData[criteriaIndex].isCommentValid) {
                this.saveOrUpdateCommentOrAttachments(criteriaIndex);
            }
        }
    }

    validateComment(criteriaIndex) {
        (this.criteriaDataList[criteriaIndex].comment || this.criteriaDataList[criteriaIndex].workflowReviewerAttachments.length) ?
            this.criteriaSupportData[criteriaIndex].isCommentValid = true :
            this.criteriaSupportData[criteriaIndex].isCommentValid = false;
    }

    editComment(comment, index, criteriaIndex) {
        this.criteriaDataList[criteriaIndex] = JSON.parse(JSON.stringify(comment));
        this.criteriaSupportData[criteriaIndex].editIndex = index;
        this.scrollToComments(criteriaIndex, 'comment' + criteriaIndex);
    }

    addAttachments(files, criteriaIndex) {
        this.criteriaSupportData[criteriaIndex].attachmentWarningMessage = null;
        let dupCount = 0;
        for (const INDEX of files) {
            (this.checkDuplicateAttachment(INDEX, criteriaIndex)) ? dupCount = dupCount + 1 : this.setAttachmentList(INDEX, criteriaIndex);
        }
        if (dupCount > 0) {
            this.criteriaSupportData[criteriaIndex].attachmentWarningMessage = '* ' + dupCount + ' File(s) already added';
        }
    }

    setAttachmentList(index, criteriaIndex) {
        this.criteriaSupportData[criteriaIndex].uploadedFile
            .push({ key: this.scoringCriteriaList[criteriaIndex].scoringCriteriaTypeCode, file: index });
        this.criteriaDataList[criteriaIndex].workflowReviewerAttachments.push({
            'fileName': index.name,
            'mimeType': index.type,
            'updateUser': this._commonService.getCurrentUserDetail('userName')
        });
    }

    checkDuplicateAttachment(index, criteriaIndex) {
        return this.criteriaDataList[criteriaIndex].workflowReviewerAttachments.find(dupFile => dupFile.fileName === index.name &&
            dupFile.mimeType === index.type) ? true : false;
    }

    deleteAttachment(criteriaIndex, attachment, attachmentIndex) {
        if (attachment.workflowReviewerAttmntsId) {
            this.deleteSavedAttachment(attachment.workflowReviewerAttmntsId, null, criteriaIndex, attachmentIndex);
        } else {
            this.criteriaSupportData[criteriaIndex].uploadedFile.splice(attachmentIndex, 1);
            this.criteriaDataList[criteriaIndex].workflowReviewerAttachments.splice(attachmentIndex, 1);
        }
    }

    deleteSavedAttachment(workflowReviewerAttmntsId, commentIndex, criteriaIndex, fileIndex) {
        this.$subscriptions.push(this._evaluationApproverPopupService.deleteWorkflowReviewerAttachment(
            { workflowReviewerAttmntsId: workflowReviewerAttmntsId }).subscribe((data: any) => {
                if (commentIndex !== null) {
                    this.scoringCriteriaList[criteriaIndex].workflowReviewerComments[commentIndex].
                        workflowReviewerAttachments.splice(fileIndex, 1);
                } else {
                    this.criteriaDataList[criteriaIndex].workflowReviewerAttachments.splice(fileIndex, 1);
                }
            }));
    }

    clearComment(criteriaIndex) {
        this.criteriaDataList[criteriaIndex] = { ...this.getCriteriaData() };
        this.criteriaSupportData[criteriaIndex].uploadedFile = [];
        this.criteriaSupportData[criteriaIndex].editIndex = null;
        this.criteriaSupportData[criteriaIndex].isCommentValid = true;
        this.criteriaSupportData[criteriaIndex].attachmentWarningMessage = null;
    }

    saveOrUpdateCommentOrAttachments(criteriaIndex) {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._evaluationApproverPopupService.saveWorkflowScoreOrEndorseProposal(
                this.setCommentRequestData(criteriaIndex), this.criteriaSupportData[criteriaIndex].uploadedFile).subscribe((data: any) => {
                    this.scoringCriteriaList[criteriaIndex] = data.workflowReviewerScores[criteriaIndex];
                    this.tempScoringCriteriaList = JSON.parse(JSON.stringify(data.workflowReviewerScores));
                    this.isSaving = false;
                    this.submitTryCount = 0;
                    this.isAllCriteriaVisited = true;
                    this.clearComment(criteriaIndex);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment/Attachment(s) saved successfully.');
                }, err => { this.isSaving = false; }));
        }
    }

    setCommentRequestData(criteriaIndex) {
        this.criteriaDataList[criteriaIndex].updateTimeStamp = new Date().getTime();
        this.criteriaDataList[criteriaIndex].updateUser = this._commonService.getCurrentUserDetail('userName');
        const REQUEST_DATA: any = {
            proposalId: this.result.proposal.proposalId,
            grantCallId: this.result.grantCall.grantCallId,
            workflowReviewerScores: [],
            isSubmit: null
        };
        REQUEST_DATA.workflowReviewerScores.push(JSON.parse(JSON.stringify(this.scoringCriteriaList[criteriaIndex])));
        if (!this.criteriaDataList[criteriaIndex].workflowReviewerCommentsId) {
            REQUEST_DATA.workflowReviewerScores[0].workflowReviewerComments.push(this.criteriaDataList[criteriaIndex]);
        } else {
            REQUEST_DATA.workflowReviewerScores[0].workflowReviewerComments.splice(this.criteriaSupportData[criteriaIndex].editIndex, 1,
                this.criteriaDataList[criteriaIndex]);
        }
        return REQUEST_DATA;
    }

    checkScoreValidation(score, criteriaIndex) {
        this.criteriaSupportData[criteriaIndex].isScoreInvalid = false;
        const pattern = /^(?:[0-9][0-9]{0,2}(?:\.\d{0,2})?|9|9.00|9.99)$/;
        if (score && (!pattern.test(score) || score > 10)) {
            this.criteriaSupportData[criteriaIndex].isScoreInvalid = true;
        }
    }

    downloadAttachment(file) {
        this.$subscriptions.push(this._evaluationApproverPopupService.downloadWorkflowReviewerAttachment(
            file.workflowReviewerAttmntsId).subscribe((data: any) => {
                fileDownloader(data, file.fileName);
            }));
    }

    deleteComment(workflowReviewerCommentsId, commentIndex, criteriaIndex) {
        this.$subscriptions.push(this._evaluationApproverPopupService.deleteWorkflowScoreComments(
            { workflowReviewerCommentsId: workflowReviewerCommentsId }).subscribe((data: any) => {
                this.scoringCriteriaList[criteriaIndex].workflowReviewerComments.splice(commentIndex, 1);
            }));
    }

    saveWorkflowScoreOrEndorseProposal(type) {
        if (!this.isSaving) {
            this.isSaving = true;
            this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._evaluationApproverPopupService.saveWorkflowScoreOrEndorseProposal(
                this.prepareWorkflowRequestData(type), this.uploadedFile).subscribe((data: any) => {
                    this.tempScoringCriteriaList = JSON.parse(JSON.stringify(data.workflowReviewerScores));
                    this.isSaving = false;
                    this._commonService.isShowOverlay = false;
                    if (type === 'SAVE') {
                        this.submitTryCount = 0;
                        this.isAllCriteriaVisited = true;
                        this.scoringCriteriaList = data.workflowReviewerScores;
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Scoring Criteria saved successfully.');
                    } else {
                        this.saveOrUpdateScoringCriteriaSucess(data);
                    }
                }, err => {
                    this.isSaving = false;
                    this._commonService.isShowOverlay = false;
                }));
        }
    }



    validateAllCriteria(type) {
        const isUnsavedChanges = this.checkScoreValid();
        if (type === 'SUBMIT') {
            this.submitTryCount += 1;
            if ((isUnsavedChanges && this.checkAllCriteriaScored()) || (isUnsavedChanges && this.submitTryCount > 1)) {
                this.saveWorkflowScoreOrEndorseProposal(type);
                this.submitTryCount = 0;
            } else if (!isUnsavedChanges) {
                this.submitTryCount = 0;
            }
        } else if (type === 'SAVE' && isUnsavedChanges) {
            this.saveWorkflowScoreOrEndorseProposal(type);
        }
    }

    checkScoreValid() {
        return this.criteriaSupportData.find(data => data.isScoreInvalid) ? false : true;
    }

    prepareWorkflowRequestData(type) {
        this.uploadedFile = [];
        this.criteriaDataList.forEach((criteriaData, index) => {
            if ((criteriaData.comment || criteriaData.workflowReviewerAttachments.length) &&
                !this.criteriaSupportData[index].isScoreInvalid) {
                if (!criteriaData.workflowReviewerCommentsId) {
                    criteriaData.updateTimeStamp = new Date().getTime();
                    criteriaData.updateUser = this._commonService.getCurrentUserDetail('userName');
                    this.scoringCriteriaList[index].workflowReviewerComments.push({ ...criteriaData });
                    this.uploadedFile = [...this.uploadedFile, ...this.criteriaSupportData[index].uploadedFile];
                } else {
                    this.scoringCriteriaList[index].workflowReviewerComments.splice(
                        this.findIndexOfCriteria(criteriaData.workflowReviewerCommentsId, index), 1, criteriaData);
                }
            }
            this.clearComment(index);
        });
        const REQUEST_DATA: any = {
            proposalId: this.result.proposal.proposalId,
            workflowReviewerScores: this.scoringCriteriaList,
            isSubmit: type === 'SUBMIT' ? 1 : null
        };
        return REQUEST_DATA;
    }

    findIndexOfCriteria(commentId, index) {
        return this.scoringCriteriaList[index].workflowReviewerComments.findIndex(item => item.workflowReviewerCommentsId === commentId);
    }
    /**
   * @param  {} data
   * save scoring criteia after sucess
   */
    saveOrUpdateScoringCriteriaSucess(data) {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal endorsed successfully.');
        this.scoringCriteriaList = data.workflowReviewerScores;
        this.result.canApproveRouting = data.canApproveRouting;
        this.result.workflow = data.workflow;
        this.result.isPersonCanScore = data.isPersonCanScore;
        this.result = data;
        this.selectedResult.emit(this.result);
        document.getElementById('closeScoringModal').click();
    }

    checkAllCriteriaScored() {
        return this.isAllCriteriaVisited = this.scoringCriteriaList.find((criteria, index) => (
            (criteria.score == null && this.result.isPersonCanScore) ||
            (!this.result.isPersonCanScore && (!criteria.workflowReviewerComments.length &&
                (!this.criteriaDataList[index].comment &&
                    !this.criteriaDataList[index].workflowReviewerAttachments.length))))) ? false : true;
    }

    toggleCriteriaComments(criteriaIndex) {
        this.criteriaSupportData[criteriaIndex].isOpen = this.criteriaSupportData[criteriaIndex].isOpen ?
            this.criteriaSupportData[criteriaIndex].isOpen : false;
        this.criteriaSupportData[criteriaIndex].isOpen = !this.criteriaSupportData[criteriaIndex].isOpen;
        this.scrollToComments(criteriaIndex, 'comment' + criteriaIndex);
        this.checkConditionArray();
    }

    scrollToComments(criteriaIndex, id) {
        if (this.criteriaSupportData[criteriaIndex].isOpen) {
            setTimeout(() => {
                const ITEM = document.getElementById(id);
                ITEM.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    toggleComments() {
        this.isExpandall = !this.isExpandall;
        this.criteriaSupportData.map(item => item.isOpen = this.isExpandall ? true : false);
    }
    /**
    * for checking the condition to show collapse button or expand button
    */
    checkConditionArray(): void {
        this.isExpandall = this.criteriaSupportData.every((element: any) => element.isOpen);
    }
}
