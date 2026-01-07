import { Component, Input, OnDestroy, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { inputRestrictionForAmountField, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { inputRestriction } from '../../../proposal/budget/budget-validations';
import { BudgetData } from '../ip-budget';
import { BudgetDataService } from '../services/budget-data.service';
import { BudgetService } from '../services/budget.service';

declare var $: any;

@Component({
    selector: 'app-periods-total',
    templateUrl: './periods-total.component.html',
    styleUrls: ['./periods-total.component.css']
})
export class PeriodsTotalComponent implements OnInit, OnDestroy, OnChanges {

    @Input() isViewMode: any = false;
    budgetData: BudgetData;
    startDatesWarningMap: any = {};
    endDatesWarningMap: any = {};
    setFocusToElement = setFocusToElement;
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
    dataDependencies = ['instituteProposalBudgetHeader', 'isBudgetMerge', 'isCampusFlagEnabled', 'isFundingSupportDeclarationRequired',
        'isKeyPersonMerge', 'isReplaceAttachmentEnabled', 'isShowCostShareAndUnderrecovery', 'isShowInKind',
        'isShowModifiedDirectCost', 'isSpecialReviewMerge', 'isShowBudgetOHRatePercentage'];

    constructor(public _commonService: CommonService, private _budgetDataService: BudgetDataService,
        private _budgetService: BudgetService) { }

    ngOnInit() {
        this.listenForDataUpdate();
        this.getBudgetFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.isViewMode.firstChange) {
            this.checkPeriodsAndTotalEditable();
        }
    }

    listenForDataUpdate(): void {
        this.$subscriptions.push(
            this._budgetDataService.ipBudgetData.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getBudgetFromStore();
                }
            })
        );
    }

    getBudgetFromStore() {
        this.budgetData = this._budgetDataService.getBudgetData(this.dataDependencies);
        if (this.budgetData) {
            this._budgetDataService.convertDateObject(this.budgetData.instituteProposalBudgetHeader);
            this.checkPeriodsAndTotalEditable();
            if (this.budgetData.instituteProposalBudgetHeader) {
                this.budgetData.instituteProposalBudgetHeader.budgetPeriods.forEach(period => {
                    this.calculatePeriodTotalCost(period, this.budgetData);
                });
            }
            this.startDatesWarningMap = {};
            this.endDatesWarningMap = {};
        }
    }

    checkPeriodsAndTotalEditable() {
        this.isPeriodsAndTotalEditable = (this.budgetData.isBudgetVersionEnabled &&
            this.budgetData.instituteProposalBudgetHeader.isAutoCalc) || this.isViewMode;
    }

    saveOrUpdateProposalBudget() {
        if (!this.isSaving && this._budgetDataService.checkBudgetDatesFilled(this.budgetData.instituteProposalBudgetHeader.budgetPeriods) &&
            this.checkDatesValid() && this.map.size < 1) {
            this.saveOrUpdateRequestData();
        }
    }

    saveOrUpdateRequestData() {
        const HEADER_DATA = JSON.parse(JSON.stringify(this.budgetData.instituteProposalBudgetHeader));
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(HEADER_DATA);
        this.isSaving = true;
        this.$subscriptions.push(this._budgetService.saveOrUpdateIPBudgetData({
            'instituteProposalBudgetHeader': HEADER_DATA
        }).subscribe((data: any) => {
                this._budgetDataService.updateBudgetData({instituteProposalBudgetHeader: data.instituteProposalBudgetHeader});
                this.isSaving = false;
            }, err => {
                this.isSaving = false;
            }));
    }

    validateCopyBudgetPeriod(): void {
        if (!this._budgetDataService.budgetDataChanged) {
            const COPY_FROM =
                this.budgetData.instituteProposalBudgetHeader.budgetPeriods.find(
                    period => period.budgetPeriod === (this.tempPeriod.budgetPeriod - 1));
            if ((COPY_FROM.totalCost !== 0 && COPY_FROM.totalCost !== null) || COPY_FROM.budgetDetails.length > 0) {
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

    validatePeriodDates(period: any, dateType: string): void {
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
        periodsDateObject.startErrorMessage = periodsDateObject.endErrorMessage = null;
        this.checkDateBetweenBudgetDates(dateType, periodsDateObject, date1);
        this.checkDateBetweenPeriodDates(dateType, periodsDateObject, date1, date2);
        this.checkDatesOverlapping(periodsDateObject, date1, dateType);
        dateType === 'STARTDATE' ? this.setStartDatesWarningMap(periodsDateObject) : this.setEndDatesWarningMap(periodsDateObject);
    }

    checkDateBetweenBudgetDates(dateType: string, periodsDateObject: any, selectedDate: Date): void {
        const startDate = getDateObjectFromTimeStamp(this.budgetData.instituteProposalBudgetHeader.startDate);
        const endDate = getDateObjectFromTimeStamp(this.budgetData.instituteProposalBudgetHeader.endDate);
        if ((compareDates(selectedDate, startDate) === -1) ||
            (compareDates(selectedDate, endDate) === 1)) {
            if (dateType === 'STARTDATE') {
                periodsDateObject.startErrorMessage = '* Choose a Period Start Date between Budget Start Date and Budget End Date.';
            } else {
                periodsDateObject.endErrorMessage = '* Choose a Period End Date between Budget Start Date and Budget End Date.';
            }
        }
    }

    checkDateBetweenPeriodDates(dateType: string, periodsDateObject: any, date1: Date, date2: Date): any {
        if (dateType === 'STARTDATE' && date2 && (compareDates(date1, date2) === 1)) {
            periodsDateObject.startErrorMessage = '* Choose a Period Start Date before Period End Date.';
        } else if (dateType === 'ENDDATE' && date2 && (compareDates(date1, date2) === -1)) {
            periodsDateObject.endErrorMessage = '* Choose a Period End Date after Period Start Date.';
        }
    }

    checkDatesOverlapping(periodsDateObject: any, date1: Date, dateType: any): void {
        // > 1 used because no need to compare overlapping condition for first period
        if (periodsDateObject.period > 1) {
            this.budgetData.instituteProposalBudgetHeader.budgetPeriods.forEach((element, index) => {
                if ((compareDates(element.startDate, date1) === 0 || compareDates(element.startDate, date1) === -1) &&
                    (compareDates(element.endDate, date1) === 0 || compareDates(element.endDate, date1) === 1) &&
                    (periodsDateObject.period - 1) !== index) {
                    if (dateType === 'STARTDATE') {
                        periodsDateObject.startErrorMessage = '* Period dates can not be overlapped each other.';
                    } else {
                        periodsDateObject.endErrorMessage = '* Period dates can not be overlapped each other.';
                    }
                }
            });
        }
    }

    setStartDatesWarningMap(periodsDateObject: any): void {
        this.startDatesWarningMap[periodsDateObject.period] = periodsDateObject;
        if (!this.startDatesWarningMap[periodsDateObject.period].startErrorMessage &&
            !this.startDatesWarningMap[periodsDateObject.period].endErrorMessage) {
            delete this.startDatesWarningMap[periodsDateObject.period];
        }
    }

    setEndDatesWarningMap(periodsDateObject: any): void {
        this.endDatesWarningMap[periodsDateObject.period] = periodsDateObject;
        if (!this.endDatesWarningMap[periodsDateObject.period].endErrorMessage &&
            !this.endDatesWarningMap[periodsDateObject.period].startErrorMessage) {
            delete this.endDatesWarningMap[periodsDateObject.period];
        }
    }

    checkDatesValid(): boolean {
        this.budgetData.instituteProposalBudgetHeader.budgetPeriods.forEach(element => {
            this.validations(element);
        });
        return Object.keys(this.startDatesWarningMap).length === 0 &&
            Object.keys(this.endDatesWarningMap).length === 0 ? true : false;
    }

    validations(element: any): void {
        if (element.totalDirectCost) {
            this.inputDigitRestriction(element.totalDirectCost, 'directCost');
        }
        if (element.totalIndirectCost) {
            this.inputDigitRestriction(element.totalIndirectCost, 'inDirectCost');
        }
        if (element.costSharingAmount) {
            this.inputDigitRestriction(element.costSharingAmount, 'costSharingAmount');
        }
        if (element.underRecoveryAmount) {
            this.inputDigitRestriction(element.underRecoveryAmount, 'underRecoveryAmount');
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
    }

    inputDigitRestriction(field: any, key: any, index: number = null): void {
        const KEY = index !== null ? key + index : key;
        this.map.delete(KEY);
        if (inputRestrictionForAmountField(field)) {
            this.map.set(KEY, inputRestrictionForAmountField(field));
        }
    }

    checkPersonExistInPeriod(period: any, id: number): void {
        this.periodDateId = id;
        let ITEM: any;
        if (period.budgetDetails.length) {
            const DETAILS = period.budgetDetails.find(item => item.personsDetails.length);
            ITEM = DETAILS ? DETAILS.personsDetails : [];
        }
        if (ITEM && ITEM.length) {
            $('#budgetPersonexistwarnModal').modal('show');
        } else {
            this.triggerPicker();
        }
        setFocusToElement(this.periodDateId);
    }

    triggerPicker(): void {
        document.getElementById(this.periodDateId).click();
    }

    calculatePeriodTotalCost(period, budgetData) {
        period.totalCost = 0;
        period.totalOfTotalCost = 0;
        period.totalDirectCost = !period.totalDirectCost ? 0 : period.totalDirectCost;
        period.totalIndirectCost = !period.totalIndirectCost ? 0 : period.totalIndirectCost;
        period.subcontractCost = !period.subcontractCost ? 0 : period.subcontractCost;
        period.costSharingAmount = !period.costSharingAmount ? 0 : period.costSharingAmount;
        period.underRecoveryAmount = !period.underRecoveryAmount ? 0 : period.underRecoveryAmount;
        period.totalInKind = !period.totalInKind ? 0 : period.totalInKind;
        period.totalModifiedDirectCost = !period.totalModifiedDirectCost ? 0 : period.totalModifiedDirectCost;
        period.totalCost = parseFloat(period.totalCost) + parseFloat(period.totalDirectCost) +
            parseFloat(period.totalIndirectCost) + parseFloat(period.subcontractCost);
        period.totalInKind = budgetData.isShowCostShareAndUnderRecovery && budgetData.isShowInKind ?
            parseFloat(period.costSharingAmount) + parseFloat(period.underRecoveryAmount) : period.totalInKind;
        period.totalOfTotalCost = parseFloat(period.totalOfTotalCost) + parseFloat(period.totalCost) +
            parseFloat(period.totalInKind);
        this.calculateBudgetTotalCost(budgetData);
    }

    calculateBudgetTotalCost(budgetData) {
        budgetData.instituteProposalBudgetHeader.totalCost = 0;
        budgetData.instituteProposalBudgetHeader.totalDirectCost = 0;
        budgetData.instituteProposalBudgetHeader.totalIndirectCost = 0;
        budgetData.instituteProposalBudgetHeader.totalSubcontractCost = 0;
        budgetData.instituteProposalBudgetHeader.costSharingAmount = 0;
        budgetData.instituteProposalBudgetHeader.underRecoveryAmount = 0;
        budgetData.instituteProposalBudgetHeader.totalInKind = 0;
        budgetData.instituteProposalBudgetHeader.totalOfTotalCost = 0;
        budgetData.instituteProposalBudgetHeader.totalModifiedDirectCost = 0;
        if (budgetData.instituteProposalBudgetHeader.budgetPeriods.length > 0) {
            budgetData.instituteProposalBudgetHeader.budgetPeriods.forEach(period => {
                budgetData.instituteProposalBudgetHeader.totalDirectCost += parseFloat(period.totalDirectCost);
                budgetData.instituteProposalBudgetHeader.totalIndirectCost += parseFloat(period.totalIndirectCost);
                budgetData.instituteProposalBudgetHeader.totalSubcontractCost += parseFloat(period.totalSubcontractCost);
                budgetData.instituteProposalBudgetHeader.costSharingAmount += parseFloat(period.costSharingAmount);
                budgetData.instituteProposalBudgetHeader.underRecoveryAmount += parseFloat(period.underRecoveryAmount);
                budgetData.instituteProposalBudgetHeader.totalInKind += parseFloat(period.totalInKind);
                budgetData.instituteProposalBudgetHeader.totalModifiedDirectCost += parseFloat(period.totalModifiedDirectCost);
                budgetData.instituteProposalBudgetHeader.totalCost += parseFloat(period.totalCost);
                budgetData.instituteProposalBudgetHeader.totalOfTotalCost += parseFloat(period.totalOfTotalCost);
            });
        }
    }

}
