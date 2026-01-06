/** last updated by Ramlekshmy on 06-07-2020 */
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GrantCallService } from './services/grant.service';
import { CommonService } from '../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../app-constants';
import {
    compareDates, getCurrentTimeStamp, getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp
} from '../common/utilities/date-utilities';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { GrantCommonDataService } from './services/grant-common-data.service';
import { SubmittedProposalsComponent } from './submitted-proposals/submitted-proposals.component';
import { deepCloneObject, fileDownloader } from '../common/utilities/custom-utilities';
import { NavigationService } from '../common/services/navigation.service';
import { AutoSaveService } from '../common/services/auto-save.service';
declare var $: any;

@Component({
    selector: 'app-grant-call',
    templateUrl: './grant-call.component.html',
    styleUrls: ['./grant-call.component.css']
})
export class GrantCallComponent implements OnInit, OnDestroy {

    @ViewChild('moreOptionsBtn', { static: true }) moreOptions: ElementRef;
    @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;
    @ViewChild(SubmittedProposalsComponent, { static: false }) mainPanelReview: SubmittedProposalsComponent;
    grantId = '';
    isGrantCopied = false;
    result: any = {};
    modalHideAndShowObject: any = {};
    isShowMoreOptions = false;
    isCreateProposal = false;
    isModifyGrantCall = false;
    isPublishGrantCall = false;
    isDeleteGrantCall = false;
    isArchiveGrantCall = false;
    isCreateGrantCall = false;
    isDepartmentPublishGrantCall = false;
    isDepartmentModifyGrantCall = false;
    editViewIOIToggle = {
        isEditIOI: false,
        isViewIOI: false,
        grantCallIOIId: null,
        deleteIOIId: null,
        issubmitted: false,
        isShowSubmitIOI: false
    };
    isShowMainPannel: any;
    validationObject: any = {
        moduleCode: 15,
        subModuleCode: 0,
        moduleItemKey: '',
    };
    warningList: any = [];
    errorList: any = [];
    validationMsg: any = [];
    proposalStatusCode = null;
    $subscriptions: Subscription[] = [];
    isShowNotificationModal = false;
    isEditMode: any = false;
    canCreateIoi = true;
    debounceTimer: any;

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                public grantService: GrantCallService,
                public commonService: CommonService,
                public commonData: GrantCommonDataService,
                private _navigationService: NavigationService,
                public autoSaveService: AutoSaveService) {
                document.addEventListener('mouseup', this.offClickHandler.bind(this));
                document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this));
    }

    // The function is used for closing nav dropdown at mobile screen
    offClickMainHeaderHandler(event: any) {
        if (window.innerWidth < 992) {
            const ELEMENT = <HTMLInputElement>document.getElementById('navbarResponsive');
            if (!this.mainHeaders.nativeElement.contains(event.target)) {
                if (ELEMENT.classList.contains('show')) {
                    document.getElementById('responsiveColapse').click();
                }
            }
        }
    }

    ngOnInit() {
        this.getPermissions();
        this.result = this.commonData.$grantCallData.value;
        this.checkMainPannelStatus();
        this.initialLoad();
        this.checkDepartmentRightsForGrantCall(this.result);
        this.triggerGrantCallDetails();
        this.autoSaveService.initiateAutoSave();
        this.$subscriptions.push(this._route.queryParams.subscribe(queryParams => {
            if (this.isGrantCopied) {
                this.loadGrantById();
            }
        }));
        this.commonData.grantCallTitle.title = this.result.grantCall.grantCallName;
        this.commonData.grantCallTitle.abbrevation = this.result.grantCall.abbrevation;
        document.getElementById('scroll-top').scrollIntoView({ block: 'end' });
    }

    triggerGrantCallDetails() {
        this.$subscriptions.push(this.grantService.isGrantActive.subscribe(data => {
            this.getGrantCallGeneralData();
        }));
    }

    getGrantCallGeneralData() {
        this.$subscriptions.push(this.commonData.$grantCallData.subscribe((data: any) => {
            if (data) {
                this.result = deepCloneObject(data);
                this.checkDepartmentRightsForGrantCall(this.result);
            }
        }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.commonData.$isMandatoryFilled.next(false);
        this.commonData.grantCallTitle = { title: '', abbrevation: '' };
        this.autoSaveService.stopAutoSaveEvent();
    }

    scoringCriteria() {
        return [1, 2, 3].includes(this.result.grantCall.grantCallType.grantTypeCode) ? false : true;
    }

    evaluation() {
        return [4, 7, 8, 9].includes(this.result.grantCall.grantCallType.grantTypeCode) ? true : false;
    }

    initialLoad() {
        this.grantId = this._route.snapshot.queryParamMap.get('grantId');
        this.commonData.getGrantCallMode();
    }

    /**fetches grant details for the given Id used in refernce with copy grant */
    loadGrantById() {
        this.$subscriptions.push(this.grantService.loadGrantById({
            'grantCallId': this._route.snapshot.queryParamMap.get('grantId')
        }).subscribe(data => {
            this.result = data;
            this.initialLoad();
            this.isGrantCopied = false;
        }));
    }

    // Create proposal was blocked when eligibility criteria was not met. Code for showing error popup is commented after discussions
    // Code not removed, retained considering if any universities need it.
    setCurrentProposalTab() {
        this.modalHideAndShowObject.isShowCreateProposalWarning = false;
        if ((compareDates(this.result.grantCall.closingDate, getCurrentTimeStamp(), 'dateObject', 'timeStamp') === -1)) {
            this.modalHideAndShowObject.isShowCreateProposalWarning = true;
        } else {
            localStorage.setItem('currentTab', 'PROPOSAL_HOME');
            this._router.navigate(['/fibi/proposal'], { queryParams: { 'grantId': this.result.grantCall.grantCallId } });
        }
    }

    checkDepartmentRightsForGrantCall(result) {
        if (result != null && result.availableRights !== undefined
            && result.availableRights !== null && result.availableRights.length > 0) {
            const modifyDepartment = result.availableRights.find(function (element) {
                return element === 'MODIFY_GRANT_CALL';
            });
            const publishDepartment = result.availableRights.find(function (element) {
                return element === 'PUBLISH_GRANT_CALL';
            });
            this.isDepartmentPublishGrantCall = publishDepartment !== undefined ? true : false;
            this.isDepartmentModifyGrantCall = modifyDepartment !== undefined ? true : false;
        } else {
            this.isDepartmentPublishGrantCall = false;
            this.isDepartmentModifyGrantCall = false;
        }
    }

    /** check whether login ed user is grant manager, status is draft,open,tentative,(closed and modify grant)
     *  if yes show warning else navigate to dashboard */
    openGoBackModal() {
        this._navigationService.navigationGuardUrl = 'fibi/dashboard/grantCall';
        if (this.isModifyGrantCall && this.result.grantCall.grantStatusCode !== 5 && this.commonData.isGrantCallDataChange) {
            document.getElementById('grantTabChangebutton').click();
        } else {
            this._router.navigate(['fibi/dashboard/grantCall']);
        }
    }

    /** checks whether all data are valid and shows publish confirmation modal  */
    checkGrantCallPublish() {
        if (this.commonData.isGrantCallDataChange) {
            this.grantService.isSaveGrantcall.next(true);
            if (!this.commonData.errorMessage) {
                this.saveGrantCallForRuleEvaluation();
            }
        }
        if (!this.commonData.errorMessage || !this.commonData.isGrantCallDataChange) {
            this.getGrantCallGeneralData();
            this.checkMainPannelStatus();
            this.modalHideAndShowObject.isShowPublishGrantCallWarning = false;
            if (this.result.grantCall.grantStatusCode === 1 &&
                ((this.result.grantCall.grantCallType.categoryCode !== 1 && this.commonService.isGrantCallStatusAutomated)
                    || !this.commonService.isGrantCallStatusAutomated)) {
                this.modalHideAndShowObject.isShowPublishGrantCallWarning = true;
            } else {
                this.modalHideAndShowObject.isShowPublishGrantCallWarning = false;
            }
            this.modalHideAndShowObject.isShowCopyWarningModal = false;
            this.modalHideAndShowObject.isShowGrantCallDeleteModal = false;
            this.validateGrantCall();
        }
    }

    saveGrantCallForRuleEvaluation() {
        const previousMode = this.commonData.isViewMode;
        this.$subscriptions.push(this.grantService.saveGrantCall({
            'grantCall': this.result.grantCall, 'isStatusChanged': this.result.isStatusChanged, 'updateType': 'UPDATE'
        }).subscribe((response: any) => {
            this.result.grantCall = response.grantCall;
            this.result.availableRights = response.availableRights;
            this.result.canCreateIOI = response.canCreateIOI;
            this.result.fundingSchemeAttachment = response.fundingSchemeAttachment;
            this.updateGrantCallStoreData(this.result);
            this.commonData.isViewMode = previousMode;
            this.commonData.isGrantCallDataChange = false;

        }));
    }

    /** removes the timestamps from date */
    removeTimeStampFromDate() {
        this.result.grantCall.openingDate = parseDateWithoutTimestamp(getDateObjectFromTimeStamp(this.result.grantCall.openingDate));
        this.result.grantCall.closingDate = parseDateWithoutTimestamp(getDateObjectFromTimeStamp(this.result.grantCall.closingDate));
        this.result.grantCall.internalSubmissionDeadLineDate = parseDateWithoutTimestamp(
            getDateObjectFromTimeStamp(this.result.grantCall.internalSubmissionDeadLineDate));
    }

    /** publish grant */
    publishGrantCall() {
        $('#warningOrAlertModal').modal('hide');
        this.removeTimeStampFromDate();
        this.result.grantCall.updateUser = this.commonService.getCurrentUserDetail('userName');
        this.$subscriptions.push(this.grantService.publishGrantCall({ 'grantCall': this.result.grantCall }).subscribe((success: any) => {
            this.result.grantCall = success.grantCall;
            this.result.canCreateIOI = success.canCreateIOI;
            this.result.fundingSchemeAttachment = success.fundingSchemeAttachment;
            this.updateGrantCallStoreData(this.result);
            this.commonData.getGrantCallMode();
            this.commonData.isGrantCallDataChange = false;
            this.modalHideAndShowObject.isShowPublishWarningModal = false;
            this.modalHideAndShowObject = {};
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant Call published successfully.');
            this.commonData.$isMandatoryFilled.next(false);

        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Publishing Grant Call failed. Please try again.');
        }));
    }

    /** copy grant */
    copyGrantCall() {
        $('#warningOrAlertModal').modal('hide');
        this.isGrantCopied = true;
        this.$subscriptions.push(this.grantService.copyGrantCall({
            'grantCallId': this.result.grantCall.grantCallId,
            'updateUser': this.commonService.getCurrentUserDetail('userName')
        }).subscribe((data: any) => {
            this.result.grantCall = data.grantCall;
            this.result.canCreateIOI = data.canCreateIOI;
            this.updateGrantCallStoreData(this.result);
            this.removeActiveClass();
            this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant Call has been copied successfully.');
            this._router.navigate(['/fibi/grant/overview'], { queryParams: { 'grantId': data.grantCall.grantCallId } });
        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Copying Grant Call failed. Please try again.');
        }));
    }

    /**
    * setup grant call common data the values that changed after the service call need to be updated into the store.
    * every service call wont have all the all the details as response so
    * we need to cherry pick the changes and update them to the store.
    */
    updateGrantCallStoreData(data) {
        this.result = deepCloneObject(data);
        this.commonData.setGrantCallData(this.result);
    }

    /*deletes grant call */
    deleteGrantCall() {
        $('#warningOrAlertModal').modal('hide');
        this.modalHideAndShowObject.isShowGrantCallDeleteModal = false;
        this.$subscriptions.push(this.grantService.deleteGrantcall({ 'grantCallId': this.grantId }).subscribe((success: any) => {
            if (success.message === 'GrantCall deleted successfully') {
                this._router.navigate(['fibi/dashboard/grantCall']);
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant Call deleted successfully.');
            }
        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Grant Call failed. Please try again.');
        }));
    }

    archiveGrantCall(type) {
        $('#warningOrAlertModal').modal('hide');
        this.$subscriptions.push(this.grantService.archiveGrantCall({
            'updateUser': this.commonService.getCurrentUserDetail('userName'),
            'grantCallId': this.result.grantCall.grantCallId
        }).subscribe((data: any) => {
            this.result.grantCall = data.grantCall;
            this.result.canCreateIOI = data.canCreateIOI;
            this.commonData.getGrantCallMode();
        }, err => {
            if (type === 'archive') {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Archiving Grant Call failed. Please try again.');
            } else if (type === 'unarchive') {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Unarchiving Grant Call failed. Please try again.');
            }
        },
            () => {
                this.commonData.isGrantCallDataChange = false;
                if (type === 'archive') {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'GrantCall archived successfully.');
                } else if (type === 'unarchive') {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'GrantCall unarchived successfully.');
                }
            }));
    }

    offClickHandler(event: any) {
        if (!this.moreOptions.nativeElement.contains(event.target)) {
            this.isShowMoreOptions = false;
        }
    }

    modifyGrant() {
        this.commonData.isViewMode = false;
        this.result.grantCall.isPublished = false;
        this.updateGrantCallStoreData(this.result);
        this._router.navigate(['/fibi/grant/overview'], { queryParamsHandling: 'merge' });
    }

    /* checks system level permissions are allowed or not */
    async getPermissions() {
        this.isCreateProposal = await this.commonService.checkPermissionAllowed('CREATE_PROPOSAL');
        this.isPublishGrantCall = await this.commonService.checkPermissionAllowed('PUBLISH_GRANT_CALL');
        this.isDeleteGrantCall = await this.commonService.checkPermissionAllowed('DELETE_GRANT_CALL');
        this.isArchiveGrantCall = await this.commonService.checkPermissionAllowed('ARCHIVE_GRANT_CALL');
        this.isCreateGrantCall = await this.commonService.checkPermissionAllowed('CREATE_GRANT_CALL');
        this.isModifyGrantCall = await this.commonService.checkPermissionAllowed('MODIFY_GRANT_CALL');
    }

    /** showDeletIcon - show delete icon only if grant call status is not open, archived and closed(only if no applications are linked) */
    showDeletIcon() {
        if (this.isDeleteGrantCall && this.result.grantCall.grantCallId != null && this.result.grantCall.grantCallStatus != null &&
            this.result.grantCall.grantCallStatus.grantStatusCode !== 2 && this.result.grantCall.grantCallStatus.grantStatusCode !== 5) {
            if (this.result.grantCall.grantCallStatus.grantStatusCode === 3 && (this.result.grantCall.proposals != null &&
                this.result.grantCall.proposals.length !== 0)) {
                return false;
            } return true;
        }
        return false;
    }

    /**
     * If MAINTAIN_APPLICATIONS right is there,
     * allows main pannel condition to be checked otherwise it will be false.
     */
    checkMainPannelStatus() {
        this.isShowMainPannel = this.result.availableRights.includes('MAINTAIN_APPLICATIONS') ? true : false;
    }

    /**
     * @param  {} editorString as input for checking the the length for inputs in ngx editor
     */
    editorMaxLength(editorString) {
        if (editorString) {
            let ngxInput = editorString;
            ngxInput = ngxInput.replace('<[^>]+>', '');
            return (ngxInput.length > 99999) ? true : false;
        } else {
            return false;
        }
    }

    validateGrantCall() {
        this.validationObject.moduleItemKey = this.result.grantCall.grantCallId;
        this.validationMsg = [];
        this.warningList = [];
        this.errorList = [];
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.$subscriptions.push(this.commonService.evaluateValidation(this.validationObject).subscribe((data: any) => {
                this.validationMsg = data;
                this.validationMsg.forEach(element => {
                    (element.validationType === 'VW') ? this.warningList.push(element) : this.errorList.push(element);
                });
                this.setValiadtionAndModalFlags();
            }));
        }, 500);
    }

    setValiadtionAndModalFlags() {
        if (this.grantService.isMandatoryFilled) {
            if (this.result.grantCall.grantStatusCode === 1 &&
                ((this.result.grantCall.grantCallType.categoryCode !== 1 && this.commonService.isGrantCallStatusAutomated)
                    || !this.commonService.isGrantCallStatusAutomated)) {
                this.modalHideAndShowObject.isShowPublishGrantCallWarning = true;
                this.modalHideAndShowObject.isShowPublishWarningModal = false;
                $('#warningOrAlertModal').modal('show');
            } else if (this.validationMsg && this.validationMsg.length > 0) {
                $('#ValidateGrantCallModal').modal('show');
            } else if (!this.modalHideAndShowObject.isShowPublishGrantCallWarning) {
                this.modalHideAndShowObject.isShowPublishWarningModal = true;
                $('#warningOrAlertModal').modal('show');
            }
        }
    }

    /**
     * function used in submitted proposals to reject selected proposals
     */
    rejectProposals() {
        this.proposalStatusCode = 'U';
        if (this.proposalSelectionCheck()) {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal');
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
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal');
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
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal');
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
        this.mainPanelReview.mainPanelObject.submittedProposals.forEach(element => {
            // this.isShowWarningModal = false;
            this.mainPanelReview.updateProposalReviewedList(element, proposalStatus);
        });
        if (!this.proposalSelectionCheck()) {
            this.changeProposalStatus(proposalStatus);
        } else {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Please select at least one proposal');
        }
    }

    /**
     * to check atleast 1 proposal is checked
     */
    proposalSelectionCheck() {
        return Object.values(this.mainPanelReview.isChecked).every(this.isSelected);
    }

    /**
     * @param  {} proposalStatus : checks the status of the proposal to show error toasts
     * save the proposal list or reject
     */
    changeProposalStatus(proposalStatus) {
        if (this.mainPanelReview.selectedArray.length > 0) {
            this.mainPanelReview.saveReview(this.proposalStatusCode);
        } else {
            this.showToastforProposalStatus(proposalStatus);
        }
    }

    /**
     * @param  {} proposalStatus : checks the status of the proposal to show error toasts
     */
    showToastforProposalStatus(proposalStatus) {
        if (proposalStatus === 'U' || proposalStatus === 'S') {
            this.commonService.showToast
                (HTTP_ERROR_STATUS, 'This action cannot be performed since the proposals are awarded/ shortlisted/ rejected');
        } if (proposalStatus === 'A') {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'This proposals cannot be awarded');
        }
    }

    /**
   * @param  {} currentValue : current values for checking the array element
   * boolean function which returns true when all values in the array are false and vice versa
   */
    isSelected = (currentValue) => currentValue === false;

    /**
   * @param  {} event
   *  updating isShowNotificationModal flag after sending award notification
   */
    showGrantCallNotificationModal(event) {
        this.isShowNotificationModal = event;
    }

    /**
   *  function for saving all the submitted proposals
   */
    saveAllProposals() {
        const proposalEvaluationScore = [];
        this.mainPanelReview.mainPanelObject.submittedProposals.forEach(element => {
            proposalEvaluationScore.push(element.proposalEvaluationScore);
        });
        if (this.mainPanelReview.checkAll === false) {
            this.mainPanelReview.checkAllProposals();
            this.mainPanelReview.checkAll = true;
            this.$subscriptions.push(this.grantService.saveAllProposals({
                'proposalEvaluationScores': proposalEvaluationScore
            }).subscribe(data => {
            }, err => { this.commonService.showToast(HTTP_ERROR_STATUS, 'Save all proposals failed. Please try again.'); },
                () => {
                    this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal details saved successfully.');
                }));
        }
    }

    /**
     * navigate to the selected path and set dataChange flag to false
     */
    navigateUsingRedirectRoute() {
        this.commonData.isGrantCallDataChange = false;
        this.redirectBasedOnQueryParam();
    }

    redirectBasedOnQueryParam() {
        this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
    }

    chooseIoiNavigation() {
        if (this.result.grantCall.grantStatusCode === 1) {
            this._router.navigate(['fibi/grant/ioi/questionnaire'], { queryParamsHandling: 'merge' });
        } else if (this.result.grantCall.grantStatusCode !== 1) {
            this._router.navigate(['fibi/grant/ioi/list'], { queryParamsHandling: 'merge' });
        }
    }

    removeActiveClass() {
        if (document.getElementById('ioi-tab')) {
            document.getElementById('ioi-tab').classList.remove('active');
        }
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll() {
        const HEIGHT = document.getElementById('stickyGrantHeader').offsetHeight;
        const HEADER = document.getElementById('stickyGrantHeader');
        if (window.pageYOffset > HEIGHT && this.commonService.isIE) {
            HEADER.classList.add('tab-sticky');
        } else {
            HEADER.classList.remove('tab-sticky');
        }
    }

    /**
     * @param  {} grantCallId
     * To check whether proposals are linked to this grant call or not
    */
    checkDeleteGrantCallOrNot(grantCallId) {
        this.grantId = grantCallId;
        this.$subscriptions.push(this.grantService.checkCanDeleteGrantCall({ 'grantCallId': this.grantId }).subscribe((response: any) => {
            this.showDeleteWarningModal(response.isGrantCallLinked);
        }));
    }

    /**
     * @param  {} isGrantCallLinked
     *  show delete confirmation modal only if grant call status is draft(1), tendative(4) and closed(3) and  no proposals are linked
    */
    showDeleteWarningModal(isGrantCallLinked) {
        const statusArray = [1, 3, 4];
        if (this.result.grantCall.grantCallStatus &&
            (statusArray.includes(this.result.grantCall.grantCallStatus.grantStatusCode)) && !isGrantCallLinked) {
            document.getElementById('grant-delete-btn').click();
        } else {
            document.getElementById('grant-delete-warning-btn').click();
        }
    }
    /**
      * @param  {string} exportIndex : 'BY_PERSON' for report using person and 'BY_CRITERIA' for report using criteria
      * function export the grant call evaluation data based on the parameter exportIndex
      */
    exportGrantCallEvaluationReport(exportIndex: string) {
        const exportDataReqObject = {
            grantCallId: this.result.grantCall.grantCallId,
            exportIndex: exportIndex
        };
        this.$subscriptions.push(this.grantService.exportGrantCallEvaluationReport(exportDataReqObject).subscribe(
            data => {
                const fileName = exportIndex === 'BY_PERSON' ? 'Evaluation Report by Reviewer' : 'Evaluation Report by Criteria';
                fileDownloader(data.body, fileName, 'xlsx');
            }));
    }

    submitIOI() {
        this.grantService.ioiSubmit$.next();
    }

    isEditModeAndRouteHasForms(): boolean {
        return (!this.commonData.isViewMode && ['overview', 'other-information', 'ioi/questionnaire'].some
            (tabName => this._router.url.includes(tabName))) || this._router.url.includes('ioi/edit');
    }

    initiateSaveInChildComponents() {
        this.autoSaveService.commonSaveTrigger$.next(true);
    }

}
