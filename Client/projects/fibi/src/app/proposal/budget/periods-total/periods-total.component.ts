import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, DEFAULT_DATE_FORMAT, COMMON_PERIODS_AND_TOTAL_LABEL } from '../../../app-constants';
import {
    compareDates, getDateObjectFromTimeStamp,
    parseDateWithoutTimestamp, isValidDateFormat
} from '../../../common/utilities/date-utilities';
import { setFocusToElement, inputRestrictionForAmountField } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetDataService } from '../../services/budget-data.service';
import { CommonService } from '../../../common/services/common.service';
import { BudgetService } from '../budget.service';
import {
    calculatePeriodTotalCost, periodWiseSalaryCalculation,
    reCalculatePersonsalary
} from '../budget-calculations';
import { checkPeriodDatesOutside, inputRestriction, toggleErrorToast, validateBudgetTotalCost } from '../budget-validations';
import { ProposalService } from '../../services/proposal.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';

declare var $: any;

@Component({
    selector: 'app-periods-total',
    templateUrl: './periods-total.component.html',
    styleUrls: ['./periods-total.component.css']
})
export class PeriodsTotalComponent implements OnInit, OnDestroy {

    @Input() isViewMode: any = false;
    budgetData: any = {};
    startDatesWarningMap: any = {};
    endDatesWarningMap: any = {};
    periodsWarningMap: any = {};
    setFocusToElement = setFocusToElement;
    calculatePeriodTotalCost = calculatePeriodTotalCost;
    inputRestriction = inputRestriction;
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    $subscriptions: Subscription[] = [];
    tempPeriod: any = {};
    map = new Map();
    copyWarningMessage = null;
    isPeriodsAndTotalEditable = false;
    generateModalWarningMessage = null;
    saveWarningMsg = null;
    periodDateId = null;
    isSaving = false;
    invalidPeriods: any = {};
    hasUnsavedChanges = false;
    formatWarningMap: any =  new Map();
    isTotalCostExceedsLimit = false;

    constructor(
        public _commonService: CommonService,
        private _budgetService: BudgetService,
        public _budgetDataService: BudgetDataService,
        private _proposalService: ProposalService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this._budgetDataService.BudgetTab = 'PERIODSTOTAL';
        this.subscribeBudgetData();
        this.initiatePeriodOperations();
        this.checkPeriodOverlapped();
        this.subscribeProposalStatusChange();
        if (this.budgetData && this.budgetData.budgetHeader) {
            toggleErrorToast(this.budgetData, this._proposalService);
        }
    }

    subscribeProposalStatusChange() {
        this.$subscriptions.push(this._budgetDataService.proposalStatusChange.subscribe((data: any) => {
            if (data) {
                this.checkPeriodsAndTotalEditable();
            }
        }));
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? JSON.parse(JSON.stringify(data)) : {};
            if (data && this.budgetData.budgetHeader) {
                this.checkPeriodsAndTotalEditable();
                this.startDatesWarningMap = {};
                this.endDatesWarningMap = {};
            }
        }));
    }

    initiatePeriodOperations() {
        this.$subscriptions.push(this._budgetDataService.isPeriodOperationsProposalTrigger.subscribe((data: any) => {
            data === 'GENERATEPERIOD' ? this.validateGenerateBudgetPeriod() : this.validateAddPeriod();
        }));
    }

    checkPeriodsAndTotalEditable() {
        this.isPeriodsAndTotalEditable = (this.budgetData.isBudgetVersionEnabled && this.budgetData.budgetHeader.isAutoCalc) ||
            this._budgetDataService.isBudgetViewMode || this.isViewMode;
    }

    validateGenerateBudgetPeriod() {
        if (!this._budgetDataService.budgetDataChanged) {
            if (this.checkValueExistInFirstPeriod()) {
                if (this.getPeriodWithItems()) {
                    this.generateModalWarningMessage =
                        'Line Item already exists in other periods. Please delete them to proceed with generate period.';
                    $('#generatePeriodWarningModal').modal('show');
                } else {
                    $('#generatePeriodModal').modal('show');
                }
            } else {
                this.generateModalWarningMessage = 'No line items added.';
                $('#generatePeriodWarningModal').modal('show');
            }
        } else {
            this.saveWarningMsg = 'You have unsaved changes. Save the changes before \'Generate All Periods\'.';
            $('#proposalBudgetDataSaveModal').modal('show');
        }
    }

    getPeriodWithItems() {
        return this.budgetData.budgetHeader.budgetPeriods.find(period =>
            (period.budgetDetails.length > 0 || period.totalCost) && period.budgetPeriod !== 1) ? true : false;
    }

    checkValueExistInFirstPeriod() {
        return ((this.budgetData.budgetHeader.budgetPeriods[0].totalCost !== 0 &&
            this.budgetData.budgetHeader.budgetPeriods[0].totalCost !== null) ||
            this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails.length > 0);
    }

    validateAddPeriod() {
        if (!this._budgetDataService.budgetDataChanged) {
            $('#addBudgetPeriodModal').modal('show');
        } else {
            this.saveWarningMsg = 'You have unsaved changes. Save the changes before \'Add Period\'.';
            $('#proposalBudgetDataSaveModal').modal('show');
        }
    }

    addBudgetPeriod() {
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        this.$subscriptions.push(this._budgetService.addBudgetPeriod({
            'budgetHeader': this.budgetData.budgetHeader,
            'proposalId': this.budgetData.proposalId, 'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'userName': this._commonService.getCurrentUserDetail('userName'),
            'activityTypeCode': this._budgetDataService.activityTypeCode
        }).subscribe((data: any) => {
            this.setBudgetData(data);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'New Period added successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding New Period failed. Please try again.');
        }));
    }

    generateBudgetPeriod() {
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        if (this._budgetDataService.checkBudgetDatesFilled()) {
            const REQUEST_OBJECT: any = {
                budgetHeader: this.budgetData.budgetHeader,
                userName: this._commonService.getCurrentUserDetail('userName'),
                proposalId: this.budgetData.proposalId,
                currentPeriodId: this.budgetData.budgetHeader.budgetPeriods[0].budgetPeriodId,
                activityTypeCode: this._budgetDataService.activityTypeCode
            };
            this.$subscriptions.push(this._budgetService.generateBudgetPeriod(REQUEST_OBJECT).subscribe((data: any) => {
                if (this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails.length > 0) {
                    data.isCalculationWithPredefinedSalary = this.budgetData.isCalculationWithPredefinedSalary;
                    reCalculatePersonsalary(data, this.budgetData.budgetHeader.budgetPeriods[0].budgetPeriod);
                    this.saveOrUpdateProposalBudgetServiceCall(this.saveOrUpdateRequestData(data, 'GENERATE'), 'GENERATE');
                } else {
                    this.setBudgetData(data);
                }
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Periods are generated successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Periods failed. Please try again.');
            }));
        }
    }

    setBudgetData(data) {
        this.budgetData.budgetHeader = data.budgetHeader;
        this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
        this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
        this._budgetDataService.setProposalBudgetData(this.budgetData);
    }

    saveOrUpdateProposalBudget(type = null) {
        if ((checkPeriodDatesOutside(this.budgetData.budgetHeader.budgetPeriods, this._proposalService.proposalStartDate,
            this._proposalService.proposalEndDate))) {
            toggleErrorToast(this.budgetData, this._proposalService);
        } else if (!this.isSaving && this._budgetDataService.checkBudgetDatesFilled(this.budgetData.budgetHeader.budgetPeriods) &&
            this.checkDatesValid() && this.map.size < 1 && !this.isTotalCostExceedsLimit) {
            this.saveOrUpdateProposalBudgetServiceCall(this.saveOrUpdateRequestData(this.budgetData, type), type);
        }
    }

    saveOrUpdateProposalBudgetServiceCall(requestData, type = null) {
        this.isSaving = true;
        this._budgetService.saveOrUpdateProposalBudget(requestData)
            .subscribe((data: any) => {
                this.setUnsavedChanges(false);
                this.setBudgetData(data);
                toggleErrorToast(this.budgetData, this._proposalService);
                if (!type) {
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Period dates updated successfully.');
                }
                this.isSaving = false;
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Budget failed. Please try again.');
                this.isSaving = false;
                this.budgetData = this._budgetDataService.budgetDataBeforeSave;
            });
    }

    saveOrUpdateRequestData(budgetData = this.budgetData, type) {
        this._budgetDataService.setBudgetDatesPriorToSave(budgetData);
        if (!type) {
            this._budgetDataService.setDateFormatFromWithoutTimeStamp(budgetData);
        }
        this.setBudgetHeaderDates();
        return {
            'budgetTabName': 'DETAILED',
            'budgetHeader': budgetData.budgetHeader,
            'proposalId': budgetData.proposalId,
            'budgetPeriod': this.tempPeriod.budgetPeriod,
            'previousFinalBudgetId': this._budgetDataService.previousFinalBudgetId,
            'grantTypeCode': this._budgetDataService.grantTypeCode,
            'activityTypeCode': this._budgetDataService.activityTypeCode
        };
    }

    validateCopyBudgetPeriod() {
        if (!this._budgetDataService.budgetDataChanged) {
            const COPYFROM =
                this.budgetData.budgetHeader.budgetPeriods.find(period => period.budgetPeriod === (this.tempPeriod.budgetPeriod - 1));
            if ((COPYFROM.totalCost !== 0 && COPYFROM.totalCost !== null) || COPYFROM.budgetDetails.length > 0) {
                if ((this.tempPeriod.totalCost !== 0 && this.tempPeriod.totalCost !== null) || this.tempPeriod.budgetDetails.length > 0) {
                    this.copyWarningMessage = 'Line Item already exists. Please delete them to proceed with copy period.';
                    $('#proposalBudgetCopyPeriodWarningModal').modal('show');
                } else {
                    $('#proposalBudgetCopyPeriodModal').modal('show');
                }
            } else {
                this.copyWarningMessage = 'No line items added.';
                $('#proposalBudgetCopyPeriodWarningModal').modal('show');
            }
        } else {
            this.saveWarningMsg = 'You have unsaved changes. Save the changes before \'Copy Period\'.';
            $('#proposalBudgetDataSaveModal').modal('show');
        }
    }

    validatePeriodDates(period, dateType, type = null) {
        let date1, date2;
        if (dateType === 'STARTDATE') {
            date1 = period.startDate;
            date2 = period.endDate;
        } else {
            date2 = period.startDate;
            date1 = period.endDate;
        }
        const periodsDateObject: any = {};
        periodsDateObject.period = period.budgetPeriod;
        periodsDateObject.startErrorMessage = periodsDateObject.endErrorMessage = periodsDateObject.periodErrorMessage = null;
        this.checkDateBetweenBudgetDates(dateType, periodsDateObject, date1, type);
        this.checkDateBetweenPeriodDates(dateType, periodsDateObject, date1, date2);
        this.checkDatesOverlapping(periodsDateObject, date1, dateType);
        dateType === 'STARTDATE' ? this.setStartDatesWarningMap(periodsDateObject) : this.setEndDatesWarningMap(periodsDateObject);
        this.setPeriodsWarningMap(periodsDateObject, dateType);
    }

    checkDateBetweenBudgetDates(selectedDateType, periodsDateObject, selectedDate, validationType) {
        if ((compareDates(selectedDate, getDateObjectFromTimeStamp(this._proposalService.proposalStartDate)) === -1) ||
            (compareDates(selectedDate, getDateObjectFromTimeStamp(this._proposalService.proposalEndDate)) === 1)) {
            if (validationType) {
                this.setInvalidErrorMessage(periodsDateObject, selectedDateType);
            } else {
                this.setPeriodsErrorMessage(periodsDateObject, selectedDateType);
            }
        }
    }

    setPeriodsErrorMessage(periodsDateObject, dateType) {
        if (dateType === 'STARTDATE') {
            periodsDateObject.startErrorMessage = '* Choose a period start date between budget start date and budget end date';
        } else {
            periodsDateObject.endErrorMessage = '* Choose a period end date between budget start date and budget end date';
        }
    }

    setInvalidErrorMessage(periodsDateObject, dateType) {
        if (dateType === 'STARTDATE') {
            this.invalidPeriods[periodsDateObject.period] = periodsDateObject.period;
            this.setPeriodsErrorMessage(periodsDateObject, dateType);
        } else {
            if (this.invalidPeriods.hasOwnProperty(periodsDateObject.period)) {
                periodsDateObject.periodErrorMessage = '*Invalid period';
                this.startDatesWarningMap[periodsDateObject.period].startErrorMessage = null;
            } else {
                this.setPeriodsErrorMessage(periodsDateObject, dateType);
            }
        }
    }

    checkDateBetweenPeriodDates(dateType, periodsDateObject, date1, date2) {
        if (dateType === 'STARTDATE' && date2 && (compareDates(date1, date2) === 1)) {
            periodsDateObject.startErrorMessage = '* Choose a period start date before period end date';
        } else if (dateType === 'ENDDATE' && date2 && (compareDates(date1, date2) === -1)) {
            periodsDateObject.endErrorMessage = '* Choose a period end date after period start date';
        }
    }

    checkDatesOverlapping(periodsDateObject, date1, dateType) {
        // > 1 used because no need to compare overlapping condition for first period
        if (periodsDateObject.period > 1) {
            this.budgetData.budgetHeader.budgetPeriods.forEach((element, index) => {
                if ((compareDates(element.startDate, date1) === 0 || compareDates(element.startDate, date1) === -1) &&
                    (compareDates(element.endDate, date1) === 0 || compareDates(element.endDate, date1) === 1) &&
                    (periodsDateObject.period - 1) !== index) {
                    dateType === 'STARTDATE' ? periodsDateObject.startErrorMessage = '* Period dates cannot be overlapped with each other' :
                        periodsDateObject.endErrorMessage = '* Period dates cannot be overlapped with each other';
                }
            });
        }
    }

    checkPeriodOverlapped() {
        this.$subscriptions.push(
            this._proposalService.$isPeriodOverlapped.subscribe((data) => {
                if (this.budgetData && this.budgetData.budgetHeader && data) {
                    this.invalidPeriods = {};
                    this.budgetData.budgetHeader.budgetPeriods.forEach((element) => {
                        if (element.startDate) {
                            this.validatePeriodDates(element, 'STARTDATE', 'PERIOD_VALIDATION');
                        }
                        if (element.endDate) {
                            this.validatePeriodDates(element, 'ENDDATE', 'PERIOD_VALIDATION');
                        }
                    });
                } else if (!data) {
                    this.periodsWarningMap = {};
                }
            })
        );
    }

    setStartDatesWarningMap(periodsDateObject) {
        this.startDatesWarningMap[periodsDateObject.period] = periodsDateObject;
        if (!this.startDatesWarningMap[periodsDateObject.period].startErrorMessage &&
            !this.startDatesWarningMap[periodsDateObject.period].endErrorMessage) {
            delete this.startDatesWarningMap[periodsDateObject.period];
        }
    }

    setPeriodsWarningMap(periodsDateObject, dateType) {
        if (this.periodsWarningMap[periodsDateObject.period] && this.periodsWarningMap[periodsDateObject.period].periodErrorMessage
            && dateType === 'ENDDATE') {
            this.periodsWarningMap[periodsDateObject.period] = this.periodsWarningMap[periodsDateObject.period];
        } else {
            this.periodsWarningMap[periodsDateObject.period] = periodsDateObject;
        }
        if (!this.periodsWarningMap[periodsDateObject.period].periodErrorMessage) {
            delete this.periodsWarningMap[periodsDateObject.period];
        }
    }

    setEndDatesWarningMap(periodsDateObject) {
        this.endDatesWarningMap[periodsDateObject.period] = periodsDateObject;
        if (!this.endDatesWarningMap[periodsDateObject.period].endErrorMessage &&
            !this.endDatesWarningMap[periodsDateObject.period].startErrorMessage) {
            delete this.endDatesWarningMap[periodsDateObject.period];
        }
    }

    checkDatesValid() {
        this.budgetData.budgetHeader.budgetPeriods.forEach((element) => {
            if (element.totalDirectCost) {
                this.inputDigitRestriction(element.totalDirectCost, 'directCost');
            }
            if (element.totalIndirectCost) {
                this.inputDigitRestriction(element.totalIndirectCost, 'inDirectCost');
            }
            if (element.costSharingAmount) {
                this.inputDigitRestriction(element.costSharingAmount, 'costSharingAmount');
            }
            if (element.underrecoveryAmount) {
                this.inputDigitRestriction(element.underrecoveryAmount, 'underRecoveryAmount');
            }
            if (element.totalModifiedDirectCost) {
                this.inputDigitRestriction(element.totalModifiedDirectCost, 'modifiedDirectCost');
            }
            if (element.totalInKind) {
                this.inputDigitRestriction(element.totalInKind, 'totalInKind');
            }
            if (element.startDate) {
                this.validatePeriodDates(element, 'STARTDATE');
            }
            if (element.endDate) {
                this.validatePeriodDates(element, 'ENDDATE');
            }
        });
        return Object.keys(this.startDatesWarningMap).length === 0 &&
            Object.keys(this.endDatesWarningMap).length === 0 ? true : false;
    }

    inputDigitRestriction(field: any, key: any, index: number = null) {
        const KEY = index !== null ? key + index : key;
        this.map.delete(KEY);
        if (inputRestrictionForAmountField(field)) {
            this.map.set(KEY, inputRestrictionForAmountField(field));
        }
    }

    openActionModal(action, period) {
        this.tempPeriod = period;
        switch (action) {
            case 'COPY': this.validateCopyBudgetPeriod(); break;
            case 'DELETE_PERIOD': $('#proposalBudgetDeletePeriodModal').modal('show'); break;
            default: break;
        }
    }

    copyBudgetPeriod() {
        if (this._budgetDataService.checkBudgetDatesFilled()) {
            this.$subscriptions.push(this._budgetService.copyBudgetPeriod(this.copyPeriodRequestData()).subscribe((data: any) => {
                if (this.budgetData.budgetHeader.budgetPeriods.find(period =>
                    period.budgetPeriod === this.tempPeriod.budgetPeriod - 1).budgetDetails.length > 0) {
                    data.isCalculationWithPredefinedSalary = this.budgetData.isCalculationWithPredefinedSalary;
                    const PERIODINDEX = data.budgetHeader.budgetPeriods.findIndex(period => period.budgetPeriodId === this.tempPeriod.budgetPeriodId);
                    data.budgetHeader.budgetPeriods[PERIODINDEX] = periodWiseSalaryCalculation(data.budgetHeader.budgetPeriods[PERIODINDEX], data);
                    this.saveOrUpdateProposalBudgetServiceCall(this.saveOrUpdateRequestData(data, 'COPY'), 'COPY');
                } else {
                    this.setBudgetData(data);
                }
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Period copied successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Copying Budget Period failed. Please try again.');
            }));
        }
    }

    copyPeriodRequestData() {
        this.budgetData.budgetHeader.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.budgetData.updateTimeStamp = new Date().getTime();
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        return {
            budgetHeader: this.budgetData.budgetHeader,
            copyPeriodId: this.budgetData.budgetHeader.budgetPeriods.find(period =>
                period.budgetPeriod === this.tempPeriod.budgetPeriod - 1).budgetPeriodId,
            currentPeriodId: this.tempPeriod.budgetPeriodId,
            proposalId: this.budgetData.proposalId,
            userName: this._commonService.getCurrentUserDetail('userName'),
            activityTypeCode: this._budgetDataService.activityTypeCode
        };
    }

    deleteBudgetPeriod() {
        this.$subscriptions.push(this._budgetService.deleteBudgetPeriod(this.deletePeriodRequestData()).subscribe((data: any) => {
            this.setBudgetData(data);
            this.checkDatesValid();
            this.resetDateChange();
            toggleErrorToast(this.budgetData, this._proposalService);
            this._budgetDataService.checkBudgetDatesFilled(this.budgetData.budgetHeader.budgetPeriods);
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Period deleted successfully.');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Budget Period failed. Please try again.');
        }));
    }

    resetDateChange() {
        const PERIODS_ARRAY = this.budgetData && this.budgetData.budgetHeader ? this.budgetData.budgetHeader.budgetPeriods : [];
        this._proposalService.isDatesChanged = this._proposalService.isDatesChanged &&
            checkPeriodDatesOutside(PERIODS_ARRAY, this._proposalService.proposalStartDate, this._proposalService.proposalEndDate) ? true : false;
    }

    deletePeriodRequestData() {
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        this.setBudgetHeaderDates();
        return {
            budgetPeriodId: this.tempPeriod.budgetPeriodId,
            budgetHeader: this.budgetData.budgetHeader,
            proposalId: this.budgetData.proposalId
        };
    }

    setBudgetHeaderDates() {
        if (!checkPeriodDatesOutside(this.budgetData.budgetHeader.budgetPeriods, this._proposalService.proposalStartDate,
            this._proposalService.proposalEndDate)) {
            this.budgetData.budgetHeader.startDate = parseDateWithoutTimestamp(this._proposalService.proposalStartDate);
            this.budgetData.budgetHeader.endDate = parseDateWithoutTimestamp(this._proposalService.proposalEndDate);
        }
    }

    checkPersonExistInPeriod(period, id) {
        this.periodDateId = id;
        let ITEM: any;
        if (period.budgetDetails.length) {
            const DETAILS = period.budgetDetails.find(item => item.personsDetails.length);
            ITEM = DETAILS ? DETAILS.personsDetails : [];
        }
        if (ITEM && ITEM.length) {
            $('#budgetPersonexistwarnModal').modal('show');
        }
        setFocusToElement(this.periodDateId);
    }


    ngOnDestroy() {
        this.setUnsavedChanges(false);
        subscriptionHandler(this.$subscriptions);
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.budgetDataChanged = flag;
        this.hasUnsavedChanges = flag;
        this._autoSaveService.setUnsavedChanges(COMMON_PERIODS_AND_TOTAL_LABEL, 'periods-total-tab', flag);
    }

    getSystemDate() {
        return new Date(new Date().setHours(0, 0, 0, 0));
    }

    dateFormateValidator(date, type, period) {
        const formatError = `* Entered date format is invalid.Please use ${DEFAULT_DATE_FORMAT} format.`;
        if (!isValidDateFormat(date) && type === 'periodstart') {
            this.formatWarningMap.set(period + 's', formatError);
        } else if (!isValidDateFormat(date) && type === 'periodend') {
            this.formatWarningMap.set(period + 'e', formatError);
        } else if (isValidDateFormat(date) && type === 'periodstart') {
            this.formatWarningMap.delete(period + 's');
        } else if (isValidDateFormat(date) && type === 'periodend') {
            this.formatWarningMap.delete(period + 'e');
        }
    }

    clearDateOnValidation(period, id) {
        if (id === 'period-start-date-icon' + period.budgetPeriod &&
            this.formatWarningMap.has(period.budgetPeriod + 's')) {
            period.startDate = this.getSystemDate();
            this.formatWarningMap.delete(period.budgetPeriod + 's');
            this.calenderOpener(id);
        } else if (id === 'period-end-date-icon' + period.budgetPeriod &&
            this.formatWarningMap.has(period.budgetPeriod + 'e')) {
            period.endDate = this.getSystemDate();
            this.formatWarningMap.delete(period.budgetPeriod + 'e');
            this.calenderOpener(id);
        } else {
            this.calenderOpener(id);
        }

    }

    calenderOpener(id) {
        setTimeout(() => {
            document.getElementById(id).click();
        });
    }

    validateTotalCost() {
        this.isTotalCostExceedsLimit = validateBudgetTotalCost(this.budgetData.budgetHeader.totalOfTotalCost);
    }

}
