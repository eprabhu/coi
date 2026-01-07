import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-award-expenditure-by-financial-year',
  templateUrl: './award-expenditure-by-financial-year.component.html',
  styleUrls: ['./award-expenditure-by-financial-year.component.css'],
  animations: [fadeDown]
})
export class AwardExpenditureByFinancialYearComponent implements OnInit, OnDestroy {
  $subscriptions: Subscription[] = [];
  isShowLoader = false;
  AwardExpenditureByFinancialYearData: any = [];
  AwardExpenditureByFinancialYearDataHeading: any = [];
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(19);
    this.getAwardExpenditureByFinancialYearData();
  }

  getAwardExpenditureByFinancialYearData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'AWARD_EXPENDITURE_BY_FINANCIAL_YEAR' })
      .subscribe((data: any) => {
        this.AwardExpenditureByFinancialYearData = data.widgetDatas || [];
        this.AwardExpenditureByFinancialYearDataHeading = this.AwardExpenditureByFinancialYearData.splice(0, 1)[0];
        this.sortBy(0);
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
