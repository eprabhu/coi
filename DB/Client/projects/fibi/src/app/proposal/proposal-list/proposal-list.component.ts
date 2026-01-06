
/** Last updated by Greeshma on 19-05-2019
 * Mahesh sreenath 06/01/2020 - this files need a lot of change code is not readble
 * if any one reviews it before me consider talking to me
 * remarks : Code optimized by Mahesh while basheer working on JIRA 2919.
*/

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { environment } from '../../../environments/environment';
import { compareDatesWithoutTimeZone, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { DEFAULT_DATE_FORMAT } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { itemAnim } from '../../common/utilities/animations';
import {
    setFocusToElement,
    pageScroll,
    onKeyPress,
    openInNewTab,
    fileDownloader,
    getSponsorSearchDefaultValue
} from '../../common/utilities/custom-utilities';
import { WafAttachmentService } from '../../common/services/waf-attachment.service';
import { ProposalListService } from './proposal-list.service';
import { getEndPointOptionsForSponsor, getEndPointOptionsForDepartment } from '../../common/services/end-point.config';
import { ProposalDashBoardItem , ProposalDashBoardRequest } from '../proposal-interfaces';
import {concatUnitNumberAndUnitName} from '../../common/utilities/custom-utilities';

declare var $: any;

@Component({
    selector: 'app-proposal-list',
    templateUrl: './proposal-list.component.html',
    styleUrls: ['./proposal-list.component.css'],
    animations: [itemAnim],
    providers: [WafAttachmentService]
})
export class ProposalListComponent implements OnInit, OnDestroy {
    isReverse = true;
    isShowResultCard = false;
    isShowGrantCallResultCard = false;
    isShowAdvanceSearchOptions = false;
    isShowGrantCallElasticSearch = false;
    isShowDeleteWarningModal = false;
    advSearchClearField: String;
    isShowCopyWarningModal = false;
    isShowExportProposalsWarningModal = false;
    isAssignAll: boolean;
    selectedProposalsWarning = null;
    serviceRequestList: Array<ProposalDashBoardItem> = [];
    evaluationRecommendation: any = [];
    selectedProposals: any = [];
    proposalRank = null;
    recommendationCode = null;
    result: any = {};
    elasticResultObject: any = {};
    elasticSearchOptions: any = {};
    userElasticSearchOptions: any = {};
    grantCallElasticSearchObject = this._proposalService.grantCallElasticSearchObject;
    grantCallElasticSearchOptions: any = {};
    reviewRequest: any = {};
    sortMap: any = {};
    sortCountObj: any = {};
    clearField: String;
    clearFieldProposalLeadUnit: String;
    clearFieldFundingAgency: String;
    placeholder = '';
    adminStatus: string;
    versionHistorySelected: number;
    proposalIndex: number;
    proposalId: number;
    resultMapArray: any = [];
    tempIndex = null;
    tempMapIndex = null;
    value = null;
    elasticPersonSearchOptions: any = {};
    fundingAgencySearchOptions: any = {};
    proposalLeadUnitSearchOptions: any = {};
    personId = this._commonService.getCurrentUserDetail('personID');
    isCreateProposal = false;
    isViewReviewCompletedTab = false;
    isViewReviewInProgressTab = false;
    isAssignReview = false;
    isBatchEndorsement = false;
    isViewAnyProposals = false;
    mandatoryList = new Map();
    deployMap = environment.deployUrl;
    actionName: string;
    uploadedFile: any = [];
    formData = new FormData();
    endorseRequest: any = {};
    selectedProposalStatus = null;
    filterValues: any = {};
    lookupValues: any = {};
    proposalCategoryTypeOptions = 'ACTIVITY_TYPE#ACTIVITY_TYPE_CODE#true';
    proposalCategoryTypeColumnName = 'ACTIVITY_TYPE_CODE';
    proposalTypeOptions = 'EPS_PROPOSAL_TYPE#TYPE_CODE#true';
    proposalTypeColumnName = 'TYPE_CODE';
    proposalStatusOptions = 'EPS_PROPOSAL_STATUS#STATUS_CODE#true#true';
    researchRoleOptions = 'EPS_PROP_PERSON_ROLE#PROP_PERSON_ROLE_ID#true#true';
    proposalStatusColumnName = 'STATUS_CODE';
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    $subscriptions: Subscription[] = [];
    $proposalList = new Subject();
    isEmployeeFlag = true;
    setFocusToElement = setFocusToElement;
    pageScroll = pageScroll;
    keyPress = onKeyPress;
    tempProposalRequestObject = new ProposalDashBoardRequest();
    copyAllBudgetVersion = false;
    copyFinalBudgetVersion = false;
    copyQuestionnaire = false;
    copyOtherInformation = false;
    copyAttachment = false;
    proposalTitle: any;
    isShowAllProposalList = false;
    proposalReviewDetails: any;
    canDeleteProposal: boolean;
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    proposalSectionConfig: any;

    constructor(private _router: Router, public _proposalService: ProposalListService,
        public _commonService: CommonService, private _elasticConfig: ElasticConfigService,
        private _wafAttachmentService: WafAttachmentService, private _navigationService: NavigationService) { }

    ngOnInit() {
        this.getProposalSectionConfig('DP03');
        this.setDashboardTab();
        this.clearField = new String('true');
        this._proposalService.proposalRequestServiceObject.grantCallId = null;
        this.setGrantCallElasticSearchCriteria();
        this.loadDashboard();
        this.elasticSearchOptions = this._elasticConfig.getElasticForProposal();
        this.userElasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
        this.fundingAgencySearchOptions = getEndPointOptionsForSponsor();
        this.proposalLeadUnitSearchOptions = getEndPointOptionsForDepartment();
        this.setSortProperties();
        this.getPermissions();
        this.setAdvanceSearch();
        this.checkForAdvanceSearch();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    /** Check if previous url includes fibi/proposal, if not then clear Advanced Search fields */
    checkForAdvanceSearch() {
        if (this.isAdvancedSearchMade() && this._navigationService.previousURL.includes('fibi/proposal')) {
            this.isShowAllProposalList = true;
            if (this._proposalService.isAdvanceSearch) {
                document.getElementById('collapseProposal').classList.add('show');
            } else {
                if (this._proposalService.proposalRequestServiceObject.tabName === 'ALL_PROPOSALS') {
                    document.getElementById('collapseProposal').classList.add('show');
                    this.isShowAllProposalList = false;
                } else {
                    document.getElementById('collapseProposal').classList.remove('show');
                }
            }
            this.switchAdvanceSearchProperties(this.tempProposalRequestObject, this._proposalService.proposalRequestServiceObject, true);
            this.tempProposalRequestObject.fullName = this._proposalService.proposalRequestExtraData.fullName || '';
            this.tempProposalRequestObject.grantCallName = this._proposalService.proposalRequestExtraData.grantCallName || '';
            this.isEmployeeFlag = this._proposalService.proposalRequestExtraData.isEmployee;
            (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
            this.generateLookupArrayForDropdown();
            this.setDefaultValueForCustomLibrarySearch();
            this._proposalService.proposalRequestServiceObject.advancedSearch = 'A';
            this.$proposalList.next();
        } else {
            this.clearAdvanceSearchField();
            this.$proposalList.next();
        }
    }

    isAdvancedSearchMade() {
        // tslint:disable-next-line: max-line-length
        return !!Object.values(this._proposalService.proposalRequestServiceObject).find(V => (typeof (V) === 'string' && V) || (typeof (V) === 'object' && V.length));
    }

    /* Setting default value for end-point, elastic search, so to display in UI. */
    setDefaultValueForCustomLibrarySearch() {
        this.fundingAgencySearchOptions.defaultValue = this._proposalService.sponsorAdvanceSearchDefaultValue;
        this.proposalLeadUnitSearchOptions.defaultValue = this._proposalService.proposalRequestServiceObject.property8;
        this.elasticPersonSearchOptions.defaultValue = this._proposalService.proposalRequestExtraData.fullName;
        this.grantCallElasticSearchOptions.defaultValue = this._proposalService.proposalRequestExtraData.grantCallName;
    }

    generateLookupArrayForDropdown() {
        if (this._proposalService.proposalRequestServiceObject.property3.length) {
            this.generateLookupArray(this._proposalService.proposalRequestServiceObject.property3, 'property3');
        }
        if (this._proposalService.proposalRequestServiceObject.property4.length) {
            this.generateLookupArray(this._proposalService.proposalRequestServiceObject.property4, 'property4');
        }
        if (this._proposalService.proposalRequestServiceObject.property6.length) {
            this.generateLookupArray(this._proposalService.proposalRequestServiceObject.property6, 'property6');
        }
        if (this._proposalService.proposalRequestServiceObject.property13.length) {
            this.generateLookupArray(this._proposalService.proposalRequestServiceObject.property13, 'property13');
        }
    }

    generateLookupArray(property, propertyNumber) {
        this.lookupValues[propertyNumber] = [];
        property.forEach(element => {
            this.lookupValues[propertyNumber].push({ code: element });
        });
    }

    /** fetch proposal list */
    loadDashboard() {
        this.$subscriptions.push(this.$proposalList.pipe(
            switchMap(() => this._proposalService.getProposalDashBoardList(this._proposalService.proposalRequestServiceObject)))
            .subscribe(data => {
                this.result = data || [];
                if (this.result !== null) {
                    this.serviceRequestList = this.result.proposal;
                }
            }));
    }

    setDashboardTab() {
        this._proposalService.proposalRequestServiceObject.tabName = !sessionStorage.getItem('currentProposalDashboardTab')
            ? 'MY_PROPOSAL' : sessionStorage.getItem('currentProposalDashboardTab');
    }

    actionsOnPageChange(event) {
        this._proposalService.proposalRequestServiceObject.currentPage = event;
        this.$proposalList.next();
        pageScroll('pageScrollToTop');
    }

    showAdvanceSearch(event: any) {
        event.preventDefault();
        this.isShowAdvanceSearchOptions = !this.isShowAdvanceSearchOptions;
        this.isShowResultCard = false;
        this.elasticResultObject = {};
        this.clearField = new String('true');
    }

    /** searches using advance search options close elastic search result if it is open
    */
    searchUsingAdvanceOptions() {
        if (this.isShowResultCard === true) {
            this.isShowResultCard = false;
        }
        this._proposalService.proposalRequestServiceObject.currentPage = 1;
        this.isShowAllProposalList = true;
        this._proposalService.isAdvanceSearch = true;
        this.$proposalList.next();
    }

    setFundingAgencyForAdvancedSearch(event) {
        if (event) {
            this.tempProposalRequestObject.property7 = event.sponsorCode;
            this._proposalService.sponsorAdvanceSearchDefaultValue = getSponsorSearchDefaultValue(event);
        } else {
            this.tempProposalRequestObject.property7 = '';
            this._proposalService.sponsorAdvanceSearchDefaultValue = '';
        }
    }

    setLeadUnitForAdvancedSearch(event) {
        this.tempProposalRequestObject.property8 = (event)  ? event.unitNumber : '';
    }

    clearAdvanceSearchField() {
        this.clearAdvanceSearchList();
        this._proposalService.isAdvanceSearch = false;
    }

    /** navigate to proposal create page if the logged in user has permission*/
    gotoProposal() {
        localStorage.setItem('currentTab', 'PROPOSAL_HOME');
        localStorage.setItem('subTab', 'PRE-REVIEW');
        this._router.navigate(['fibi/proposal']);
    }

    /** select a result from elastic search
     * @param value
     */
    selectProposalElasticResult(value) {
        if (value) {
            this.isShowResultCard = true;
            this.isShowAdvanceSearchOptions = false;
            this.elasticResultObject = value;
        } else {
            this.clearProposalElasticResults();
        }
    }

    setGrantCallForAdvancedSearch(event) {
        this.tempProposalRequestObject.property9 = (event) ? event.grant_header_id : null;
        this.tempProposalRequestObject.grantCallName = event ? event.title : '';
    }
    /** sends boolean value to elastic component - when clearing the elastic input result card also vanishes
   * @param $event
   */
    receiveResultCard($event) {
        this.isShowResultCard = $event;
    }

    /** sorts results based on fields
    * @param sortFieldBy
    */
    sortResult(sortFieldBy) {
        this.sortCountObj[sortFieldBy]++;
        this._proposalService.proposalRequestServiceObject.sortBy = sortFieldBy;
        if (this.sortCountObj[sortFieldBy] < 3) {
            if (this._proposalService.proposalRequestServiceObject.sortBy === sortFieldBy) {
                this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
            }
        } else {
            this.sortCountObj[sortFieldBy] = 0;
            delete this.sortMap[sortFieldBy];
        }
        this._proposalService.proposalRequestServiceObject.sort = this.sortMap;
        this._proposalService.sortCountObj = this.sortCountObj;
        this.$proposalList.next();
    }

    /** view proposal
     * @param event
     * @param proposalId
     */
    viewProposalById(proposal) {
        localStorage.setItem('subTab', 'PRE-REVIEW');
        if ([1, 3, 8].includes(proposal.statusCode)) {
            localStorage.setItem('currentTab', 'PROPOSAL_HOME');
            openInNewTab('proposal/overview?', ['proposalId'], [proposal.proposalId]);
        } else {
            localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
            openInNewTab('proposal/summary?', ['proposalId'], [proposal.proposalId]);
        }
    }

    /** export proposal data as excel sheet or pdf
     * @param docType
     */
    exportAsTypeDoc(docType) {
        const exportObject: any = { ...this._proposalService.proposalRequestServiceObject };
        exportObject.documentHeading = this.getDocumentHeading(this._proposalService.proposalRequestServiceObject.tabName);
        exportObject.exportType = docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '';
        exportObject.grantCallId = this._proposalService.proposalRequestServiceObject.grantCallId,
            exportObject.sortBy = this._proposalService.proposalRequestServiceObject.sortBy,
            exportObject.sort = this._proposalService.proposalRequestServiceObject.sort,
            exportObject.advancedSearch = 'L';
        this.checkAdvanceSearchOption();
        exportObject.advancedSearch = this._proposalService.proposalRequestServiceObject.advancedSearch;
        this.$subscriptions.push(this._proposalService.exportProposalDashboardData(exportObject).subscribe(
            data => {
                const FILENAME = exportObject.documentHeading;
                fileDownloader(data.body, FILENAME, exportObject.exportType);
            }));
    }

    getDocumentHeading(tabName: string) {
        return tabName === 'ALL_PROPOSALS' ?
            'All Proposals' : tabName === 'MY_PROPOSAL' ?
                'My Proposals' : tabName === 'INPROGRESS_PROPOSAL' ?
                    'Inprogress Proposals' : tabName === 'MY_REVIEW_PENDING_PROPOSAL' ?
                        'Review Pending Proposals' : 'Review Completed Proposals';
    }

    setCurrentProposalTab() {
        localStorage.setItem('currentTab', 'PROPOSAL_HOME');
        localStorage.setItem('subTab', 'PRE-REVIEW');
    }

    clearModalFlags() {
        this.isShowCopyWarningModal = false;
        this.copyAllBudgetVersion = false;
        this.copyFinalBudgetVersion = false;
        this.copyQuestionnaire = false;
        this.copyOtherInformation = false;
        this.copyAttachment = false;
    }

    deleteProposal() {
        this.$subscriptions.push(this._proposalService.deleteProposal({ 'proposalId': this.proposalId }).subscribe((success: any, ) => {
            if (success.message === 'Proposal deleted successfully') {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal deleted successfully.');
                this.serviceRequestList.splice(this.proposalIndex, 1);
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Proposal failed. Please try again.');
            }
        } , err => {
            $('#permissionCheckingModal').modal('hide');
            this._commonService.showToast(HTTP_ERROR_STATUS,
                (err && typeof err.error === 'string') ? err.error : 'Deleting Proposal failed. Please try again.'
            );
        }));
    }

    canDeleteProposalDetail({ proposalId, homeUnitNumber }, index) {
        this.proposalId = proposalId;
        this.proposalIndex = index;
        this.$subscriptions.push(this._proposalService.canDeleteProposalDetail
            ({ homeUnitNumber, proposalId }).subscribe((success: any) => {
                this.canDeleteProposal = success.canDeleteProposal;
                $('#permissionCheckingModal').modal('show');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Proposal failed. Please try again.');
            }));
    }

    temporaryCopyProposal(proposalId, proposalTitle) {
        this.proposalId = proposalId;
        this.isShowCopyWarningModal = true;
        this.proposalTitle = proposalTitle;
    }

    /** copy and open proposal
     * @param proposalId
     */
    copyProposal() {
        const proposalVO = {
            proposalId: this.proposalId,
            copyAllBudgetVersion: this.copyAllBudgetVersion,
            copyFinalBudgetVersion: this.copyFinalBudgetVersion,
            copyQuestionnaire: this.copyQuestionnaire,
            copyOtherInformation: this.copyOtherInformation,
            copyAttachment: this.copyAttachment,
            updateUser: this._commonService.getCurrentUserDetail('userName')
        };
        this.$subscriptions.push(this._proposalService.copyProposal(proposalVO).subscribe((success: any) => {
            localStorage.setItem('currentTab', 'PROPOSAL_HOME');
            localStorage.setItem('subTab', 'PRE-REVIEW');
            openInNewTab('proposal?', ['proposalId'], [success.proposal.proposalId]);
        }));
        this.clearModalFlags();
    }

    showGrantCallElasticSearch(event: any) {
        event.preventDefault();
        this.clearField = new String('true');
        this.isShowGrantCallElasticSearch = !this.isShowGrantCallElasticSearch;
        if (this.grantCallElasticSearchObject != null) {
            this.clearGrantCallElasticResults();
            this.$proposalList.next();
        }
        this.elasticSearchOptions.defaultValue = '';
        this.clearProposalElasticResults();
    }

    selectGrantCallElasticResult(value) {
        if (value) {
            this.isShowGrantCallResultCard = true;
            this.grantCallElasticSearchObject = value;
            this._proposalService.grantCallElasticSearchObject = value;
            this._proposalService.proposalRequestServiceObject.grantCallId = value.grant_header_id;
        } else {
            this.clearGrantCallElasticResults();
        }
        this.$proposalList.next();
    }

    /* export proposal as zip */
    printProposal(event, proposalId, piName): void {
        event.preventDefault();
        const REQUEST_OBJECT = {
            proposalId: proposalId,
            questionnaireMode: 'ANSWERED'
        };
        this.$subscriptions.push(this._proposalService.printEntireProposal(REQUEST_OBJECT).subscribe(
            data => { fileDownloader(data, 'Proposal_' + proposalId + '_' + piName, 'zip');
        }));
    }

    /**
     * @param  {} event
     * if a person is employee then sets prncpl_id  to the json object otherwise sets rolodex_id.
     */
    selectedFilter(event) {
        if (event) {
            this.tempProposalRequestObject.property5 = this.isEmployeeFlag ? event.prncpl_id : event.rolodex_id;
            this.tempProposalRequestObject.fullName = event.full_name || '';
        }
    }

    emptyValidationKeyup(event) {
        if (event.keyCode >= 46 && event.keyCode <= 90 || event.keyCode === 8) {
            this._proposalService.proposalRequestServiceObject.property5 = '';
        }
    }

    fetchReviewDetails() {
        this.$subscriptions.push(
            this._proposalService.getProposalAndReviewSummary(
                { 'proposalId': this.proposalId, 'personId': this._commonService.getCurrentUserDetail('personID') })
                .subscribe(
                    (data: any) => {
                        this.proposalReviewDetails = data;
                        this.proposalRank = this.proposalReviewDetails.proposal.proposalRank || null;
                        this.recommendationCode = this.proposalReviewDetails.proposal.recommendationCode || null;
                        this.evaluationRecommendation = data.evaluationRecommendation;
                    }, err => { },
                    () => {
                        document.getElementById('triggerModalOnSuccessBtn').click();
                    }));
    }

    saveProposalRank(proposalId) {
        this.$subscriptions.push(this._proposalService.saveProposalRank({
            'proposalId': proposalId, 'proposalRank': this.proposalRank, 'recommendationCode': this.recommendationCode,
            'userName': this._commonService.getCurrentUserDetail('userName')
        }).subscribe((data: any) => {
            this.serviceRequestList[this.proposalIndex].proposalRank = this.proposalRank;
            this.serviceRequestList[this.proposalIndex].recommendationCode = this.recommendationCode;
            this.serviceRequestList[this.proposalIndex].applicationStatus = data.proposal.proposalStatus.description;
            this.serviceRequestList[this.proposalIndex].statusCode = data.proposal.proposalStatus.statusCode;
            $('#rankProposalModal').modal('hide');
        }));
    }

    selectAllProposals() {
        this.result.proposal.forEach(element => {
            element.isAssigned = this.isAssignAll ? true : false;
        });
    }

    checkOrUnCheckSelectAll(isAssigned) {
        if (!isAssigned && this.isAssignAll) {
            this.isAssignAll = false;
        } else {
            const unAssignedProposals = this.result.proposal.filter(element => element.isAssigned === false);
            if (unAssignedProposals.length === 0) {
                this.isAssignAll = true;
            }
        }
    }

    /** clears all values and shows request new review popup*/
    showRequestNewReview() {
        this.clearField = new String('true');
        this.placeholder = '';
        this.mandatoryList.clear();
        this.reviewRequest = {};
        this.reviewRequest.evaluationStop = null;
        this.fetchEvaluationStops();
    }

    fetchEvaluationStops() {
        const assignedProposal: any = this.result.proposal.filter(P => P.isAssigned);
        // tslint:disable-next-line: prefer-const
        let isAdded = [], activityTypeCodes = [];
        assignedProposal.find((value) => {
            if (!isAdded[value.activityTypeCode]) {
                isAdded[value.activityTypeCode] = true;
                activityTypeCodes.push(value.activityTypeCode);
            }
        });
        this.$subscriptions.push(this._proposalService.fetchEvaluationStop({
            'proposalStatusCode': assignedProposal[0].statusCode,
            'activityTypeCodes': activityTypeCodes
        }).subscribe((data: any) => {
            this.result.evaluationReviewStop = data.evaluationStopList;
        }, err => { },
            () => { $('#assignReviewModal').modal('show'); }));
    }

    /** changes the value of placeholder in add review popup */
    setPlaceHolder() {
        this.placeholder = this.reviewRequest.evaluationStop != null && this.reviewRequest.evaluationStop !== 'null' ?
            'Search here for ' + this.reviewRequest.evaluationStop.description : '';
    }

    /** assign required values from elastic search
     * @param value
     */
    selectedReviewer(value) {
        if (value != null) {
            this.reviewRequest.reviewerPersonId = value.prncpl_id;
            this.reviewRequest.reviewerFullName = value.full_name;
            this.reviewRequest.reviewerEmail = value.email_addr;
        } else {
            this.reviewRequest.reviewerPersonId = null;
            this.reviewRequest.reviewerFullName = null;
            this.reviewRequest.reviewerEmail = null;
        }
    }

    dateValidation(date) {
        const currentDate: Date = new Date();
        this.mandatoryList.delete('reviewdeadline');
        if (date && compareDatesWithoutTimeZone(date, currentDate, 'dateObject', 'dateObject') === -1) {
            this.mandatoryList.set('reviewdeadline', 'Review deadline date already passed. Please choose another date.');
        }
    }

    /** assigns reviewer based on validations */
    addReviewer() {
        this.mandatoryList.clear();
        if (this.reviewRequest.evaluationStop == null || this.reviewRequest.evaluationStop === 'null') {
            this.mandatoryList.set('reviewStop', '* Please choose a Review Stop');
        }
        this.dateValidation(this.reviewRequest.reviewDeadLineDate);
        if (this.mandatoryList.size === 0) {
            this.reviewRequest.reviewStartDate = new Date().getTime();
            this.reviewRequest.updateTimestamp = new Date().getTime();
            this.reviewRequest.reviewDeadLineDate = parseDateWithoutTimestamp(this.reviewRequest.reviewDeadLineDate);
            this.reviewRequest.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.reviewRequest.hasEndorsed = this.reviewRequest.evaluationStop.hasEndorsed;
            this.reviewRequest.hasRank = this.reviewRequest.evaluationStop.hasRank;
            this.reviewRequest.hasQuestionnaire = this.reviewRequest.evaluationStop.hasQuestionnaire;
            this.reviewRequest.isFinal = this.reviewRequest.evaluationStop.isFinal;
            this.reviewRequest.evaluationStopCode = this.reviewRequest.evaluationStop.evaluationStopCode;
            this.reviewRequest.roleId = this.reviewRequest.evaluationStop.roleId;
            this.reviewRequest.role = this.reviewRequest.evaluationStop.role;
            this.reviewRequest.hasRecommendation = this.reviewRequest.evaluationStop.hasRecommendation;
            this.$subscriptions.push(this._proposalService.addReview({
                'proposalIds': this.selectedProposals, 'proposal': null,
                'newProposalReview': this.reviewRequest, 'personId': this._commonService.getCurrentUserDetail('personID')
            }).subscribe((data: any) => {
                this.clearField = new String('true');
                this.$proposalList.next();
                this.reviewRequest = {};
            }, err => { },
            () => {
                $('#assignReviewModal').modal('hide');
            }));
        }
    }

    checkProposalsSelected(action: string) {
        this.selectedProposalsWarning = null;
        this.selectedProposals = this.getSelectedProposals();
        if (!this.selectedProposals.length) {
            this.selectedProposalsWarning = 'Please select atleast one proposal to ' + action;
            $('#assignReviewModal').modal('show');
            return false;
        }
        return true;
    }

    getSelectedProposals(): Array<number> {
        const proposals: Array<number> = [];
        this.result.proposal.forEach(P => {
            if (P.isAssigned) {
                proposals.push(P.proposalId);
                this.selectedProposalStatus = P.statusCode;
            }
        });
        return proposals;
    }

    validateSelectedProposals(action: string) {
        const assignedProposal: any = this.result.proposal.filter(P => P.isAssigned);
        const statusMismatch = assignedProposal.some(proposal => proposal.statusCode !== assignedProposal[0].statusCode);
        if (statusMismatch) {
            this.selectedProposalsWarning = action + ' can be done as a batch only to proposals having same status.';
            $('#assignReviewModal').modal('show');
            return false;
        } else if (action === 'Endorsement') {
            const isInValidStatus = assignedProposal.some(proposal => proposal.statusCode !== 19 && proposal.statusCode !== 18);
            if (isInValidStatus) {
                this.selectedProposalsWarning = 'Batch ' + action + ' can only be done to proposal(s) if the status is:' + '<br/>' +
                    '1. URC Review In Progress' + '<br/>' + '2. Pending VPR Endorsement';
                $('#assignReviewModal').modal('show');
                return false;
            }
        }
        return true;
    }

    /** VALIDATIONS FOR NOT ASSIGNING REVIEWS */
    checkAssignReviewValidation() {
        const isProposalsSelected = this.checkProposalsSelected('assign review');
        if (isProposalsSelected && this.validateSelectedProposals('Assign Review')) {
          this.showRequestNewReview();
        }
    }

    /** VALIDATIONS FOR NOT ENDORSING */
    checkEndorseValidation() {
        const isProposalsSelected = this.checkProposalsSelected('endorse');
        if (isProposalsSelected) {
            this.filterEvaluationStatus();
            const isValidProposals = this.validateSelectedProposals('Endorsement');
            if (isValidProposals) { $('#endorse-modal').modal('show'); }
        }
    }

    /** finalEvaluationStatus values -
     Awarded(statusCode = 11), Unsuccessful(statusCode = 29), Withdrawn(statusCode = 12) for VPR endorsement */
    filterEvaluationStatus() {
        this.result.finalEvaluationStatus = this.result.finalEvaluationStatus.filter(status => status.statusCode === 11 ||
            status.statusCode === 29 || status.statusCode === 12);
    }

    exportProposalsAsZip() {
        this.isShowExportProposalsWarningModal = false;
        const isAssignedProposalArrays = this.result.proposal.filter(isAssignedProposals => isAssignedProposals.isAssigned === true);
        if (isAssignedProposalArrays.length === 0) {
            this.isShowExportProposalsWarningModal = true;
        } else {
            isAssignedProposalArrays.forEach(element => {
                const REQUEST_OBJECT = {
                    proposalId: element.proposalId,
                    questionnaireMode: 'ANSWERED'
                };
                this.$subscriptions.push(this._proposalService.printEntireProposal(REQUEST_OBJECT)
                    .subscribe(data => {
                        fileDownloader(data, 'Proposal_' + element.proposalId + '_' + element.investigator.fullName, 'zip');
                    }));
            });
        }
    }

    async getPermissions() {
        this.isCreateProposal = await this._commonService.checkPermissionAllowed('CREATE_PROPOSAL');
        this.isViewReviewInProgressTab = await this._commonService.checkPermissionAllowed('VIEW_REVIEW_IN_PROGRESS_TAB');
        this.isViewReviewCompletedTab = await this._commonService.checkPermissionAllowed('VIEW_REVIEW_COMPLETED_TAB');
        this.isAssignReview = await this._commonService.checkPermissionAllowed('ASSIGN_REVIEW');
        this.isBatchEndorsement = await this._commonService.checkPermissionAllowed('BATCH_ENDORSEMENT');
    }

    performActionBasedOnRight(proposalId, rightName, index) {
        this.proposalIndex = index;
        this.proposalId = proposalId;
        if (rightName === 'DELETE_PROPOSAL') {
            this.isShowDeleteWarningModal = (rightName === 'DELETE_PROPOSAL') ? true : false;
            $('#permissionCheckingModal').modal('show');
        } else if (rightName === 'MAINTAIN_RANK') {
            this.fetchReviewDetails();
        }
    }

    clearPermissionCheckingModalFlags() {
        $('#permissionCheckingModal').modal('hide');
        this.isShowDeleteWarningModal = false;
    }

    /* To retain filtered proposals based on grant call in dashboard after opening a proposal from filtered list of proposals */
    setGrantCallElasticSearchCriteria() {
        this.grantCallElasticSearchOptions = this._elasticConfig.getElasticForGrantCall();
        if (this.grantCallElasticSearchObject != null) {
            this.grantCallElasticSearchOptions.defaultValue = this.grantCallElasticSearchObject.title;
            this.isShowGrantCallElasticSearch = true;
            this._proposalService.proposalRequestServiceObject.grantCallId = this.grantCallElasticSearchObject.grant_header_id;
            this.isShowGrantCallResultCard = true;
        }
    }

    clearGrantCallElasticResults() {
        this.clearField = new String('true');
        this.grantCallElasticSearchOptions.defaultValue = '';
        this._proposalService.clearGrantCallElasticSearchObject();
        this.grantCallElasticSearchObject = null;
        this._proposalService.proposalRequestServiceObject.grantCallId = null;
        this.isShowGrantCallResultCard = false;
    }

    clearProposalElasticResults() {
        this.isShowResultCard = false;
        this.elasticResultObject = {};
    }

    setSortProperties() {
        this.resetSearchOptions();
        this.sortCountObj = (Object.entries(this._proposalService.sortCountObj).length === 0) ?
            this.sortCountObj : this._proposalService.sortCountObj;
        this.sortMap = (Object.entries(this._proposalService.proposalRequestServiceObject.sort).length === 0) ?
            this.sortMap : this._proposalService.proposalRequestServiceObject.sort;
    }

    checkRankValidation() {
        if (this.validateRank()) {
            this.saveProposalRank(this.proposalReviewDetails.proposal.proposalId);
        }
    }

    validateRank() {
        this.mandatoryList.clear();
        !this.proposalReviewDetails.proposal.isEndorsedOnce ? this.checkMandatoryFilled() : this.determineRankValidation();
        return this.mandatoryList.size !== 0 ? false : true;
    }

    checkMandatoryFilled() {
        if (this.proposalReviewDetails.proposal.hasRecommendation
            && !this.recommendationCode || this.recommendationCode === 'null') {
            this.mandatoryList.set('recommendation', 'Please choose a recommendation value');
        }
        if (this.proposalReviewDetails.proposal.hasRank && this.recommendationCode !== 2) {
            if (!this.proposalRank) {
                this.mandatoryList.set('rank', 'Please enter a rank to save');
            } else if (this.proposalRank < 1) {
                this.mandatoryList.set('rank', 'Please enter a valid rank');
            }
        }
    }

    determineRankValidation() {
        !this.checkIsRecommendationModified(this.recommendationCode, this.proposalReviewDetails.proposal.recommendationCode) ?
            this.setRankValidationMessage() : this.checkMandatoryFilled();
    }

    setRankValidationMessage() {
        !this.checkIsRankModified(this.proposalRank, this.proposalReviewDetails.proposal.proposalRank) ?
            this.mandatoryList.set('endorseWarning', 'Rank and Recommendation values is not modified, ' +
                'saving demands DEC reviewers to endorse again. Please enter new values to save.') :
            this.mandatoryList.set('endorseWarning', 'Recommendation value is not modified, saving recommendation ' +
                ' demands DEC reviewers to endorse again, please enter a new recommendation to save.');
    }

    checkIsRankModified(rank, proposalRank) {
        return this.proposalReviewDetails.proposal.hasRank && (rank === proposalRank) ? false : true;
    }

    checkIsRecommendationModified(recommendation, recommendationCode) {
        return this.proposalReviewDetails.proposal.hasRecommendation && (recommendation === recommendationCode) ?
            false : true;
    }

    checkAdvanceSearchOption() {
        if (this.isAdvancedSearchMade()) {
            this._proposalService.proposalRequestServiceObject.advancedSearch = 'A';
        } else {
            this._proposalService.proposalRequestServiceObject.advancedSearch = 'L';
        }
        return this._proposalService.proposalRequestServiceObject;
    }

    clearFields() {
        this.reviewRequest = {};
        this.endorseRequest = {};
        this.uploadedFile = [];
        this.mandatoryList.clear();
    }

    /** service call for endorse review */
    completeReturnReview() {
        let ipNumbers = [];
        this.mandatoryList.clear();
        if (this.reviewRequest.reviewComment == null || this.reviewRequest.reviewComment === '') {
            this.mandatoryList.set('comment', '* Please add a comment to endorse proposal(s)');
        }
        // check if proposal status is chosen only if VPR endorsement (selectedProposalStatus = 18)
        if (this.selectedProposalStatus === 18 && (!this.endorseRequest.proposalStatusCode ||
            this.endorseRequest.proposalStatusCode === 'null')) {
            this.mandatoryList.set('status', '* Please select a proposal status to endorse proposal(s)');
        }
        if (this.mandatoryList.size === 0) {
            if (!this._commonService.isWafEnabled) {
                this.setCommentRequestObject();
                this.setActionRequestObject();
                this.endorseRequest.reviewStatusCode = null;
                this.formData.append('formDataJson', JSON.stringify(this.endorseRequest));
                this.$subscriptions.push(this._proposalService.approveOrDisapproveReview(this.formData).subscribe((data: any) => {
                    ipNumbers = data.ipNumbers;
                    this.$proposalList.next();
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Endorsing Review failed. Please try again.');
                },
                    () => {
                        this.clearFields();
                        if (ipNumbers && ipNumbers.length > 0) {
                            this.createAwardFromProposal(ipNumbers);
                        }
                        $('#endorse-modal').modal('hide');
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review has been endorsed successfully.');
                    }));
            } else {
                this.completeReturnReviewWaf();
            }
        }
    }

    /** createAwardFromProposal - create award from proposal if IP is generated
  * @param ipNumbers
  */
    createAwardFromProposal(ipNumbers) {
        this._proposalService.createAwardFromProposal({
            'ipNumbers': ipNumbers, 'updateUser': localStorage.getItem('currentUser')
        }).subscribe(data => { });
    }

    /**if attachments are added, sets parameters and calls save attachment,
     * otherwise calls saveWafRequest function in wafAttachmentService.
    * */
    async completeReturnReviewWaf() {
        $('#endorse-modal').modal('hide');
        this.endorseRequest.isLastUploadedFile = false;
        this.setCommentRequestObject();
        this.setActionRequestObject();
        this.endorseRequest.reviewStatusCode = null;
        if (this.uploadedFile.length > 0) {
            const data = await this._wafAttachmentService.saveAttachment(this.endorseRequest, null, this.uploadedFile,
                '/approveOrDisapproveReviewForWaf', 'completeEvaluation', null);
            this.checkEndorsed(data);
        } else {
            this._wafAttachmentService.saveWafRequest(this.endorseRequest, '/approveOrDisapproveReviewForWaf').then(data => {
                this.checkEndorsed(data);
            }).catch(error => {
                this.checkEndorsed(error);
            });
        }
    }

    /**
    * @param  {} data
    * if data doesn't contains error, review endorsed successfully.Other wise shows error toast
    */
    checkEndorsed(data) {
        if (data && !data.error) {
            const ipNumbers = data.ipNumbers;
            this.$proposalList.next();
            if (ipNumbers && ipNumbers.length > 0) {
                this.createAwardFromProposal(ipNumbers);
            }
            this.clearFields();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal Review was endorsed successfully.');
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for endorsing the review.');
        }
    }

    /** sets common request object for add comment and complete/return review */
    setCommentRequestObject() {
        this.reviewRequest.personId = this.personId;
        this.reviewRequest.fullName = this._commonService.getCurrentUserDetail('fullName');
        if (!this._commonService.isWafEnabled) {
            this.formData = new FormData();
            for (let i = 0; i < this.uploadedFile.length; i++) {
                this.formData.append('files', this.uploadedFile[i], this.uploadedFile[i].name);
            }
        }
        this.endorseRequest.proposalIds = this.selectedProposals;
        this.endorseRequest.reviewId = null;
        this.endorseRequest.userName = this._commonService.getCurrentUserDetail('userName');
        if (this.reviewRequest.reviewComment != null && this.reviewRequest.reviewComment !== '') {
            this.endorseRequest.newReviewComment = this.reviewRequest;
        }
    }

    /** sets specific values of requestObject for endorse review */
    setActionRequestObject() {
        this.endorseRequest.actionType = 'APPROVE';
        this.endorseRequest.completeReviewerPersonId = this._commonService.getCurrentUserDetail('personID');
        this.endorseRequest.completeReviewerFullName = this._commonService.getCurrentUserDetail('fullName');
        this.endorseRequest.completeReviewerEmail = this._commonService.getCurrentUserDetail('email');
        this.reviewRequest.proposalId = this.result.proposal.proposalId;
        this.reviewRequest.updateTimestamp = new Date().getTime();
        this.reviewRequest.updateUser = this._commonService.getCurrentUserDetail('userName');
    }

    fileDrop(files) {
        for (let index = 0; index < files.length; index++) {
            this.uploadedFile.push(files[index]);
        }
    }

    deleteFromUploadedFileList(index) {
        this.uploadedFile.splice(index, 1);
    }

    /**setRankValue - if recommendation value is not support, sets rank value to null */
    setRankValue() {
        this.proposalRank = this.recommendationCode === 2 ? null : this.proposalRank;
        if (this.recommendationCode === 2) {
            this.mandatoryList.delete('rank');
        }
    }

    /**
     * @param  {} data
     * @param  {} template
     * to get the values of the lookups in advanced search which returns string value
     */
    onLookupSelect(data, template) {
        this.lookupValues[template] = data;
        this.tempProposalRequestObject[template] = data.length ? data.map(d => d.code) : [];
    }

    /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
    changeMemberType() {
        this.tempProposalRequestObject.property5 = '';
        this.advSearchClearField = new String('true');
        this.elasticPersonSearchOptions.defaultValue = '';
        (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    }

    /**setElasticPersonOption - Set Elastic search option for Fibi Person */
    setElasticPersonOption() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    }

    /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
    setElasticRolodexOption() {
        this.elasticPersonSearchOptions = this._elasticConfig.getElasticForRolodex();
    }

    setCurrentDashboardTab(currentTab: string) {
        this._proposalService.proposalRequestServiceObject.tabName = currentTab;
        sessionStorage.setItem('currentProposalDashboardTab', currentTab);
        this._proposalService.proposalRequestServiceObject.currentPage = 1;
        this._proposalService.isAdvanceSearch = false;
        this.resetSearchOptions();
        this.setAdvanceSearch();
        this.clearAdvanceSearchList();
        this.$proposalList.next();
    }

    resetSearchOptions () {
        this.sortMap = {};
        this.sortCountObj = {
            'proposalId': 0, 'sponsorProposalNumber': 0, 'title': 0, 'proposalPersons.fullName': 0, 'homeUnitName': 0,
            'activityType.description': 0, 'proposalStatus.description': 0, 'sponsorName': 0, 'sponsorDeadlineDate': 0, 'createUser': 0,
            'grantCallName': 0, 'grantCallClosingDate': 0, 'proposalRank': 0, 'proposalType.description': 0
            , 'abbrevation': 0
        };
    }

    setAdvanceSearch() {
		sessionStorage.setItem('currentProposalDashboardTab', this._proposalService.proposalRequestServiceObject.tabName);
		if (this._proposalService.proposalRequestServiceObject.tabName === 'ALL_PROPOSALS') {
			document.getElementById('collapseProposal').classList.add('show');
            this.isShowAllProposalList = false;
		} else {
			if (this._proposalService.isAdvanceSearch) {
				document.getElementById('collapseProposal').classList.add('show');
			} else {
				document.getElementById('collapseProposal').classList.remove('show');
                this.isShowAllProposalList = true;
            }

		}
	}

    clearAdvanceSearchList() {
        this._proposalService.proposalRequestServiceObject = new ProposalDashBoardRequest();
        this.tempProposalRequestObject = new ProposalDashBoardRequest();
        this._proposalService.proposalRequestServiceObject.tabName = sessionStorage.getItem('currentProposalDashboardTab');
        this.clearFieldProposalLeadUnit = new String('true');
        this._proposalService.sponsorAdvanceSearchDefaultValue = '';
        this.clearFieldFundingAgency = new String('true');
        this.clearField = new String('true');
        this._proposalService.proposalRequestExtraData.fullName = '';
        this._proposalService.proposalRequestExtraData.grantCallName = '';
        this.advSearchClearField = new String('true');
        this.lookupValues = [];
        this.isEmployeeFlag = true;
        this.setElasticPersonOption();
        this._proposalService.proposalRequestServiceObject.advancedSearch = 'L';
    }

    switchAdvanceSearchProperties(destination, source, isInitialLoad) {
        destination.property1 = source.property1 || '';
        destination.property2 = source.property2 || '';
        destination.property3 = source.property3;
        destination.property4 = source.property4;
        destination.property5 = source.property5 || '';
        destination.property6 = source.property6;
        destination.property7 = source.property7 || '';
        destination.property8 = source.property8 || '';
        destination.property9 = source.property9 || '';
        destination.property10 = source.property10 || '';
        destination.property11 = source.property11 || '';
        destination.property12 = source.property12 || '';
        destination.property13 = source.property13;
        if (isInitialLoad) {
            destination.property14 = getDateObjectFromTimeStamp(source.property14) || '';
            destination.property15 = getDateObjectFromTimeStamp(source.property15) || '';
        } else {
            destination.property14 = parseDateWithoutTimestamp(source.property14) || '';
            destination.property15 = parseDateWithoutTimestamp(source.property15) || '';
        }
        destination.property16 = source.property16 || '';
    }

    searchProposal() {
        this.switchAdvanceSearchProperties(this._proposalService.proposalRequestServiceObject, this.tempProposalRequestObject, false);
        this._proposalService.proposalRequestExtraData.fullName = this.tempProposalRequestObject.fullName ?
            this.tempProposalRequestObject.fullName : '';
        this._proposalService.proposalRequestExtraData.grantCallName = this.tempProposalRequestObject.grantCallName ?
            this.tempProposalRequestObject.grantCallName : '';
        this._proposalService.proposalRequestExtraData.isEmployee = this.isEmployeeFlag;
        this._proposalService.proposalRequestServiceObject.advancedSearch = 'A';
        this.searchUsingAdvanceOptions();
    }

    getProposalSectionConfig(moduleCode: string) {
        this._commonService.getDashboardActiveModules(moduleCode).subscribe(data => {
            this.proposalSectionConfig = this._commonService.getSectionCodeAsKeys(data);
        });
    }

}
