import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-proposal-list-by-sponsor',
  templateUrl: './proposal-list-by-sponsor.component.html',
  styleUrls: ['./proposal-list-by-sponsor.component.css'],
  animations: [fadeDown]
})
export class ProposalListBySponsorComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  isShowLoader = false;
  proposalBySponsorData: any = [];
  proposalBySponsorDataHeading: any = [];
  widgetDescription: any;
  totalProposalCount: number;
  currentFY: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(26);
    this.getProposalBySponsorData();
  }

  getProposalBySponsorData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'PROPOSAL_BY_SPONSOR' })
      .subscribe((data: any) => {
        this.proposalBySponsorData = data.widgetDatas || [];
        this.getTotalSubmittedProposal();
        this.currentFY = this._researchSummaryWidgetService.getCurrentFinancialYear();
        // this.proposalBySponsorDataHeading = this.proposalBySponsorData.splice(0, 1)[0];
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  /**
   * {number} the column number or the value the sum should be taken
   */
  getTotalSubmittedProposal(): void {
    this.totalProposalCount = this._researchSummaryWidgetService.getSumOfColumn(this.proposalBySponsorData, 1);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
