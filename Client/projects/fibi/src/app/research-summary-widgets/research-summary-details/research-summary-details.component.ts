import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fadeDown } from '../../common/utilities/animations';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';

@Component({
  selector: 'app-research-summary-details',
  templateUrl: './research-summary-details.component.html',
  styleUrls: ['./research-summary-details.component.css'],
  animations: [fadeDown]
})
export class ResearchSummaryDetailsComponent implements OnInit, OnDestroy {

  $subscriptions: Subscription[] = [];
  summaryData: any = {};
  isShowLoader = false;
  widgetDescription: any;
  unitNumber = '';
  unitName = '';
  descentFlag = null;

  constructor(public _commonService: CommonService, private _router: Router,
    private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
    private _researchSummaryConfigService: ResearchSummaryConfigService) { }

  ngOnInit() {
    this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(1);
    this.getSelectedUnit();
  }

  getSelectedUnit() {
    this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
      if (data) {
        this.unitNumber =  data.unitNumber;
        this.unitName = data.unitName;
        this.descentFlag = data.descentFlag;
      } else {
        this.unitNumber = '';
        this.unitName = '';
      }
      this.getResearchSummaryTable();
    }));
  }

  getResearchSummaryTable() {
    this.isShowLoader = true;
    const REQUEST_DATA = {
      isAdmin: this._commonService.getCurrentUserDetail('unitAdmin'),
      unitNumber: this.unitNumber,
      tabName: 'RESEARCH_SUMMARY_TABLE',
      descentFlag: this.descentFlag
    };
    this.$subscriptions.push(this._researchSummaryWidgetService.getResearchSummaryDatasByWidget(REQUEST_DATA)
      .subscribe((data: any) => {
        this.summaryData = data.widgetDatas || [];
        this.isShowLoader = false;
      }, err => { this.isShowLoader = false; }));
  }

  getDetailedResearchSummary(summaryLabel) {
    this._router.navigate(['/fibi/expanded-widgets/research-summary-list'],
      { queryParams: this.getQueryParams(summaryLabel) });
  }

  getQueryParams(summaryLabel) {
    const QUERY_PARAMS = {
      summaryIndex: 'PROPOSALSSUBMITTED',
      summaryHeading: summaryLabel,
      UN: this.unitNumber,
      DF: this.descentFlag
    };
    switch (summaryLabel) {
      case 'Submitted Proposals': QUERY_PARAMS.summaryIndex = 'AWARDED_PROPOSALS'; break;
      case 'In Progress Proposals': QUERY_PARAMS.summaryIndex = 'INPROGRESS_PROPOSALS'; break;
      case 'Active Awards': QUERY_PARAMS.summaryIndex = 'AWARDSACTIVE'; break;
      case 'Approval In Progress Proposals': QUERY_PARAMS.summaryIndex = 'APPROVAL_INPROGRESS_PROPOSALS'; break;
      default: break;
    }
    return QUERY_PARAMS;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
