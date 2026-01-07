import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
  selector: 'app-research-summary-expanded-view',
  templateUrl: './research-summary-expanded-view.component.html',
  styleUrls: ['./research-summary-expanded-view.component.css']
})
export class ResearchSummaryExpandedViewComponent implements OnInit, OnDestroy {

  researchSummaryIndex = null;
  researchSummaryHeading = null;
  serviceRequestResult: any = [];
  $subscriptions: Subscription[] = [];
  unitNumber: String = '';
  fromDate: any;
  toDate: any;
  column: number;
  direction: number = -1;
  isDesc: boolean;
  descentFlag = null;


  constructor(private _route: ActivatedRoute, public _commonService: CommonService,
    private _expandedWidgetsService: ExpandedWidgetsService) { }

  ngOnInit() {
    this.researchSummaryIndex = this._route.snapshot.queryParamMap.get('summaryIndex');
    this.researchSummaryHeading = this._route.snapshot.queryParamMap.get('summaryHeading');
    this.unitNumber =  this._route.snapshot.queryParamMap.get('UN');
    this.descentFlag = this._route.snapshot.queryParamMap.get('DF');
    this.fromDate = this._route.snapshot.queryParamMap.get('fromDate');
    this.toDate = this._route.snapshot.queryParamMap.get('toDate');
    this.loadDetailedResearchSummary();
  }

  loadDetailedResearchSummary() {
    this.$subscriptions.push(this._expandedWidgetsService.getDetailedViewOfWidget({
      tabName: this.researchSummaryIndex,
      unitNumber: this.unitNumber,
      startDate:  this.fromDate,
      endDate:  this.toDate,
      descentFlag: this.descentFlag
    }).subscribe((data: any) => {
        this.serviceRequestResult = data.widgetDatas || [];
      }));
  }

  setCurrentProposalTab() {
    localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
  }

  exportAsTypeDoc(docType) {
    const REQUEST_DATA = {
      researchSummaryIndex: this.researchSummaryIndex,
      unitNumber: this.unitNumber,
      startDate:  this.fromDate,
      endDate:  this.toDate,
      documentHeading: this.researchSummaryHeading,
      exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
      descentFlag: this.descentFlag
    };
    this.$subscriptions.push(this._expandedWidgetsService.exportResearchSummaryData(REQUEST_DATA).subscribe(
      data => {
        fileDownloader(data.body, this.researchSummaryHeading.toLowerCase(), REQUEST_DATA.exportType);
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

}
