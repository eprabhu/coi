import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
  selector: 'app-awarded-proposal-by-sponsor-expanded-view',
  templateUrl: './awarded-proposal-by-sponsor-expanded-view.component.html',
  styleUrls: ['./awarded-proposal-by-sponsor-expanded-view.component.css']
})
export class AwardedProposalBySponsorExpandedViewComponent implements OnInit, OnDestroy {

  sponsorCode = null;
  exportDataReqObj: any = {};
  serviceRequestResult: any = {};
  researchSummaryIndex = null;
  pieChartIndex = null;
  departmentUnitNumber = null;
  exportDataHeading = '';
  $subscriptions: Subscription[] = [];
  column: number;
  direction: number = -1;
  isDesc: boolean;
  descentFlag = null;

  constructor(private _activatedRoute: ActivatedRoute, public _commonService: CommonService,
    private _expandedViewService: ExpandedWidgetsService) { }

  ngOnInit() {
    this.exportDataHeading = this._activatedRoute.snapshot.queryParamMap.get('donutAwardHeading');
    this.sponsorCode = this._activatedRoute.snapshot.queryParamMap.get('sponsorCode');
    this.departmentUnitNumber = this._activatedRoute.snapshot.queryParamMap.get('UN');
    this.descentFlag = this._activatedRoute.snapshot.queryParamMap.get('DF');
    this.loadAwardData();
  }

  loadAwardData() {
    this.$subscriptions.push(this._expandedViewService.getDetailedViewOfWidget({
      tabName: 'AWARDED_PROPOSALS_BY_SPONSOR',
      property1: this.sponsorCode,
      unitNumber:  this.departmentUnitNumber,
      descentFlag: this.descentFlag
    }).subscribe((data: any) => {
      this.serviceRequestResult = data.widgetDatas || [];
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  exportAsTypeDoc(docType) {
    this.exportDataReqObj.property1 = this.sponsorCode;
    this.exportDataReqObj.researchSummaryIndex = 'AWARDED_PROPOSALS_BY_SPONSOR';
    this.exportDataReqObj.documentHeading = this.exportDataHeading;
    this.exportDataReqObj.exportType = docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '';
    this.exportDataReqObj.unitNumber = this.departmentUnitNumber;
    this.exportDataReqObj.descentFlag = this.descentFlag;
    this.$subscriptions.push(this._expandedViewService.exportResearchSummaryData(this.exportDataReqObj).subscribe(
      data => {
        fileDownloader(data.body, this.exportDataHeading.toLowerCase(), this.exportDataReqObj.exportType);
      }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

}
