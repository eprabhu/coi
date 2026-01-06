import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
  selector: 'app-inprogress-proposal-expaned-view',
  templateUrl: './inprogress-proposal-expaned-view.component.html',
  styleUrls: ['./inprogress-proposal-expaned-view.component.css']
})
export class InprogressProposalExpanedViewComponent implements OnInit, OnDestroy {

  serviceRequestResult: any = [];
  $subscriptions: Subscription[] = [];
  departmentUnitNumber = null;
  heading = null;
  column: number;
  direction: number = -1;
  isDesc: boolean;
  descentFlag = null;
  sponsorCode: string;

  constructor(private _expandedWidgetsService: ExpandedWidgetsService,
    private _route: ActivatedRoute, public _commonService: CommonService,
    private _router: Router) { }

  ngOnInit() {
    this.heading = this._route.snapshot.queryParamMap.get('donutProposalHeading');
    this.departmentUnitNumber =  this._route.snapshot.queryParamMap.get('UN');
    this.descentFlag = this._route.snapshot.queryParamMap.get('DF');
    this.loadDonutChartDataByType();
  }

  loadDonutChartDataByType() {
    const sponsorType = this._route.snapshot.queryParamMap.get('sponsorCode');
    this.sponsorCode = sponsorType !== 'Other' ? `'${sponsorType}'` : sessionStorage.getItem('proposalBySponsorOther');
    const REQUEST_DATA = {
      property1: this.sponsorCode,
      tabName: 'INPROGRESS_PROPOSALS_BY_SPONSOR',
      unitNumber: this.departmentUnitNumber,
      descentFlag: this.descentFlag
    };
    this.$subscriptions.push(this._expandedWidgetsService.getDetailedViewOfWidget(REQUEST_DATA).subscribe(
      (data: any) => {
        this.serviceRequestResult = data.widgetDatas || [];
      }));
  }

  exportAsTypeDoc(docType) {
    const REQUEST_DATA = {
      researchSummaryIndex: 'INPROGRESS_PROPOSALS_BY_SPONSOR',
      documentHeading: this.heading,
      exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
      property1: this.sponsorCode,
      unitNumber: this.departmentUnitNumber,
      descentFlag: this.descentFlag
    };
    this.$subscriptions.push(this._expandedWidgetsService.exportResearchSummaryData(REQUEST_DATA).subscribe(
      data => {
        fileDownloader(data.body, this.heading.toLowerCase(), REQUEST_DATA.exportType);
      }));
  }

  myDashboard(event: any) {
    event.preventDefault();
    this._router.navigate(['fibi/dashboard']);
  }

  setCurrentProposalTab() {
    localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

}
