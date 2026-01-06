/**
 * Last updated by Saranya T Pillai on 21/11/2019
 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { RoleService } from './role.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ProposalService } from '../services/proposal.service';
import { WebSocketService } from '../../common/services/web-socket.service';
import { DataStoreService } from '../services/data-store.service';

import {concatUnitNumberAndUnitName} from '../../common/utilities/custom-utilities';
import {AutoSaveService} from '../../common/services/auto-save.service';
@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {

    result: any = {};
    departmentLevelRightsForProposal: any = {};
    elasticSearchOptions: any = {};
    isCollapseList = [];
    roleList: any = [];
    isCollapse = false;
    personRoleObject: any = {};
    personRolesList = [];
    map = new Map();
    clearField: String;
    deletePersonRole = null;
    roleName = null;
    $subscriptions: Subscription[] = [];
    canEditPermission = false;
    storeDependencies = ['proposal', 'dataVisibilityObj', 'availableRights'];
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
    hasUnsavedChanges = false;

    constructor(public _commonService: CommonService,
        public _roleService: RoleService,
        private _elasticConfig: ElasticConfigService,
        public _proposalService: ProposalService,
        private _webSocket: WebSocketService,
        private _dataStore: DataStoreService,
        private _autoSaveService: AutoSaveService) { }

    ngOnInit() {
        this.updateData();
        this.listenDataChangeFromStore();
        this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
        this.fetchPersonRoles();
        this.personRoleObject.roleId = null;
    }

    ngOnDestroy() {
        this._autoSaveService.clearUnsavedChanges();
        subscriptionHandler(this.$subscriptions);
    }

    updateData(sections: string[] = this.storeDependencies) {
        this.getDataFromStore(sections);
        this.updateEditPermissions();
    }

    getDataFromStore(sections) {
        sections.forEach(section => {
            Object.assign(this.result, this._dataStore.getData([section]));
        });
    }

    listenDataChangeFromStore() {
        this.$subscriptions.push(this._dataStore.dataEvent.subscribe(
            (sections: string[]) => {
                if (sections.some(dep => this.storeDependencies.includes(dep))) {
                    this.updateData(sections);
                }
            }));
    }

    updateEditPermissions() {
        this.departmentLevelRightsForProposal = this._proposalService.checkDepartmentLevelPermission(this.result.availableRights);
        const lockId = 'Proposal' + '#' + this.result.proposal.proposalId;
        this.canEditPermission = this.result.dataVisibilityObj.mode !== 'view' || this.departmentLevelRightsForProposal.isModifyPermissions;
        this.canEditPermission = this.canEditPermission && this._webSocket.currentLockedModule[lockId].isModuleLockAvailable;
    }
    /**
     * Loads the role list and person role list
     */
    fetchPersonRoles() {
        this.$subscriptions.push(this._roleService.fetchPersonRoles
            ({ 'proposalId': this.result.proposal.proposalId })
            .subscribe((data: any) => {
                this.roleList = data.moduleDerivedRoles;
                this.personRolesList = data.proposalPersonRoles;
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
        this.personRoleObject = {};
        this.clearField = new String('true');
        this.personRoleObject.roleId = null;
        this.map.clear();
        this.setUnsavedChanges(false);
    }
    /**
     * @param  {} deleteData
     * delete the selected person with role
     */
    deletePersonRoles(deleteData) {
        deleteData.acType = 'D';
        this.$subscriptions.push(
            this._roleService.maintainPersonRoles({ 'proposalId': this.result.proposal.proposalId, proposalPersonRoles: [deleteData] })
                .subscribe((data: any) => {
                    const INDEX = this.personRolesList.findIndex(item => item.proposalPersonRoleId === deleteData.proposalPersonRoleId);
                    this.personRolesList.splice(INDEX, 1);
                }));
    }
    /**
     * to assign a person to a role
     */
    savePersonRoles() {
        this.validations();
        if (this.map.size < 1) {
            this.personRoleObject.proposalPersonRoleId = null;
            this.personRoleObject.proposalId = this.result.proposal.proposalId;
            this.personRoleObject.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.personRoleObject.acType = 'I';
            this.$subscriptions.push(this._roleService.maintainPersonRoles(
                { 'proposalId': this.result.proposal.proposalId, proposalPersonRoles: [this.personRoleObject] })
                .subscribe((data: any) => {
                    data.proposalPersonRoles.forEach((element) => {
                        this.personRolesList.push(element);
                    });
                    this.resetObject();
                    setTimeout(() => {
                        document.getElementById(data.proposalPersonRoles[0].proposalPersonRoleId).scrollIntoView({ block: 'end' });
                    }, 0);
                }));

        }
    }
    selectedPerson(event) {
        (event !== null) ? this.personRoleObject.personId = event.prncpl_id : this.personRoleObject.personId = null;
        this.setUnsavedChanges(true);
    }
    /**
     * @param  {} roleId
     * returns the list persons which comes under the role id
     */
    filterPersonPerRole(roleId) {
        return this.personRolesList.filter(person => (person.roleId === roleId));
    }

    validations() {
        this.map.clear();
        if (!this.personRoleObject.personId) {
            this.map.set('person', 'Please select a person');
        }
        if (!this.personRoleObject.roleId) {
            this.map.set('role', 'Please select a role');
        }
        if ((this.personRolesList.find((item) =>
            // tslint:disable-next-line:triple-equals
            (item.personId === this.personRoleObject.personId && item.roleId == this.personRoleObject.roleId)))) {
            this.map.set('repeat', 'person with same role is already existing');
        }
    }

    setUnsavedChanges(flag: boolean) {
        if (this.hasUnsavedChanges !== flag) {
            this._autoSaveService.setUnsavedChanges('Permissions', 'accordionSearch', flag, true);
            this.result.dataVisibilityObj.dataChangeFlag = flag;
            this._dataStore.updateStore(['dataVisibilityObj'], this.result);
        }
        this.hasUnsavedChanges = flag;
    }
}
