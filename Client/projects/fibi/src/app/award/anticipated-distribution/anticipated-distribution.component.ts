import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { convertToValidAmount, inputRestrictionForAmountField, setFocusToElement } from '../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonDataService } from '../services/common-data.service';
import {
    AmountTotals, AnticipatedAmountInfo,
    AnticipatedDistributionPeriod, AwardFunds, PeriodsDate
} from './anticipated-distribution.interface';
import { AnticipatedDistributionService } from './anticipated-distribution.service';

declare var $: any;

@Component({
    selector: 'app-anticipated-distribution',
    templateUrl: './anticipated-distribution.component.html',
    styleUrls: ['./anticipated-distribution.component.css']
})
export class AnticipatedDistributionComponent implements OnInit, OnDestroy {

    @Input() anticipatedModalType: string;
    @Input() isEdit: boolean;
    @Input() awardCostDetails: AwardFunds;
    @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();

    $subscriptions: Subscription[] = [];
    datePlaceHolder = DEFAULT_DATE_FORMAT;
    setFocusToElement = setFocusToElement;
    convertToValidAmount = convertToValidAmount;

    anticipatedPeriods: Array<AnticipatedDistributionPeriod>;
    isShowComment: Array<boolean> = [];
    awardStartDate: Date;
    awardEndDate: Date;
    startDatesWarningMap: any = {};
    endDatesWarningMap: any = {};
    awardResult: any = {};
    validationMap = new Map();
    totalAmount: AmountTotals = new AmountTotals();
    amountInformation: AnticipatedAmountInfo = new AnticipatedAmountInfo();
    isSaving = false;

    constructor(
        private _anticipatedDistributionService: AnticipatedDistributionService,
        public _commonData: CommonDataService,
        private _commonService: CommonService
    ) { }

    ngOnInit() {
        this.getPermissions();
        this.convertAwardDates();
        this.setObligateAndAnticipatedAmount();
        this.getAwardGeneralData();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    getPermissions(): void {
        this.isEdit = this.isEdit && this._commonData.checkDepartmentLevelRightsInArray('MODIFY_ANTICIPATED_FUNDING_DISTRIBUTION');
    }

    convertAwardDates(): void {
        this.awardStartDate = getDateObjectFromTimeStamp(this._commonData.beginDate);
        this.awardEndDate = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
    }
    /**
     * For setting the Obligated Total and Anticipated Total for the header information
     */
    setObligateAndAnticipatedAmount(): void {
        this.amountInformation = this.anticipatedModalType === 'P' ?
            new AnticipatedAmountInfo(this.awardCostDetails.pendingAmountInfo) :
            new AnticipatedAmountInfo(this.awardCostDetails.activeAmountInfo);
    }

    getAwardGeneralData(): void {
        this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
            if (data) {
                this.awardResult = JSON.parse(JSON.stringify(data));
                this.loadAnticipatedDistribution();
            }
        }));
    }

    loadAnticipatedDistribution(): void {
        this.$subscriptions.push(this._anticipatedDistributionService.loadAnticipatedDistribution({
            'awardNumber': this.awardResult.award.awardNumber,
            'sequenceNumber': this.awardResult.award.sequenceNumber,
            'awardId': this.awardResult.award.awardId,
            'transactionStatus': this.anticipatedModalType,
            'awardSequenceStatus': this.awardResult.award.awardSequenceStatus
        }).subscribe((data: AnticipatedDistributionPeriod[]) => {
            this.anticipatedPeriods = this.convertTimestamp(data);
            this.calculateBudgetTotalCost();
            $('#anticipated-distribution-modal').modal('show');
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching anticipated distributed failed. Please try again.');
            this.closeModal.emit(null);
        }));
    }

    convertTimestamp(periodList: AnticipatedDistributionPeriod[]): AnticipatedDistributionPeriod[] {
        return periodList.map((period: AnticipatedDistributionPeriod) => {
            period.startDate = getDateObjectFromTimeStamp(period.startDate);
            period.endDate = getDateObjectFromTimeStamp(period.endDate);
            return period;
        });
    }

    addPeriod(): void {
        this.anticipatedPeriods.push(new AnticipatedDistributionPeriod(
            this.anticipatedPeriods.length + 1,
            this.awardResult.award.awardId,
            this.awardResult.award.awardNumber,
            this.awardResult.award.sequenceNumber,
        ));
    }

    deletePeriod(index: number, deleteId: number): void {
        deleteId ? this.deletePeriodAPI(index, deleteId) : this.updateDeletedPeriod(index);
    }

    deletePeriodAPI(index: number, deleteId: number): void {
        this.$subscriptions.push(
            this._anticipatedDistributionService.deleteAnticipatedDistribution(
                deleteId).subscribe((data: any) => {
                    this.updateDeletedPeriod(index);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Anticipated distributed deleted successfully.');
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting anticipated distribution failed. Please try again.');
                }));
    }

    updateDeletedPeriod(index: number): void {
        this.anticipatedPeriods.splice(index, 1);
        this.updatePeriods();
        this.checkDatesValid();
        this.calculateBudgetTotalCost();
    }

    updatePeriods(): void {
        this.anticipatedPeriods.forEach((period: AnticipatedDistributionPeriod, index: number) => {
            period.budgetPeriod = index + 1;
        });
    }

    emitData(): void {
        $('#anticipated-distribution-modal').modal('hide');
        this.closeModal.emit(null);
    }

    setRequest(): AnticipatedDistributionPeriod[] {
        return this.anticipatedPeriods.map((period: AnticipatedDistributionPeriod) => {
            period.startDate = parseDateWithoutTimestamp(period.startDate);
            period.endDate = parseDateWithoutTimestamp(period.endDate);
            return period;
        });
    }

    saveOrUpdateAnticipatedDistribution(): void {
        if (!this.isSaving && this.checkDatesValid()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._anticipatedDistributionService.saveOrUpdateAnticipatedDistribution(
                    this.setRequest()).subscribe((data: AnticipatedDistributionPeriod[]) => {
                        this.anticipatedPeriods = this.convertTimestamp(data);
                        this.calculateBudgetTotalCost();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Anticipated Funding Distribution saved successfully.');
                        this.isSaving = false;
                    }, err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Anticipated Funding Distribution failed. Please try again.');
                        this.isSaving = false;
                    }));
        }
    }

    validatePeriodDates(period: AnticipatedDistributionPeriod, dateType: string): void {
        let date1, date2;
        if (dateType === 'START-DATE') {
            date1 = period.startDate;
            date2 = period.endDate;
        } else {
            date2 = period.startDate;
            date1 = period.endDate;
        }
        const periodsDateObject: PeriodsDate = new PeriodsDate();
        periodsDateObject.period = period.budgetPeriod;
        periodsDateObject.startErrorMessage = periodsDateObject.endErrorMessage = null;
        this.validateWithAwardDates(dateType, periodsDateObject, date1);
        this.checkDateBetweenPeriodDates(dateType, periodsDateObject, date1, date2);
        this.checkDatesOverlapping(periodsDateObject, date1, dateType);
        dateType === 'START-DATE' ? this.setStartDatesWarningMap(periodsDateObject) : this.setEndDatesWarningMap(periodsDateObject);
    }

    validateWithAwardDates(dateType: string, periodsDateObject: PeriodsDate, selectedDate: Date): void {
        if ((compareDates(selectedDate, this.awardStartDate) === -1) || (compareDates(selectedDate, this.awardEndDate) === 1)) {
            if (dateType === 'START-DATE') {
                periodsDateObject.startErrorMessage = '* Choose a Period Start Date between Award Start Date and Award End Date.';
            } else {
                periodsDateObject.endErrorMessage = '* Choose a Period End Date between Award Start Date and Award End Date.';
            }
        }
    }

    checkDateBetweenPeriodDates(dateType: string, periodsDateObject: PeriodsDate, date1: Date, date2: Date): void {
        if (dateType === 'START-DATE' && date2 && (compareDates(date1, date2) === 1)) {
            periodsDateObject.startErrorMessage = '* Choose a Period Start Date before Period End Date.';
        } else if (dateType === 'END-DATE' && date2 && (compareDates(date1, date2) === -1)) {
            periodsDateObject.endErrorMessage = '* Choose a Period End Date after Period Start Date.';
        }
    }

    checkDatesOverlapping(periodsDateObject: PeriodsDate, selectedDate: Date, dateType: string): void {
        // > 1 used because no need to compare overlapping condition for first period
        if (periodsDateObject.period > 1) {
            this.anticipatedPeriods.forEach((element, index) => {
                if (element.startDate && selectedDate && element.endDate &&
                    compareDates(element.startDate, selectedDate) !== 1 && compareDates(element.endDate, selectedDate) !== -1 &&
                    (periodsDateObject.period - 1) !== index) {
                    if (dateType === 'START-DATE') {
                        periodsDateObject.startErrorMessage = '* Period dates can not be overlapped each other.';
                    } else {
                        periodsDateObject.endErrorMessage = '* Period dates can not be overlapped each other.';
                    }
                }
            });
        }
    }

    setStartDatesWarningMap(periodsDateObject: PeriodsDate): void {
        this.startDatesWarningMap[periodsDateObject.period] = periodsDateObject;
        if (!this.startDatesWarningMap[periodsDateObject.period].startErrorMessage &&
            !this.startDatesWarningMap[periodsDateObject.period].endErrorMessage) {
            delete this.startDatesWarningMap[periodsDateObject.period];
        }
    }

    setEndDatesWarningMap(periodsDateObject: PeriodsDate): void {
        this.endDatesWarningMap[periodsDateObject.period] = periodsDateObject;
        if (!this.endDatesWarningMap[periodsDateObject.period].endErrorMessage &&
            !this.endDatesWarningMap[periodsDateObject.period].startErrorMessage) {
            delete this.endDatesWarningMap[periodsDateObject.period];
        }
    }

    calculatePeriodTotalCost(period: AnticipatedDistributionPeriod): void {
        period.totalDirectCost = !period.totalDirectCost ? 0 : convertToValidAmount(period.totalDirectCost);
        period.totalIndirectCost = !period.totalIndirectCost ? 0 : convertToValidAmount(period.totalIndirectCost);
        this.calculateBudgetTotalCost();
    }

    calculateBudgetTotalCost(): void {
        this.totalAmount = new AmountTotals();
        this.calculateTotalAmount();
    }

    calculateTotalAmount(): void {
        this.anticipatedPeriods.forEach(period => {
            this.totalAmount.totalDirectCost += convertToValidAmount(period.totalDirectCost);
            this.totalAmount.totalIndirectCost += convertToValidAmount(period.totalIndirectCost);
            this.totalAmount.totalCost += (convertToValidAmount(period.totalDirectCost) + convertToValidAmount(period.totalIndirectCost));
        });
    }

    inputDigitRestriction(field: any, key: string, index: number = null): void {
        const KEY = index !== null ? key + index : key;
        this.validationMap.delete(KEY);
        if (inputRestrictionForAmountField(field)) {
            this.validationMap.set(KEY, inputRestrictionForAmountField(field));
        }
    }
    /**
   * To check the entire period dates are valid
   */
    checkDatesValid(): boolean {
        this.clearValidations();
        this.anticipatedPeriods.forEach((element, index) => {
            this.validations(element, index);
        });
        return Object.keys(this.startDatesWarningMap).length === 0 &&
            Object.keys(this.endDatesWarningMap).length === 0 && this.validationMap.size === 0;
    }

    clearValidations(): void {
        this.startDatesWarningMap = [];
        this.endDatesWarningMap = [];
        this.validationMap.clear();
    }

    validations(element: AnticipatedDistributionPeriod, index: number): void {
        if (!element.startDate) {
            this.validationMap.set('startDate' + index, 'Enter Start Date');
        }
        if (!element.endDate) {
            this.validationMap.set('endDate' + index, 'Enter End Date');
        }
        if (element.startDate) {
            this.validatePeriodDates(element, 'START-DATE');
        }
        if (element.endDate) {
            this.validatePeriodDates(element, 'END-DATE');
        }
        if (!element.totalDirectCost) {
            this.validationMap.set('directCost' + index, 'Enter Direct Cost');
        }
        if (element.totalDirectCost) {
            this.inputDigitRestriction(element.totalDirectCost, 'directCost', index);
        }
        if (element.totalIndirectCost) {
            this.inputDigitRestriction(element.totalIndirectCost, 'indirectCost', index);
        }
    }
    /**
     * @param  {number} index
     * function adds animation to the delete confirmation
     */
    deleteElement(index: number): void {
        this.cancelPerviousDelete();
        const period = document.getElementById(`period-${index}`);
        period.style.display = 'none';
        const deleteConfirmation = document.getElementById(`delete-confirmation-${index}`);
        deleteConfirmation.style.display = 'table-row';
        deleteConfirmation.classList.add('flip-top');
    }

    cancelPerviousDelete(): void {
        const existingDeleteConfirmation = document.querySelector('.flip-top');
        if (existingDeleteConfirmation) {
            const existingDeleteId = existingDeleteConfirmation.id.split('-');
            this.cancelDeleteElement(parseInt(existingDeleteId[2], 10));
        }
    }
    /**
     * @param  {number} index
     * function adds animation to the delete confirmation on cancelling the delete operation
     */
    cancelDeleteElement(index: number): void {
        const deleteConfirmation = document.getElementById(`delete-confirmation-${index}`);
        deleteConfirmation.style.display = 'none';
        deleteConfirmation.classList.remove('flip-top');
        const period = document.getElementById(`period-${index}`);
        period.style.display = 'table-row';
        period.classList.add('flip-bottom');
    }

}
