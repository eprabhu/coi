import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExpandedWidgetsService } from '../expanded-widgets.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';


@Component({
  selector: 'app-institute-proposal-lead-unit-expanded-view',
  templateUrl: './institute-proposal-lead-unit-expanded-view.component.html',
  styleUrls: ['./institute-proposal-lead-unit-expanded-view.component.css']
})
export class InstituteProposalLeadUnitExpandedViewComponent implements OnInit {

  $subscriptions: Subscription[] = [];
  detailedViewOfWidget: any = [];
  isDesc: boolean;
  column: number;
  direction: number;
  heading = null;
  tabName: any;
  unitNumber: any;
  currentStatus: string;

  constructor(private _route: ActivatedRoute,
    private _expandedWidgetsService: ExpandedWidgetsService, private _router: Router) { }

  ngOnInit() {
    this.tabName = this._route.snapshot.queryParamMap.get('tabName');
    this.unitNumber = this._route.snapshot.queryParamMap.get('UN');
    this.setStatus();
    this.heading = this.currentStatus + ' Institute Proposal by Lead Unit: ' + this._route.snapshot.queryParamMap.get('unitName');
    this.getDetailedData();
  }

  sortBy(property) {
    this.column = property;
    this.direction = this.isDesc ? 1 : -1;
  }
  setStatus() {
    if (this.tabName === 'PENDING_INSTITUTE_PROPOSAL') {
      this.currentStatus = 'Pending '
    } else if (this.tabName === 'NOT_FUNDED_INSTITUTE_PROPOSAL') {
      this.currentStatus = 'Not Funded'
    } else if (this.tabName === 'FUNDED_INSTITUTE_PROPOSAL') {
      this.currentStatus = 'Funded'
    } else {
      this.currentStatus = 'Withdrawn'
    }
  }

  getDetailedData() {
    const REQ_DATA = {
      tabName: this.tabName,
      unitNumber: this.unitNumber
    };
    this.$subscriptions.push(this._expandedWidgetsService.getDetailedViewOfWidget(REQ_DATA).subscribe((data: any) => {
      this.detailedViewOfWidget = data.widgetDatas || [];
    }));
  }

  openInstituteProposal(proposalId) {
    this._router.navigate(['/fibi/instituteproposal/overview'], {
      queryParams: {
        instituteProposalId: proposalId
      }
    })
  }

  exportAsTypeDoc(docType) {
    const REQ_BODY = {
      documentHeading: this.heading,
      exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
      researchSummaryIndex: this.tabName,
      unitNumber: this._route.snapshot.queryParamMap.get('UN')
    };
    this.$subscriptions.push(this._expandedWidgetsService.exportResearchSummaryData(REQ_BODY).subscribe(
      data => {
        fileDownloader(data.body, this.heading.toLowerCase(), REQ_BODY.exportType);
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

}
