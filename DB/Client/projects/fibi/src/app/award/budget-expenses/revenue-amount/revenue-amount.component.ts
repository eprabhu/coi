import { BudgetDataService } from './../budget-data.service';
import { DEFAULT_DATE_FORMAT } from './../../../app-constants';
import { CommonService } from './../../../common/services/common.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BudgetService } from '../budget.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { fileDownloader, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { CommonDataService } from '../../services/common-data.service';
import { parseDateWithoutTimestamp, compareDatesWithoutTimeZone } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-revenue-amount',
  templateUrl: './revenue-amount.component.html',
  styleUrls: ['./revenue-amount.component.css']
})
export class RevenueAmountComponent implements OnInit, OnDestroy {
  awardBudgetRevenueDetails: any[];
  $subscriptions: Subscription[] = [];
  awardId: any;
  internalOrderCode: Array<string> = [];
  filterpostingdatefrom: 'null';
  filterpostingdateto: 'null';
  awardData: any = {};
  instanceof: any;
  setFocusToElement = setFocusToElement;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  exportDataReqObject: any = {
    documentHeading: 'Revenue Details',
    awardNumber: null,
    internalOrderCode: null,
    accountNumber: null,
  };
  title: any;
  budgetData: any = {};
  isDateValid = true;
  IOCodes: any = [];
  selectedIOCodes: any = [];
  ioCodeOptions = 'EMPTY#EMPTY#true#true';
  totalExpenses: any = {};

  constructor(private _budgetService: BudgetService, private _activatedRoute: ActivatedRoute,
    public _budgetDataService: BudgetDataService, private _router: Router,
    public _commonService: CommonService, private _commonData: CommonDataService) { }

  ngOnInit() {
    this.onLoad();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    document.getElementById('budget-expense-revenue').classList.remove('active');
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
    this.highlightRevenueTab();
    this.getBudgetData();
    if (this.budgetData.index > -1) {
      this.getAwardGeneralData();
    } else {
      this.redirectionPath();
    }
  }
  /**
   * @param
   * to redirect the component to previous page
   * used for back button and when there is no data
   */
  redirectionPath() {
    this._router.navigate(['/fibi/award/budget-expense/revenue'], { queryParamsHandling: 'merge' });
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
      }
    }));
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
      this.selectedIOCodes = [this.IOCodes[index]];
      this.internalOrderCode = [this.IOCodes[index].description];
    }
  }
  /**
   * @param  {} budgetDataArray
   * For preparing the ioCode array from the list
   */
  getOICodes(budgetDataArray) {
    budgetDataArray.forEach((eachData, index) => {
      this.IOCodes.push({ 'code': index + 1, 'description': eachData.internalOrderCode });
    });
  }
  /**
  * @param internalOrderCode
  * Used to view transaction details with respect from totalRevenueAmount column in Award Revenue Table.
  */
  viewTransactionDetails() {
    this.$subscriptions.push(this._budgetService.getRevenueTransactionDetails({
      'awardNumber': this.awardData.award.awardNumber,
      'accountNumber': this.awardData.award.accountNumber,
      'internalOrderCodes': this.internalOrderCode,
      'fiPostingStartDate': parseDateWithoutTimestamp(this.filterpostingdatefrom ? this.filterpostingdatefrom : null),
      'fiPostingEndDate': parseDateWithoutTimestamp(this.filterpostingdateto ? this.filterpostingdateto : null),
    }).subscribe((data: any) => {
      this.awardBudgetRevenueDetails = data;
      if (this.awardBudgetRevenueDetails.length) {
        this.calculateTotalAmount(this.awardBudgetRevenueDetails);
      }
    }));
  }

  calculateTotalAmount(data: any) {
    this.totalExpenses = data.reduce((previousValue, currentValue) => {
      return {
        'amountInFmaCurrency': previousValue.amountInFmaCurrency + currentValue.amountInFmaCurrency,
      };
    });
  }

  /**
   * Used to pass which tab should be highlighted after loading
   * here specific tab unique Id is used
   */
  highlightRevenueTab() {
    document.getElementById('budget-expense-revenue').classList.add('active');
  }

  /**
   * @param  {} docType
   * here based in doc type which service us to be triggered is determined
   */
  exportrevenue(docType) {
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
   * @param
   * exportDataReqObject is setted to pass exportdetails
   */
  setExportObject() {
    this.exportDataReqObject.documentHeading = 'Revenue';
    this.exportDataReqObject.tabHeading = 'Revenue Amount of ' + this.internalOrderCode + '-' + this.title;
    this.exportDataReqObject.isRevenue = 'Y';
    this.exportDataReqObject.isExpenseOrPurchase = 'N';
    this.exportDataReqObject.actualOrCommittedFlag = null;
    this.exportDataReqObject.awardNumber = this.awardData.award.awardNumber;
    this.exportDataReqObject.internalOrderCodes = this.internalOrderCode;
    this.exportDataReqObject.accountNumber = this.awardData.award.accountNumber;
    this.exportDataReqObject.awardId = this.awardData.award.awardId;
    this.exportDataReqObject.fiPostingStartDate = parseDateWithoutTimestamp(this.filterpostingdatefrom ? this.filterpostingdatefrom : null);
    this.exportDataReqObject.fiPostingEndDate = parseDateWithoutTimestamp(this.filterpostingdateto ? this.filterpostingdateto : null);
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
  checkDateValidOrNot(dateValue) {
    if (dateValue) {
      const from = new Date(dateValue);
      return dateValue && from.getTime() > 0 && from instanceof Date && !isNaN(from.valueOf()) ? true : false;
    } else {
      return true;
    }
  }
  /**
   * @param  {}
   * this function trigeers on focusout of date field
   * first it validates the date then service call is done
   */
  filterRevenueData() {
    this.dateValidation();
    if (this.isDateValid && this.checkDateValidOrNot(this.filterpostingdatefrom)
      && this.checkDateValidOrNot(this.filterpostingdateto)) {
      if (this.internalOrderCode.length) {
        this.viewTransactionDetails();
      } else {
        this.awardBudgetRevenueDetails = [];
      }
    }
  }

  onLookupSelect(data) {
    this.internalOrderCode = data.length ? data.map(d => d.description) : [];
  }
}
