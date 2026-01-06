import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Subject } from 'rxjs';

import { BudgetService } from './budget.service';
import { getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';
import { WebSocketService } from '../../common/services/web-socket.service';

@Injectable()
export class BudgetDataService {

  constructor(private _budgetService: BudgetService, public webSocket: WebSocketService) { }

  public awardBudgetData = new BehaviorSubject<any>({});
  public awardBudgetPersonData = new BehaviorSubject<any>([]);
  isBudgetPrintTrigger = new Subject();
  isBudgetTabTrigger = new Subject();
  awardBudgetFundType = '';
  budgetData: any = {};
  awardFunds: any = [];
  budgetId = null;
  isInvalidCost = false;
  isBudgetEditable = true;
  isBudgetDatesFilled = true;
  expensePurchase: any = {};
  $budgetHelpText = new BehaviorSubject<any>(null);
  isBudgetPartiallyEditable = false;

  /** Method to set fund type of award budget
   * values will be either 'O'(for OBLIGATED_DISTRIBUTABLE_AMOUNT) or 'A'(for TOTAL_PROJECT_COST) */
  setBudgetFundType(fundType) {
    this.awardBudgetFundType = fundType;
  }

  /** Method to validate total cost against available fund (Total Cost of all line items <= available fund)
   */
  checkTotalCostValidation() {
    this.isInvalidCost = this.budgetData.awardBudgetHeader.availableFund < 0 ? true : false;
  }

  setBudgetId(budgetId) {
    this.budgetId = budgetId;
  }

  setAwardBudgetData(budgetData) {
    this.budgetData = budgetData;
    this.convertDateObject();
    this.awardBudgetData.next(budgetData);
  }

   /**
   * Converting budget start date and date date from time stamp to date object.
   */
  convertDateObject() {
    if (this.budgetData && this.budgetData.awardBudgetHeader) {
      this.budgetData.awardBudgetHeader.startDate = getDateObjectFromTimeStamp(this.budgetData.awardBudgetHeader.startDate);
      this.budgetData.awardBudgetHeader.endDate = getDateObjectFromTimeStamp(this.budgetData.awardBudgetHeader.endDate);
      this.budgetData.awardBudgetHeader.budgetPeriods.map(period => {
        period.startDate = getDateObjectFromTimeStamp(period.startDate);
        period.endDate = getDateObjectFromTimeStamp(period.endDate);
      });
    }
  }

  setAwardBudgetPersonList(awardBudgetPersonData) {
    this.awardBudgetPersonData.next(awardBudgetPersonData);
  }

  setAwardFundData(awardFundData) {
    this.awardFunds = awardFundData;
  }

  setBudgetEditMode(isBudgetEditable) {
    this.isBudgetEditable = isBudgetEditable;
    if (this.isBudgetEditable && !this.webSocket.isLockAvailable('Award' + '#' + this.budgetData.awardId)) {
      this.isBudgetEditable = false;
    }
  }

  /**loads award budget data
   * @param awardId
  */
  loadBudgetByAwardId(awardId) {
    this._budgetService.loadBudgetByAwardId({ 'awardId': awardId, 'awardBudgetId': this.budgetId }).subscribe((data: any) => {
      this.setAwardBudgetData(data);
    });
  }

  checkBudgetDatesFilled(periods = this.budgetData.awardBudgetHeader.budgetPeriods) {
    this.isBudgetDatesFilled = periods.find(period => period.startDate == null || period.endDate == null) ? false : true;
    return this.isBudgetDatesFilled;
  }
}
