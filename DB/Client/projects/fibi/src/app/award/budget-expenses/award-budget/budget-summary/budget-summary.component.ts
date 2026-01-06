import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BudgetService } from '../../budget.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { BudgetDataService } from '../../budget-data.service';
import { CommonService } from '../../../../common/services/common.service';

@Component({
  selector: 'app-budget-summary',
  templateUrl: './budget-summary.component.html',
  styleUrls: ['./budget-summary.component.css']
})
export class BudgetSummaryComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  awardBudgetData: any = {};
  budgetSummaryDetails: any = {};
  helpText: any = {};

  constructor(public _budgetService: BudgetService, public _budgetDataService: BudgetDataService,
      public _commonService: CommonService) { }

  ngOnInit() {
    this.subscribeBudgetData();
    this.fetchHelpText();
  }
  subscribeBudgetData() {
    this.$subscriptions.push(this._budgetDataService.awardBudgetData.subscribe((data: any) => {
      this.awardBudgetData = Object.assign({}, data);
      (this.awardBudgetData.awardBudgetHeader) ? this.fetchAwardBudgetSummaryTable() : ' ';
    }));
  }
  fetchHelpText() {
    this.$subscriptions.push(this._budgetDataService.$budgetHelpText.subscribe((data: any) => {
      this.helpText = data;
    }));
  }
  fetchAwardBudgetSummaryTable() {
    this.$subscriptions.push(
      this._budgetService.fetchAwardBudgetSummaryTable({ 'awardBudgetId': this.awardBudgetData.awardBudgetHeader.budgetId  })
      .subscribe((data: any) => {
        this.budgetSummaryDetails = data;
        this.budgetSummaryDetails.budgetPeriodSummaries = this.sortBudgetData(this.budgetSummaryDetails.budgetPeriodSummaries);
    }));
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * To sort the budget data
   */
  sortBudgetData(budgetData) {
    return budgetData.sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    });
  }
}
