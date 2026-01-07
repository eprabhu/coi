import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-expenditure-by-budget-category-in-months',
  templateUrl: './expenditure-by-budget-category-in-months.component.html',
  styleUrls: ['./expenditure-by-budget-category-in-months.component.css'],
  animations: [fadeDown]
})
export class ExpenditureByBudgetCategoryInMonthsComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  expenseData: any = [];
  tableHeaderData: any = [];
  isShowLoader = false;
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(20);
    this.getExpenditureByCategoryInMonths();
    }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getExpenditureByCategoryInMonths() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'AWARD_EXPENDITURE_BY_CURRENT_YEAR' })
      .subscribe((data: any) => {
        this.expenseData = data.widgetDatas || [];
        this.tableHeaderData = this.expenseData.splice(0, 1)[0];
        this.sortBy(0);
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
}


}
