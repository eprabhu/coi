import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { concatUnitNumberAndUnitName, deepCloneObject } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { PersonDetails } from '../common/role-maintenance';
import { RoleMaintainanceService } from '../role-maintainance.service';
import { UserRoleService } from './user-role.service';

declare var $: any;

class RoleDetails {
	unitNumber = null;
	personId = null;
}

@Component({
	selector: 'app-user-role-creation',
	templateUrl: './user-role-creation.component.html',
	styleUrls: ['./user-role-creation.component.css'],
	providers: [UserRoleService, AuditLogService,
		{ provide: 'moduleName', useValue: 'ROLE_MAINTENANCE' }]

})
export class UserRoleCreationComponent implements OnInit, OnDestroy {

	elasticSearchOptions: any = {};
	unitSearchOptions: any = {};
	personUnitName: any;
	roleDetails: RoleDetails = new RoleDetails();
	isShowPersonCard = false;
	isAssignedAndUnassignedWidget = false;
	$subscriptions: Subscription[] = [];
	unAssignedList: any;
	tempUnAssignedList: any;
	assignedList: any;
	tempAssignedList: any;
	tempModalDataList: any;
	isSaving = false;
	assignedDetails: any = {
		personId: '',
		unitNumber: '',
		updateUser: '',
		roles: []
	};
	searchText: any;
	search: any;
	isPersonFieldDisabled = false;
	isRoleUnitDisable = false;
	clickedOption: any;
	personDetails = new PersonDetails();
	clearField: boolean;
	deployMap = environment.deployUrl;
	viewRoleId: any;
	isShowRightsModal = false;
	currentPersonName: string;

	constructor(private _elasticConfig: ElasticConfigService,
		private _userRoleService: UserRoleService,
		private _commonService: CommonService,
		private _route: ActivatedRoute,
		public roleMaintenanceService: RoleMaintainanceService,
		private _auditLogService: AuditLogService) { }

	ngOnInit() {
		this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
		this.unitSearchOptions = getEndPointOptionsForDepartment();
		this.assignedDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
		this.checkForEditAndAssign();
		this.assignedAndUnAssignedRolesForPerson();
	}

	private checkForEditAndAssign(): void {
		this.clickedOption = this._route.snapshot.queryParams['CO'];
		this.clickedOption === 'E'
			? this.setDefaultValues(this.roleMaintenanceService.editPersonDetails, this.roleMaintenanceService.editUnitDetails)
			: this.setDefaultValues(this.roleMaintenanceService.assignPersonDetails, this.roleMaintenanceService.assignUnitDetails);
	}

	private setDefaultValues(personObj, unitObj): void {
		if (personObj.personId) {
			this.elasticSearchOptions.defaultValue = personObj.personName;
			this.roleDetails.personId = personObj.personId;
			this.currentPersonName = personObj.personName;
			this.isShowPersonCard = true;
			this.isPersonFieldDisabled = true;
			this.personDetails = Object.assign(personObj);
			this.personDetails.unit_name = personObj.homeUnitName ? personObj.homeUnitName : this.roleMaintenanceService.assignPersonDetails.unit_name;
		}
		if (unitObj.unitNumber) {
			this.unitSearchOptions.defaultValue = concatUnitNumberAndUnitName(unitObj.unitNumber, unitObj.unitName);
			this.roleDetails.unitNumber = unitObj.unitNumber;
			this.personUnitName = unitObj.unitName;
			this.isAssignedAndUnassignedWidget = true;
			this.isRoleUnitDisable = true;
		}
	}

	selectUserElasticResult(result): void {
		result ? this.setSearchResults('person', result) : this.setBasicDetailsOfSelectedPersonNull();
	}

	selectUnitSearchValues(result): void {
		if (result) {
			this.setSearchResults('unit', result);
		} else {
			this.personUnitName = null;
		}
	}

	selectAllUnAssigned(check): void {
		this.tempUnAssignedList.forEach(element => {
		  element.selected = check;
		});
	  }

	selectAllAssigned(check): void {
	this.tempAssignedList.forEach(element => {
		element.selected = check;
	});
	}

	private setSearchResults(type, result): void {
		type === 'person'
		? this.setSelectedPerson(this.roleMaintenanceService.assignPersonDetails, result)
		: this.unitChangeFunction(this.roleMaintenanceService.assignUnitDetails, result);
	}

	private setSelectedPerson(personDetails, result): void {
		this.personDetails.personName = personDetails.personName = result.full_name;
		this.personDetails.email_id = personDetails.email_id = result.email_addr;
		this.personDetails.personId = personDetails.personId = result.prncpl_id;
		this.personDetails.unit_name = personDetails.unit_name = result.unit_name;
		this.personDetails.user_name = personDetails.user_name = result.prncpl_nm;
		this.personDetails.primaryTitle = personDetails.primaryTitle = result.primaryTitle;
		this.personDetails.directoryTitle = personDetails.directoryTitle = result.directory_title;
		// tslint:disable-next-line: triple-equals
		this.personDetails.isExternalUser = personDetails.isExternalUser = result.external == 'Y' ? true : false;
		this.roleDetails.personId = this.assignedDetails.personId = result.prncpl_id;
		this.currentPersonName = result.full_name;
		this.isShowPersonCard = true;
		this.assignedAndUnAssignedRolesForPerson();
	}

	private unitChangeFunction(unitObj, event): void {
		if (event) {
			this.personUnitName = unitObj.unitName = event.unitName;
			this.roleDetails.unitNumber = unitObj.unitNumber = event.unitNumber;
			this.assignedAndUnAssignedRolesForPerson();
		}
	}

	private setBasicDetailsOfSelectedPersonNull(): void {
		this.roleMaintenanceService.editPersonDetails = new PersonDetails();
		this.roleDetails.personId = this.assignedDetails.personId = '';
	}

	setDescentType(list): void {
		let before: any = {};
		let auditLog: any = {};
		if (!this.isSaving) {
			this.isSaving = true;
			this.assignedDetails.roles = [];
			before = deepCloneObject(list);
			list.acType = 'U';
			list.descentFlag = list.descentFlag === 'N' ? 'Y' : 'N';
			delete list.selected;
			this.assignedDetails.roles.push(list);
			this.$subscriptions.push(this._userRoleService.assignRoles(this.assignedDetails).subscribe((data) => {
				auditLog = this.generateAuditObject('U', before, data[0]);
				this._auditLogService.saveAuditLog(auditLog.actionType, auditLog.before, auditLog.after, 'PERSON_ROLE', auditLog.metadata,
				this.roleDetails.personId);				
				this.isSaving = false;
			}));
		}
	}

	private assignedAndUnAssignedRolesForPerson(): void {
		if (this.roleDetails.personId !== null && this.roleDetails.unitNumber !== null) {
			this.assignedDetails.personId = this.roleDetails.personId;
			this.assignedDetails.unitNumber = this.roleDetails.unitNumber;
			this.isAssignedAndUnassignedWidget = true;
			this.$subscriptions.push(this._userRoleService.getUnAssignedList(this.roleDetails).subscribe(
				(data: any) => {
					this.unAssignedList = data;
					this.tempUnAssignedList = this.unAssignedList;
				}));
			this.$subscriptions.push(this._userRoleService.getAssignedList(this.roleDetails).subscribe(
				(data: any) => {
					this.assignedList = data;
					this.tempAssignedList = this.assignedList;
				}));
		}
	}

	noUnassignedData(): void {
		this.tempModalDataList = this.unAssignedList.filter(list => list.selected === true);
		$('#UnassignedRoleModal').modal('show');
	}

	noAssignedData(): void {
		this.tempModalDataList = this.assignedList.filter(list => list.selected === true);
		$('#assignedRoleModal').modal('show');
	}

	moveUnAssignedList(): void {
		if (!this.isSaving) {
			let auditLog: any = {};
			this.isSaving = true;
			const SELECTED_LIST = deepCloneObject(this.unAssignedList.filter(e => e.selected));
			SELECTED_LIST.forEach((e: any) => {
				delete e.selected;
				e.acType = 'I';
			});
			this.assignedDetails.roles = SELECTED_LIST;
			this.assignedDetails.unitNumber = this.roleDetails.unitNumber;
			const BEFORE_VAL = deepCloneObject(this.tempAssignedList);
			this.$subscriptions.push(this._userRoleService.assignRoles(this.assignedDetails).subscribe(
				(data: any) => {
					this.tempAssignedList = this.assignedList.concat(data);
					this.assignedList = this.tempAssignedList;
					this.isSaving = false;
					this.unAssignedList = this.unAssignedList.filter(e => !e.selected);
					this.tempUnAssignedList = this.unAssignedList;
					this.searchText = null;
					this.search = null;
					auditLog = this.generateAuditObject('I', BEFORE_VAL, this.assignedList);
					this._auditLogService.saveAuditLog(auditLog.actionType, auditLog.before, auditLog.after, 'PERSON_ROLE', auditLog.metadata,
													   this.roleDetails.personId);	
				}, err => { this.isSaving = false; }));
		}
	}

	moveAssignedList(): void {
		if (!this.isSaving) {
			let auditLog: any = {};
			this.isSaving = true;
			const SELECTED_LIST = deepCloneObject(this.assignedList.filter(e => e.selected));
			SELECTED_LIST.forEach((e: any) => {
				delete e.selected;
				e.acType = 'D';
			});
			const BEFORE_VAL = deepCloneObject(this.tempAssignedList);
			this.assignedDetails.roles = SELECTED_LIST;
			this.$subscriptions.push(this._userRoleService.assignRoles(this.assignedDetails).subscribe(
				(data: any) => {
					this.tempUnAssignedList = this.unAssignedList.concat(data);
					this.unAssignedList = this.tempUnAssignedList;
					this.isSaving = false;
					this.assignedList = this.assignedList.filter(e => !e.selected);
					this.tempAssignedList = this.assignedList;
					this.searchText = null;
					this.search = null;
					auditLog = this.generateAuditObject('D', BEFORE_VAL, this.assignedList);
					this._auditLogService.saveAuditLog(auditLog.actionType, auditLog.before, auditLog.after, 'PERSON_ROLE', auditLog.metadata,
													   this.roleDetails.personId);					
					}, err => { this.isSaving = false; }));
		}
	}

	filterAssignedUnits(searchText): void {
		if (searchText !== '') {
			this.tempAssignedList = this.assignedList.filter(v => {
				return v.roleName.toLowerCase().includes(searchText.toLowerCase());
			});
		} else {
			this.tempAssignedList = this.assignedList;
		}
	}

	filterUnassignedUnits(searchText): void {
		if (searchText !== '') {
			this.tempUnAssignedList = this.unAssignedList.filter(v => {
				return v.roleName.toLowerCase().includes(searchText.toLowerCase());
			});
		} else {
			this.tempUnAssignedList = this.unAssignedList;
		}
	}

	closeModal(): void {
		this.isShowRightsModal = false;
	}

	viewRoleDetails(roleId): void {
		this.viewRoleId = roleId;
		this.isShowRightsModal = true;
	}

	private generateAuditObject(actionType: 'I' | 'U' | 'D', before: any, after: any): void {
		let auditLog: any = {};
		auditLog.before = this.getRoleAndUnit();
		auditLog.after = this.getRoleAndUnit();
		if (actionType === 'I' || actionType === 'D') {
			auditLog.before['roles'] =  this.getRoleNamesList(before);
			auditLog.after['roles'] =  this.getRoleNamesList(after);
			auditLog.metadata = actionType === 'I' ? Object.keys(auditLog.after) : Object.keys(auditLog.before);
			auditLog.actionType = this.getActionType(auditLog);
			return auditLog;
		} else {
			auditLog.before['descentFlag'] = before.descentFlag,
			auditLog.before['roleName'] = before.roleName;
			auditLog.after['descentFlag'] = after.descentFlag,
			auditLog.after['roleName'] = after.roleName;			
			auditLog.metadata = Object.keys(auditLog.before);
			auditLog.actionType = 'U';
			return auditLog;
		}
	}

	private getRoleAndUnit() {
		return {
			'Role Assigned To' : this.currentPersonName,
			'unitNumber': this.roleDetails.unitNumber + '(' + this.personUnitName + ')',
		}
	}

	/**
	 * if roles are inserted for the first time then it is insert action
	 * if roles are completely removed then it is delete action
	 * if roles are added to already existing roles or only some
	 * roles are deleted and remaining roles available, then 
	 * it is update action, that checking is done in this function.
	 */
	private getActionType(auditLog): 'I' | 'D' | 'U'{
		if (!auditLog.before.roles.length && auditLog.after.roles.length) {
			return 'I';
		} else if (auditLog.before.roles.length && !auditLog.after.roles.length) {
			return 'D';
		} else {
			return 'U';
		}
	}

	getRoleNamesList(inputArray: Array<any>) {
		return inputArray.map(e => e.roleName);
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
