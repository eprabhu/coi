import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fadeDown } from '../../common/utilities/animations';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-institute-proposal-by-sponsor',
  templateUrl: './institute-proposal-by-sponsor.component.html',
  styleUrls: ['./institute-proposal-by-sponsor.component.css'],
  animations: [fadeDown]
})
export class InstituteProposalBySponsorComponent implements OnInit {

  column: number;
  direction: number;
  isDesc: boolean;
  totalPendingCount: number = 0;
  totalNotFundedCount: number = 0;
  totalFundedCount: number = 0;
  totalWithdrawnCount: number = 0;
  widgetDescription: any;
  currentFY: any;
  submittedBySponsor: any = [];
  $subscriptions: Subscription[] = [];
  isShowLoader = false;

  constructor(private _researchSummaryWidgetService: ResearchSummaryWidgetsService, private _router: Router,) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(35);
    this.currentFY = this._researchSummaryWidgetService.getCurrentFinancialYear();
    this.getSponsorDetails();
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  getSponsorDetails() {
    this.isShowLoader = true;
    this.$subscriptions.push(
      this._researchSummaryWidgetService.getResearchSummaryDatasByWidget({ unitNumber: null, tabName: 'INSTITUTE_PROPOSAL_BY_SPONSOR' }).subscribe((res: any) => {
        this.submittedBySponsor = res.widgetDatas || [];
        this.getTotalCountOfSponsorDetails();
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  getDetailsIpDetails(viewDetails, tabName, noOfCount) {
    if (noOfCount !== null) {
      this._router.navigate(['/fibi/expanded-widgets/ip-by-sponsored'],
        {
          queryParams: {
            sponsorName: viewDetails[0],
            tabName: tabName,
            sponsorNumber: viewDetails[5]
          }
        });
    }
  }

  getTotalCountOfSponsorDetails() {
    this.totalPendingCount = this._researchSummaryWidgetService.getSumOfColumn(this.submittedBySponsor,1);
    this.totalNotFundedCount = this._researchSummaryWidgetService.getSumOfColumn(this.submittedBySponsor,2);
    this.totalFundedCount = this._researchSummaryWidgetService.getSumOfColumn(this.submittedBySponsor,3);
    this.totalWithdrawnCount = this._researchSummaryWidgetService.getSumOfColumn(this.submittedBySponsor,4)
  }

  ngOnDestroy(){
    subscriptionHandler(this.$subscriptions)
  }
}
