import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-proposal-list-by-grantcall',
  templateUrl: './proposal-list-by-grantcall.component.html',
  styleUrls: ['./proposal-list-by-grantcall.component.css'],
  animations: [fadeDown]
})
export class ProposalListByGrantcallComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  isShowLoader = false;
  proposalByGrantCallData: any = [];
  proposalByGrantCallDataHeading: any = [];
  widgetDescription: any;
  totalProposalCount: number;
  currentFY: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(28);
    this.getProposalByGrantCallData();
  }

  getProposalByGrantCallData() {
    this.isShowLoader = true;
    this.$subscriptions.push(this._researchSummaryWidgetService.
      getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'PROPOSAL_BY_GRANT_CALL' })
      .subscribe((data: any) => {
        this.proposalByGrantCallData = data.widgetDatas || [];
        this.getTotalSubmittedProposal();
        this.currentFY = this._researchSummaryWidgetService.getCurrentFinancialYear();
        // this.proposalByGrantCallDataHeading = this.proposalByGrantCallData.splice(0, 1)[0];
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  /**
   * {number} is the column number or the value the sum should be taken
   */
   getTotalSubmittedProposal(): void {
    this.totalProposalCount = this._researchSummaryWidgetService.getSumOfColumn(this.proposalByGrantCallData, 1);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
