/**
 * created by Archana R on 20/11/2019
 * last updated by Archana R  on 22/11/2019
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../services/common-data.service';
import { RoleService } from '../role.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, TOAST_DURATION } from '../../../app-constants';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.css']
})
export class RoleEditComponent implements OnInit, OnDestroy {

  elasticPersonSearchOptions: any = {};
  clearField: String;
  awardData: any;
  isCollapseList = [];
  roleList: any = [];
  person: any = {};
  personRolesList: any = [];
  selectRole: any = {};
  deletePersonRole = null;
  roleName = null;
  map = new Map();
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(private _elasticConfig: ElasticConfigService, public _commonData: CommonDataService,
    public _roleService: RoleService, public _commonService: CommonService) { }

  ngOnInit() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data.award;
      }
    }));
    this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
    this.fetchPersonRoles();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
  * Loads the role list and person role list
  */
  fetchPersonRoles() {
    this.$subscriptions.push(this._roleService.$awardPersonRolesDetails.subscribe((data: any) => {
        this.roleList = data.moduleDerivedRoles;
        this.personRolesList = data.awardPersonRoles ? data.awardPersonRoles : [];
        this.roleList.forEach(element => {
          this.isCollapseList[element.roleName] = true;
        });
      }));
  }
  /**
   * @param  {} roleName
   * to set collapsable tables
   */
  collapseRoleTables(roleName) {
    this.isCollapseList[roleName] === false ? this.isCollapseList[roleName] = true : this.isCollapseList[roleName] = false;
    this.resetObject();
  }

  resetObject() {
    this.person = {};
    this.clearField = new String('true');
    this.map.clear();
    this.selectRole = {};
  }

  selectedPerson(event) {
    (event !== null) ? this.person.personId = event.prncpl_id : this.person.personId = null;
    this._commonData.isAwardDataChange = true;
  }

  /**
  * @param  {} roleId
  * returns the list persons which comes under the role id
  */
  filterPersonPerRole(roleId) {
    return this.personRolesList.filter(person => (person.roleId === roleId));
  }

  checkMandatoryFilled() {
    this.map.clear();
    if (!this.person.personId) {
      this.map.set('person', 'Please select a person');
    }
    if (!this.selectRole.roleId || this.selectRole.roleId === 'null') {
      this.map.set('role', 'Please select a role');
    }
    if ((this.personRolesList.find((item) =>
      (item.personId === this.person.personId && item.roleId === this.selectRole.roleId)))) {
      this.map.set('repeat', 'person with same role is already existing');
    }
  }

  /**
 * to assign a person to a role
 */
  savePersonRoles() {
    this.checkMandatoryFilled();
    if (this.map.size <= 0 && !this.isSaving) {
      this.isSaving = true;
      const ROLEDATA: any = {};
      ROLEDATA.awardPersonRoleId = null;
      ROLEDATA.awardId = this.awardData.awardId;
      ROLEDATA.awardNumber = this.awardData.awardNumber;
      ROLEDATA.sequenceNumber = this.awardData.sequenceNumber;
      ROLEDATA.roleId = this.selectRole.roleId;
      ROLEDATA.personId = this.person.personId;
      this.$subscriptions.push(
        this._roleService.addAwardPersonRoles(
          {
            'awardPersonRole': ROLEDATA,
            'updateUser': this._commonService.getCurrentUserDetail('userName'),
            'isActiveAward': this.awardData.awardSequenceStatus === 'ACTIVE' ? true : false
          }).subscribe((data: any) => {
            this.personRolesList.push(data);
            this.resetObject();
            this.selectRole = {};
            this._commonData.isAwardDataChange = false;
            this.isSaving = false;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Roles assigned successfully.');
          }, err => {
            const errorMessage = `The addition/modification of permissions conflicts with another variation that is currently In Progress.
             Please use the 'In progress variation' for any modification.`;
            this._commonService.showToast(HTTP_ERROR_STATUS, errorMessage, TOAST_DURATION);
            this.isSaving = false;
          }));
    }
  }

  /**
 * @param  {} awardPersonRoleId
 * delete the selected person with role
 */
  deletePersonRoles(awardPersonRoleId) {
    this.$subscriptions.push(this._roleService.deleteAwardPersonRoles({
      'awardPersonRoleId': awardPersonRoleId })
      .subscribe((data: any) => {
        const INDEX = this.personRolesList.findIndex(item => item.awardPersonRoleId === awardPersonRoleId);
        this.personRolesList.splice(INDEX, 1);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Roles deleted successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Role failed. Please try again.');
      }
      ));
    this.selectRole = {};
  }
}
