/**
 * Created on 15-01-2020 by Saranya T Pillai
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscriptionLike as ISubscription, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { CommonDataService } from '../../../services/common-data.service';
import { CommonService } from '../../../../common/services/common.service';
import { BudgetService } from '../../budget.service';
import { BudgetDataService } from '../../budget-data.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { DEFAULT_DATE_FORMAT, AWARD_LABEL } from '../../../../app-constants';
import { setFocusToElement, inputRestrictionForAmountField } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';


@Component({
  selector: 'app-periods-total',
  templateUrl: './periods-total.component.html',
  styleUrls: ['./periods-total.component.css']
})

export class PeriodsTotalComponent implements OnInit, OnDestroy {

  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  awardBudgetData: any = {};
  modalActionObject: any = {
    generatePeriodMsg: null,
    copyPeriodMsg: null,
    isGeneratePeriodError: false,
    deletePeriodNumber: null
  };
  isPeriodsAndTotalEditable = false;
  currentPeriod: any = {};
  copyPeriod: any = {};
  startDatesWarningMap: any = {};
  endDatesWarningMap: any = {};
  isInvalidCost = false;
  saveWarningMsg = null;
  $subscriptions: Subscription[] = [];
  private $periodOperations: ISubscription;
  map = new Map();
  isSaving = false;

  constructor(public _commonDataService: CommonDataService, private _budgetService: BudgetService,
    public _commonService: CommonService, public _budgetDataService: BudgetDataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscribeBudgetData();
    this.periodOperationTriggered();
  }

  subscribeBudgetData() {
    this.$subscriptions.push(this._budgetDataService.awardBudgetData.subscribe((data: any) => {
      this.awardBudgetData = data ? JSON.parse(JSON.stringify(data)) : {};
      if (Object.keys(this.awardBudgetData).length) {
        this.checkPeriodsAndTotalEditable();
        this._budgetDataService.checkTotalCostValidation();
      }
    }));
  }

  convertDates() {
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.map(period => {
      period.startDate = getDateObjectFromTimeStamp(period.startDate);
          period.endDate = getDateObjectFromTimeStamp(period.endDate);
    });
  }

  periodOperationTriggered() {
    this.$periodOperations = this._budgetService.isPeriodOperationsTrigger.subscribe((data: any) => {
      data === 'GENERATE PERIOD' ? this.validateGenerateAwardBudgetPeriod() : this.validateAddPeriod();
    });
  }
  validateAddPeriod() {
    if (!this._commonDataService.isAwardDataChange) {
      document.getElementById('addAwardBudgetPeriodModalBtn').click();
    } else {
      this.saveWarningMsg = 'You have unsaved changes. Save the changes before \'Add Period\'.';
      document.getElementById('awardBudgetDataSaveModalBtn').click();
    }
  }
  /**Periods & Total input fields will be editable when no line items are added in any of the budget periods and
   * when Auto calculate is OFF
   */
  checkPeriodsAndTotalEditable() {
    if (this._budgetDataService.isBudgetEditable) {
      const isPeriodsWithDetails = this.awardBudgetData.awardBudgetHeader.budgetPeriods
        .find(period => period.budgetDetails.length > 0) ? true : false;
      this.isPeriodsAndTotalEditable = !isPeriodsWithDetails && !this.awardBudgetData.awardBudgetHeader.isAutoCalc ? true : false;
    } else {
      this.isPeriodsAndTotalEditable = false;
    }
  }

  addAwardBudgetPeriod() {
    this.$subscriptions.push(this._budgetService.addAwardBudgetPeriod({
      'budgetHeaderId': this.awardBudgetData.awardBudgetHeader.budgetId,
      'userName': this._commonService.getCurrentUserDetail('userName')})
      .subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Period added successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, `Adding ${AWARD_LABEL} Budget Period failed. Please try again.`);
      }));
  }
  /**
   * return true if totalcost exceeds available fund after generate all periods
   */
  checkAvailableFundOnGenerate() {
    this.isInvalidCost = (parseFloat(this.awardBudgetData.awardBudgetHeader.initialAvailableFund) <
      parseFloat(this.awardBudgetData.awardBudgetHeader.totalCost) * this.awardBudgetData.awardBudgetHeader.budgetPeriods.length - 1) ?
      true : false;
    return this.isInvalidCost;
  }
  generateAwardBudgetPeriod() {
    if (this._budgetDataService.checkBudgetDatesFilled() && !this.checkAvailableFundOnGenerate()) {
      const periodWithBudgetDetail = this.awardBudgetData.awardBudgetHeader.budgetPeriods.find(
        period => period.budgetDetails.length > 0);
      const requestObject: any = {
        awardBudgetId: this.awardBudgetData.awardBudgetHeader.budgetId,
        awardId: this.route.snapshot.queryParams['awardId'],
        copyPeriodId: this.awardBudgetData.awardBudgetHeader.budgetPeriods[0].budgetPeriodId,
        isEnabledAwardBudgetDetail: periodWithBudgetDetail ? true : false,
        userName: this._commonService.getCurrentUserDetail('userName')
      };
      this.$subscriptions.push(this._budgetService.generateAwardBudgetPeriods(requestObject).subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this._budgetDataService.checkTotalCostValidation();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Periods generated successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Budget Period failed. Please try again.');
      }));
    }
  }

  validateGenerateAwardBudgetPeriod() {
    if (!this._commonDataService.isAwardDataChange) {
      this.modalActionObject = {};
      const isFirstPeriodEmpty = this.awardBudgetData.awardBudgetHeader.budgetPeriods.find(
        period => period.budgetPeriod === 1 && period.totalCost === 0 && period.budgetDetails.length === 0) ? true : false;
      if (isFirstPeriodEmpty) {
        this.modalActionObject.generatePeriodMsg = 'No line items exists to generate periods.';
        this.modalActionObject.isGeneratePeriodError = true;
      } else {
        const periodWithLineItems = this.awardBudgetData.awardBudgetHeader.budgetPeriods.find(
          period => period.budgetPeriod !== 1 && (period.totalCost > 0 || period.budgetDetails.length > 0));
        if (periodWithLineItems) {
          this.modalActionObject.generatePeriodMsg =
            'Line Item already exists in other periods. Please delete them to proceed with generate period.';
          this.modalActionObject.isGeneratePeriodError = true;
        } else {
          this.modalActionObject.generatePeriodMsg = 'Are you sure you want to generate all periods?';
        }
      }
      document.getElementById('generateAwardBudgetPeriodModalButton').click();
    } else {
      this.saveWarningMsg = 'You have unsaved changes. Save the changes before \'Generate All Periods\'.';
      document.getElementById('awardBudgetDataSaveModalBtn').click();
    }
  }

  triggerCopyBudgetModal(periodObject) {
    if (!this._commonDataService.isAwardDataChange) {
      (this.validateCopyAwardBudget(periodObject)) ?
        document.getElementById('copy-period-modal-button').click() :
        document.getElementById('copy-period-modal-warning-button').click();
    } else {
      this.saveWarningMsg = 'You have unsaved changes. Save the changes before \'Copy Period\'.';
      document.getElementById('awardBudgetDataSaveModalBtn').click();
    }
  }

  validateCopyAwardBudget(periodObject) {
    this.modalActionObject = {};
    this.currentPeriod = periodObject;
    this.copyPeriod = this.awardBudgetData.awardBudgetHeader.budgetPeriods
      .find(period => period.budgetPeriod === this.currentPeriod.budgetPeriod - 1);
    if (this.copyPeriod.totalCost === 0 && this.copyPeriod.budgetDetails.length === 0) {
      this.modalActionObject.copyPeriodMsg = 'No line items exists to copy';
    } else if (this.currentPeriod.totalCost > 0 || this.currentPeriod.budgetDetails.length > 0) {
      this.modalActionObject.copyPeriodMsg = 'Line Item already exists. Please delete them to proceed with copy period.';
    }
    return (this.modalActionObject.copyPeriodMsg ? false : true);
  }
  /**
   * return true if total cost exceeds after copy budget periods
   * to copy period 1 to period 2 double of total cost of period 1's total cost is considered as total cost
   * in other cases to get total cost adding total cost of copying period with total budget cost
   */
  checkAvailableFundOnCopy() {
    if (this.copyPeriod.budgetPeriod !== 1) {
      this.isInvalidCost =
        parseFloat(this.copyPeriod.totalCost) + parseFloat(this.awardBudgetData.awardBudgetHeader.totalCost)
          > parseFloat(this.awardBudgetData.awardBudgetHeader.initialAvailableFund) ? true : false;
    } else {
      this.isInvalidCost = parseFloat(this.copyPeriod.totalCost) * 2 >
        parseFloat(this.awardBudgetData.awardBudgetHeader.initialAvailableFund) ? true : false;
    }
    return this.isInvalidCost;
  }

  copyAwardBudgetPeriod() {
    if (this._budgetDataService.checkBudgetDatesFilled() && !this.checkAvailableFundOnCopy()) {
      const REQUESTOBJECT = {
        awardBudgetId: this.awardBudgetData.awardBudgetHeader.budgetId,
        budgetHeaderId: this.awardBudgetData.awardBudgetHeader.budgetId,
        awardId: this.route.snapshot.queryParams['awardId'],
        copyPeriodId: this.copyPeriod.budgetPeriodId,
        currentPeriodId: this.currentPeriod.budgetPeriodId,
        userName: this._commonService.getCurrentUserDetail('userName')
      };
      this.$subscriptions.push(this._budgetService.copyAwardBudgetPeriod(REQUESTOBJECT)
        .subscribe((data: any) => {
          this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
          this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
          this._budgetDataService.checkTotalCostValidation();
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Period copied successfully.');
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Copying Budget Period failed. Please try again.');
        }));
    }
  }

  validateDeleteBudgetPeriod(periodNumber) {
    this.modalActionObject.deletePeriodNumber = periodNumber;
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.length === 1 ? document.getElementById('deleteBudgetPeriodWarnModalBtn').click() :
      document.getElementById('deleteAwardBudgetPeriodModalBtn').click();
  }

  deleteAwardBudgetPeriod() {
    const deletePeriodId = this.awardBudgetData.awardBudgetHeader.budgetPeriods
      .find(period => period.budgetPeriod === this.modalActionObject.deletePeriodNumber).budgetPeriodId;
    this.$subscriptions.push(this._budgetService.deleteAwardBudgetPeriod({
      'budgetPeriodId': deletePeriodId, 'updateUser': this._commonService.getCurrentUserDetail('userName') })
      .subscribe((data: any) => {
      this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
      this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
      this._budgetDataService.checkBudgetDatesFilled();
      this._budgetDataService.checkTotalCostValidation();
      this.checkDatesValid();
      this._commonDataService.isAwardDataChange = false;
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Period deleted successfully.');
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Budget Period failed. Please try again.');
    }));
  }

  calculatePeriodTotalCost(period) {
    this._commonDataService.isAwardDataChange = true;
    period.totalCost = 0;
    period.totalDirectCost = !period.totalDirectCost ? 0 : parseFloat(period.totalDirectCost);
    period.totalIndirectCost = !period.totalIndirectCost ? 0 : parseFloat(period.totalIndirectCost);
    period.totalCost = period.totalDirectCost + period.totalIndirectCost;
    this.calculateBudgetTotalCost();
  }

  calculateBudgetTotalCost() {
    this.awardBudgetData.awardBudgetHeader.totalDirectCost = 0;
    this.awardBudgetData.awardBudgetHeader.totalIndirectCost = 0;
    this.awardBudgetData.awardBudgetHeader.totalCost = 0;
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.forEach(period => {
      this.awardBudgetData.awardBudgetHeader.totalDirectCost += period.totalDirectCost;
      this.awardBudgetData.awardBudgetHeader.totalIndirectCost += period.totalIndirectCost;
      this.awardBudgetData.awardBudgetHeader.totalCost += period.totalCost;
    });
  }

  setDateFormatWithoutTimeStamp() {
    this.awardBudgetData.awardBudgetHeader.startDate = parseDateWithoutTimestamp(this.awardBudgetData.awardBudgetHeader.startDate);
    this.awardBudgetData.awardBudgetHeader.endDate = parseDateWithoutTimestamp(this.awardBudgetData.awardBudgetHeader.endDate);
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.forEach(period => {
    period.startDate = parseDateWithoutTimestamp(period.startDate);
    period.endDate = parseDateWithoutTimestamp(period.endDate);
    });
  }
  savePeriodsAndTotalData() {
    this._budgetDataService.isInvalidCost =
      this.awardBudgetData.awardBudgetHeader.totalCost > this.awardBudgetData.awardBudgetHeader.initialAvailableFund ? true : false;
    if (!this._budgetDataService.isInvalidCost && this.checkDatesValid() &&
      this._budgetDataService.checkBudgetDatesFilled(this.awardBudgetData.awardBudgetHeader.budgetPeriods) && !this.isSaving) {
      this.isSaving = true;
      const requestObject = {
        'period': this.awardBudgetData.awardBudgetHeader.budgetPeriods,
        'budgetId': this.awardBudgetData.awardBudgetHeader.budgetId,
        'updateUser': this._commonService.getCurrentUserDetail('userName')
      };
      this.setDateFormatWithoutTimeStamp();
      this.$subscriptions.push(
        this._budgetService.saveOrUpdateAwardBudgetPeriod(requestObject).subscribe((data: any) => {
          /**Only available fund is updated after save call since all other costs are calculated & displayed
           * need to fetch saved values only on loading budget*/
          this.awardBudgetData.awardBudgetHeader.availableFund = data.availableFund;
          this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
          this._commonDataService.isAwardDataChange = false;
          this._budgetDataService.isBudgetDatesFilled = true;
          this.isInvalidCost = false;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, `${AWARD_LABEL} Budget saved successfully.`);
          this.isSaving = false;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Saving ${AWARD_LABEL} Budget failed. Please try again.`);
          this.isSaving = false;
        }));
    }
  }

  /**
   * To check the entire period dates are valid
   */
  checkDatesValid() {
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.forEach(element => {
      if (element.totalDirectCost) {
        this.inputDigitRestriction(element.totalDirectCost, 'directCost');
      }
      if (element.totalIndirectCost) {
        this.inputDigitRestriction(element.totalIndirectCost, 'indirectCost');
      }
      if (element.startDate) { this.validatePeriodDates(element, 'STARTDATE'); }
      if (element.endDate) { this.validatePeriodDates(element, 'ENDDATE'); }
    });
    return Object.keys(this.startDatesWarningMap).length === 0 &&
      Object.keys(this.endDatesWarningMap).length === 0 ? true : false;
  }

  inputDigitRestriction(field: any,  key: string, index: number = null) {
    const KEY = index !== null ? key + index : key;
    this.map.delete(KEY);
    if (inputRestrictionForAmountField(field)) {
      this.map.set(KEY, inputRestrictionForAmountField(field));
    }
  }

  validatePeriodDates(period, dateType) {
    let date1, date2;
    if (dateType === 'STARTDATE') {
      date1 = period.startDate;
      date2 = period.endDate;
    } else {
      date2 = period.startDate;
      date1 = period.endDate;
    }
    const periodsDateObject: any = {};
    this._commonDataService.isAwardDataChange = true;
    periodsDateObject.period = period.budgetPeriod;
    periodsDateObject.startErrorMessage = periodsDateObject.endErrorMessage = null;
    this.checkDateBetweenBudgetDates(dateType, periodsDateObject, date1);
    this.checkDateBetweenPeriodDates(dateType, periodsDateObject, date1, date2);
    this.checkDatesOverlapping(periodsDateObject, date1, dateType);
    dateType === 'STARTDATE' ? this.setStartDatesWarningMap(periodsDateObject) : this.setEndDatesWarningMap(periodsDateObject);
  }

  checkDateBetweenBudgetDates(dateType, periodsDateObject, selectedDate) {
  if ((compareDates(selectedDate, this.awardBudgetData.awardBudgetHeader.startDate) === -1) ||
      (compareDates(selectedDate, this.awardBudgetData.awardBudgetHeader.endDate) === 1)) {
      if (dateType === 'STARTDATE') {
        periodsDateObject.startErrorMessage = '* Choose a Period Start Date between Budget Start Date and Budget End Date.';
      } else {
        periodsDateObject.endErrorMessage = '* Choose a Period End Date between Budget Start Date and Budget End Date.';
      }
    }
  }

  checkDateBetweenPeriodDates(dateType, periodsDateObject, date1, date2) {
    if (dateType === 'STARTDATE' && date2 && (compareDates(date1, date2) === 1)) {
      periodsDateObject.startErrorMessage = '* Choose a Period Start Date before Period End Date.';
    } else if (dateType === 'ENDDATE' && date2 && (compareDates(date1, date2) === -1)) {
      periodsDateObject.endErrorMessage = '* Choose a Period End Date after Period Start Date.';
    }
  }

  checkDatesOverlapping(periodsDateObject, date1, dateType) {
    // > 1 used because no need to compare overlapping condition for first period
    if (periodsDateObject.period > 1) {
      this.awardBudgetData.awardBudgetHeader.budgetPeriods.forEach((element, index) => {
        if ((compareDates(element.startDate, date1) === 0 || compareDates(element.startDate, date1) === -1) &&
          (compareDates(element.endDate, date1) === 0 || compareDates(element.endDate, date1) === 1) &&
          (periodsDateObject.period - 1) !== index) {
          dateType === 'STARTDATE' ? periodsDateObject.startErrorMessage = '* Period dates can not be overlapped each other.' :
            periodsDateObject.endErrorMessage = '* Period dates can not be overlapped each other.';
        }
      });
    }
  }

  setStartDatesWarningMap(periodsDateObject) {
    this.startDatesWarningMap[periodsDateObject.period] = periodsDateObject;
    if (!this.startDatesWarningMap[periodsDateObject.period].startErrorMessage &&
      !this.startDatesWarningMap[periodsDateObject.period].endErrorMessage) {
      delete this.startDatesWarningMap[periodsDateObject.period];
    }
  }

  setEndDatesWarningMap(periodsDateObject) {
    this.endDatesWarningMap[periodsDateObject.period] = periodsDateObject;
    if (!this.endDatesWarningMap[periodsDateObject.period].endErrorMessage &&
      !this.endDatesWarningMap[periodsDateObject.period].startErrorMessage) {
      delete this.endDatesWarningMap[periodsDateObject.period];
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    if (this.$periodOperations) {
      this.$periodOperations.unsubscribe();
    }
    this._budgetDataService.isBudgetDatesFilled = true;
  }
}
