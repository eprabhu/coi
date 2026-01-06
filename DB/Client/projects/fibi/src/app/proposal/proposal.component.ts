import { BudgetService } from './budget/budget.service';
/** Last updated by Ramlekshmy on 28-01-2020 */
// Last updated by Arun Raj (back button issue fix) on 07/04/2020
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { ProposalService } from './services/proposal.service';
import { CommonService } from '../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, COMMON_APPROVE_LABEL,AWARD_ERR_MESSAGE} from '../app-constants';

import { compareDates, getCurrentTimeStamp, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { QuestionnaireListService } from '../shared/view-questionnaire-list/questionnaire-list.service';
import { BudgetDataService } from './services/budget-data.service';
import { fileDownloader } from '../common/utilities/custom-utilities';
import { environment } from '../../environments/environment';
import { WebSocketService } from '../common/services/web-socket.service';
import { AutoSaveService } from '../common/services/auto-save.service';
import { DataStoreService } from './services/data-store.service';

import { concatUnitNumberAndUnitName } from '../common/utilities/custom-utilities';
import { NavigationService } from '../common/services/navigation.service';

// KKI Specific Change Don't Delete
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';

declare var $: any;

@Component({
    selector: 'app-proposal',
    templateUrl: './proposal.component.html',
    styleUrls: ['./proposal.component.css']
})
export class ProposalComponent implements OnInit, OnDestroy {

    @ViewChild('moreOptionsBtn', { static: true }) moreOptions: ElementRef;
    @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;

    result: any = {};
    dataVisibilityObj: any = {
        mode: 'view',
        currentTab: (localStorage.getItem('currentTab') == null) ? 'PROPOSAL_HOME' : localStorage.getItem('currentTab'),
        isGrantCallWdgtOpen: true,
        isAreaOfResearchWidgetOpen: true,
        isKeyPersonWidgetOpen: true,
        isMoreInfoWdgtOpen: true,
        isSpecialReviewWidgetOpen: true,
        isBudgetWdgtOpen: true,
        isAttachmentListOpen: true,
        isAttachmentEditable: false,
        isBudgetPeriodDate: false,
        isAttachmentVersionOpen: [],
        selectedVersion: 1,
        isbudgetDetils: false,
        isbudget: true,
        isMultiPI: false,
        BudgetTab: null,
        personnelFrom: 'DETAILBUDGET',
        isEvaluationFormEdittable: [],
        isBudgetHeaderFound: false,
        proposalStatus: null,
        isBudgetHeaderEdited: false,
        grantCallId: null,
        isPanelNotSeleceted: false,
        isNoPersonSeleceted: false
    };
    showRequestModal: any = {};
    moduleDetails: any = {};
    copyAllBudgetVersion = false;
    copyFinalBudgetVersion = false;
    copyQuestionnaire = false;
    copyOtherInformation = false;
    copyAttachment = false;
    preReviewReq: any = {
        moduleItemCode: 3,
        moduleSubItemCode: 0,
        moduleItemKey: '',
        moduleSubItemKey: '0',
        reviewTypeCode: '1',
        reviewSectionTypeCode: '1'
    };
    supportReq: any = {
        moduleItemCode: 3,
        moduleSubItemCode: 0,
        moduleItemKey: this._route.snapshot.queryParamMap.get('proposalId'),
        moduleSubItemKey: '0',
        reviewTypeCode: '2'
    };
    deployMap = environment.deployUrl;
    addAttachment: any = {};
    isShowMoreOptions = false;
    userName = this._commonService.getCurrentUserDetail('fullName');
    toast_message = '';
    rate_toast_message = '';
    superUser = this._commonService.getCurrentUserDetail('superUser');
    tempSavecurrentTab: string;
    uploadedFile = [];

    warningMsgObj: any = {};
    proposalDataBindObj: any = this._proposalService.proposalDataBindObj;
    requestObject: any = {};
    showApproveDisapproveModal: any = {};
    versionHistorySelected: number;
    workflowDetailsMap: any = [];
    selectedAttachmentStop: any = [];
    commentsApproverExpand: any = {};
    budgetPeriodsDateObj: any = {};
    validationObject: any = {
        moduleCode: 3,
        subModuleCode: 0,
        moduleItemKey: '',
    };
    validationMsg: any;
    errorMsg: any;
    validationFlag: boolean;
    warningList: any = [];
    errorList: any = [];
    tempMapIndex = null;
    tempIndex = null;
    value: any;
    resultMapArray: any = [];
    setAttachmentTabFlag: boolean;
    isPageReload = false;
    promptObject: any = {};
    departmentLevelRightsForProposal: any = {};
    currentTab = null;
    budgetVersion = null;
    isCreateProposal = false;
    isShowCommentsTab = false;
    isCommentEditMode = false;
    hasModifyProposalRight = false;
    $subscriptions: Subscription[] = [];
    isShowNotificationModal = false;
    isEmptyCommentArea = false;
    recallProposalObject: any = {};
    uploadedFiles: any = [];
    isSaving = false;
    isButtonDisabled = false;
    exportproposal: any = {};
    budgetData: any = {};
    importedFile = [];
    questionnaireList: any = [];
    isShowDateValidation = false;
    dateValidationMessage: string;
    isShowSave = false;
    dataDependencies = ['dataVisibilityObj', 'availableRights', 'grantCall', 'proposalId', 'proposal', 'isBudgetHeaderFound',
        'researchTypes', 'notificationTypeId', 'workflow', 'workflowList', 'canApproveRouting', 'isPersonCanScore', 'proposalRoles',
        'ipGenerationOnly', 'approverStopNumber', 'enableClosedGrantCallLinkingInProposal', 'preReviewTypes', 'preReviewRoutingReview',
        'showOtherInformation', 'proposalDetails', 'workflow', 'workflowList', 'approverStopNumber',
        'canApproveRouting', 'isPersonCanScore', 'hasRank', 'hasRecommendation'];
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    printTemplates: any = null;
    validationMap = new Map();
    isDownloading = false;
    currentTemplateArr: any = [];
    isChecked = {};
    submitModalName: string;
    proposalMode = '';
    invalidActionMessage = '';

    // KKI Specific Change Don't Delete
    // internalDeadlineWarningMsg: string;
    // public configUrl = environment.deployUrl + './assets/app-data-config.json';

    // private _http: HttpClient  // add to constructor KKI Specific Change
    constructor(private _route: ActivatedRoute,
        public _proposalService: ProposalService,
        private _router: Router,
        public _commonService: CommonService,
        private _questionnaireListService: QuestionnaireListService,
        public _budgetDataService: BudgetDataService,
        private _budgetService: BudgetService,
        public webSocket: WebSocketService,
        public autoSaveService: AutoSaveService,
        public _dataStore: DataStoreService,
        private _navigationService: NavigationService) {
        document.addEventListener('mouseup', this.offClickHandler.bind(this));
        document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this));
        this.lockFailEvent();
        this._router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.canShowSave();
            }
        });
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

    async ngOnInit() {
        this.getDataFromStore();
        this.autoSaveService.initiateAutoSave();
        this.listenDataChangeFromStore();
        await this.getSystemLevelPermissions();
        this.dataVisibilityObj.grantCallId = this.result.grantCall ? this.result.grantCall.grantCallId : null;
        await this.initialLoad();
        this.checkCurrentTabChange();
        this.setDateValidationMessage();
        //  KKI Specific Change Don't Delete
        //  this._http.get(this.configUrl).subscribe(data => {
        //   this.internalDeadlineWarningMsg = data['internalDeadlineWarning'];
        //   if (this.result.proposal.sponsorDeadlineDate != null) {
        //     this.compareAndSetInternalDateMessage();
        //   }
        // });
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData();
        this.result = DATA;
        this.dataVisibilityObj = DATA.dataVisibilityObj;
        this.departmentLevelRightsForProposal = this._proposalService.checkDepartmentLevelPermission(this.result.availableRights);
        this.canShowSave();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
            if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                this.getDataFromStore();
            }
            if (dependencies.includes('workflow')) {
                this.showMergeModal();
            }
        }));
    }


    checkCurrentTabChange() {
        this.$subscriptions.push(this._proposalService.$currentTab.subscribe(data => {
            if (data) {
                this.dataVisibilityObj.currentTab = data;
                localStorage.setItem('currentTab', data);
            }
        }));
    }

    generateProposalBudgetReport() {
        this._budgetDataService.isProposalBudgetPrintTrigger.next(true);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._budgetDataService.setProposalBudgetData(null);
        this._proposalService.proposalStartDate = null;
        this._proposalService.proposalEndDate = null;
        this._budgetDataService.isBudgetDatesFilled = true;
        this._proposalService.$currentTab.next(null);
        this._proposalService.proposalDateChangeType = null;
        this._proposalService.$isShowDateWarning.next(null);
        this._proposalService.isDatesChanged = false;
        this.autoSaveService.stopAutoSaveEvent();
        localStorage.removeItem('currentTab');
        this.webSocket.releaseCurrentModuleLock('Proposal' + '#' + this.result.proposal.proposalId);
    }

    async initialLoad() {
        this.preReviewReq.moduleItemKey = this.result.proposal.proposalId;
        this.supportReq.moduleItemKey = this.result.proposal.proposalId;
        this._proposalService.proposalTitle = this.result.proposal.title;
        this.setModuleDetails();
        /** added to naviagate to proposal home if user is in create budget page and automatically loggs out due to session timeout */
        if (this.dataVisibilityObj.currentTab !== 'PROPOSAL_HOME' && this.result.proposal.proposalId == null) {
            this.dataVisibilityObj.currentTab = 'PROPOSAL_HOME';
        }
        this.initialiseProposalFormElements();
        this.isShowCommentButton();
    }

    // KKI Specific Change Don't Delete
    // compareAndSetInternalDateMessage() {
    //   if (this.result.proposal.sponsorDeadlineDate != null &&
    //     compareDates(this.result.proposal.internalDeadLineDate, getCurrentTimeStamp(), 'dateObject', 'timeStamp') === -1) {
    //     this.proposalDataBindObj.dateWarningList.set('internalDeadlineDate', this.internalDeadlineWarningMsg);
    //   }
    // }

    getBadgeByStatusCode(statusCode) {
        if (statusCode === 4) {
            return 'success';
        } else if (statusCode === 2) {
            return 'warning';
        } else if (statusCode === 3) {
            return 'danger';
        } else {
            return 'info';
        }
    }

    /**fetches propsal details for the given Id used in refernce with copy proposal */
    loadProposalById(proposalId) {
        this.triggerManualLoader(true);
        this.$subscriptions.push(this._proposalService.loadProposalById({ 'proposalId': proposalId })
            .subscribe(data => {
                this.dataVisibilityObj.currentTab = 'PROPOSAL_HOME';
                this.result = { ...data, dataVisibilityObj: this.dataVisibilityObj };
                this._dataStore.manualDataUpdate(this.result);
                this.initialLoad();
                localStorage.setItem('currentTab', 'PROPOSAL_HOME');
                this._router.navigate(['/fibi/proposal/overview'], { queryParams: { 'proposalId': this.result.proposal.proposalId } });
                this.isPageReload = false;
                this.triggerManualLoader(false);
            }));
    }

    setCurrentTab(currentTab) {
        if (this.result.proposal.proposalId == null) {
            this.warningMsgObj.mandatoryNotFilledMsg = null;
            this.dataVisibilityObj.isProposalSaved = false;
            this.tempSavecurrentTab = currentTab;
        }
        if (!this.dataVisibilityObj.dataChangeFlag) {
            this.dataVisibilityObj.currentTab = currentTab;
        }
        this.updateDataVisibilityObj();
    }

    private updateDataVisibilityObj() {
        this._dataStore.manualDataUpdate({
            dataVisibilityObj: this.dataVisibilityObj
        });
    }

    offClickHandler(event: any) {
        if (!this.moreOptions.nativeElement.contains(event.target)) {
            this.isShowMoreOptions = false;
        }
    }

    initialiseProposalFormElements() {
        this.setProposalMode();
        this.dataVisibilityObj.proposalStatus = this.result.proposal.proposalStatus.statusCode;
        this.dataVisibilityObj.isBudgetHeaderFound = this.result.isBudgetHeaderFound;
        this._proposalService.proposalStartDate = this.result.proposal.startDate;
        this._proposalService.proposalEndDate = this.result.proposal.endDate;
        this._proposalService.sponsorDeadlineDate = this.result.proposal.sponsorDeadlineDate;
        this._proposalService.internalDeadLineDate = this.result.proposal.internalDeadLineDate;
        this.updateDataVisibilityObj();
    }

    checkBudgetEdittable() {
        if (this.dataVisibilityObj.mode !== 'view' &&
            (this.departmentLevelRightsForProposal.isMaintainProposalBudget ||
                this.departmentLevelRightsForProposal.isDefineApprovedBudget)) {
            this.dataVisibilityObj.isBudgetEdittable = true;
        } else if (this.dataVisibilityObj.mode === 'view' && this.result.proposal.statusCode !== 11
            && this.result.proposal.statusCode !== 12 && this.departmentLevelRightsForProposal.isDefineApprovedBudget) {
            this.dataVisibilityObj.isBudgetEdittable = true;
        } else {
            this.dataVisibilityObj.isBudgetEdittable = false;
        }
        this.updateDataVisibilityObj();
    }

    openGoBackModal() {
        this._navigationService.navigationGuardUrl = '/fibi/dashboard/proposalList';
        if (this.dataVisibilityObj.dataChangeFlag ||
            (this.dataVisibilityObj.currentTab === 'BUDGET' && this._budgetDataService.budgetDataChanged)) {
            this.dataVisibilityObj.isShowSaveBeforeExitWarning = true;
            $('#saveAndExitModal').modal('show');
        } else {
            this.closeGoBackModal();
        }
        this.updateDataVisibilityObj();
    }

    closeGoBackModal() {
        $('#saveAndExitModal').modal('hide');
        this.dataVisibilityObj.isShowSaveBeforeExitWarning = false;
        if (this.result.proposal.proposalId == null || this.dataVisibilityObj.mode === 'view') {
            this._router.navigate(['/fibi/dashboard/proposalList']);
        } else {
            if (!this.dataVisibilityObj.isBudgetPeriodDate) {
                this._router.navigate(['/fibi/dashboard/proposalList']);
            }
        }
    }

    closeWarningModal() {
        $('#warning-modal').modal('hide');
        $('#saveAndExitModal').modal('hide');
        this.dataVisibilityObj.isSaveOnTabSwitch = false;
        this.dataVisibilityObj.isShowSubmitWarningModal = false;
        this.dataVisibilityObj.isShowSaveBeforeExitWarning = false;
        this.dataVisibilityObj.isShowNotifyApprover = false;
        this.dataVisibilityObj.isShowWithdrawConfirmation = false;
        this.warningMsgObj.submitConfirmation = null;
        this.warningMsgObj.submitWarningMsg = null;
        this.updateDataVisibilityObj();
    }

    closeSaveAndExitModal() {
        $('#saveAndExitModal').modal('hide');
        this.dataVisibilityObj.isSaveOnTabSwitch = false;
        this.result.proposal = this._dataStore.getData(['proposal']).proposal;
        this.dataVisibilityObj.dataChangeFlag = false;
        this._budgetDataService.budgetDataChanged = false;
        this.dataVisibilityObj.isMandatoryNotFilled = false;
        this.dataVisibilityObj.currentTab = this.tempSavecurrentTab;
        this._budgetDataService.isBudgetOverviewChanged = false;
        this.updateDataVisibilityObj();
        this.redirectBasedOnQueryParam();
    }

    redirectBasedOnQueryParam() {
        this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
    }

    copyProposal(event) {
        event.preventDefault();
        this.isPageReload = true;
        this.$subscriptions.push(this._proposalService.copyProposal({
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'proposalId': this.result.proposal.proposalId,
            copyAllBudgetVersion: this.copyAllBudgetVersion,
            copyFinalBudgetVersion: this.copyFinalBudgetVersion,
            copyQuestionnaire: this.copyQuestionnaire,
            copyOtherInformation: this.copyOtherInformation,
            copyAttachment: this.copyAttachment,
        }).subscribe(async (success: any) => {
            this.webSocket.releaseCurrentModuleLock('Proposal' + '#' + this.result.proposal.proposalId);
            await this.webSocket.isModuleLocked('Proposal', success.proposal.proposalId);
            this.dataVisibilityObj.isPanelNotSeleceted = false;
            this.dataVisibilityObj.dataChangeFlag = false;
            this.clearCopyFlags();
            this.autoSaveService.clearUnsavedChanges();
            this.loadProposalById(success.proposal.proposalId);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal copied successfully.');
        }));
    }

    withdrawProposal(event) {
        event.preventDefault();
        this.$subscriptions.push(this._proposalService.withdrawProposal({
            'userFullName': this._commonService.getCurrentUserDetail('fullName'),
            'updateUser': this._commonService.getCurrentUserDetail('userName'), 'proposalId': this.result.proposal.proposalId,
            'proposalStatusCode': this.result.proposal.statusCode
        }).subscribe((data: any) => {
            this.result.proposal.proposalStatus = data.proposal.proposalStatus;
            this.result.proposal.statusCode = data.proposal.statusCode;
            this._dataStore.updateStore(['proposal'], this.result);
            this.webSocket.releaseCurrentModuleLock('Proposal' + '#' + this.result.proposal.proposalId);
        }, err => {
            $('#warning-modal').modal('hide');
            (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Withdraw Proposal failed. Please try again.');
        },
        () => {
            $('#warning-modal').modal('hide');
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal withdrawn successfully.');
            this._proposalService.proposalMode = this.dataVisibilityObj.mode = 'view';
            this.updateBudgetEditMode();
            this.dataVisibilityObj.isAttachmentEditable = false;
            this.updateDataVisibilityObj();
        }));

    }

    checkSubmitProposalValidation() {
        if (this.dataVisibilityObj.dataChangeFlag ||
            (this._router.url.includes('budget') &&
            (this._budgetDataService.budgetDataChanged || this._budgetDataService.isBudgetOverviewChanged))) {
            this.dataVisibilityObj.isShowSaveBeforeExitWarning = true;
            $('#proposalSubmitWithoutSaveModal').modal('show');
            this.updateDataVisibilityObj();
        } else {
            this.closeWarningModal();
            if (!this.dataVisibilityObj.isBudgetPeriodDate && (this.result.proposal.proposalId != null)) {
                this.validateProposal();
            }
        }
    }

    continueToSubmit() {
        if (!this.dataVisibilityObj.isBudgetPeriodDate && (this.result.proposal.proposalId != null)) {
            this.validateProposal();
        }
    }

    convertDateFormatWithoutTimeStamp() {
        this.result.proposal.startDate = parseDateWithoutTimestamp(this.result.proposal.startDate);
        this.result.proposal.sponsorDeadlineDate = parseDateWithoutTimestamp(this.result.proposal.sponsorDeadlineDate);
        this.result.proposal.internalDeadLineDate = parseDateWithoutTimestamp(this.result.proposal.internalDeadLineDate);
        this.result.proposal.endDate = parseDateWithoutTimestamp(this.result.proposal.endDate);
    }

    submitProposal() {
        this.proposalDataBindObj.keywordWarningText = null;
        this.proposalDataBindObj.isGrantClosingDateError = false;
        this.result.proposal.updateTimeStamp = new Date().getTime();
        this.result.proposal.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.result.proposal.submitUser = this._commonService.getCurrentUserDetail('userName');
        this.result.proposal.submissionDate = new Date().getTime();
        this.convertDateFormatWithoutTimeStamp();
        this._commonService.isShowOverlay = true;
        this.$subscriptions.push(this._proposalService.submitProposal({
            'proposalId': this.result.proposal.proposalId, 'proposalStatusCode': this.result.proposal.statusCode,
            'moduleCode': 3, 'subModuleCode': 0, 'moduleItemKey': this.result.proposal.proposalId
        }).subscribe((data: any) => {
            this.setProposalStoreData(data);
            this.promptObject.body = data.body;
            this.promptObject.subject = data.subject;
            this._budgetDataService.isBudgetOverviewChanged = false;
            this._budgetDataService.budgetDataChanged = false;
            this.dataVisibilityObj.dataChangeFlag = false;
            this._proposalService.proposalDateChangeType = null;
            this._proposalService.$isShowDateWarning.next(false);
            this._proposalService.$isPeriodOverlapped.next(false);
            this.proposalDataBindObj.dateWarningList.clear();
            if ((this._commonService.isMapRouting || this._commonService.isEvaluationAndMapRouting)
                && data.workflow.workflowDetails.length) {
                this.dataVisibilityObj.currentTab = 'ROUTE_LOG';
                this._router.navigate(['/fibi/proposal/route-log'], { queryParams: { 'proposalId': data.proposal.proposalId } });
            } else {
                this.dataVisibilityObj.currentTab = 'PROPOSAL_REVIEW';
                this._router.navigate(['/fibi/proposal/summary'], { queryParams: { 'proposalId': data.proposal.proposalId } });
            }
            this.updateDataVisibilityObj();
        },
            err => {
                $('#warning-modal').modal('hide');
                if (err && err.status === 405) { 
                    $('#invalidActionModal').modal('show');
                } else if (err.error && err.error.errorMessage  === 'Deadlock') {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Submit Proposal failed. Please try again.');
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Transaction is not completed due to an error.
                    ${AWARD_ERR_MESSAGE}`);
                 }
                this._commonService.isShowOverlay = false;
            },
            () => {
                $('#warning-modal').modal('hide');
                this.warningMsgObj.submitConfirmation = null;
                this.dataVisibilityObj.isShowSubmitWarningModal = false;
                this.dataVisibilityObj.isAttachmentVersionOpen = [];
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal submitted successfully.');
                this._proposalService.proposalMode = this.dataVisibilityObj.mode = 'view';
                this.updateBudgetEditMode();
                if (this.result.notificationTypeId !== undefined && this.result.notificationTypeId != null) {
                    sessionStorage.setItem('promptObject', JSON.stringify(this.promptObject));
                    this._router.navigate(['/fibi/notification/promptnotification'],
                        {
                            queryParams: {
                                'notificationTypeId': this.result.notificationTypeId,
                                'sectionId': this.result.proposal.proposalId, 'section': '3'
                            }
                        });
                }
                this.autoSaveService.clearUnsavedChanges();
                this.showMergeModal();
                this.updateDataVisibilityObj();
                this.webSocket.releaseCurrentModuleLock('Proposal' + '#' + this.result.proposal.proposalId);
            }));
    }

    setProposalPrintData() {
        this.exportproposal.proposalId = this.result.proposal.proposalId;
        this.$subscriptions.push(this._budgetService.loadBudgetByProposalId({
            'proposalId': this.result.proposal.proposalId,
        }).subscribe((data: any) => {
            this.budgetData = data;
            if (this.budgetData) {
                this.exportproposal.isSimpleBudgetPrint = this.budgetData.isSimpleBudgetEnabled ? 'Y' : 'N';
                this.exportproposal.isDetailedBudgetPrint = this.budgetData.isDetailedBudgetEnabled ? 'Y' : 'N';
                this.exportproposal.isPersonnelBudgetPrint = this.budgetData.isDetailedBudgetEnabled ? 'Y' : 'N';
                this.exportproposal.isBudgetSummaryPrint = this.budgetData.isBudgetSummaryEnabled ? 'Y' : 'N';
            }
        }));
    }

    selectedTemplates(isChecked: any, template: any) {
        if (isChecked) {
            this.currentTemplateArr.push(template);
        } else {
            const INDEX = this.currentTemplateArr.findIndex(element => element.letterTemplateTypeCode === template.letterTemplateTypeCode);
            this.currentTemplateArr.splice(INDEX, 1);
        }
    }

    initiateDownload() {
        if (this.currentTemplateArr.length !== 0) {
            this.printProposalAsZipOrDocxOrPdf(this.currentTemplateArr.length === 1 ? this.currentTemplateArr[0].printFileType : 'zip');
            $('#printProposalModal').modal('hide');
        } else {
            this.validationMap.set('selectTemplate', 'Please select atleast one template');
        }
    }

    printProposalAsZipOrDocxOrPdf(fileType: string) {
        if (!this.isDownloading) {
            this.isDownloading = true;
            this.$subscriptions.push(this._proposalService
                .printProposal({
                    'proposalId': this.result.proposal.proposalId,
                    'personId': this._commonService.getCurrentUserDetail('personID'),
                    'userName': this._commonService.getCurrentUserDetail('userName'),
                    'letterTemplateTypeCodes': this.setTypeCodeArray(),
                    'questionnaireMode': 'ANSWERED'
                }).subscribe(
                    data => {
                        this.closePrintModal();
                        this.parsePrintedPage(data, fileType);
                        this.currentTemplateArr = [];
                        this.isDownloading = false;
                    }, (err) => {
                        this.closePrintModal();
                        setTimeout(() => {
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Print Proposal failed. Please try again.');
                        }, 500);
                        this.isDownloading = false;
                    }
                ));
        }
    }

    setTypeCodeArray() {
        return this.currentTemplateArr.map(template => template.letterTemplateTypeCode);
    }

    exportProposal() {
        this.setProposalPrintData();
        const REQUEST_OBJECT = {
            proposalId: this.result.proposal.proposalId,
            questionnaireMode: 'ANSWERED'
        };
        this.$subscriptions.push(this._proposalService.printEntireProposal(REQUEST_OBJECT)
            .subscribe(
                data => {
                    this.parsePrintedPage(data, 'zip');
                }));
    }

    parsePrintedPage(data, fileType: string) {
        const person_name = this.result.proposal.investigator ? this.result.proposal.investigator.fullName : null;
        const fileName = 'Proposal_' + this.result.proposal.proposalId + '_' + person_name;
        fileDownloader(data, fileName, fileType);
    }

    getprintTemplates() {
        if (!this.printTemplates) {
            this.$subscriptions.push(this._proposalService.getLetterTemplates().subscribe(
                (res: any) => {
                    this.printTemplates = res.data;
                    $('#printProposalModal').modal('show');
                }
            ));
        } else {
            $('#printProposalModal').modal('show');
        }
    }

    downloadAttachments(event, selectedFileName, selectedAttachArray: any[], downloadType) {
        event.preventDefault();
        const attachment = selectedAttachArray.find(attachmentDetail => attachmentDetail.fileName === selectedFileName);
        if (attachment != null) {
            if (downloadType === 'ROUTE-LOG') {
                this.$subscriptions.push(this._proposalService.downloadRoutelogAttachment(attachment.attachmentId).subscribe(
                    data => {
                        fileDownloader(data, attachment.fileName);
                    }));
            }
        }
    }

    fileDrop(files) {
        this.warningMsgObj.attachmentWarningMsg = null;
        let dupCount = 0;
        for (let index = 0; index < files.length; index++) {
            if (this.uploadedFile.find(dupFile => dupFile.name === files[index].name) != null) {
                dupCount = dupCount + 1;
                this.warningMsgObj.attachmentWarningMsg = '* ' + dupCount + ' File(s) already added';
            } else {
                this.uploadedFile.push(files[index]);
            }
        }
    }

    deleteFromUploadedFileList(index) {
        this.uploadedFile.splice(index, 1);
        this.warningMsgObj.attachmentWarningMsg = null;
    }
    /* approve proposal */
    approveProposal() {
        this.proposalDataBindObj.modalAproveHeading = COMMON_APPROVE_LABEL;
        this.requestObject = {};
        this.isEmptyCommentArea = false;
        this.requestObject.actionType = 'A';
        // Base code
        this.showApproveDisapproveModal.isReadyToApprove = true;
        $('#approveDisapproveModal').modal('show');
        // KKI Specific Change Don't Delete
        // this.checkSuperUserIsFinalApprover();
        // this.showApproveDisapproveModal.isReadyToApprove = false;
        // this.showApproveDisapproveModal.isAttachmentIncomplete = false;
        // if ((this.result.finalApprover && this.result.isApproved === false) ||
        //   (this.superUser && this.showApproveDisapproveModal.isLastApproval)) {
        //   const attachments = this.result.proposalAttachments.find(attachment =>
        //     attachment.narrativeStatus.code === 'I' && attachment.documentStatusCode === 1);
        //   this.showApproveDisapproveModal.isAttachmentIncomplete = (attachments != null) ? true : false;
        //   if (!this.showApproveDisapproveModal.isAttachmentIncomplete) {
        //     this.showApproveDisapproveModal.isReadyToApprove = true;
        //   }
        //   $('#approveDisapproveModal').modal('show');
        // } else {
        //   this.showApproveDisapproveModal.isReadyToApprove = true;
        //   $('#approveDisapproveModal').modal('show');
        // }
    }
    /* checking whether superuser is final approver or not */
    checkSuperUserIsFinalApprover() {
        let lastStop: any;
        lastStop = this.result.workflow.workflowDetailMap[Object
            .keys(this.result.workflow.workflowDetailMap)[Object.keys(this.result.workflow.workflowDetailMap).length - 1]];
        this.showApproveDisapproveModal.isLastApproval = lastStop.filter(stop => stop.approvalStatusCode === 'W').length > 0 ? true : false;
    }

    /* disapprove proposal */
    disapproveProposal() {
        this.showApproveDisapproveModal.isReadyToApprove = true;
        this.requestObject = {};
        this.isEmptyCommentArea = false;
        this.proposalDataBindObj.modalAproveHeading = 'Return';
        this.requestObject.actionType = 'R';
    }

    /* Reassigning requiered proposal details */
    setProposalStoreData(data) {
        this.setBaseProposalTitle(data);
        this.result.proposal = data.proposal;
        this.result.workflow = data.workflow;
        this.result.workflowList = data.workflowList;
        this.result.canApproveRouting = data.canApproveRouting;
        this.result.isPersonCanScore = data.isPersonCanScore;
        this.result.notificationTypeId = data.notificationTypeId;
        // this.result.availableRights = data.availableRights;
        this.result.proposalRoles = data.proposalRoles;
        this.result.isBudgetHeaderFound = data.isBudgetHeaderFound;
        this.dataVisibilityObj.isBudgetHeaderFound = data.isBudgetHeaderFound;
        this.result.ipGenerationOnly = data.ipGenerationOnly;
        this.result = JSON.parse(JSON.stringify(this.result));
        this.dataVisibilityObj = JSON.parse(JSON.stringify(this.dataVisibilityObj));
        this.isShowCommentButton();
        this._dataStore.updateStore(['proposal', 'workflow', 'workflowList', 'canApproveRouting',
            'isPersonCanScore', 'notificationTypeId', 'proposalRoles', 'isBudgetHeaderFound', 'ipGenerationOnly'], this.result);
    }

    setBaseProposalTitle(data: any): void {
        this.result.proposal.baseProposalTitle = data.proposal.baseProposalTitle ?
            data.proposal.baseProposalTitle : this.result.proposal.baseProposalTitle;
    }

    /* approves or disapproves proposal */
    approveDisapproveProposal(type) {
        this.requestObject.actionType = type;
        this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
        this.requestObject.workFlowPersonId = this._commonService.getCurrentUserDetail('personID');
        this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.requestObject.proposalId = this.result.proposal.proposalId;
        this.requestObject.isSuperUser = this.superUser;
        const approveFormData = new FormData();

        for (let i = 0; i < this.uploadedFile.length; i++) {
            approveFormData.append('files', this.uploadedFile[i], this.uploadedFile[i].name);
        }
        approveFormData.append('formDataJson', JSON.stringify(this.requestObject));
        approveFormData.append('moduleCode', '3');
        approveFormData.append('subModuleCode', '0');
        this.validateReturnRequest();
        if (!this.isEmptyCommentArea && !this.isSaving) {
            this.isSaving = true;
            this._commonService.isShowOverlay = true;
            this.$subscriptions.push(this._proposalService.approveDisapproveProposal(approveFormData).subscribe(async (data: any) => {
                const isModuleLocked = await this.webSocket.isModuleLocked('Proposal', this.result.proposalId);
                this.setProposalStoreData(data);
                this._dataStore.updateStore(['availableRights'], data);
                this.initialiseProposalFormElements();
                this.isSaving = false;
                this._commonService.isShowOverlay = false;
                this.updateBudgetEditMode();
            },
                err => {
                    $('#approveDisapproveModal').modal('hide');
                    this.closeApproveDisapproveModal();
                    if (err && err.status === 405) {
                      $('#invalidActionModal').modal('show');
                    }
                    // tslint:disable-next-line:max-line-length
                    else if (err.error && err.error.errorMessage  === 'Deadlock') {
                        this._commonService.showToast(HTTP_ERROR_STATUS, `Proposal ${COMMON_APPROVE_LABEL.toLowerCase()} failed. Please try again.`);
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, `Transaction is not completed due to an error.
                        ${AWARD_ERR_MESSAGE}`);
                    }
                    this.isSaving = false;
                    this._commonService.isShowOverlay = false;
                },
                () => {
                    this.dataVisibilityObj.isAttachmentVersionOpen = [];
                    $('#approveDisapproveModal').modal('hide');
                    if (this.requestObject.actionType === 'A') {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, `Proposal ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`);
                    } else if (this.requestObject.actionType === 'R') {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal returned successfully.');
                    }
                    this.closeApproveDisapproveModal();
                    this.isSaving = false;
                    this.showMergeModal();
                    this.updateDataVisibilityObj();
                }));
        }
    }
    /**
     * to make commetns mandatory for returning in the routelog
     */
    validateReturnRequest() {
        this.isEmptyCommentArea = this.requestObject.actionType === 'R' && !this.requestObject.approveComment;
    }

    /* closes approve-disapprove modal */
    closeApproveDisapproveModal() {
        $('#approveDisapproveModal').modal('hide');
        this.proposalDataBindObj.modalAproveHeading = null;
        this.requestObject = {};
        this.uploadedFile = [];
        this.showApproveDisapproveModal.isReadyToApprove = false;
        this.showApproveDisapproveModal.isAttachmentIncomplete = false;
    }

    notifyAttachmentIncomplete() {
        this.$subscriptions.push(this._proposalService.sendPIAttachmentNotification({
            'userFullName': this._commonService.getCurrentUserDetail('fullName'),
            'updateUser': this._commonService.getCurrentUserDetail('userName'), 'proposalId': this.result.proposal.proposalId
        }).subscribe(data => { },
            err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Sending notification failed. Please try again.'); },
            () => { this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification sent successfully.'); }));
    }

    notifyApprover() {
        this.$subscriptions.push(
            this._proposalService.sendDocCompleteApproverNotification({ 'proposalId': this.result.proposal.proposalId })
                .subscribe((data: any) => {
                    if (data === 'SUCCESS') {
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Notification sent successfully.');
                    }
                }, err => {
                    $('#warning-modal').modal('hide');
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Notify approver failed. Please try again.');
                },
                    () => {
                        this.dataVisibilityObj.isShowNotifyApprover = false;
                        $('#warning-modal').modal('hide');
                    }));
    }

    showToast() {
        this.rate_toast_message = 'Rates updated successfully.';
        this._commonService.showToast(HTTP_SUCCESS_STATUS, this.rate_toast_message);
    }

    validateProposal() {
        this.proposalDataBindObj.keywordWarningText = null;
        this.proposalDataBindObj.isGrantClosingDateError = false;
        this.validationMsg = [];
        this.errorList = [];
        this.warningList = [];
        this.triggerManualLoader(true);
        if (!this.isSaving) {
            this.isSaving = true;
            this.validationObject.moduleItemKey = this.result.proposal.proposalId;
            this.$subscriptions.push(forkJoin(this._commonService.evaluateValidation(this.validationObject),
                this.validateQuestionnaire()).subscribe(async (data: any) => {
                    if (data[0].length) {
                        data[0].forEach(validationMsg => this.validationMsg.push(validationMsg));
                    }
                    this.setValidationMsgArray();
                    this.isSaving = false;
                }, err => {
                    this.isSaving = false;
                    this.triggerManualLoader(false);
                 }));
        }
    }

    validateQuestionnaire(): Promise<any> {
        return new Promise((resolve, reject) => {
            const list = [];
            const errorObject: any = { validationType: 'VE', validationMessage: '' };
            this.setQuestionnaireRequestObject(list);
            this.$subscriptions.push(
                forkJoin(...list).subscribe(data => {
                    this.questionnaireList = [];
                    data.forEach((d: any) => this.combineQuestionnaireList(d.applicableQuestionnaire));
                    const UnAnsweredQuestionnaireList = [];
                    if (this.questionnaireList && this.questionnaireList.length) {
                        this.questionnaireList.forEach(element => {
                            if (element.IS_MANDATORY === 'Y' && element.QUESTIONNAIRE_COMPLETED_FLAG !== 'Y') {
                                UnAnsweredQuestionnaireList.push(element.QUESTIONNAIRE_LABEL || element.QUESTIONNAIRE);
                            }
                        });
                        if (UnAnsweredQuestionnaireList.length) {
                            errorObject.validationMessage =
                                'Please complete the following mandatory Questionnaire(s) in the "Questionnaire" section.'
                                + this.getUnAnsweredList(UnAnsweredQuestionnaireList);
                            this.validationMsg.push(errorObject);
                        }
                    }
                    resolve(true);
                }, error => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Evaluating Proposal failed. Please try again.');
                    reject();
                }));
        });
    }

    combineQuestionnaireList(newList): void {
        this.questionnaireList = [...this.questionnaireList, ...newList];
    }


    setQuestionnaireRequestObject(list): void {
        const requestObject: any = {};
        requestObject.moduleItemCode = 3;
        requestObject.moduleSubItemCode = 0;
        requestObject.moduleItemKey = this.result.proposal.proposalId;
        requestObject.moduleSubItemKey = '';
        requestObject.actionPersonName = this._commonService.getCurrentUserDetail('userName');
        requestObject.actionUserId = this._commonService.getCurrentUserDetail('personID');
        requestObject.questionnaireMode = 'ACTIVE_ANSWERED_UNANSWERED';
        list.push(this.getApplicableQuestionnaire(requestObject));
    }

    getApplicableQuestionnaire(requestObject): any {
        requestObject = JSON.parse(JSON.stringify(requestObject));
        return this._questionnaireListService.getApplicableQuestionnaire(requestObject);
    }

    getUnAnsweredList(list): string {
        let modifiedQuestionList = '<ol>';
        list.forEach(element => { modifiedQuestionList += `<li> ${element} </li>`; });
        return modifiedQuestionList + '</ol>';
    }
    /**setValidationMsgArray - sets questionnaire complete message, PI not present message and other messages from business rule
    * @param questionnaireComplete
    */
    setValidationMsgArray() {
        if (this.result.proposal.investigator == null) {
            const element = { validationType: 'VE', validationMessage: 'Please provide a Principal Investigator in Key Personnel.' };
            this.validationMsg.push(element);
        }
        if (this.validationMsg.length) {
            this.validationMsg.forEach(element => {
                (element.validationType === 'VW') ? this.warningList.push(element) : this.errorList.push(element);
            });
            $('#ValidateModal').modal('show');
            this.triggerManualLoader(false);
        } else if (this.validationMsg.length === 0) {
            if (this.proposalMode === 'VALIDATE') {
                $('#ValidateModal').modal('show');
                this.triggerManualLoader(false);
            } else if (this.proposalMode === 'SUBMIT') {
                this.showSubmitConfirmation();
            } else if (this.proposalMode === 'ADMIN_CORRECTION') {
                if (this.dataVisibilityObj.dataChangeFlag ||
                    (this._router.url.includes('budget') &&
                        (this._budgetDataService.budgetDataChanged || this._budgetDataService.isBudgetOverviewChanged))) {
                    this.completeAdminCorrectionForProposal();
                } else {
                    this.triggerManualLoader(false);
                    $('#AdminCorrectionSubmitConfirmModal').modal('show');
                }
            }
        }
    }

    /** Proposal cannot be submitted if Grant Call Closing date has passed or Grant Call status is closed(grantStatusCode = 3), PROVIDED
     * Proposal Status is Pending Revisions By PI(GA)(statusCode = 20), Pending Revisions by PI (HOD)(statusCode = 22), Pending Revisions
     * By PI(GM)(statusCode = 24), Returned (statusCode = 3) (since proposal will be reviewed only once Grant Call closed)
    */
    showSubmitConfirmation() {
        this.submitModalName = '';
        if ((!this.result.enableClosedGrantCallLinkingInProposal) && (this.result.grantCall &&
            (compareDates(this.result.grantCall.closingDate, getCurrentTimeStamp(), 'dateObject', 'timeStamp') === -1 ||
                this.result.grantCall.grantStatusCode === 3)) && (this.result.proposal.statusCode !== 20 &&
                    this.result.proposal.statusCode !== 22 &&
                    this.result.proposal.statusCode !== 24 && this.result.proposal.statusCode !== 3)) {
            this.dataVisibilityObj.isShowSubmitWarningModal = true;
            this.warningMsgObj.submitWarningMsg = 'Proposal cannot be submitted since the Grant Call closed.';
            this.submitModalName = 'Submit Proposal';
            this.updateDataVisibilityObj();
            this.triggerManualLoader(false);
            $('#warning-modal').modal('show');
        } else if (!this.dataVisibilityObj.dataChangeFlag && ['SUBMIT', 'VALIDATE'].includes(this.proposalMode)) {
            this.$subscriptions.push(this._budgetService.loadBudgetByProposalId({
                'proposalId': this.result.proposal.proposalId,
            }).subscribe((data: any) => {
                this.budgetData = data ? data : null;
                this.dataVisibilityObj.isShowSubmitWarningModal = true;
                // tslint:disable: triple-equals
                // tslint:disable:max-line-length
                this.warningMsgObj.submitConfirmation = (this.budgetData.budgetHeader && !this.budgetData.isBudgetVersionEnabled && this.budgetData.budgetHeader.budgetStatusCode != '3') ?
                    'The Budget Status is In Progress. Do you want to make it Complete & proceed with submission?' : 'Do you want to Submit this proposal?';
                this.updateDataVisibilityObj();
                this.triggerManualLoader(false);
                this.submitModalName = 'Confirmation';
                $('#warning-modal').modal('show');
            }));
        } else {
            if (this.proposalMode == 'SUBMIT') {
                this.submitProposal();
            } else if (this.proposalMode == 'ADMIN_CORRECTION') {
                this.completeAdminCorrectionForProposal();
            }
        }
    }

    stopValue(index, k) {
        if (this.tempMapIndex !== k) { this.tempIndex = -1; }
        if (this.tempIndex !== index) {
            this.tempIndex = index;
            this.tempMapIndex = k;
            this.value = 'Stop' + (parseInt(index, 10) + 1);
            return this.value;
        } else {
            this.tempIndex = index;
            this.tempMapIndex = k;
            this.value = null;
        }
    }

    openRatesModal(event) {
        event.preventDefault();
        $('#show-rates-modal-proposal').modal('show');
        this.isShowMoreOptions = !this.isShowMoreOptions;
    }

    /*if no budget versions are in proposal,modal appears for creating budget or not,otherwise loads buget page */
    canCreateBudgetOrNot(currentTab, budgetVersion) {
        this.currentTab = currentTab;
        this.budgetVersion = budgetVersion;
        // this.loadBudget(null);
        /* if (!this.dataVisibilityObj.isBudgetHeaderFound && this.dataVisibilityObj.isBudgetEdittable
            && (this.result.proposal.statusCode === 1 || this.result.proposal.statusCode === 3)) {
          $('#createBudgetModal').modal('show');
        } else {
          this.loadBudget(null);
        } */
    }

    canShowSave() {
        this.isShowSave = this.isEditModeAndRouteHasForms()
            || this.canShowSaveInEvaluation()
            || this.canShowSaveInBudget()
            || this.canShowSaveInCertificationTab();
    }

    private isEditModeAndRouteHasForms(): boolean {
        return this.dataVisibilityObj.mode === 'edit' && ['overview', 'other-information', 'questionnaire',
            'evaluation/evaluate', 'certification'].some(tabName => this._router.url.includes(tabName));
    }

    canShowSaveInEvaluation() {
        const proposal = this.result.proposal;
        return this._router.url.includes('review/evaluation') && this.dataVisibilityObj.mode === 'view' &&
            (proposal && ![1, 2, 3, 9].includes(proposal.statusCode)) &&
            (this._commonService.isEvaluation || this._commonService.isEvaluationAndMapRouting) &&
            (this.result.hasRank || this.result.hasRecommendation || this.isEvaluationFormEditable());
    }

    isEvaluationFormEditable() {
        return this.dataVisibilityObj.isEvaluationFormEdittable.some(ele => ele.reviewId);
    }

    canShowSaveInBudget() {
        return this._router.url.includes('budget') && !this._budgetDataService.isBudgetViewMode
            && this.dataVisibilityObj.isBudgetHeaderFound;
    }

    canShowSaveInCertificationTab() {
        return this._router.url.includes('certification') && this.result.proposal && [3, 1, 9, 12].includes(this.result.proposal.statusCode);
    }

    setProposalMode() {
        if (this._route.snapshot.queryParamMap.get('proposalId') == null) {
            this.dataVisibilityObj.mode = 'create';
        } else {
            if (this.result.proposal.statusCode === 1 || this.result.proposal.statusCode === 9 ||
                this.result.proposal.statusCode === 12 || this.result.proposal.proposalStatus.statusCode === 22 ||
                this.result.proposal.proposalStatus.statusCode === 3 || this.result.proposal.proposalStatus.statusCode === 20 ||
                this.result.proposal.proposalStatus.statusCode === 24 || this.requestObject.actionType === 'R') {
                this.dataVisibilityObj.mode = (this.departmentLevelRightsForProposal.isModifyProposal) ? 'edit' : 'view';
            } else {
                this.dataVisibilityObj.mode = 'view';
            }
            if (this.result.proposal.documentStatusCode === '3') {
                this.dataVisibilityObj.mode = 'view';
            }
            if (this.result.proposal.documentStatusCode === '2' && this.departmentLevelRightsForProposal.isCreateAdminCorrection) {
                this.dataVisibilityObj.mode = 'edit';
            }
            this.checkLockBasedProposalMode();
        }
        this.dataVisibilityObj = JSON.parse(JSON.stringify(this.dataVisibilityObj));
        this.updateDataVisibilityObj();
        this._proposalService.proposalMode = this.dataVisibilityObj.mode;
    }

    async getSystemLevelPermissions() {
        this.isCreateProposal = await this._commonService.checkPermissionAllowed('CREATE_PROPOSAL');
        this.hasModifyProposalRight = this.result.availableRights.includes('MODIFY_PROPOSAL');
    }

    setProposalStatusInActive() {
        this.$subscriptions.push(this._proposalService.setProposalStatusInActive({
            'proposalId': this.result.proposal.proposalId,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'proposalStatusCode': this.result.proposal.statusCode
        }).subscribe((data: any) => {
            if (data) {
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal deactivated.');
                if (this.dataVisibilityObj.currentTab === 'ROUTE_LOG') {
                    this.dataVisibilityObj.currentTab = 'PROPOSAL_REVIEW';
                }
                this.dataVisibilityObj.mode = 'view';
                this.updateDataVisibilityObj();
                this.setProposalStoreData(data);
            }
        }, err => {
            $('#warning-modal').modal('hide');
            (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Deactivate Proposal failed. Please try again.');
        },
            () => {
                this.dataVisibilityObj.isShowNotifyApprover = false;
                $('#warning-modal').modal('hide');
            }));
    }

    /** setModuleDetails - sets module details to be passed to pre-routing */
    setModuleDetails() {
        this.moduleDetails.preReviewTypes = this.result.preReviewTypes;
        this.moduleDetails.preReviewRoutingReview = this.result.preReviewRoutingReview;
    }

    endorseProposal() {
        // tslint:disable:triple-equals
        if (this.result.canApproveRouting === '1' && this.result.proposal.statusCode == 2) {
            this.approveProposal();
        } else if (this.result.canApproveRouting === '1' && this.result.proposal.statusCode == 8) {
            $('#addEvaluationScoringModal').modal('show');
        }
    }

    setProposalDetails(event) {
        this._dataStore.manualDataUpdate(event);
    }

    /**
    * for checking the whether to show comments button and check whether the
    * commment is in view mode (view priate comment and add new comment)
    * the comment button is shown only for GM and Main panel member (in two stage evaluation)
    * and proposal with status 11 - Awarded, 29 - Unsuccessful, 38 - Completed, 40 - Shortlisted
    * That is any stage after evaluation is complete (that's where main panel member can see the proposal)
    * Main panel member has MAINTAIN_PRIVATE_COMMENTS right and GM is one with '100' roletype in proposalRoles.
    * isCommentEditMode is used to show private comments and permission to add new commnets.
    * This was given for GM and Main panel member only.
    * Every one can view the Comments Tab after propoal is initially saved. (only public comments)
    */
    isShowCommentButton() {
        let isViewPrivate = false;
        let isLoginIsGM;
        if (this.result.availableRights !== null && this.result.availableRights.length > 0) {
            isViewPrivate = this.result.availableRights.includes('MAINTAIN_PRIVATE_COMMENTS');
            isLoginIsGM = this.result.availableRights.includes('START_EVALUATION');
        }
        this.isShowCommentsTab = ([11, 29, 38, 40].includes(this.result.proposal.statusCode) &&
            ((isLoginIsGM != null && isLoginIsGM !== undefined) || isViewPrivate)) ? true : false;
        this.isCommentEditMode = ((isLoginIsGM != null && isLoginIsGM !== undefined) || isViewPrivate) ? true : false;
    }

    /**
   * @param  {} event
   *  updating isShowNotificationModal flag after sending award notification
   */
    showProposalNotificationModal(event) {
        this.isShowNotificationModal = event;
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll() {
        const HEIGHT = document.getElementById('stickyProposalHeader').offsetHeight;
        const HEADER = document.getElementById('stickyProposalHeader');
        if (window.pageYOffset > HEIGHT && this._commonService.isIE) {
            HEADER.classList.add('tab-sticky');
        } else {
            HEADER.classList.remove('tab-sticky');
        }
    }

    recallFilesDrop(files) {
        let dupFile = null;
        for (let index = 0; index < files.length; index++) {
            dupFile = this.uploadedFiles.find(file => file.name === files[index].name);
            if (dupFile != null) {
                this.warningMsgObj.attachment = '* ' + dupFile.name + ' already added';
            } else {
                this.uploadedFiles.push(files[index]);
            }
        }
    }
    recallProposal(result) {
        this.isButtonDisabled = true;
        if (!this.isSaving) {
            this.isSaving = true;
            if (!this._commonService.isWafEnabled) {
                this.$subscriptions.push(this._proposalService.recallProposal(
                    { ...this.recallProposalObject, ...this.setRecallProposalObject(result.proposal.proposalId) },
                    this.uploadedFiles).subscribe(async (data: any) => {
                        await this.webSocket.isModuleLocked('Proposal', this.result.proposalId);
                        this.setProposalStoreData(data);
                        this.initialiseProposalFormElements();
                        $('#recallProposalModal').modal('hide');
                        this.updateBudgetEditMode();
                        this.isSaving = false;
                    },
                    err => {
                            $('#recallProposalModal').modal('hide');
                        (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Withdraw Proposal failed. Please try again.');
                            this.isSaving = false;
                        }));
            }
        }
    }

    private updateBudgetEditMode() {
        if (this._router.url.includes('budget')) {
            this._budgetDataService.setBudgetEditMode(this.dataVisibilityObj.mode, this.result.proposal.statusCode);
            this.updateDataVisibilityObj();
            this._budgetDataService.updateBudgetOnProposalStatusChange(true);
        }
    }

    deleteProposal() {
        this.$subscriptions.push(this._proposalService.deleteProposal({
            'proposalId': this.result.proposal.proposalId
        }).subscribe((success: any) => {
            if (success.message === 'Proposal deleted successfully') {
                this._router.navigate(['fibi/dashboard/proposalList']);
                this._commonService.showToast(HTTP_SUCCESS_STATUS , success.message);
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'You don\'t have the right to delete this Proposal.');
            }
        }, err => {
            $('#deleteProposalModal').modal('hide');
            (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
                this._commonService.showToast(HTTP_ERROR_STATUS, 'You don\'t have the right to delete this Proposal.');
        }));
    }

    setRecallProposalObject(proposalId) {
        return {
            'proposalId': proposalId,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'actionType': 'C',
            'personId': this._commonService.getCurrentUserDetail('personID'),
            'workFlowPersonId': this._commonService.getCurrentUserDetail('personID'),
            'proposalStatusCode': this.result.proposal.statusCode
        };
    }

    dataChangeEvent(event) {
        this.dataVisibilityObj.dataChangeFlag = event;
        this.updateDataVisibilityObj();
    }

    showImportTemplateModal() {
        $('#confirmImportModal').modal('hide');
        $('#propImportModal').modal('show');
    }

    uploadTemplate() {
        if (this.importedFile.length) {
            $('#propImportModal').modal('hide');
            this.$subscriptions.push(
                this._proposalService.addImportedAttachment(this.result.proposal.proposalId, this.importedFile)
                    .subscribe((data: any) => {
                        this.importedFile = [];
                        if (data) {
                            this._dataStore.manualDataUpdate(data);
                        }
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Template imported successfully.');
                    },
                        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Importing from Template failed. Please try again.'); }
                    ));
        } else {
            this.proposalDataBindObj.mandatoryList.set('noFileSelected', 'Please add an excel file template to import');
        }
    }

    addImportAttachment(file) {
        if (file && file.length) {
            this.importedFile = file;
            this.proposalDataBindObj.mandatoryList.delete('noFileSelected');
        }
    }

    clearCopyFlags() {
        this.copyAllBudgetVersion = false;
        this.copyFinalBudgetVersion = false;
        this.copyQuestionnaire = false;
        this.copyOtherInformation = false;
        this.copyAttachment = false;
        this._proposalService.$isShowDateWarning.next(false);
    }

    createAdminCorrectionForProposal() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._proposalService.createProposalAdminCorrection({
                'proposalId': this.result.proposal.proposalId,
                'proposalStatusCode': this.result.proposal.statusCode
            }).subscribe(async (success: any) => {
                    await this.webSocket.isModuleLocked('Proposal', this.result.proposalId);
                    this.isSaving = false;
                    this.result.proposal.documentStatusCode = '2';
                    this._dataStore.updateStore(['proposal'], this.result);
                    this.setProposalMode();
                    this.updateBudgetEditMode();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Admin Correction created successfully.');
            }, err => {
                this.isSaving = false;
                (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Admin Correction failed. Please try again.');
            }));
        }
    }

    checkAdminCorrectionValidation() {
        if (this.dataVisibilityObj.dataChangeFlag ||
            (this._router.url.includes('budget') &&
            (this._budgetDataService.budgetDataChanged || this._budgetDataService.isBudgetOverviewChanged))) {
            $('#proposalSubmitWithoutSaveModal').modal('show');
        } else {
            this.validateProposal();
        }
    }

    submitProposalOrAdminCorrection() {
        if (['SUBMIT', 'VALIDATE'].includes(this.proposalMode)) {
            this.continueToSubmit();
        } else {
            this.validateProposal();
        }
    }

    completeAdminCorrectionForProposal() {
        this.isSaving = false;
        if (!this.isSaving) {
            this.isSaving = true;
            this.triggerManualLoader(true);
            this.$subscriptions.push(this._proposalService.completeProposalAdminCorrection(this.result.proposal.proposalId).subscribe((data: any) => {
                    if (data.status === 200) {
                        this.isSaving = false;
                        this.setProposalStoreData(data.body);
                        this.dataVisibilityObj.dataChangeFlag = false;
                        this._budgetDataService.isBudgetOverviewChanged = false;
                        this._budgetDataService.budgetDataChanged = false;
                        this.setProposalMode();
                        this.triggerManualLoader(false);
                        this.proposalDataBindObj.dateWarningList.clear();
                        this.updateBudgetEditMode();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Admin Correction submitted successfully.');
                        this.webSocket.releaseCurrentModuleLock('Proposal' + '#' + this.result.proposal.proposalId);
                        this._proposalService.$isShowDateWarning.next(false);
                        this._proposalService.$isPeriodOverlapped.next(false);
                        if ((this._commonService.isMapRouting || this._commonService.isEvaluationAndMapRouting) && data.body.workflow.workflowDetails.length) {
                            this.dataVisibilityObj.currentTab = 'ROUTE_LOG';
                            this._router.navigate(['/fibi/proposal/route-log'], { queryParams: { 'proposalId': data.body.proposal.proposalId } });
                        } else {
                            this.dataVisibilityObj.currentTab = 'PROPOSAL_REVIEW';
                            this._router.navigate(['/fibi/proposal/summary'], { queryParams: { 'proposalId': data.body.proposal.proposalId } });
                        }
                        this.autoSaveService.clearUnsavedChanges();
                        this.updateDataVisibilityObj();
                    } else {
                        this.triggerManualLoader(false);
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Submit Admin Correction failed. Please try again.');
                        this.isSaving = false;
                    }
            }, err => {
                (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Complete Admin Correction failed. Please try again.');
            }));
        }
    }

    showMergeModal(): void {
        if (this.result && this.departmentLevelRightsForProposal.canCreateIP && this.result.proposal.proposalStatus.statusCode === 41) {
            this.result.ipGenerationOnly ? this.createIPConfirmation() : $('#mergeIPModal').modal('show');
        }
    }

    createIPConfirmation(): void {
        $('#CreateIPConfirmation').modal('show');
    }

    createIP(): void {
        this.$subscriptions.push(this._proposalService.createIP({ 'proposalId': this.result.proposal.proposalId })
            .subscribe((data: any) => {
                this.result.proposal = data.proposal;
                this.setProposalStoreData(this.result);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Institute Proposal created successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Institute Proposal failed. Please try again.');
            }
            ));
    }

    setDateValidationMessage() {
        this.$subscriptions.push(this._proposalService.$isShowDateWarning.subscribe((data: any) => {
            this.isShowDateValidation = data;
            this.dateValidationMessage = 'Budget Period dates are not aligned with Proposal start and end dates.';
        }));
    }

    checkLockBasedProposalMode(): void {
        const key = 'Proposal' + '#' + this.result.proposal.proposalId;
        if (this.dataVisibilityObj.mode === 'edit' && this.webSocket.isLockAvailable(key)) {
            this.getLockForProposal();
        } else if (this.dataVisibilityObj.mode === 'edit' && !this.webSocket.isLockAvailable(key)) {
            this.dataVisibilityObj.mode = 'view';
            this.getLockForProposal();
            this.webSocket.showModal(key);
        } else {
            this.dataVisibilityObj.mode = 'view';
        }
    }

    getLockForProposal() {
        this.webSocket.getLockForModule('Proposal', this.result.proposal.proposalId, this.result.proposal.title);
    }

    lockFailEvent(): void {
        this.$subscriptions.push(this.webSocket.lockFail$.subscribe(data => {
            this.getLockForProposal();
            this.dataVisibilityObj.mode = 'view';
        }));
    }

    /**
     * this initiates the save trigger on the autoSave service which in place
     * initiates the save on all child components who have subscribed into this event
     */
    initiateSaveInChildComponents() {
        this.autoSaveService.commonSaveTrigger$.next(true);
    }

    closePrintModal() {
        $('#printIPModal').modal('hide');
        this.isChecked = {};
    }

    triggerManualLoader(flag: boolean): void {
        this._commonService.isManualLoaderOn = flag;
        this._commonService.isShowLoader.next(flag);
    }

    showSupportModal() {
        const SUPPORT_BUTTON = document.getElementById('prop-support-req-btn');
        if (SUPPORT_BUTTON) {
                SUPPORT_BUTTON.click();
        } else {
            this.showRequestModal.isRequestSupport = true;
            setTimeout(() => {
                $('#app-generic-support-modal').modal('show');
            });
        }
    }
    reload() {
        window.location.reload();
    }

    cancelAdminCorrection() {
        this.$subscriptions.push(this._proposalService.cancelAdminCorrection({'proposalId': this.result.proposal.proposalId}).subscribe((data: any) => {
            this._commonService.showToast(HTTP_SUCCESS_STATUS,'Admin Correction cancelled successfully.');
            this.loadProposalById(data);
        }, err => {
            if (err && err.status === 405) {
                this.invalidActionMessage = err.error;
                $('#invalidProposalActionModal').modal('show');
            } else {
                this._commonService.showToast(HTTP_ERROR_STATUS,'Admin Correction Cancel Failed.');
            }
        }
        ))
        $('#cancelAdminCorrection').modal('hide');
    }
}

