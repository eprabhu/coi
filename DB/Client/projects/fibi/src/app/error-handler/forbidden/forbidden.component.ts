import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.css']
})
export class ForbiddenComponent implements OnInit {

  constructor(public _commonService: CommonService) { }

  pathConfig = {
    paths: {
      1: { name: 'Award', path: '#/fibi/dashboard/awardList', class: 'success-badge' },
      2: { name: 'Institute Proposal', path: '#/fibi/dashboard/instituteProposalList', class: 'warning-badge' },
      3: { name: 'Development Proposal', path: '#/fibi/dashboard/proposalList', class: 'secondary-badge' },
      5: { name: 'Negotiation', path: '#/fibi/dashboard/negotiations', class: 'info-badge' },
      13: {name: 'Agreement', path: '#/fibi/dashboard/agreementsList', class: 'info-badge'},
      14: { name: 'Claim', path: '#/fibi/dashboard/claim-list', class: 'info-badge' },
      15: { name: 'Grant Call', path: '#/fibi/dashboard/grantCall', class: 'info-badge'},
      16: { name: 'Progress Report', path: '#/fibi/dashboard/progressReportList', class: 'info-badge'},
      20: { name: 'Service Request', path: '#/fibi/dashboard/serviceRequestList', class: 'info-badge'}
    }

  };
  ngOnInit() {
  }

  /**
   * navigates back to list according the error value set in forbidden variable in common service
   * pathconfig is used to assign path to be navigated
   */
  navigateBack() {
    window.location.hash = this._commonService.forbiddenModule ? this.pathConfig.paths[this._commonService.forbiddenModule].path
      : '#/fibi/dashboard/researchSummary';
  }

}
