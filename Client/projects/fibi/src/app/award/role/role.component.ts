import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../services/common-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { WebSocketService } from '../../common/services/web-socket.service';
import { RoleService } from './role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {

  isRoleEdit = false;
  $subscriptions: Subscription[] = [];
  isPermissionEditable = false;

  constructor(public _commonData: CommonDataService, private websocket: WebSocketService,
    public _roleService: RoleService) { }

  ngOnInit() {
    this.fetchPersonRoles();
    this.getAwardGeneralData();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        const isLockStatus = this.websocket.isLockAvailable('Award' + '#' + data.award.awardId);
        const isSectionEditable =  this._commonData.getSectionEditableFlag('107');
        const isModifyInActive =  this._commonData.checkDepartmentLevelRightsInArray('MODIFY_DOCUMENT_PERMISSION') &&
          data.award.awardSequenceStatus === 'ACTIVE';
        this.isRoleEdit = (isSectionEditable && isLockStatus) || (isModifyInActive && !this.isPermissionEditable);
      }
    }));
  }

  fetchPersonRoles() {
    this.$subscriptions.push(this._roleService.$awardPersonRolesDetails.subscribe((data: any) => {
      this.isPermissionEditable = data.isAdminCorrectionPending;
    }));
  }
}
