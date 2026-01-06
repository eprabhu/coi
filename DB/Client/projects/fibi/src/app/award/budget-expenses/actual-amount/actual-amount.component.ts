import { BudgetDataService } from './../budget-data.service';
import { subscriptionHandler } from './../../../common/utilities/subscription-handler';
import { DEFAULT_DATE_FORMAT } from './../../../app-constants';
import { CommonDataService } from './../../services/common-data.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BudgetService } from '../budget.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { fileDownloader, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp, compareDatesWithoutTimeZone } from '../../../common/utilities/date-utilities';

@Component({
  selector: 'app-actual-amount',
  templateUrl: './actual-amount.component.html',
  styleUrls: ['./actual-amount.component.css']
})
export class ActualAmountComponent implements OnInit, OnDestroy {
  awardBudgetTransactionDetails: any = {};
  $subscriptions: Subscription[] = [];
  internalOrderCode: string[] = [];
  exportDataReqObject: any = {};
  setFocusToElement = setFocusToElement;
  filterpostingdatefrom: null;
  filterpostingdateto: null;
  awardData: any = {};
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  title = '';
  tab: any;
  budgetData: any = {};
  awardId = '';
  isDateValid = true;
  getAllIOCodes: any = [];
  ioCodeList: any = [];
  ioCodeOptions = 'EMPTY#EMPTY#true#true';
  totalExpenses: any = {};

  constructor(private _budgetService: BudgetService, private _activatedRoute: ActivatedRoute,
    public _budgetDataService: BudgetDataService, public _commonService: CommonService,
    private _commonData: CommonDataService, private _router: Router) { }

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
   * onLoad() is the initial loaded function
   * here budget data from the previous componsnt is loaded
   * this function will check if there is data from previous component
   * if data is there this component will work
   * else again redirect to previous one
   * this is done becoz card header is set from the previous component using _budgetDataService
   */
  onLoad() {
    this.getBudgetData();
    if (this.title) {
      this.getAwardGeneralData();
      this.highlightPurchaseExpenseTab();
    } else {
      this.redirectionPath();
    }
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
      this.getOICodes(this.budgetData.budgetData);
      this.ioCodeList = [this.getAllIOCodes.find(element => element.description === this.budgetData.budgetData[index].internalOrderCode)];
      this.internalOrderCode = this.ioCodeList.length ? [this.ioCodeList[0].description] : [];
    }
  }
  /**
   * @param  {} budgetDataArray
   * For preparing the ioCode array from the list
   */
  getOICodes(budgetDataArray) {
    budgetDataArray.forEach((eachData, index) => {
      this.getAllIOCodes.push({ 'code': index + 1, 'description': eachData.internalOrderCode });
    });
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

  /**
   * @param internalOrderCode
   * Used to view transaction details with respect from expenditureToDate column in Award Expense Table and Purchase
   * The transactions are categorised into Actual and Committed Expense.
   */
  viewTransactionDetails() {
    this.$subscriptions.push(this._budgetService.getTransactionDetails({
      'awardNumber': this.awardData.award.awardNumber,
      'accountNumber': this.awardData.award.accountNumber,
      'internalOrderCodes': this.internalOrderCode,
      'actualOrCommittedFlag': 'A',
      'fmPostingStartDate': parseDateWithoutTimestamp(this.filterpostingdatefrom ? this.filterpostingdatefrom : null),
      'fmPostingEndDate': parseDateWithoutTimestamp(this.filterpostingdateto ? this.filterpostingdateto : null),
      'isShowAllTransactions': 'N'
    }).subscribe(
      (data: any) => {
        this.awardBudgetTransactionDetails = data;
        // this.filterActualAmounts();
        if (this.awardBudgetTransactionDetails.expenseTransactions.length) {
          this.calculateTotalAmount(this.awardBudgetTransactionDetails.expenseTransactions);
        }
      }
    ));
  }
  /**
   * sap tracsactions and non-sap transactions are filtered to seperate arrays using isFromSap flag to show heading
  */
  // filterActualAmounts() {
  //   this.awardBudgetTransactionDetails.sapTransactions = this.awardBudgetTransactionDetails.expenseTransactions.filter(amount =>
  //     amount.isFromSap === 'Y');
  //   this.awardBudgetTransactionDetails.nonSapTransactions = this.awardBudgetTransactionDetails.expenseTransactions.filter(amount =>
  //     amount.isFromSap === 'N' || !amount.isFromSap);
  // }

  /**
   * @param
   * based on doctype which is to be exported the particular service is triggered
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
    this.exportDataReqObject.tabHeading = 'Actual Amount of ' + this.internalOrderCode;
    this.exportDataReqObject.awardNumber = this.awardData.award.awardNumber;
    this.exportDataReqObject.isRevenue = 'N';
    this.exportDataReqObject.isExpenseOrPurchase = 'Y';
    this.exportDataReqObject.actualOrCommittedFlag = 'A';
    this.exportDataReqObject.isShowAllTransactions = 'N';
    this.exportDataReqObject.internalOrderCodes = this.internalOrderCode;
    this.exportDataReqObject.accountNumber = this.awardData.award.accountNumber;
    this.exportDataReqObject.awardId = this.awardData.award.awardId;
    this.exportDataReqObject.fmPostingStartDate = parseDateWithoutTimestamp(this.filterpostingdatefrom ? this.filterpostingdatefrom : null);
    this.exportDataReqObject.fmPostingEndDate = parseDateWithoutTimestamp(this.filterpostingdateto ? this.filterpostingdateto : null);
  }

  /**
 * @param  {}
 * to validate from and to date before fetching
 */
  dateValidation() {
    this.isDateValid = true;
    if (this.filterpostingdatefrom && this.filterpostingdateto &&
      compareDatesWithoutTimeZone(this.filterpostingdatefrom, this.filterpostingdateto) === 1) {
      this.isDateValid = false;
    }
  }

  /**
   * @param  {}
   * this function trigeers on focusout of date field
   * first it validates the date then service call is done
   */
  filterTransaticonData() {
      this.dateValidation();
      if (this.isDateValid) {
        this.viewTransactionDetails();
      }
  }

  checkDateValidOrNot(dateValue) {
    if (this.isDateValid && this.checkDateValidOrNot(this.filterpostingdatefrom)
          && this.checkDateValidOrNot(this.filterpostingdateto) ) {
      const from = new Date(dateValue);
      return dateValue && from.getTime() > 0 && from instanceof Date && !isNaN(from.valueOf()) ? true : false;
    } else {
      return true;
    }
  }

  onLookupSelect(data) {
    this.ioCodeList = data;
    this.internalOrderCode = data.length ? data.map(d => d.description) : [];
  }

  calculateTotalAmount(data: any) {
    this.totalExpenses = data.reduce((previousValue, currentValue) => {
      return {
        'amountInFmacurrency': previousValue.amountInFmacurrency + currentValue.amountInFmacurrency,
      };
    });
  }
}
