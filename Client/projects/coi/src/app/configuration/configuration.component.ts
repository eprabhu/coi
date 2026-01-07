import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../admin-dashboard/src/environments/environment';
import {CommonService} from '../common/services/common.service';
import { fadeInOutHeight } from '../common/utilities/animations';
import {ConfigurationService} from "./configuration.service";
import {Subscription} from "rxjs";
import {HTTP_SUCCESS_STATUS} from "../app-constants";
import {subscriptionHandler} from "../../../../fibi/src/app/common/utilities/subscription-handler";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  animations: [fadeInOutHeight]
})
export class ConfigurationComponent implements OnInit, OnDestroy {

  deployMap = environment.deployUrl;
  isMaintainQuestionnaire = false;
  isApplicationAdministrator = false;
  isMaintainUserRoles = false;
  isMaintainRole = false;
  isMaintainPerson = false;
  isMaintainOrcidWorks = false;
  isMaintainDelegation = false;
  isMaintainTimeSheet = false;
  isViewTimeSheet = false;
  isMaintainTraining = false;

  $subscriptions: Subscription[] = [];

  constructor(private _commonService: CommonService, private _configurationService: ConfigurationService) {
  }

  ngOnInit() {
    this.setAdminRights();
  }

  ngOnDestroy() {
      subscriptionHandler(this.$subscriptions);
  }

  openInNewTab(path: string) {
    const url = this._commonService.fibiApplicationUrl + '#' + path;
    window.open(url);
  }

  setAdminRights() {
    this.isMaintainQuestionnaire = this._commonService.getAvailableRight(['MAINTAIN_QUESTIONNAIRE']);
    this.isApplicationAdministrator = this._commonService.getAvailableRight(['APPLICATION_ADMINISTRATOR']);
    this.isMaintainUserRoles = this._commonService.getAvailableRight(['MAINTAIN_USER_ROLES']);
    this.isMaintainRole = this._commonService.getAvailableRight(['MAINTAIN_ROLE']);
    this.isMaintainPerson = this._commonService.getAvailableRight(['MAINTAIN_PERSON']);
    this.isMaintainOrcidWorks = this._commonService.getAvailableRight(['MAINTAIN_ORCID_WORKS']);
    this.isMaintainDelegation = this._commonService.getAvailableRight(['MAINTAIN_DELEGATION']);
    this.isMaintainTimeSheet = this._commonService.getAvailableRight(['MAINTAIN_KEY_PERSON_TIMESHEET']);
    this.isViewTimeSheet = this._commonService.getAvailableRight(['VIEW_KEY_PERSON_TIMESHEET']);
    this.isMaintainTraining = this._commonService.getAvailableRight(['MAINTAIN_TRAINING']);
  }

    syncEntityToGraphDB() {
      this.$subscriptions.push(this._configurationService.syncEntityToGraphDB().subscribe((res: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'All Entities synced successfully.');
      }));
    }

}
