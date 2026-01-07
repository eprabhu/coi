import { subscriptionHandler } from './../../../common/utilities/subscription-handler';
import { CommonDataService } from './../../services/common-data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BudgetService } from '../budget.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetDataService } from '../budget-data.service';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-committed-amount',
  templateUrl: './committed-amount.component.html',
  styleUrls: ['./committed-amount.component.css']
})
export class CommittedAmountComponent implements OnInit, OnDestroy {
  awardBudgetTransactionDetails: any = {};
  $subscriptions: Subscription[] = [];
  internalOrderCode: any;
  exportDataReqObject: any = {};
  awardData: any = {};
  title: any;
  tab: any;
  budgetData: any = {};
  totalExpenses: any = {};
  isShowAllTransactions = 'Y';

  constructor(private _budgetService: BudgetService, private _activatedRoute: ActivatedRoute, private route: ActivatedRoute,
    public _budgetDataService: BudgetDataService, private _router: Router,
    public _commonService: CommonService, private _commonData: CommonDataService) { }

  ngOnInit() {
      this.tab = this._activatedRoute.snapshot.queryParamMap.get('tab'),
      this.onLoad();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    this.removeParams();
    this.tab === 'P' ? (document.getElementById('budget-expense-purchase').classList.remove('active')) :
    (document.getElementById('budget-expense-expense-tracking').classList.remove('active'));
  }

  /**
   * @param  {}
   * to remove respective tab name passed in urls
   */
  removeParams() {
    const { tab, ...params } = this._activatedRoute.snapshot.queryParams;
    this._router.navigate([], { queryParams: params });
  }

  /**
   * @param  {}
   * This function is used to set path for redirection
   * used when there is no budget data and back buton is pressed
   * redirection is decided on the basis of tab name in url
   */
  redirectionPath() {
  this.tab === 'P' ?
      this._router.navigate(['/fibi/award/budget-expense/purchase'], { queryParamsHandling: 'merge' }) :
      this._router.navigate(['/fibi/award/budget-expense/expensetrack'], { queryParamsHandling: 'merge' });
  }

  /**
   * @param  {}
   * onLoad() is the initial loaded function
   * here budget data from the previous componsnt is loaded
   * this function will check if there is data from previous component
   * if data is there this component will work
   * else again redirect to previous one
   * this is done becoz card header is set from the previous component using _budgetDataService
   */
  onLoad() {
    this.highlightPurchaseExpenseTab();
    this.getBudgetData();
    if (this.budgetData.index > -1) {
      this.getAwardGeneralData();
    } else {
      this.redirectionPath();
    }
  }

  /**
   * @param
   * to fetch award basic details from commondata
   */
  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data;
        this.viewTransactionDetails();
      }}));
  }

  /**
   * @param  {}
   * to fetch award buget details from previous component through _budgetDataService
   * expensePurchase is used to feed all the details of lineitem in respective component
   * and index of the lineitem selected, this index is used to set the card header
   */
  getBudgetData() {
    this.budgetData = this._budgetDataService.expensePurchase;
    if (this.budgetData.index > -1) {
      const index = this.budgetData.index;
      this.title = this.budgetData.budgetData[index].budgetCategory;
      this.internalOrderCode = this.budgetData.budgetData[index].internalOrderCode;
    }
  }

  /**
   * @param internalOrderCode
   * Used to view transaction details with respect from expenditureToDate column in Award Expense Table.
   * The transactions are categorised into Actual and Committed Expense.
   */
  viewTransactionDetails() {
    this.$subscriptions.push(this._budgetService.getTransactionDetails({
      'awardNumber': this.awardData.award.awardNumber,
      'accountNumber': this.awardData.award.accountNumber,
      'internalOrderCodes': [this.internalOrderCode],
      'actualOrCommittedFlag': 'C',
      'fmPostingStartDate':  null,
      'fmPostingEndDate' : null,
      'isShowAllTransactions': this.isShowAllTransactions
    }).subscribe(
      (data: any) => {
        this.awardBudgetTransactionDetails = data;
        // this.filterCommittedAmounts();
        if (this.awardBudgetTransactionDetails.expenseTransactions.length) {
          this.calculateTotalAmount(this.awardBudgetTransactionDetails.expenseTransactions);
        }
      }));
  }
  calculateTotalAmount(data: any) {
    this.totalExpenses = data.reduce((previousValue, currentValue) => {
      return {
        'amountInFmacurrency': previousValue.amountInFmacurrency + currentValue.amountInFmacurrency,
      };
    });
  }

  /** sap tracsactions and non-sap transactions are filtered to seperate arrays using isFromSap flag to show heading
   * using isFromSap === 'Y' => Committed Expense from SAP
   * using isFromSap === 'N' => Manually entered committed items
  */
  // filterCommittedAmounts() {
  //   this.awardBudgetTransactionDetails.sapTransactions = this.awardBudgetTransactionDetails.expenseTransactions.filter(amount =>
  //     amount.isFromSap === 'Y');
  //   this.awardBudgetTransactionDetails.nonSapTransactions = this.awardBudgetTransactionDetails.expenseTransactions.filter(amount =>
  //     amount.isFromSap === 'N' || !amount.isFromSap);
  // }

  /** Here docType is passed which will be used to classify between which service is to be triggered
  */
  exportcomitted(docType) {
    this.setExportObject();
    const fileName = this.exportDataReqObject.documentHeading;
    if (docType === 'pdf') {
      this._budgetService.generateRevenueExpensePurchasePDFReport(this.exportDataReqObject).subscribe((data: any) => {
        fileDownloader(data, fileName, docType);
      });
    } else {
      this._budgetService.generateRevenueExpensePurchaseExcelReport(this.exportDataReqObject).subscribe((data: any) => {
        fileDownloader(data, fileName, docType);
      });
    }
  }

  /**
   * @param object is set for export
   * since same service is used for revenu and expense
   * isRevenue & isExpenseOrPurchase is used to identify from which tab the request is sended
   */
  setExportObject() {
    this.exportDataReqObject.documentHeading = this.tab === 'P' ? 'Purchase' : 'Expense Tracking';
    this.exportDataReqObject.tabHeading = 'Committed Amount of ' + this.internalOrderCode;
    this.exportDataReqObject.isRevenue = 'N';
    this.exportDataReqObject.isExpenseOrPurchase = 'Y';
    this.exportDataReqObject.actualOrCommittedFlag = 'C';
    this.exportDataReqObject.isShowAllTransactions = this.isShowAllTransactions;
    this.exportDataReqObject.awardNumber = this.awardData.award.awardNumber;
    this.exportDataReqObject.internalOrderCodes = [this.internalOrderCode];
    this.exportDataReqObject.accountNumber = this.awardData.award.accountNumber;
    this.exportDataReqObject.awardId = this.awardData.award.awardId;
    this.exportDataReqObject.fmPostingStartDate = null;
    this.exportDataReqObject.fmPostingEndDate = null;
  }

  /**
   * Used to pass which tab should be highlighted after loading
   * here specific tab unique Id is used
   * here tab variable is used to identify from which tab purchase or expense need to be highlighted
   * since both are redirected from same component
   */
  highlightPurchaseExpenseTab() {
    this.tab === 'P' ? document.getElementById('budget-expense-purchase').classList.add('active') :
      document.getElementById('budget-expense-expense-tracking').classList.add('active');
  }
}
