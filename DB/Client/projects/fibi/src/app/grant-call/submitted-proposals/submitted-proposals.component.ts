import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonService } from '../../common/services/common.service';
import { slideInOut, fadeDown } from '../../common/utilities/animations';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GrantCallService } from '../services/grant.service';
import { GrantCommonDataService } from '../services/grant-common-data.service';
import { openInNewTab, fileDownloader, deepCloneObject } from '../../common/utilities/custom-utilities';
import {concatUnitNumberAndUnitName} from "../../common/utilities/custom-utilities"

declare var $: any;

@Component({
  selector: 'app-submitted-proposals',
  templateUrl: './submitted-proposals.component.html',
  styleUrls: ['./submitted-proposals.component.css'],
  animations: [slideInOut, fadeDown]

})
export class SubmittedProposalsComponent implements OnInit, OnDestroy {

  result: any = {};
  mainPanelObject: any;
  isMainPanelComment = {};
  isChecked = {};
  grantCallId;
  isDesc = true;
  column = 'proposalRank';
  direction = 1;
  searchText = null;
  proposalCompleteStatus = null;
  selectedArray = [];
  proposalRank = {};
  evaluationFetch: any = {};
  isShowFilterByPanel = false;
  checkAll = false;
  isNoEvaluation = false;
  evaluationPanelFliterList = [];
  $subscriptions: Subscription[] = [];
  proposalStatusCode = null;
  adjustedScoreChange = false;
  rankChange = false;
  criteriaTab: any;
  scoreFullData: any = [];
  isScoreViewEnabled: any = [];

  reviewerScores = {};
  sumOfReviewerScores = {};
  header = {};
  reviewerScoreCount = {};
  totalScore: any;
  criteriaTotal: any = {};
  criteriaPersonCount: any = {};
  reviewerComments: any = {};
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  
  constructor(private _grantService: GrantCallService,
    public _commonService: CommonService, private _route: ActivatedRoute, public _commonData: GrantCommonDataService) { }

  ngOnInit() {
    this.isChecked = {};
    this.selectedArray = [];
    this.evaluationPanelFliterList = [];
    this.grantCallId = this._route.snapshot.queryParamMap.get('grantId');
    this.getGrantCallGeneralData();
    this.fetchEvaluationPanels(this.grantCallId);
    this.fetchSubmittedProposals();
  }

  fetchSubmittedProposals() {
    this.$subscriptions.push(this._grantService.getProposalByGrantCallId({
      'grantCallId': this.grantCallId,
      'loginPersonId': this._commonService.getCurrentUserDetail('personID')
    }).subscribe((data: any) => {
      this.mainPanelObject = data;
    }));
  }

  getGrantCallGeneralData() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.checkGrantCallType();
        this.showFilterByPanel();
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * @param  {} grantId: passing grant call id as input to fetch evaluation panels
   */
  fetchEvaluationPanels(grantId) {
    this.$subscriptions.push(this._grantService.fetchAllEvaluationPanels({ 'grantCallId': grantId }).subscribe(data => {
      this.evaluationFetch = data;
      this.evaluationFetch.grantCallEvaluationPanels.forEach(element => {
        if (element.isMainPanel !== 'Y') {
          this.evaluationPanelFliterList.push(element);
        }
      });
    }));
  }

  /**
  * restrict input fields to numbers, - and /
  * @param event
  */
  inputRestriction(event: any) {
    const pattern = /[0-9\+\/\.\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  validateAdjustedScore(proposal) {
    const pattern = /^(10|\d)(\.\d{1,2})?$/;
    proposal.isScoreInvalid = false;
    if (proposal.proposalEvaluationScore.adjustedScore &&
      (proposal.proposalEvaluationScore.adjustedScore > 10 || !pattern.test(proposal.proposalEvaluationScore.adjustedScore))) {
      proposal.isScoreInvalid = true;
    }
  }

  /**
   * to show filter by panel
   * 1 - Internal -no evaluation
   * 2 - External -no evaluation
   * 5 - Internal - simple evaluation
   * 6 - External - simple evaluation
   */
  showFilterByPanel() {
    this.isShowFilterByPanel = [1, 2, 5, 6].includes(this.result.grantCall.grantCallType.grantTypeCode) ? false : true;
  }

  generateRequestObject(proposalStatus) {
    const ro = deepCloneObject(this.mainPanelObject);
    ro.submittedProposals = this.selectedArray.map(({ isScoreInvalid, ...data }) => data);
    ro.statusType = proposalStatus;
    ro.updateUser = this._commonService.getCurrentUserDetail('userName');
    return ro;
  }

  /**
   * @param  {} proposalStatus : status which decides the proposals to be of status shortlisted, awarded or unsuccessful
   * saves the list of proposal with status which shows whether the proposal is shortlisted, awarded or unsuccessful
   */
  saveReview(proposalStatus) {
    this.$subscriptions.push(this._grantService.saveorUpdateProposalEvaluationScore(this.generateRequestObject(proposalStatus))
    .subscribe((data: any) => {
      this.mainPanelObject = data;
    }, 
    err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Proposal Review failed. Please try again.'); },
    () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal Review saved successfully.');
        this.selectedArray = [];
    }));
  }

  viewProposalById(proposalId) {
    localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
    openInNewTab('proposal/summary?', ['proposalId'], [proposalId]);
  }

  /**
   * for selecting all the proposals
   */
  checkOrUncheckPropoals() {
    (this.checkAll) ? this.checkAllProposals() : this.unCheckAllProposals();
  }

  checkAllProposals() {
    this.mainPanelObject.submittedProposals.forEach(element => {
      this.isChecked[element.proposalId] = true;
    });
  }

  unCheckAllProposals() {
    this.mainPanelObject.submittedProposals.forEach(element => {
      this.isChecked[element.proposalId] = false;
    });
  }

  /**
   * @param  {} proposalArrayElement : instance of the selected proposal
   * @param  {} proposalStatus : status for checking the action performed on proposals
   * pushes to the list which has to be passed to the service
   */
  updateProposalReviewedList(proposalArrayElement, proposalStatus) {
    this.isChecked[proposalArrayElement.proposalId] ?
      this.addProposalListElement(proposalArrayElement, proposalStatus) : this.removeProposalListElement(proposalArrayElement.proposalId);
  }

  /**
   * @param  {} proposal : instance which has to be pushed
   * @param  {} proposalStatus : status for checking the action performed on proposals
   * proposalStatusCode == 'U' Reject
   * proposalStatusCode == 'A' Award
   * proposalStatusCode == 'S' Shortlist
   * used to push the value to the array
   */
  addProposalListElement(proposal, proposalStatus) {
    if (!this.selectedArray.includes(proposal.proposalId)) {
      if (proposalStatus === 'S' && proposal.proposalStatus.description === 'Completed') {
        this.selectedArray.push(proposal);
      }
      if (['A', 'U'].includes(proposalStatus) && ['Completed', 'Shortlisted'].includes(proposal.proposalStatus.description)) {
        this.selectedArray.push(proposal);
      }
    }
  }

  /**
   * @param  {} proposalId : to search the value which has to be spliced
   * function to splice the unchecked values
   */
  removeProposalListElement(proposalId) {
    this.selectedArray.forEach(element => {
      if (proposalId === element.proposalId) {
        this.selectedArray.splice(this.selectedArray.indexOf(element), 1);
      }
    });
  }

  /**
   * for checking the grant call type
   * 1 - Internal -no evaluation
   * 2 - External -no evaluation
   */
  checkGrantCallType() {
    this.isNoEvaluation = [1, 2].includes(this.result.grantCall.grantCallType.grantTypeCode) ? true : false;
    this.column = this.isNoEvaluation ? 'title' : 'proposalRank';
  }

  /**
   * @param index
   * Used to expand and shrink the expandable.
   * Only one expansion happens when view score clicked at a time.
   */
  scoreViewExpanded(index) {
    const flag = this.isScoreViewEnabled[index];
    this.isScoreViewEnabled = [];
    this.isScoreViewEnabled[index] = !flag;
  }

  showReviewerComment(reviewerComment){
      this.reviewerComments = reviewerComment;
  }

  /**
   * @param  {} proposal : proposal object to display the score card
   * @param {} index: index of proposal displayed.
   * isMainPanelComment[proposalId] is set to false so if comment section is open when 
   * clicked on Scorecard then commentsection will close and scorecard will show.
   */
  viewScoreCard(proposal, index) {
    this.isMainPanelComment[proposal.proposalId] = false;
    if (this.isScoreViewEnabled[index]) {
      return this.isScoreViewEnabled[index] = false;
    }
    this.$subscriptions.push(this._grantService.getScoreByProposalId({ 'proposalId': proposal.proposalId })
      .subscribe((data: any) => {
        this.scoreFullData = Object.keys(data).length ? data : null;
        if (this.scoreFullData) {
          this.setDefaultValues();
          Object.keys(this.scoreFullData).forEach((criteria) => {
            this.sortReviewerInCriteriaById(criteria);
            this.scoreFullData[criteria].forEach((reviewer) => {
              if (reviewer.person.isPersonCanScore) {
                this.getReviewerScoresOfEachCriteria(reviewer);
                this.header[reviewer.person.personId] = reviewer.person.personName;
                this.getSumOfReviewersScore(reviewer);
                this.getReviewerScoreCount(reviewer);
                this.getCriteriaTotal(reviewer, criteria);
              }
            });
          });
          this.header = Object.keys(this.header).length ? this.header : null;
          this.getTotalAvgOfReviewers();
        }
        this.scoreViewExpanded(index);
      }));
  }

  setDefaultValues() {
    this.criteriaTab = 'SCORE';
    this.reviewerScores = {};
    this.header = {};
    this.sumOfReviewerScores = {};
    this.reviewerScoreCount = {};
    this.criteriaTotal = {};
    this.criteriaPersonCount = {};
  }
  /**
   * 
   */
  getReviewerScoreCount(reviewer) {
    this.reviewerScoreCount[reviewer.person.personId] = this.reviewerScoreCount[reviewer.person.personId] || 0;
    if (reviewer.person.score || reviewer.person.score == 0) {
      this.reviewerScoreCount[reviewer.person.personId] = this.reviewerScoreCount[reviewer.person.personId] + 1;
    }
  }

  getSumOfReviewersScore(reviewer) {
    this.sumOfReviewerScores[reviewer.person.personId] = (this.sumOfReviewerScores[reviewer.person.personId] || this.sumOfReviewerScores[reviewer.person.personId] == 0) ?
      this.sumOfReviewerScores[reviewer.person.personId] : null;
    if (reviewer.person.score || reviewer.person.score == 0) {
      this.sumOfReviewerScores[reviewer.person.personId] = this.sumOfReviewerScores[reviewer.person.personId] + reviewer.person.score;
    }
  }

  sortReviewerInCriteriaById(criteria) {
    this.scoreFullData[criteria].sort((reviewerOne, reviewerTwo) => this.compare(reviewerOne, reviewerTwo));
  }

  compare(reviewerOne, reviewerTwo): number {
    if (reviewerOne.person.personId < reviewerTwo.person.personId) {
      return -1;
    }
    if (reviewerOne.person.personId > reviewerTwo.person.personId) {
      return 1;
    }
    return 0;
  }

  getReviewerScoresOfEachCriteria(reviewer) {
    this.reviewerScores[reviewer.scoringCriteriaCode + reviewer.person.personId] = (reviewer.person.score || reviewer.person.score == 0) ? reviewer.person.score : '-';
  }

  getTotalAvgOfReviewers() {
    let sumofReviewerTotalScore = 0;  
    let totalSumOfReviewerAvg = 0;
    let avgCount = 0;
    Object.keys(this.sumOfReviewerScores).forEach((reviewerId) => {
      if (this.sumOfReviewerScores[reviewerId] || this.sumOfReviewerScores[reviewerId] == 0) {
        totalSumOfReviewerAvg += this.sumOfReviewerScores[reviewerId] / this.reviewerScoreCount[reviewerId];
        sumofReviewerTotalScore += this.sumOfReviewerScores[reviewerId];
        avgCount += 1;
      }
    })
    this.totalScore = avgCount ? (sumofReviewerTotalScore / avgCount).toFixed(2) : '-';
  }

  /**
   * @param  {} property table which has to be sorted
   * the function sorts the table elements using the orderBy pipe
   */
  sortBy(property) {
    this.isScoreViewEnabled = [];
    this.isDesc = !this.isDesc;
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }
  /**
   * to show or hide the comment section
   * @param  {} proposalId
   * isScoreViewEnabled[index] is set to false. so if ScoreCard of this proposal is visible, 
   * it will be closed when comment shown. 
   */
  openOrCloseCommentArea(proposalId) {
    this.isMainPanelComment[proposalId] = !this.isMainPanelComment[proposalId];
    this.isScoreViewEnabled = [];
  }
  /**
   * @param  {} proposalEvaluationScore : object which has rank and adjusted score
   * to save the rank and adjusted score individially
   */
  saveProposalRankAndScore(proposal) {
    if (!proposal.isScoreInvalid) {
      proposal.proposalEvaluationScore.updateUser = this._commonService.getCurrentUserDetail('userName');
      proposal.proposalEvaluationScore.updateTimeStamp = new Date().getTime();
      this.$subscriptions.push(this._grantService.saveProposalRankAndScore({
        'proposalEvaluationScore': proposal.proposalEvaluationScore
      }).subscribe(data => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, this.setToastMessage());
        this.rankChange = false;
        this.adjustedScoreChange = false;
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Proposal Rank failed. Please try again.');
      }));
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS,
        'The Total Adjusted Score value should be less than 10 (upto 2 decimal places) or equal to 10.');
    }
  }
  setToastMessage() {
    let toastMessage = null;
    if (this.adjustedScoreChange && !this.rankChange) {
      toastMessage = 'Proposal score saved successfully.';
    } else if (!this.adjustedScoreChange && this.rankChange) {
      toastMessage = 'Proposal rank saved successfully.';
    } else {
      toastMessage = 'Proposal score and rank saved successfully.';
    }
    return toastMessage;
  }

  /**
* @param  {any} event : input to rank
* allows only A-Z a-z 0-9 .
*/
  rankRnputRestriction(event: any) {
    const pattern = /[A-Za-z0-9.]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  /**
   * @param  {} attachment
   * Function is used to download attachment from backend workflowReviewerAttachmentId is passed.
   */
  downloadAttachments(attachment) {
    if (attachment.workflowReviewerAttmntsId != null) {
      this.$subscriptions.push(this._grantService.downloadWorkflowReviewerAttachment(attachment.workflowReviewerAttmntsId)
        .subscribe(data => {
          fileDownloader(data, attachment.fileName);
        }));
    } else {
      const URL = 'data:' + attachment.mimeType + ';base64,' + attachment.attachment;
      const a = document.createElement('a');
      a.href = URL;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
    }
  }

  resetProposalSelection() {
    this.checkAll = false;
    this.checkOrUncheckPropoals();
  }

  /**
  * function used in submitted proposals to reject selected proposals
  */
  rejectProposals() {
    this.proposalStatusCode = 'U';
    if (this.proposalSelectionCheck()) {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal.');
    } else {
      this.openModal();
    }
  }
  /**
   * function used in submitted proposals to award selected proposals
   */
  awardProposal() {
    this.proposalStatusCode = 'A';
    if (this.proposalSelectionCheck()) {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal.');
    } else {
      this.openModal();
    }
  }
  /**
   * function used in submitted proposals to short list selected proposals
   */
  shortListProposal() {
    this.proposalStatusCode = 'S';
    if (this.proposalSelectionCheck()) {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal.');
    } else {
      this.openModal();
    }
  }
  /**
   * function used to show Confirmation modal in Main-Panel
   */
  openModal() {
    $('#main-panel-confirmation-model').modal('show');
  }
  /**
   * function compares if proposals are selected or not
   */
  checkListSelection(proposalStatus) {
    this.selectedArray = [];
    this.mainPanelObject.submittedProposals.forEach(element => {
      // this.isShowWarningModal = false;
      this.updateProposalReviewedList(element, proposalStatus);
    });
    if (!this.proposalSelectionCheck()) {
      this.changeProposalStatus(proposalStatus);
      this.isChecked = {};
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal.');
    }
  }
  /**
   * to check atleast 1 proposal is checked
   */
  proposalSelectionCheck() {
    return Object.values(this.isChecked).every(this.isSelected);
  }
  /**
   * @param  {} proposalStatus : checks the status of the proposal to show error toasts
   * save the proposal list or reject
   */
  changeProposalStatus(proposalStatus) {
    const IS_SCORE_VALID = this.checkScoreValid(this.selectedArray);
    if (this.selectedArray.length > 0 && IS_SCORE_VALID) {
      this.saveReview(this.proposalStatusCode);
    } else {
      this.showToastforProposalStatus(proposalStatus, IS_SCORE_VALID);
    }
  }

  checkScoreValid(proposalList) {
    return proposalList.find(item => item.isScoreInvalid) ? false : true;
  }
  /**
   * @param  {} proposalStatus : checks the status of the proposal to show error toasts
   */
  showToastforProposalStatus(proposalStatus, isScoreValid = true) {
    if (!isScoreValid) {
      this._commonService.showToast(HTTP_ERROR_STATUS,
        'The Total Adjusted Score value(s) should be less than 10 (upto 2 decimal places) or equal to 10.');
    } else {
      if (proposalStatus === 'U' || proposalStatus === 'S') {
        this._commonService.showToast
          (HTTP_ERROR_STATUS, 'This action cannot be performed since the proposals are awarded/ shortlisted/ rejected.');
      } if (proposalStatus === 'A') {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'This proposals cannot be awarded.');
      }
    }
  }
  /**
 * @param  {} currentValue : current values for checking the array element
 * boolean function which returns true when all values in the array are false and vice versa
 */
  isSelected = (currentValue) => currentValue === false;

  /**
 *  function for saving all the submitted proposals
 */
  saveAllProposals() {
    const proposalEvaluationScore = [];
    if (this.checkScoreValid(this.mainPanelObject.submittedProposals)) {
      this.mainPanelObject.submittedProposals.forEach(element => {
        if ([38,40].includes(element.proposalStatus.statusCode)) {
          proposalEvaluationScore.push(element.proposalEvaluationScore);
        }
      });
      this.$subscriptions.push(this._grantService.saveAllProposals({
        'proposalEvaluationScores': proposalEvaluationScore
      }).subscribe(data => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Correct scores.');
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal saved successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Proposal failed. Please try again.');
      }));
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS,
        'The Total Adjusted Score value(s) should be less than 10 (upto 2 decimal places) or equal to 10.');
    }
  }
  checkProposalSelection() {
    return Object.values(this.isChecked).indexOf(true) > -1;
  }
  /**
   * @param  {any={}} reviewer
   * @param  {string} criteria
   * function calculates the sum of each scored criteria and number of person that scored to calculate the average criteria score
   */
  getCriteriaTotal(reviewer: any = {}, criteria: string): void {
    this.criteriaTotal[criteria] =
      (this.criteriaTotal[criteria] || this.criteriaTotal[criteria] === 0) ?
        this.criteriaTotal[criteria] : null;
    if (reviewer.person.score || reviewer.person.score === 0) {
      this.criteriaTotal[criteria] = this.criteriaTotal[criteria] + reviewer.person.score;
      this.criteriaPersonCount[criteria] = (this.criteriaPersonCount[criteria] ? this.criteriaPersonCount[criteria] + 1 : 1);
    }
  }
}
