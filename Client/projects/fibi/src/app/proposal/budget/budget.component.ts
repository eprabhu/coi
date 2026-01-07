/**
 * Budget Module is revamped by saranya T Pillai-14/10/2020
 * JIRA: https://polussoftwares.atlassian.net/browse/FIBI-1053
 * this.dataVisibilityObj.mode contains mode of proposal
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { BudgetService } from './budget.service';
import { CommonService } from '../../common/services/common.service';
import { BudgetDataService } from '../services/budget-data.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { PersonnelService } from './personnel/personnel.service';
import { ProposalService } from '../services/proposal.service';
import { fileDownloader, setHelpTextForSubItems } from '../../common/utilities/custom-utilities';
import {
    toggleErrorToast, setProposalDateChange, checkPeriodDatesOutside,
    checkDatesAreNotEqual, inputRestriction
} from './budget-validations';
import { WebSocketService } from '../../common/services/web-socket.service';
import { DataStoreService } from '../services/data-store.service';
import { AutoSaveService } from '../../common/services/auto-save.service';

declare var $: any;

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.css']
})

export class BudgetComponent implements OnInit, OnDestroy {

    proposalId: number = null;
    activityTypeCode: string = null;
    grantTypeCode: string = null;
    proposalStatusCode: number = null;
    proposalPI: string = null;
    dataVisibilityObj: any = {};
    departmentLevelRightsForProposal: any = this._proposalService.departmentLevelRightsForProposal;
    $subscriptions: Subscription[] = [];
    selectedRateClassType = '';
    budgetData: any = {};
    isbudgetDescription = true;
    isApplyRates = false;
    isCreateBudgetVersion = false;
    tempBudgetRates: any = [];
    inputRestriction = inputRestriction;
    helpText: any = {};
    isSaving = false;
    isShowPeriodsChangeModal = false;
    isBudgetIdRequired = false;
    dataDependencies = ['dataVisibilityObj', 'proposal'];

    constructor(
        public _budgetService: BudgetService,
        public _commonService: CommonService,
        public _budgetDataService: BudgetDataService,
        private _personnelService: PersonnelService,
        public _proposalService: ProposalService,
        private _websocket: WebSocketService,
        private _dataStore: DataStoreService,
        private _router: Router,
        public autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchHelpText();
        this.subscribeBudgetData();
        this.initiateBudgetPrint();
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData(this.dataDependencies);
        this.dataVisibilityObj = DATA.dataVisibilityObj;
        this.proposalId = DATA.proposal.proposalId;
        this.activityTypeCode = DATA.proposal.activityTypeCode;
        this.grantTypeCode = DATA.proposal.grantTypeCode;
        this.proposalStatusCode = DATA.proposal.statusCode;
        this.proposalPI =  DATA.proposal.investigator && DATA.proposal.investigator.fullName;
        this.initializeBudget();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

    /**
     * Get ghelp texts for Proposal section codes 302 - Budget
     */
    fetchHelpText() {
        this.$subscriptions.push(this._proposalService.fetchHelpText({
            'moduleCode': 3, 'sectionCodes': [302]
        }).subscribe((data: any) => {
            this.helpText = data;
            Object.keys(this.helpText).length ? (this.helpText.budget.parentHelpTexts.length ? this.setHelpTextForLineItems(this.helpText) :
                this._budgetDataService.$budgetHelpText.next(this.helpText)) : this._budgetDataService.$budgetHelpText.next(null);
        }));
    }

    /**
     * @param helpTextObj
     * This function is used to remove array of the list of line items that comes on response.
     * This is because to remove index and convert to objects
     * so that you can easily display the help text using [] notation as used in html.
     */
    setHelpTextForLineItems(helpTextObj: any = {}) {
        helpTextObj = setHelpTextForSubItems(helpTextObj, 'budget');
        this._budgetDataService.$budgetHelpText.next(helpTextObj);
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? data : {};
            if (data && this.budgetData.budgetHeader) {
                this._budgetDataService.setBudgetEditMode(this.dataVisibilityObj.mode, this.proposalStatusCode);
                this.getBudgetPerson();
            }
            if (this.budgetData.rateClassTypes) {
                this.selectedRateClassType = this.budgetData.rateClassTypes[0];
            }
        }));
    }

    initializeBudget() {
        this.setCreateBudgetVersionFlag();
        this._budgetDataService.activityTypeCode = this.activityTypeCode;
        this._budgetDataService.grantTypeCode = this.grantTypeCode;
        this._budgetDataService.departmentLevelRightsForProposal = this.departmentLevelRightsForProposal;
        if (!this.budgetData.isBudgetHeaderFound && this.dataVisibilityObj.isBudgetHeaderFound) {
            this.loadBudgetData();
        }
    }

    checkIfDateChanged(): void {
        const PERIODS_ARRAY = this.budgetData && this.budgetData.budgetHeader ? this.budgetData.budgetHeader.budgetPeriods : [];
        if ((checkPeriodDatesOutside(PERIODS_ARRAY, this._proposalService.proposalStartDate,
            this._proposalService.proposalEndDate) || this._proposalService.isDatesChanged)) {
            this.openModal(PERIODS_ARRAY);
        } else {
            this.showErrorToast();
        }
    }

    openModal(PERIODS_ARRAY): void {
        if (checkDatesAreNotEqual(this._proposalService, this.budgetData.budgetHeader.startDate, this.budgetData.budgetHeader.endDate)) {
            this.isShowPeriodsChangeModal = true;
            this.isBudgetIdRequired = false;
            if (!this._proposalService.proposalDateChangeType) {
                const DATE_OBJECT: any = {
                    'proposalStartDate': this._proposalService.proposalStartDate,
                    'proposalEndDate': this._proposalService.proposalEndDate,
                    'budgetStartDate': PERIODS_ARRAY ? PERIODS_ARRAY[0].startDate : null,
                    'budgetEndDate': PERIODS_ARRAY ? PERIODS_ARRAY[PERIODS_ARRAY.length - 1].endDate : null
                };
                setProposalDateChange(DATE_OBJECT, this._proposalService);
            }
        } else {
            this.showErrorToast();
        }
    }


    /**
     * since the validations triggering function and showErrorToast are called inside
     * onInit, validations will be triggered before executing showErrorToast, so it is given
     * in timeout.
     */
    showErrorToast(): void {
        setTimeout(() => {
            toggleErrorToast(this.budgetData, this._proposalService);
        });
    }

    /**
     * Proposal Status Code: 1-In Progress,  9-Revision Requested,
     * 22-ORT Director Review Completed, 20,24 - Pending Revision By PIs
     */
    setCreateBudgetVersionFlag() {
        this.isCreateBudgetVersion =
            (this.dataVisibilityObj.mode !== 'view' && this.departmentLevelRightsForProposal.isMaintainProposalBudget) ||
            (this.dataVisibilityObj.mode === 'view' && [1, 9, 20, 22, 24, 12].includes(this.proposalStatusCode) &&
                this.departmentLevelRightsForProposal.isMaintainProposalBudget);
        if (this.isCreateBudgetVersion) {
            this.isCreateBudgetVersion = this._websocket.isLockAvailable('Proposal' + '#' + this.proposalId);
        }
    }

    initiateBudgetPrint() {
        this.$subscriptions.push(this._budgetDataService.isProposalBudgetPrintTrigger.subscribe((data: any) => {
            if (data) {
                this.generateProposalBudgetReport();
            }
        }));
    }

    /**
     * why fetched person data here:
     * We have to use person list in personnel component and in personnel line item component.
     */
    getBudgetPerson() {
        this.$subscriptions.push(this._personnelService.getPersonsRequiredData(
            {
                'budgetId': this.budgetData.budgetHeader.budgetId,
                'proposalId': this.budgetData.proposalId
            }).subscribe((data: any) => {
                this._budgetDataService.setBudgetPersonData(data);
            }));
    }

    loadBudgetData() {
        this._proposalService.$isShowDateWarning.next(false);
        this.$subscriptions.push(this._budgetService.loadBudgetByProposalId({
            'proposalId': this.proposalId,
            'userName': this._commonService.getCurrentUserDetail('userName'),
            'userFullName': this._commonService.getCurrentUserDetail('fullName')
        }).subscribe((data: any) => {
            this.budgetData = data;
            this.setResponseData(data);
            this.dataVisibilityObj.isBudgetHeaderFound = data.isBudgetHeaderFound;
            this.updateDataVisibilityObj();
            if (this.budgetData.isPeriodTotalEnabled && this._proposalService.proposalSectionConfig['308'].isActive &&
                data.isBudgetHeaderFound &&
                (!this.budgetData.budgetHeader.isApprovedBudget && !this._budgetDataService.isBudgetViewMode)) {
                this.checkIfDateChanged();
            }
        }));
    }

    private updateDataVisibilityObj() {
        this._dataStore.updateStore(['dataVisibilityObj'], this);
    }

    createProposalBudget() {
        if (this.checkDescriptionExist()) {
            this.dataVisibilityObj.mode === 'view' && this._budgetDataService.isBudgetViewMode ?
                this.createApprovedBudgetVersion() : this.createBudgetVersion();
        }
    }

    createBudgetVersion() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._budgetService.createProposalBudget(this.createBudgetRequestObject())
                .subscribe((data: any) => {
                    this.budgetData = data;
                    this.budgetData.isDetailedBudgetEnabled = data.isDetailedBudgetEnabled;
                    this.dataVisibilityObj.isBudgetHeaderFound = data.isBudgetHeaderFound;
                    this.setResponseData(data);
                    this.updateDataVisibilityObj();
                    this.isSaving = false;
                    this.closeCreateModal();
                    this._proposalService.$isShowDateWarning.next(false);
                    this._proposalService.$isPeriodOverlapped.next(false);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Version created successfully.');
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Creating Budget Version failed. Please try again.');
                    this.isSaving = false;
                }));
        }
    }

    createApprovedBudgetVersion() {
        this.$subscriptions.push(this._budgetService.createApprovedProposalBudget({
            'proposalId': this.budgetData.proposalId,
            'budgetId': this.getFinalBudgetId(),
            'budgetDescription': this.budgetData.budgetDescription,
            'userName': this._commonService.getCurrentUserDetail('userName'),
            'userFullName': this._commonService.getCurrentUserDetail('fullName')
        }).subscribe((data: any) => {
            this.closeCreateModal();
            this.setResponseData(data);
            this._proposalService.$isShowDateWarning.next(false);
            this._proposalService.$isPeriodOverlapped.next(false);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Approved Budget created successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Creating approved Budget Version failed. Please try again.');
        }));
    }

    getFinalBudgetId() {
        const FINAL_BUDGET = this.dataVisibilityObj.isBudgetHeaderFound ?
            this.budgetData.budgetHeaderDetails.find(detail => detail.isFinalBudget === true) : null;
        return FINAL_BUDGET ? FINAL_BUDGET.budgetId : null;
    }

    /** to check whether description entered while creating a new budget version */
    checkDescriptionExist() {
        return this.isbudgetDescription = this.budgetData.budgetDescription ? true : false;
    }

    createBudgetRequestObject() {
        return {
            'proposalId': this.proposalId,
            'budgetDescription': this.budgetData.budgetDescription,
            'isFirstVersion': this.dataVisibilityObj.isBudgetHeaderFound ? false : true,
            'userName': this._commonService.getCurrentUserDetail('userName'),
            'userFullName': this._commonService.getCurrentUserDetail('fullName')
        };
    }

    closeCreateModal() {
        document.getElementById('create-budget-close-btn').click();
        this.isbudgetDescription = true;
        this.budgetData.budgetDescription = null;
    }

    setRateObject() {
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        return {
            budgetTabName: this._budgetDataService.BudgetTab,
            proposalId: this.proposalId,
            activityTypeCode: this.activityTypeCode,
            budgetHeader: this.budgetData.budgetHeader,
            grantTypeCode: this._budgetDataService.grantTypeCode
        };
    }

    applyRates() {
        this.$subscriptions.push(this._budgetService.applyRates(this.setRateObject()).subscribe((data: any) => {
            this.setResponseData(data);
            this.isApplyRates = false;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Rates applied successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Applying Budget Rates failed. Please try again.');
        }));
    }

    resetBudgetRates() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._budgetService.resetBudgetRates(this.setRateObject()).subscribe((data: any) => {
                this.setResponseData(data);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Rates reset successfully.');
                this.isSaving = false;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Reseting Budget Rates failed. Please try again.');
                this.isSaving = false;
            }));
        }
    }

    getSyncBudgetRates() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._budgetService.getSyncBudgetRates(this.setRateObject()).subscribe((data: any) => {
                this.budgetData.rateClassTypes = data.rateClassTypes;
                this.setResponseData(data);
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Rates synced successfully.');
                this.isSaving = false;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Syncing Budget Rates failed. Please try again.');
                this.isSaving = false;
            }));
        }
    }

    setResponseData(data) {
        this.budgetData.budgetHeader = data.budgetHeader;
        this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
        this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
        this._budgetDataService.setProposalBudgetData(this.budgetData);
    }

    clearRateParam() {
        this.selectedRateClassType = this.budgetData.rateClassTypes[0];
        if (this.isApplyRates) {
            this.budgetData.budgetHeader.proposalRates = this.tempBudgetRates;
            this.isApplyRates = false;
        }
        this.tempBudgetRates = [];
    }

    printBudgetSummaryAsExcel() {
        this._budgetService.generateBudgetSummaryExcelReport(this.budgetData.proposalId, this.budgetData.budgetHeader.budgetId)
            .subscribe(data => {
                const fileName = 'Proposal_Budget_Summary' + '_' + this.proposalId + '_' + this.proposalPI;
                fileDownloader(data, fileName, 'xlsx');
            });
    }

    /**Export Proposal Simple Budget as Excel */
    generateProposalSimpleBudgetReport() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._budgetService.generateProposalSimpleBudget
                (this.budgetData.budgetHeader.budgetId).subscribe((data: any) => {
                    const tempData: any = data || {};
                    const fileName = 'Simple_Budget_Proposal_' + this.proposalId + '_' + this.budgetData.budgetHeader.versionNumber;
                    fileDownloader(data, fileName, 'xlsx');
                    this.isSaving = false;
                }, err => { this.isSaving = false; }));
        }
    }

    /**Export Proposal Detailed Budget as Excel */
    generateProposalDetailedBudgetReport() {
        this.$subscriptions.push(this._budgetService.generateProposalDetailedBudget
            (this.budgetData.budgetHeader.budgetId).subscribe((data: any) => {
                const tempData: any = data || {};
                const fileName = 'Detailed_Budget_Proposal_' + this.proposalId + '_' + this.budgetData.budgetHeader.versionNumber;
                fileDownloader(data, fileName, 'xlsx');
            }));
    }

    /**Method to print Budget in PDF format based on section
    * @param section
    * @param isBudgetSummaryPrint
    * @param isDetailedBudgetPrint
    */
    printBudgetAsPdf(section, isBudgetSummaryPrint, isDetailedBudgetPrint, isSimpleBudgetPrint, isPersonnelBudgetPrint) {
        this._budgetService.printBudget(this.budgetData.proposalId, this.budgetData.budgetHeader.budgetId,
            isBudgetSummaryPrint, isDetailedBudgetPrint, isSimpleBudgetPrint, isPersonnelBudgetPrint)
            .subscribe(data => {
                const fileName = 'Proposal_' + section + '_' + this.proposalId + '_' + this.proposalPI;
                fileDownloader(data, fileName, 'pdf');
            });
    }

    generateProposalBudgetReport() {
        const isSimpleBudgetPrint = this.budgetData ? (this.budgetData.isSimpleBudgetEnabled ?
            'Y' : 'N') : null;
        const isDetailedBudgetPrint = this.budgetData ? (this.budgetData.isDetailedBudgetEnabled ?
            'Y' : 'N') : null;
        const isPersonnelBudgetPrint = this.budgetData ? (this.budgetData.isDetailedBudgetEnabled ?
            'Y' : 'N') : null;
        const isBudgetSummaryPrint = this.budgetData ? (this.budgetData.isBudgetSummaryEnabled ?
            'Y' : 'N') : null;
        this.$subscriptions.push(this._budgetService.printBudget(this.proposalId,
            this.budgetData.budgetHeader.budgetId, isBudgetSummaryPrint, isDetailedBudgetPrint, isSimpleBudgetPrint, isPersonnelBudgetPrint)
            .subscribe(data => {
                fileDownloader(data, 'Proposal_Budget_Summary_' + this.proposalId + '_' + this.proposalPI, 'pdf');
            }));
    }

    setTempBudgetRates() {
        if (!this.tempBudgetRates.length) {
            this.tempBudgetRates = JSON.parse(JSON.stringify(this.budgetData.budgetHeader.proposalRates));
        }
    }

    ngOnDestroy() {
        if (this.dataVisibilityObj.isBudgetHeaderFound && !this.budgetData.budgetHeader.isFinalBudget &&
            !this.budgetData.budgetHeader.isLatestVersion) {
            this._proposalService.$isShowDateWarning.next(false);
            this._proposalService.$isPeriodOverlapped.next(false);
        }
        this._budgetDataService.setProposalBudgetData(null);
        this._budgetDataService.setBudgetPersonData(null);
        this._budgetDataService.$budgetHelpText.next(null);
        subscriptionHandler(this.$subscriptions);
        this._budgetService.navigationUrl = '';
    }

    closeModal(event): void {
        if (event) {
            this.isShowPeriodsChangeModal = false;
            this.isBudgetIdRequired = false;
        }
    }

    setNavigationTab(link: string) {
        if (this._budgetDataService.budgetDataChanged) {
            this._budgetService.navigationUrl = link;
        }
    }

    discardChanges() {
        this._budgetDataService.budgetDataChanged = false;
        this._router.navigate([this._budgetService.navigationUrl], { queryParamsHandling: 'merge' });
        this._budgetService.navigationUrl = '';
    }

    getUnsavedChanges() {
        return this.autoSaveService.unSavedSections
            .filter((e: any) => e.documentId !== 'proposal-budget-overview')
            .map(section => section.name);
    }

}
