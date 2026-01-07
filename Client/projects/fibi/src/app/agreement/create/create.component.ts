import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  isAgreementAdministrator: any;
  isGroupAdministrator: any;

  constructor(private _router: Router, private _commonService: CommonService) { }

  async ngOnInit() {
    this._commonService.isShowLoader.next(true);
    this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR')
    this.isGroupAdministrator = await this._commonService.checkPermissionAllowed('VIEW_ADMIN_GROUP_AGREEMENT');
    this.gotoAgreementCreation();
  }

  gotoAgreementCreation() {
    if ((!this.isAgreementAdministrator && !this.isGroupAdministrator) && this._commonService.isTriageQuestionnaireRequired) {
      this._router.navigate(['/fibi/triage'], { queryParams: { 'triageId': null } });
    } else {
      this._router.navigate(['/fibi/agreement/form']);
    }
  }
}
