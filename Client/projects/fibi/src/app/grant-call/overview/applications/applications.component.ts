import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  @Input() result: any = {};
  @Input() mode: any;
  isShowProposalDetails = true;
  isViewGrantCallApplications = false;
  constructor(private _router:  Router, private _commonService:  CommonService) { }

  ngOnInit() {
  }

  viewProposalById(event: any, proposalId) {
    event.preventDefault();
    localStorage.setItem('currentTab', 'PROPOSAL_HOME');
    this._router.navigate(['fibi/proposal'], { queryParams: { 'proposalId': proposalId } });
  }

  async getPermissions() {
    this.isViewGrantCallApplications = await this._commonService.checkPermissionAllowed('VIEW_GRANT_CALL_APPLICATIONS');
  }
  setProposalTab() {
    localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
  }
}
