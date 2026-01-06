import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonService } from '../../../../common/services/common.service';
import { BudgetService } from '../../budget.service';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

declare var $: any;

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.css']
})
export class PersonDetailsComponent implements OnInit, OnDestroy {

  @Input() awardExpensePersonVOs: any = [];
  @Input() awardData: any = {};
  @Input() isExpenseEdit = false;
  @Output() onSavePersonCommittedAmount = new EventEmitter<any>();
  awardBudgetPersonTransactionDetails: any = {};
  currencyFormatter;
  setFocusToElement = setFocusToElement;
  awardExpenseTab: any = 'ACTUAL_EXPENSE';
  modalTitle = null;
  totalCommittedAmount: any;
  awardBudgetExpense: any = {};
  committedAmountData: any;
  deleteIndex = null;
  $subscriptions: Subscription[] = [];

  constructor(private _commonService: CommonService, private _budgetService: BudgetService) { }

  ngOnInit() {
    this.currencyFormatter = this._commonService.currencyFormat;
  }

  /**
   * @param index
   * Used to set title for every modal in Award Expense tracking page in the format
   * Internal Order Code - Line item (Budget category)
   */
  setModalTitle(personDetail) {
    this.modalTitle = personDetail.internalOrderCode + ' - ' + personDetail.lineItem + ' (' + personDetail.personName + ')';
  }

  fetchTransactionDetails(internalOrderCode, type) {
    this.$subscriptions.push(this._budgetService.getTransactionDetails({
      'awardNumber': this.awardData.awardNumber,
      'internalOrderCode': internalOrderCode,
      'accountNumber': this.awardData.accountNumber,
      'actualOrCommittedFlag': type
    }).subscribe(
      (data: any) => {
        this.awardBudgetPersonTransactionDetails = data;
        this.filterCommittedAmounts();
      }
    ));
  }

  /** sap tracsactions and non-sap transactions are filtered to seperate arrays using isFromSap flag to show heading in modal
  */
  filterCommittedAmounts() {
    this.awardBudgetPersonTransactionDetails.sapTransactions = this.awardBudgetPersonTransactionDetails.expenseTransactions
                                                            .filter( amount => amount.isFromSap === 'Y');
    this.awardBudgetPersonTransactionDetails.nonSapTransactions = this.awardBudgetPersonTransactionDetails.expenseTransactions
                                                            .filter( amount => amount.isFromSap === 'N' || !amount.isFromSap);
  }

  /**
   * This function once called will assign the values to the modal that appears when user clicks on edit
   * (pencil icon) on Committed Budget column of persons Table
   */
  assignValuesToModal(totalAmount, personDetail) {
    this.totalCommittedAmount = totalAmount;
    this.awardBudgetExpense = Object.assign({}, personDetail);
    this.$subscriptions.push(this._budgetService.getCommittedAmountList({
      'awardNumber': this.awardData.awardNumber,
      'accountNumber': this.awardData.accountNumber,
      'internalOrderCode': personDetail.internalOrderCode,
    }).subscribe(
      (data: any) => {
        this.committedAmountData = data.awardExpenseDetailsExts;
        this.awardBudgetExpense.balance = data.balance;
      }
    ));
  }

  /**
   * This function saves the person's committed amount that is entered by user througn the modal
   */
  savePersonCommittedAmount() {
    document.getElementById('person-comitted-amt-edit-close-btn').click();
    if (this.awardBudgetExpense.balance > 0) {
      this.$subscriptions.push(this._budgetService.saveCommittedBudget(this.prepareCommittedBudgetObject()).subscribe(
        (data: any) => {
          this.onSavePersonCommittedAmount.emit();
          this.awardBudgetExpense = data;
          this.committedAmountData = data.awardExpenseDetailsExts;
          this.totalCommittedAmount = data.updatedCommittedAmount;
          this.awardBudgetExpense.description = '';
        }
      ));
    }
  }

  prepareCommittedBudgetObject() {
    const awardCommittedBudget: any = {};
    awardCommittedBudget.accountNumber = this.awardData.accountNumber;
    awardCommittedBudget.awardNumber = this.awardData.awardNumber;
    awardCommittedBudget.internalOrderCode = this.awardBudgetExpense.internalOrderCode;
    awardCommittedBudget.balance = this.awardBudgetExpense.balance;
    awardCommittedBudget.description = this.awardBudgetExpense.description;
    awardCommittedBudget.committedAmount = 0;
    awardCommittedBudget.updateUser = this._commonService.getCurrentUserDetail('userName');
    return awardCommittedBudget;
  }

  /**
   * This function deletes transaction from transactions that is shown as list in edit committed budget modal
   */
  deletePersonTransactionDetail() {
    this.$subscriptions.push(this._budgetService.deleteAwardExpenseDetailsExtById({
      'awardNumber': this.awardData.awardNumber,
      'accountNumber': this.awardData.accountNumber,
      'internalOrderCode': this.committedAmountData[this.deleteIndex].internalOrderCode,
      'awardExpenseDetailsId': this.committedAmountData[this.deleteIndex].awardExpenseDetailsId
    }).subscribe(
      (data: any) => {
        this.committedAmountData = data.awardExpenseDetailsExts;
        this.totalCommittedAmount = data.updatedCommittedAmount;
        this.onSavePersonCommittedAmount.emit();
        this.awardBudgetExpense = data;
        $('#deletePersonTransactionModal').modal('hide');
        $('#editPersonCommittedBudget').modal('hide');
      }
    ));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
