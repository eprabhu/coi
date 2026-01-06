import { CommonDataService } from '../../services/common-data.service';
import { BudgetSummaryService } from './budget-summary.service';
import { CommonService } from '../../../common/services/common.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { ActivatedRoute } from '@angular/router';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';
import { AWARD_LABEL } from '../../../app-constants';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-budget-summary',
  templateUrl: './budget-summary.component.html',
  styleUrls: ['./budget-summary.component.css']
})
export class BudgetSummaryComponent implements OnInit {

  currency: string;
  selectedYear: any = {};
  $subscriptions: Subscription[] = [];
  budgetResponses: any = {};
  result: any = {};
  years = [];
  total: any = {
    budget: 0,
    actual: 0,
    commitment: 0,
    fundAvailable: 0
  };

  constructor(public _commonService: CommonService, public _budgetService: BudgetSummaryService,
    public _commonData: CommonDataService, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
    this.getAwardGeneralData();
  }
  
  /**
   * fetch service Project number given is Award account number
   * on initial load data with current year is loaded
   */
  loadData() : void{
    this.$subscriptions.push(this._budgetService.fetchBudgetAPIData({
      "projectNumber": this.result.award.accountNumber,
      "year": this.selectedYear
    }).subscribe((data: any) => {
      this.budgetResponses = data;
      this.getTotal();
    }));
  }
  /**
   * This method loads the year dropdown
   * Year dropdown should contains years between(including) award start and end year
   * During inital load current year is selected year
   * if the dropdown doesn't contain current year then from years list 0th index will be selected year
   */
  getYearList() : void {
    const BEGIN_YEAR = (getDateObjectFromTimeStamp(this.result.award.beginDate)).getFullYear();
    const END_YEAR = (getDateObjectFromTimeStamp(this.result.award.finalExpirationDate)).getFullYear();
    if (BEGIN_YEAR === END_YEAR) {
      this.years.push(BEGIN_YEAR);
    } else {
      for (let index = BEGIN_YEAR; index <= END_YEAR; index++) {
        this.years.push(index);
      }
    }
    this.selectedYear = this.years.find(year => year === (new Date().getFullYear())) ? (new Date().getFullYear()) : this.years[0];
  }

  getAwardGeneralData() : void {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getYearList();
        this.loadData();
      }
    }));
  }

  /**
   * This method gives Total of each individual amount
   * Used to display in UI total section section
   */
  getTotal() : void{
    if(this.budgetResponses.budgetAPIResponses){
    this.total = this.budgetResponses.budgetAPIResponses.reduce(function(previousValue, currentValue){
      return {
      'budget' : previousValue.budget + currentValue.budget,
      'actual' : previousValue.actual + currentValue.actual,
      'commitment' : previousValue.commitment + currentValue.commitment,
      'fundAvailable' : previousValue.fundAvailable + currentValue.fundAvailable,
    };
  })}
  }

  exportAsTypeDoc(type) : void{
    const FILENAME = `${AWARD_LABEL} Budget Summary-_ ${this.result.award.title}`;
    this.$subscriptions.push(this._budgetService.generateAwardBudgetIntegrationReport({
      "projectNumber": this.result.award.accountNumber,
      "awardId": this._activatedRoute.snapshot.queryParamMap.get('awardId'),
      "year": this.selectedYear,
      "exportType": type
    }).subscribe((data: any) => {
      fileDownloader(data.body, FILENAME, type);
    }));
  }

}
