import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isMaintainRolodex = false;
  isMaintainSponsor = false;
  isMaintainUserRoles = false;
  isMaintainRole = false;
  isApplicationAdministrator = false;
  isMaintainTraining = false;
  isMaintainQuestionnaire = false;
  deployMap = environment.deployUrl;
  isMaintainOrcidWorks = false;
  isMaintainPerson = false;
  isMaintainSapFeed = false;
  isMaintainManpowerFeed = false;
  isGenerateAuditReport = false;
  isMaintainExternalUser = false;
  isMaintainInvoiceFeed = false;
  isMaintainDelegation = false;
  isMaintainSponsorHierarchy = false;
  isAgreementAdministrator = false;
  isMaintainReviewer = false;
  isMaintainTimeSheet = false;
  isViewTimeSheet = false;
  isViewAuditLog = false;


  constructor(public _commonService: CommonService) { }

  ngOnInit() {
    this._commonService.isShowLoader.next(false);
    this.getPermissions();
  }

  async getPermissions() {
    this._commonService.rightsArray = [];
    this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
    this.isMaintainTraining = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    this.isMaintainQuestionnaire = await this._commonService.checkPermissionAllowed('MAINTAIN_QUESTIONNAIRE');
    this.isMaintainRolodex = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLODEX');
    this.isMaintainSponsor = await this._commonService.checkPermissionAllowed('MAINTAIN_SPONSOR');
    this.isMaintainUserRoles = await this._commonService.checkPermissionAllowed('MAINTAIN_USER_ROLES');
    this.isMaintainRole = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLE');
    this.isMaintainOrcidWorks = await this._commonService.checkPermissionAllowed('MAINTAIN_ORCID_WORKS');
    this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
    this.isMaintainSapFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_SAP_FEED') ||
      await this._commonService.checkPermissionAllowed('VIEW_SAP_FEED') ||
      await this._commonService.checkPermissionAllowed('MAINTAIN_INTERFACE_PROCESSING');
    this.isMaintainManpowerFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_MANPOWER_FEED');
    this.isGenerateAuditReport = await this._commonService.checkPermissionAllowed('GENERATE_AUDIT_REPORT');
    this.isMaintainExternalUser = await this._commonService.checkPermissionAllowed('MAINTAIN_EXTERNAL_USER');
    this.isMaintainInvoiceFeed = await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_FEED') ||
      await this._commonService.checkPermissionAllowed('VIEW_INVOICE_FEED') ||
      await this._commonService.checkPermissionAllowed('MAINTAIN_INVOICE_INTERFACE_PROCESSING');
    this.isMaintainDelegation = await this._commonService.checkPermissionAllowed('MAINTAIN_DELEGATION');
    this.isMaintainSponsorHierarchy = await this._commonService.checkPermissionAllowed('MAINTAIN_SPONSOR_HIERARCHY');
    this.isAgreementAdministrator = await this._commonService.checkPermissionAllowed('AGREEMENT_ADMINISTRATOR');
    this.isMaintainReviewer = await this._commonService.checkPermissionAllowed('MAINTAIN_EXTERNAL_REVIEW');
    this.isMaintainTimeSheet = await this._commonService.checkPermissionAllowed('MAINTAIN_KEY_PERSON_TIMESHEET');
    this.isViewTimeSheet = await this._commonService.checkPermissionAllowed('VIEW_KEY_PERSON_TIMESHEET');
    this.isViewAuditLog = await this._commonService.checkPermissionAllowed('VIEW_AUDIT_LOG');
  }

}
