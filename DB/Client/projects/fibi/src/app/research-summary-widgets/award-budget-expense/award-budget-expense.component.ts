import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeDown } from '../../common/utilities/animations';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-award-budget-expense',
  templateUrl: './award-budget-expense.component.html',
  styleUrls: ['./award-budget-expense.component.css'],
  animations: [fadeDown]
})
export class AwardBudgetExpenseComponent implements OnInit, OnDestroy {

  isShowLoader = false;
  $subscriptions: Subscription[] = [];
  budgetAwardList: any = [];
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;


  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(10);
    this.fetchAwardData();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * Here the array returns an array which contains 8 elemets which is directly called from array in the html
   * element - 0 is Sponsor Reference Number
   * element - 1 is Project Title
   * element - 2 is Project Start Date
   * element - 3 is Project End Date
   * element - 4 is Budget
   * element - 5 is Expense
   * element - 6 is Balance
   * element - 7 is Utilization
   * element - 8 is Remarks
   * element - 9 is Award Id
   */
  fetchAwardData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget(
      {'tabName' : 'AWARD_BUDGET_AND_EXPENSES'})
      .subscribe((data: any) => {
        this.budgetAwardList = this.setAwardData(data.widgetDatas);
        this.isShowLoader = false;
      },
      err => {
        this.isShowLoader = false;
      }
      ));
  }

  setAwardData(data: any = []) {
    data.map(element => {
      element[1] = this.spliceAwardTitle(element[1]);
    });
    return data;
  }
  /**
   * @param  {string} title
   * splices the title if the length of title is more than 100 characters and adds '...' to indicate that length is spliced
   */
  spliceAwardTitle(title: string) {
    return title.length > 100 ? title.substr(0, 100) + '...' : title;
  }

  openInNewTab(awardId) {
    const url = window.location.origin + window.location.pathname + '#/fibi/award/overview?awardId=' + awardId;
    window.open(url, '_blank');
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

}
