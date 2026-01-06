import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
@Component({
  selector: 'app-claims-submitted-to-sponsor-by-claim-status',
  templateUrl: './claims-submitted-to-sponsor-by-claim-status.component.html',
  styleUrls: ['./claims-submitted-to-sponsor-by-claim-status.component.css'],
  animations: [fadeDown]
})
export class ClaimsSubmittedToSponsorByClaimStatusComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  isShowLoader = false;
  claimsByStatusData: any = [];
  claimsByStatusDataHeading: any = [];
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(16);
    this.getClaimsByStatusData();
  }

  getClaimsByStatusData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'SUBMITTED_CLAIMS_BY_STATUS' })
      .subscribe((data: any) => {
        this.claimsByStatusData = data.widgetDatas || [];
        this.claimsByStatusDataHeading = this.claimsByStatusData.splice(0, 1)[0];
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
