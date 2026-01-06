import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
  selector: 'app-expanded-awards-by-sponsor',
  templateUrl: './expanded-awards-by-sponsor.component.html',
  styleUrls: ['./expanded-awards-by-sponsor.component.css']
})
export class ExpandedAwardsBySponsorComponent implements OnInit, OnDestroy {

  researchSummaryReqObj: any = {};
  exportDataReqObj: any = {};
  awardList: any = [];
  researchSummaryIndex = null;
  pieChartIndex = null;
  departmentUnitNumber = null;
  exportDataHeading = this._activatedRoute.snapshot.queryParamMap.get('expandedViewAwardHeading');
  $subscriptions: Subscription[] = [];
  sponsorCode: string;
  column: number;
  direction: number = -1;
  isDesc: boolean;
  descentFlag = null;

  constructor(private _activatedRoute: ActivatedRoute, public _commonService: CommonService,
    private _expandedViewService: ExpandedWidgetsService) { }

  ngOnInit() {
    this.departmentUnitNumber =  this._activatedRoute.snapshot.queryParamMap.get('UN');
    this.descentFlag = this._activatedRoute.snapshot.queryParamMap.get('DF');
    this.loadAwardData();
  }
  /**
   * Here the array returns an array which contains 8 elemets which is directly called from array in the html
   * element - 0 is Award Number
   * element - 1 is Account Number
   * element - 2 is Title
   * element - 3 is Sponsor Name
   * element - 4 is Award Id
   */
  loadAwardData() {
    const sponsorType =  this._activatedRoute.snapshot.queryParamMap.get('sponsorCode');
    this.sponsorCode =  sponsorType !== 'Other' ? `'${sponsorType}'` : sessionStorage.getItem('awardBySponsorOther');
    this.$subscriptions.push(this._expandedViewService.getDetailedViewOfWidget({
      tabName: 'AWARD_BY_SPONSOR',
      property1: this.sponsorCode,
      unitNumber:  this.departmentUnitNumber,
      descentFlag: this.descentFlag
    }).subscribe(
      (data: any) => {
        this.awardList = data.widgetDatas || [];
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  exportAsTypeDoc(docType) {
    this.exportDataReqObj.researchSummaryIndex = 'AWARD_BY_SPONSOR';
    this.exportDataReqObj.documentHeading = this.exportDataHeading;
    this.exportDataReqObj.exportType = docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '';
    this.exportDataReqObj.unitNumber = this.departmentUnitNumber;
    this.exportDataReqObj.property1 = this.sponsorCode;
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
