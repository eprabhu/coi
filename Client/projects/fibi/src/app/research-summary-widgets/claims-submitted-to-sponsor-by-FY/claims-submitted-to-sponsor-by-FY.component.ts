import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-claims-submitted-to-sponsor-by-FY',
  templateUrl: './claims-submitted-to-sponsor-by-FY.component.html',
  styleUrls: ['./claims-submitted-to-sponsor-by-FY.component.css'],
  animations: [fadeDown]
})
export class ClaimsSubmittedToSponsorByFYComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  claimsData: any = [];
  isShowLoader = false;
  claimsHeaderData: any = [];
  widgetDescription: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryConfigService: ResearchSummaryConfigService,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(14);
    this.getClaimsData();
  }

  getClaimsData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'SUBMITTED_CLAIMS_IN_LAST_THREE_YEAR' })
      .subscribe((data: any) => {
        this.claimsData = data.widgetDatas || [];
        this.claimsHeaderData = this.claimsData.splice(0, 1)[0];
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
