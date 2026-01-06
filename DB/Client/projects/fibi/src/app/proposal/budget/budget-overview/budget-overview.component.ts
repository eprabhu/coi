import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { BudgetService } from '../budget.service';
import { BudgetDataService } from '../../services/budget-data.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import {
    compareDates, compareDatesWithoutTimeZone, getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp
} from '../../../common/utilities/date-utilities';
import { ProposalService } from '../../services/proposal.service';
import {
    setProposalDateChange, checkPeriodDatesOutside, checkIfDatesOverlapped,
    toggleErrorToast, checkDatesAreNotEqual
} from '../budget-validations';
import { NavigationService } from '../../../common/services/navigation.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';


declare var $: any;

@Component({
    selector: 'app-budget-overview',
    templateUrl: './budget-overview.component.html',
    styleUrls: ['./budget-overview.component.css']
})

export class BudgetOverviewComponent implements OnInit, OnDestroy {

    @Input() helpText: any = {};
    isBudgetOverviewWidgetOpen = true;
    budgetData: any = {};
    $subscriptions: Subscription[] = [];
    isbudgetStatusComplete = false;
    tempBudgetTemplateId = null;
    campusFlagList: any = [
        { value: 'N', description: 'ON' },
        { value: 'F', description: 'OFF' },
        { value: 'D', description: 'BOTH' }
    ];
    isSaving = false;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    budgetDatesValidation = new Map();
    setFocusToElement = setFocusToElement;
    isShowPeriodsChangeModal = false;
    hasUnsavedChanges = false;
    

    constructor(
        public _budgetDataService: BudgetDataService,
        public _commonService: CommonService,
        private _budgetService: BudgetService,
        private _proposalService: ProposalService,
        private _navigateService: NavigationService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this.subscribeBudgetData();
        this.listenForGlobalSave();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? JSON.parse(JSON.stringify(data)) : {};
            if (this.budgetData.budgetHeader) {
                this.getDropDownRateObjects();
            }
        }));
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => this.saveOrUpdateProposalBudget()));
    }

    /**
    * @param  {} data
    * @param  {} type
    * for status ,Over Head Rate Type & Under Recovery Rate Type:
    */
    setObjectofDropdown(data, type) {
        this.setUnsavedChanges(true);
        // tslint:disable:triple-equals
        if (type === 'status') {
            data.budgetStatus = this.budgetData.budgetStatus.find(item => data.budgetStatusCode == item.budgetStatusCode);
            this.checkBudgetStatus();
        } else if (type === 'oh') {
            this.budgetData.budgetHeader.rateTypeCode = data.rateType ? data.rateType.rateTypeCode : null;
            this.budgetData.budgetHeader.rateClassCode = data.rateType ? data.rateType.rateClassCode : null;
        } else if (type === 'ur') {
            this.budgetData.budgetHeader.underrecoveryRateClassCode = data.underrecoveryRateType ? data.underrecoveryRateType.rateClassCode : null;
            this.budgetData.budgetHeader.underrecoveryRateTypeCode = data.underrecoveryRateType ? data.underrecoveryRateType.rateTypeCode : null;
        }
    }

    getDropDownRateObjects() {
        this.tempBudgetTemplateId = this.budgetData.budgetHeader.budgetTemplateTypeId;
        this.budgetData.budgetHeader.rateType =
            this.getRateTypeObject(this.budgetData.budgetHeader.rateClassCode, this.budgetData.budgetHeader.rateTypeCode);
        this.budgetData.budgetHeader.underrecoveryRateType =
            this.getRateTypeObject(this.budgetData.budgetHeader.underrecoveryRateClassCode,
                                          this.budgetData.budgetHeader.underrecoveryRateTypeCode);
    }


    getRateTypeObject(classCode: string, typeCode: string): any {
        const rateType = this.findRateTypeFromClassCode(classCode, typeCode);
        return rateType ? rateType : null;
    }

    findRateTypeFromClassCode(classCode: string, typeCode: string): any {
        return this.budgetData.rateTypes.find(item => classCode === item.rateClassCode && typeCode === item.rateTypeCode);
    }

    /** method to check whether the budget status is 'complete' */
    checkBudgetStatus() {
        this.isbudgetStatusComplete = false;
        this.isbudgetStatusComplete = this.budgetData.isBudgetVersionEnabled ?
         (this.budgetData.budgetHeader.isFinalBudget === true && this.budgetData.budgetHeader.budgetStatusCode != 3 ? true : false) : true;
    }

    /*
    * To on or off autocalc button
    */
    onAutoCalcChange() {
        this.budgetData.budgetHeader.isAutoCalc = !this.budgetData.budgetHeader.isAutoCalc;
        this.hasUnsavedChanges = true;
    }

    /** method to check whether final budget version already exists & shows confirmation modal */
    checkFinalBudget(event) {
        this.setUnsavedChanges(true);
        if (event) {
            this.checkFinalVersionExist() ? $('#isFinalBudgetProposal').modal('show') : this.checkDatesAndSetFinalBudget('BUDGET_STATUS');
        } else {
            this.budgetData.budgetHeader.isFinalBudget = false;
        }
    }

    compareProposalAndBudgetDates(): boolean {
        const PERIODS_ARRAY = this.budgetData && this.budgetData.budgetHeader ? this.budgetData.budgetHeader.budgetPeriods : [];
        if (checkPeriodDatesOutside(PERIODS_ARRAY, this._proposalService.proposalStartDate, this._proposalService.proposalEndDate)) {
            const DATE_OBJECT: any = {
                'proposalStartDate': this._proposalService.proposalStartDate,
                'proposalEndDate': this._proposalService.proposalEndDate,
                'budgetStartDate': PERIODS_ARRAY ? PERIODS_ARRAY[0].startDate : null,
                'budgetEndDate': PERIODS_ARRAY ? PERIODS_ARRAY[PERIODS_ARRAY.length - 1].endDate : null
            };
            setProposalDateChange(DATE_OBJECT, this._proposalService);
            return true;
        } else {
            return false;
        }
    }

    /**
     * if Periods And Totals tab available
     * budget date update feature will work
     * else final budget will be set without considering this feature.
     * @param type
     */
    checkDatesAndSetFinalBudget(type): void {
        if (this.budgetData.isPeriodTotalEnabled && this._proposalService.proposalSectionConfig['308'].isActive) {
            this.checkIfDatesChanged(type);
        } else {
            type === 'BUDGET_STATUS' ? this.setBudgetStatus() : this.setFinalBudget();
        }
    }

    checkIfDatesChanged(type): void {
        if (this.compareProposalAndBudgetDates()) {
            this.openModal();
        } else if (checkIfDatesOverlapped(this.budgetData)) {
            this.showErrorToast();
        } else {
            this.budgetData.budgetHeader.isFinalBudget = true;
            type === 'BUDGET_STATUS' ? this.setBudgetStatus() : this.setFinalBudget();
        }
    }

    showErrorToast() {
        this._navigateService.navigateToDocumentRoutePath('periodsAndTotal', 'proposal-periods-total', this.budgetData.proposalId);
        setTimeout(() => {
            this.budgetData.budgetHeader.isFinalBudget = false;
            toggleErrorToast(this.budgetData, this._proposalService);
        });
    }

    openModal() {
        if (checkDatesAreNotEqual(this._proposalService, this.budgetData.budgetHeader.startDate,
            this.budgetData.budgetHeader.endDate)) {
            this.isShowPeriodsChangeModal = true;
        } else {
            this.showErrorToast();
        }
    }

    /**To set status as complete*/
    setBudgetStatus() {
        this.budgetData.budgetHeader.budgetStatusCode = '3';
        this.setObjectofDropdown(this.budgetData.budgetHeader, 'status');
    }

    checkFinalVersionExist() {
        if (this.budgetData.budgetHeaderDetails.length > 1) {
            return !!this.budgetData.budgetHeaderDetails.find(
                detail => detail.isFinalBudget === true && detail.budgetId !== this.budgetData.budgetHeader.budgetId);
        } else {
            return false;
        }
    }
    /**
     * on clicking confirm in isfinal popup it sets the current budget versions as final and all other as not final.
     */
    setFinalBudget() {
        this.setBudgetStatus();
        this.budgetData.budgetHeaderDetails.forEach((element) => {
            if (element.isFinalBudget === true) {
                element.isFinalBudget = false;
                this._budgetDataService.previousFinalBudgetId = element.budgetId;
            }
        });
        this.saveOrUpdateProposalBudget('IS_FINAL');
    }

    saveOrUpdateProposalBudget(type = null) {
        if (!this.budgetData.isBudgetVersionEnabled && this.budgetData.budgetHeader.budgetStatusCode === '3') {
            this.budgetData.budgetHeader.isFinalBudget = true;
        }
        if (this._budgetDataService.checkBudgetDatesFilled() && (!this.isbudgetStatusComplete ||
            !this.budgetData.isBudgetVersionEnabled) && !this.isSaving && !this.budgetDatesValidation.size) {
            if (this.hasUnsavedChanges) {
                this.isSaving = true;
                this.$subscriptions.push(this._budgetService.saveOrUpdateProposalBudget(this.setSaveOrUpdateRequestData(type))
                    .subscribe((data: any) => {
                        this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                        this.budgetData.budgetHeader = data.budgetHeader;
                        this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
                        this._budgetDataService.setProposalBudgetData(this.budgetData);
                        if (this.budgetData.isPeriodTotalEnabled && this._proposalService.proposalSectionConfig['308'].isActive
                            && (!this.budgetData.budgetHeader.isApprovedBudget && !this._budgetDataService.isBudgetViewMode)) {
                            toggleErrorToast(this.budgetData, this._proposalService);
                        }
                        this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
                        this._budgetDataService.previousFinalBudgetId = null;
                        this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
                        this.getDropDownRateObjects();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget saved successfully.');
                        this.isSaving = false;
                        this.setUnsavedChanges(false);
                    }, err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Budget failed. Please try again.');
                        this.isSaving = false;
                    }));
            }
        } else {
            if (!type && !this.isSaving) {
                this._autoSaveService.errorEvent(
                    { name: 'Budget Overview', documentId: 'proposal-budget-overview', type: 'VALIDATION' });
            }
            if (type === 'AUTOCALCULATE') {
                $('#proposalAutocalcToggleModal').modal('hide');
                this.onAutoCalcChange();
            }
        }
    }

    /**
     * @param  {} type
     * budgetTemplateTypeId is also added outside budhetHeader
     * :- it contains the budgetTemplateId of the confirmed template.
     *  Since we have only one API to update budget, based on the value of 'budgetTemplateTypeId'
     *  system decides whether to inserts canned cost elements
     */
    setSaveOrUpdateRequestData(type) {
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        if (this.budgetData.isPeriodTotalEnabled && this._proposalService.proposalSectionConfig['308'].isActive &&
            !checkPeriodDatesOutside(this.budgetData.budgetHeader.budgetPeriods, this._proposalService.proposalStartDate,
                this._proposalService.proposalEndDate)) {
            this.budgetData.budgetHeader.startDate = parseDateWithoutTimestamp(this._proposalService.proposalStartDate);
            this.budgetData.budgetHeader.endDate = parseDateWithoutTimestamp(this._proposalService.proposalEndDate);
        }
        return {
            'budgetTabName': this._budgetDataService.BudgetTab,
            'budgetHeader': this.budgetData.budgetHeader,
            'proposalId': this.budgetData.proposalId,
            'budgetPeriod': null,
            'previousFinalBudgetId': this._budgetDataService.previousFinalBudgetId,
            'grantTypeCode': this._budgetDataService.grantTypeCode,
            'activityTypeCode': this._budgetDataService.activityTypeCode,
            'isSimpleBudgetEnabled': this.budgetData.isSimpleBudgetEnabled,
            'budgetTemplateTypeId': type === 'BUDGET_TEMPLATE' ? this.budgetData.budgetHeader.budgetTemplateTypeId : null
        };
    }

    triggerConfirmationPopup() {
        this.setUnsavedChanges(true);
        if (this.budgetData.budgetHeader.budgetTemplateTypeId) {
            $('#confirmBudgetTemplateModal').modal('show');
        }
    }

    ngOnDestroy() {
        this.setUnsavedChanges(false);
        this._autoSaveService.clearUnsavedChanges();
        subscriptionHandler(this.$subscriptions);
    }

    dateValidation() {
        this.budgetDatesValidation.clear();
        const proposalStartDate = getDateObjectFromTimeStamp(this._proposalService.proposalStartDate);
        const proposalEndDate = getDateObjectFromTimeStamp(this._proposalService.proposalEndDate);
        if (!this.budgetData.budgetHeader.startDate) {
            this.budgetDatesValidation.set('startDate', 'Please select a start date');
        } else {
            if (compareDatesWithoutTimeZone(this.budgetData.budgetHeader.startDate, proposalStartDate) === -1) {
                this.budgetDatesValidation.set('startDate', 'Please select a start date on or after proposal start date');
            }
            if (compareDatesWithoutTimeZone(this.budgetData.budgetHeader.startDate, proposalEndDate) === 1) {
                this.budgetDatesValidation.set('startDate', 'Please select a start date on or before proposal end date');
            }
            if (compareDates(this.budgetData.budgetHeader.startDate, this.budgetData.budgetHeader.endDate) === 1) {
                this.budgetDatesValidation.set('startDate', 'Please select a start date on or before end date');
            }
        }
        if (!this.budgetData.budgetHeader.endDate) {
            this.budgetDatesValidation.set('endDate', 'Please select a end date');
        } else {
            if (compareDatesWithoutTimeZone(this.budgetData.budgetHeader.endDate, proposalStartDate) === -1) {
                this.budgetDatesValidation.set('endDate', 'Please select a end date on or after proposal start date');
            }
            if (compareDatesWithoutTimeZone(this.budgetData.budgetHeader.endDate, proposalEndDate) === 1) {
                this.budgetDatesValidation.set('endDate', 'Please select a end date on or before proposal end date');
            }
            if (compareDates(this.budgetData.budgetHeader.endDate, this.budgetData.budgetHeader.endDate) === -1) {
                this.budgetDatesValidation.set('endDate', 'Please select a end date on or after start date');
            }
        }
    }

    closeModal(event): void {
        const PERIODS_ARRAY = this.budgetData && this.budgetData.budgetHeader ? this.budgetData.budgetHeader.budgetPeriods : [];
        if (event) {
            this.isShowPeriodsChangeModal = false;
            if (event.selectedOption == 'Y' &&
                !checkPeriodDatesOutside(PERIODS_ARRAY, this._proposalService.proposalStartDate, this._proposalService.proposalEndDate) &&
                !checkIfDatesOverlapped(this.budgetData)) {
                this.budgetData.budgetHeader.isFinalBudget = true;
                this.setFinalBudget();
            } else {
                this.showErrorToast();
            }
        }
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.isBudgetOverviewChanged = flag;
        this.hasUnsavedChanges = flag;
        this._autoSaveService.setUnsavedChanges('Budget Summary', 'ip-budget-overview', flag, true);
    }

    getCampusFlagDescription(code) {
        return this.campusFlagList.find(item => item.value === code).description;
    }

}
