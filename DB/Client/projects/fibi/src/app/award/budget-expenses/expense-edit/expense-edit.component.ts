import { BudgetDataService } from './../budget-data.service';
/** Last updated by Aravind  on 13-01-2020 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { CommonDataService } from '../../services/common-data.service';
import { BudgetService } from '../budget.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-expense-edit',
  templateUrl: './expense-edit.component.html',
  styleUrls: ['./expense-edit.component.css']
})
export class ExpenseEditComponent implements OnInit, OnDestroy {

  awardBudgetExpenseData: any = [];
  awardBudgetExpense: any = {};
  totalExpenses: any = {};
  awardBudgetTransactionDetails: any = {};
  timeLogDetails: any = {};
  award: any = {};
  modalTitle: any;
  currency: any;
  lastRefreshedDate: any;
  awardExpenseTab: any = 'ACTUAL_EXPENSE';
  committedAmountData: any = [];
  activeIndex: any;
  deleteIndex: any;
  isExpenseEdit = false;
  totalCommittedAmount: any;
  expensePersonDetails: any = [];
  showPersonDetail: any = [];
  groupByCostElementsData: any = [];
  isGroupByCostElements = false;
  $subscriptions: Subscription[] = [];
  result: any = {};
  isViewExpenseTransactions = false;
  budgetExpenseExportData: any = {};
  type: String;
  exportType: String;
  documentHeading: String;
  tab: any;
  isViewPurchaseTransactions = false;
  expensePurchase: any= {
    index : null,
  };

  constructor(public _commonService: CommonService, private _budgetService: BudgetService,
    public _budgetDataService: BudgetDataService, public _commonDataService: CommonDataService) { }

  ngOnInit() {
    this.isExpenseEdit = this._commonDataService.checkDepartmentLevelRightsInArray('MAINTAIN_AWARD_EXPENSES');
    this.isViewExpenseTransactions = this._commonDataService.checkDepartmentLevelRightsInArray('VIEW_EXPENSE_TRANSACTION');
    this.isViewPurchaseTransactions = this._commonDataService.checkDepartmentLevelRightsInArray('VIEW_AWARD_PURCHASE_TRANSACTION');
    this.currency = this._commonService.currencyFormat;
    this.tab = window.location.hash.split(/[/?]/).includes('expensetrack') ? 'E' : 'P';
    this.$subscriptions.push(this._commonDataService.awardData.subscribe((data: any) => {
      if (data) {
        this.award = Object.assign({}, data.award);
        this.loadAwardBudgetExpenseData();
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /* This function will load all data that is need to be shown on table of Award Expense Tracking page
   * and perform total expense calculation for each column in Award Expense Table
   */
  loadAwardBudgetExpenseData() {
    this.$subscriptions.push(this._budgetService.getBudgetExpenseData({
      'awardNumber': this.award.awardNumber,
      'accountNumber': this.award.accountNumber,
      'type': window.location.hash.split(/[/?]/).includes('expensetrack') ? 'E' : 'P'
    }).subscribe(
      (data: any) => {
        if (data) {
          this.result = data;
          this.lastRefreshedDate = data.lastSyncTimestamp;
          if (data.awardExpenseDetailVOs.length > 0) {
            this.awardBudgetExpenseData = data.awardExpenseDetailVOs;
            this.togglePersonDetailFlag();
            this.totalExpenses = this.awardBudgetExpenseData.reduce(function (previousValue, currentValue) {
              return {
                'quantity': previousValue.quantity + currentValue.quantity,
                'originalApprovedBudget': previousValue.originalApprovedBudget + currentValue.originalApprovedBudget,
                'latestApprovedBudget': previousValue.latestApprovedBudget + currentValue.latestApprovedBudget,
                'expenditureToDate': previousValue.expenditureToDate + currentValue.expenditureToDate,
                'updatedCommittedAmount': previousValue.updatedCommittedAmount + currentValue.updatedCommittedAmount,
                'balance': previousValue.balance + currentValue.balance,
                'balanceCommittedBudget': previousValue.balanceCommittedBudget + currentValue.balanceCommittedBudget
              };
            });
            if (this.totalExpenses && this.totalExpenses.expenditureToDate && this.totalExpenses.latestApprovedBudget) {
              this.totalExpenses.utilizationRate = ((this.totalExpenses.expenditureToDate / this.totalExpenses.latestApprovedBudget)* 100).toFixed(2);
            }
          }
        }
      }
    ));
  }

  setContent(index) {
    this._budgetDataService.expensePurchase.index = index;
    this._budgetDataService.expensePurchase.budgetData = this.result.awardExpenseDetailVOs;
  }

  /* According to the return type of this function will display the row 'Total' in the
   * budget expense tracking screen based on which totalExpenses variable contains data or not
   */
  checkTotalExpenses() {
    return Object.entries(this.totalExpenses).length ? true : false;
  }
  /**
   * @param index
   * Used to set title for every modal in Award Expense tracking page in the format
   * Internal Order Code - Line item (Budget category)
   */
  setModalTitle(index) {
    this.modalTitle = this.awardBudgetExpenseData[index].internalOrderCode ?
      this.awardBudgetExpenseData[index].internalOrderCode + ' - ' + this.awardBudgetExpenseData[index].lineItem
      : this.awardBudgetExpenseData[index].lineItem;
  }

  /**
   * This function once called will assign the values to the modal that appears when user clicks on edit
   * (pencil icon) on Committed Budget column of Table
   */
  assignValuesToModal(totalAmount) {
    this.totalCommittedAmount = totalAmount;
    this.awardBudgetExpense = Object.assign({}, this.awardBudgetExpenseData[this.activeIndex]);
    this.$subscriptions.push(this._budgetService.getCommittedAmountList({
      'awardNumber': this.award.awardNumber,
      'accountNumber': this.award.accountNumber,
      'internalOrderCode': this.awardBudgetExpenseData[this.activeIndex].internalOrderCode,

    }).subscribe(
      (data: any) => {
        this.committedAmountData = data.awardExpenseDetailsExts;
        this.awardBudgetExpense.balance = data.balance;
      }
    ));
  }

  /**
    * This function prepares committed budget object where the user enters committed amount from modal and returns that object
    */
  prepareCommittedBudgetObject() {
    const awardCommittedBudget: any = {};
    awardCommittedBudget.accountNumber = this.award.accountNumber;
    awardCommittedBudget.awardNumber = this.award.awardNumber;
    awardCommittedBudget.internalOrderCode = this.awardBudgetExpense.internalOrderCode;
    awardCommittedBudget.balance = this.awardBudgetExpense.balance;
    awardCommittedBudget.description = this.awardBudgetExpense.description;
    awardCommittedBudget.committedAmount = 0;
    awardCommittedBudget.updateUser = this._commonService.getCurrentUserDetail('userName');
    return awardCommittedBudget;
  }

  /**
   * This function saves the committed amount that is entered by user througn the modal
   */
  saveCommittedAmount() {
    if (this.awardBudgetExpense.balance > 0) {
      this.$subscriptions.push(this._budgetService.saveCommittedBudget(this.prepareCommittedBudgetObject()).subscribe(
        (data: any) => {
          this.loadAwardBudgetExpenseData();
          this.awardBudgetExpense = data;
          this.committedAmountData = data.awardExpenseDetailsExts;
          this.totalCommittedAmount = data.updatedCommittedAmount;
          this.awardBudgetExpense.description = '';
        }
      ));
    }
  }

  /**
   * @param internalOrderCode
   * This function displays the time logged by the user based on budget category type code
   */
  viewTimeLogDetails(internalOrderCode) {
    this.$subscriptions.push(this._budgetService.getTimeLogDetails({
      'awardNumber': this.award.awardNumber,
      'accountNumber': this.award.accountNumber,
      'internalOrderCode': internalOrderCode
    }).subscribe(
      (data: any) => {
        this.timeLogDetails = data;
        document.getElementById('view-time-log-modal-btn').click();
      }
    ));
  }

  /**
   * This function deletes transaction from transactions that is shown as list in edit committed budget modal
   */
  deleteTracsactionDetail() {
    this.$subscriptions.push(this._budgetService.deleteAwardExpenseDetailsExtById({
      'awardNumber': this.award.awardNumber,
      'accountNumber': this.award.accountNumber,
      'internalOrderCode': this.committedAmountData[this.deleteIndex].internalOrderCode,
      'awardExpenseDetailsId': this.committedAmountData[this.deleteIndex].awardExpenseDetailsId
    }).subscribe(
      (data: any) => {
        this.committedAmountData = data.awardExpenseDetailsExts;
        this.totalCommittedAmount = data.updatedCommittedAmount;
        this.loadAwardBudgetExpenseData();
        this.awardBudgetExpense = data;
      }
    ));
  }

  loadAwardExpensePersonDetails(expenseDetail) {
    const requestObject = {
      'awardNumber': this.award.awardNumber,
      'accountNumber': this.award.accountNumber,
      'budgetDetailId': expenseDetail.budgetDetailId
    };
    this.$subscriptions.push(this._budgetService.loadAwardExpensePersonDetails(requestObject)
      .subscribe((data: any) => {
        this.expensePersonDetails = data;
      }));
    this.showPersonDetail[expenseDetail.budgetDetailId] = !this.showPersonDetail[expenseDetail.budgetDetailId];
  }

  togglePersonDetailFlag() {
    for (const detail of this.awardBudgetExpenseData) {
      this.showPersonDetail[detail.budgetDetailId] = false;
    }
  }

  groupByCostElements() {
    const requestObject = {
      'awardNumber': this.award.awardNumber, 'accountNumber': this.award.accountNumber,
      'type': window.location.hash.split(/[/?]/).includes('expensetrack') ? 'E' : 'P'
    };
    this.$subscriptions.push(this._budgetService.loadExpenseDetailsBasedOnCostElement(requestObject)
      .subscribe((data: any) => {
        this.groupByCostElementsData = data;
      }));
  }

  fetchExpenseDetails() {
    this.isGroupByCostElements ? this.groupByCostElements() : this.loadAwardBudgetExpenseData();
  }

  /** TO Export Detailed Budget as excel */
   generateExpenseDetailedBudget(exportType) {
    const isExpense = window.location.hash.split(/[/?]/).includes('expensetrack');
    const budgetExportData = {
      'awardNumber': this.award.awardNumber,
      'awardId': this.award.awardId,
      'accountNumber': this.award.accountNumber,
      'type': isExpense ? 'E' : 'P',
      'exportType': exportType,
      'documentHeading': isExpense ? 'Expense Details' : 'Purchase Details'
    };
    this.$subscriptions.push(this._budgetService.generateExpenseDetailedBudget(budgetExportData).subscribe(
      data => {
        const tempData: any = data || {};
        const filename = isExpense ? 'Award_ExpenseDetails_' : 'Award_PurchaseDetails_';
        fileDownloader(data.body, filename + this.award.awardNumber, exportType);
      }));
  }
}
