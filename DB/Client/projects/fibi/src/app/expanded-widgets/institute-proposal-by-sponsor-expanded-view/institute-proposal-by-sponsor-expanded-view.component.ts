import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { ExpandedWidgetsService } from '../expanded-widgets.service';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';

@Component({
  selector: 'app-institute-proposal-by-sponsor-expanded-view',
  templateUrl: './institute-proposal-by-sponsor-expanded-view.component.html',
  styleUrls: ['./institute-proposal-by-sponsor-expanded-view.component.css']
})
export class InstituteProposalBySponsorExpandedViewComponent implements OnInit {

  heading = null;
  isDesc: boolean;
  column: number;
  direction: number;
  tabName: any;
  currentStatus: string;
  sponsorNumber: any;
  $subscriptions: Subscription[] = [];
  detailedViewOfWidget: any = [];
  departmentUnitNumber = null;
  descentFlag = null;
  isPendingIPWidget = false;
  constructor(private _route: ActivatedRoute, private _expandedWidgetsService: ExpandedWidgetsService, private _router: Router,
    private _commonService: CommonService) { }

  ngOnInit() {
    this.tabName = this._route.snapshot.queryParamMap.get('tabName');
    this.isPendingIPWidget = this.tabName === 'PENDING_INSTITUTE_PROPOSAL_BY_SPONSOR_TYPE';
    this.departmentUnitNumber =  this._route.snapshot.queryParamMap.get('UN');
    this.descentFlag = this._route.snapshot.queryParamMap.get('DF');
    this.setStatus();
    this.getDetailedData();
    this.heading = this.isPendingIPWidget ?
                   this._route.snapshot.queryParamMap.get('proposalHeading') :
                   this.currentStatus + ' Institute proposal by ' + this._route.snapshot.queryParamMap.get('sponsorName');
  }

  exportAsTypeDoc(docType) {
    const REQ_BODY = this.getExportReqObj(docType);
    this.$subscriptions.push(this._expandedWidgetsService.exportResearchSummaryData(REQ_BODY).subscribe((res: any) => {
      fileDownloader(res.body, this.heading.toLowerCase(), REQ_BODY.exportType);
    }, error => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Downloading the attachment failed. Please try again.');
    }));
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }

  getExportReqObj(docType) {
    let reqObj = {};
    const COMMON_OBJ = {
      researchSummaryIndex: this.tabName,
      documentHeading: this.heading,
      exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
    }
    if (this.isPendingIPWidget) {
      reqObj = {
        property1: this._route.snapshot.queryParamMap.get('sponsorCode'),
        unitNumber: this.departmentUnitNumber,
        descentFlag: this.descentFlag
      };
    } else {
      reqObj = {
        sponsorCodes: [this._route.snapshot.queryParamMap.get('sponsorNumber')]
      };
    }
    return {...COMMON_OBJ, ...reqObj};
  }

  openInstituteProposal(proposalId) {
    this._router.navigate(['/fibi/instituteproposal/overview'], {
      queryParams: {
        instituteProposalId: proposalId
      }
    });
  }

  setStatus() {
    switch (this.tabName) {
      case 'PENDING_INSTITUTE_PROPOSAL_SPONSOR': this.currentStatus = 'Pending';
        break;
      case 'NOT_FUNDED_INSTITUTE_PROPOSAL_SPONSOR': this.currentStatus = 'Not Funded';
        break;
      case 'FUNDED_INSTITUTE_PROPOSAL_SPONSOR': this.currentStatus = 'Funded';
        break;
      case 'WITHDRAWN_INSTITUTE_PROPOSAL_SPONSOR': this.currentStatus = 'Withdrawn';
        break;
      default: break;
    }
  }

  getDetailedData() {
    this.$subscriptions.push(this._expandedWidgetsService.getDetailedViewOfWidget(this.getLoadReqObj()).subscribe((data: any) => {
      this.detailedViewOfWidget = data.widgetDatas || [];
    }, error => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Something Went wrong!');
    }));
  }

  getLoadReqObj() {
    if (this.isPendingIPWidget) {
      return {
        property1: this._route.snapshot.queryParamMap.get('sponsorCode'),
        tabName: this.tabName,
        unitNumber: this.departmentUnitNumber,
        descentFlag: this.descentFlag
      };
    } else {
      return {
        tabName: this.tabName,
        sponsorCodes: [this._route.snapshot.queryParamMap.get('sponsorNumber')]
      };
    }
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
