import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-recent-awards',
  templateUrl: './recent-awards.component.html',
  styleUrls: ['./recent-awards.component.css'],
  animations: [fadeDown]
})
export class RecentAwardsComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  recentAwards: any = [];
  isShowLoader = false;
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(11);
    this.getRecentAwards();
  }

  getRecentAwards() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'RECENT_AWARDS' })
      .subscribe((data: any) => {
        this.recentAwards = data.widgetDatas || [];
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  openInNewTab(awardId) {
    const url = window.location.origin + window.location.pathname + '#/fibi/award/overview?awardId=' + awardId;
    window.open(url, '_blank');
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
