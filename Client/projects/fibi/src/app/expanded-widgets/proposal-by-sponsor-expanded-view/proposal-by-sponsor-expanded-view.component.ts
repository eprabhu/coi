import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
  selector: 'app-proposal-by-sponsor-expanded-view',
  templateUrl: './proposal-by-sponsor-expanded-view.component.html',
  styleUrls: ['./proposal-by-sponsor-expanded-view.component.css']
})
export class ProposalBySponsorExpandedViewComponent implements OnInit, OnDestroy {

  serviceRequestResult: any = [];
  $subscriptions: Subscription[] = [];
  departmentUnitNumber = null;
  heading = null;
  isPendingProposal = this._route.snapshot.queryParamMap.get('tabName') === 'PENDING_PROPOSAL_BY_SPONSOR_TYPE';
  column: number;
  direction: number = -1;
  isDesc: boolean;
  descentFlag = null;

  constructor(private _expandedWidgetsService: ExpandedWidgetsService,
    private _route: ActivatedRoute, public _commonService: CommonService) { }

  ngOnInit() {
    this.heading = this._route.snapshot.queryParamMap.get('proposalHeading');
    this.departmentUnitNumber =  this._route.snapshot.queryParamMap.get('UN');
    this.descentFlag = this._route.snapshot.queryParamMap.get('DF');
    this.loadPieChartDataByType();
  }

  loadPieChartDataByType() {
    const REQUEST_DATA = {
      property1: this._route.snapshot.queryParamMap.get('sponsorCode'),
      tabName: this._route.snapshot.queryParamMap.get('tabName') || 'PROPOSAL_BY_SPONSOR_TYPE',
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
      researchSummaryIndex: this._route.snapshot.queryParamMap.get('tabName') || 'PROPOSAL_BY_SPONSOR_TYPE',
      documentHeading: this.heading,
      exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
      property1:  this._route.snapshot.queryParamMap.get('sponsorCode'),
      unitNumber: this.departmentUnitNumber,
      descentFlag: this.descentFlag
    };
    this.$subscriptions.push(this._expandedWidgetsService.exportResearchSummaryData(REQUEST_DATA).subscribe(
      data => {
        fileDownloader(data.body, this.heading.toLowerCase(), REQUEST_DATA.exportType);
      }));
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
