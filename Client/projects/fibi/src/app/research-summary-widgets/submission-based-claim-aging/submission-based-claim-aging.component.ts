import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-submission-based-claim-aging',
  templateUrl: './submission-based-claim-aging.component.html',
  styleUrls: ['./submission-based-claim-aging.component.css'],
  animations: [fadeDown]
})
export class SubmissionBasedClaimAgingComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  claimData: any = [];
  claimsHeaderData: any = [];
  isShowLoader = false;
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(18);
    this.getSubmissionBasedClaimData();
  }

  getSubmissionBasedClaimData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService
      .getResearchSummaryDatasByWidget({ tabName: 'SUBMISSION_BASED_CLAIM_AGE' }).subscribe((data: any) => {
        this.isShowLoader = false;
        this.claimData = data.widgetDatas;
        this.claimsHeaderData = this.claimData.splice(0, 1)[0];
      },
        err => { this.isShowLoader = false; }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
