import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuditLogService } from '../../../../common/services/audit-log.service';
import { CommonService } from '../../../../common/services/common.service';
import { deepCloneObject } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { RoleListService } from '../role-list.service';

declare var $: any;

@Component({
	selector: 'app-maintain-role',
	templateUrl: './maintain-role.component.html',
	styleUrls: ['./maintain-role.component.css'],
	providers: [AuditLogService,
	{provide: 'moduleName', useValue: 'ROLE_MAINTENANCE'}
	]
})
export class MaintainRoleComponent implements OnInit, OnDestroy {

	isCreateRole = false;
	roleTypesList: any = [];
	$subscriptions: Subscription[] = [];
	role: any = {};
	validationMap: Map<string, boolean> = new Map();
	roleRights: any = [];
	tempAssignedRightList: any = [];
	tempUnAssignedRightList: any = [];
	assignedRightList: any = [];
	unAssignedRightList: any = [];
	allCheck: boolean;
	currentRoleId: any;
	tempModalDataList: any;
	isSaving = false;
	searchText: any;
	search: any;
	tempSelectedList: any;

	constructor(
		private _route: ActivatedRoute,
		private _roleListService: RoleListService,
		private _commonService: CommonService,
		private _router: Router,
		private _auditLogService: AuditLogService
	) { }

	ngOnInit() {
		this.isCreateRole = this._route.snapshot.queryParams['roleId'] ? false : true;
		this.currentRoleId = this._route.snapshot.queryParams['roleId'];
		this.getRoleTypes();
		this.getAssignedAndUnAssignedRightsList(this.currentRoleId);
		if (!this.isCreateRole) {
			this.$subscriptions.push(this._roleListService.getRoleById(this.currentRoleId).subscribe(
				(data: any) => {
					this.role = data.role;
				}));
		}
	}

	getRoleTypes(): void {
		this.$subscriptions.push(this._roleListService.getRoleTypes().subscribe(
			(data: any) => {
				this.roleTypesList = data.roleTypeList;
			}));
	}

	onChangeRight(rightId, event): void {
		if (event.target.checked) {
			this.roleRights.push({ 'rightId': rightId });
		} else {
			this.allCheck = false;
			const INDEX = this.roleRights.findIndex(item => item.rightId === rightId);
			this.roleRights.splice(INDEX, 1);
		}
	}

	isMandatoryFieldsFilled(): boolean {
		this.validationMap.clear();
		['roleName', 'roleTypeCode', 'description'].forEach((fieldName) => {
			if (!this.role[fieldName]) { this.validationMap.set(fieldName, true); }
		});
		return this.validationMap.size === 0;
	}

	saveRoles(): void {
		if (this.isMandatoryFieldsFilled()) {
			const REQUEST_REPORT_DATA: any = {};
			REQUEST_REPORT_DATA.updateUser = this._commonService.getCurrentUserDetail('userName');
			REQUEST_REPORT_DATA.role = this.role;
			REQUEST_REPORT_DATA.roleRights = this.roleRights;
			REQUEST_REPORT_DATA.acType = 'I';
			this.$subscriptions.push(this._roleListService.saveRoleData(REQUEST_REPORT_DATA).subscribe((data: any) => {
				this.role = data.role;
				this.role.roleType = this.getRoleTypeFromRoleTypeCode(data.role.roleTypeCode);
				this.roleRights = [];
				this._router.navigate(['/fibi/role-maintainance/rolesList/maintain-role'],
					{ queryParams: { roleId: data.role.roleId } });
				let auditLog = this.generateAuditObject('I', null, data);
				this._auditLogService.saveAuditLog('I', auditLog.before, auditLog.after, 'ROLE_RIGHT', auditLog.metaData, data.role.roleId);
				this.isCreateRole = false;
				this.search = null;
				this.searchText = null;
				this.getAssignedAndUnAssignedRightsList(this.role.roleId);
			}));
		}
	}

	getAssignedAndUnAssignedRightsList(roleId): void {
		this.assignedRightList = [];
		this.unAssignedRightList = [];
		this.tempAssignedRightList = [];
		this.tempUnAssignedRightList = [];
		this.$subscriptions.push(this._roleListService.getAssignedAndUnassignedRightsList(roleId).subscribe(
			(data: any) => {
				this.assignedRightList = data.assignedRights;
				this.unAssignedRightList = data.unAssignedRights;
				this.tempAssignedRightList = this.assignedRightList;
				this.tempUnAssignedRightList = this.unAssignedRightList;
			}));
	}

	selectAllUnAssignedRights(check): void  {
		this.tempUnAssignedRightList.forEach(element => {
			element.selected = check;
			if (check === true) {
				this.roleRights.push({ 'rightId': element.rightId });
			} else {
				this.roleRights = [];
			}
		});
	}

	selectAllAssignedRights(check): void {
		this.tempAssignedRightList.forEach(element => {
			element.selected = check;
		});
	}

	getRoleTypeFromRoleTypeCode(roleTypeCode: string): void {
		return this.roleTypesList.find(roleType => roleType.roleTypeCode == roleTypeCode);
	}

	noUnassignedData(): void {
		this.tempModalDataList = this.unAssignedRightList.filter(list => list.selected);
		$('#UnassignedRightModal').modal('show');
	}

	noAssignedData(): void {
		this.tempModalDataList = this.assignedRightList.filter(list => list.selected);
		$('#assignedRightModal').modal('show');
	}

	getSelectedRightsList(): void {
		if (this.isMandatoryFieldsFilled()) {
			this.tempSelectedList = this.unAssignedRightList.filter(list => list.selected);
			$('#createRightModal').modal('show');
		}
	}

	moveUnAssignedList(): void {
		if (!this.isSaving) {
			this.isSaving = true;
			const SELECTED_LIST = deepCloneObject(this.unAssignedRightList.filter(e => e.selected));
			SELECTED_LIST.forEach((e: any) => {
				delete e.selected;
			});
			const BEFORE = deepCloneObject(this.tempAssignedRightList);
			this.$subscriptions.push(this._roleListService.saveRoleData(
				{
					'role': this.role,
					'roleRights': SELECTED_LIST,
					'updateUser': this._commonService.getCurrentUserDetail('userName'),
					'acType': 'U',
					'roleRightAcType': 'ARR'
				}).subscribe(
					(data: any) => {
						this.role = data.role;
						this.tempAssignedRightList = this.assignedRightList.concat(data.roleRights);
						this.assignedRightList = this.tempAssignedRightList;
						this.isSaving = false;
						this.unAssignedRightList = this.unAssignedRightList.filter(e => !e.selected);
						this.tempUnAssignedRightList = this.unAssignedRightList;
						this.search = null;
						this.searchText = null;
						let auditLog = this.generateAuditObject('U', BEFORE, this.tempAssignedRightList);
						this._auditLogService.saveAuditLog('U', auditLog.before, auditLog.after, 'ROLE_RIGHT', auditLog.metaData, this.currentRoleId);
					}, err => { this.isSaving = false; }));
		}
	}

	moveAssignedList(): void {
		if (!this.isSaving) {
			this.isSaving = true;
			const SELECTED_LIST = deepCloneObject(this.assignedRightList.filter(e => e.selected));
			SELECTED_LIST.forEach((e: any) => {
				delete e.selected;
			});
			const BEFORE = deepCloneObject(this.tempAssignedRightList);
			this.$subscriptions.push(this._roleListService.saveRoleData(
				{
					'role': this.role,
					'roleRights': SELECTED_LIST,
					'updateUser': this._commonService.getCurrentUserDetail('userName'),
					'acType': 'U', 'roleRightAcType': 'DRR'
				}).subscribe(
					(data: any) => {
						this.role = data.role;
						this.tempUnAssignedRightList = this.unAssignedRightList.concat(data.roleRights);
						this.unAssignedRightList = this.tempUnAssignedRightList;
						this.isSaving = false;
						this.assignedRightList = this.assignedRightList.filter(e => !e.selected);
						this.tempAssignedRightList = this.assignedRightList;
						this.search = null;
						this.searchText = null;
						let auditLog = this.generateAuditObject('U', BEFORE, this.tempAssignedRightList);
						this._auditLogService.saveAuditLog('U', auditLog.before, auditLog.after, 'ROLE_RIGHT', auditLog.metaData, this.currentRoleId);
					}, err => { this.isSaving = false; }));
		}
	}

	/**
	 * @param  {} searchText
	 * filters the assigned and unassigned list with respect to the input entered
	 */
	filterAssignedRights(searchText): void {
		if (searchText !== '') {
			this.tempAssignedRightList = this.assignedRightList.filter(v => {
				return v.rightName.toLowerCase().includes(searchText.toLowerCase());
			});
		} else {
			this.tempAssignedRightList = this.assignedRightList;
		}
	}

	filterUnassignedRights(searchText): void {
		if (searchText !== '') {
			this.tempUnAssignedRightList = this.unAssignedRightList.filter(v => {
				return v.rightName.toLowerCase().includes(searchText.toLowerCase());
			});
		} else {
			this.tempUnAssignedRightList = this.unAssignedRightList;
		}
	}

	private generateAuditObject(actionType: 'I'|'U'|'D', before: any, after: any): any {
		let auditLog: any = {};
		switch (actionType) {
			case 'I': {
				auditLog.before = {};
				auditLog.after = {
					'description': after.role.description,
					'roleName': after.role.roleName,
					'roleTypeCode': after.role.roleTypeCode,
					'rights': this.getRightName(after.roleRights)
				};
				auditLog.metaData = Object.keys(after);
				return auditLog;
			}
			case 'U' : {
				auditLog.before = {
					'roleName': this.role.roleName,
					'rights' : this.getRightName(before),
				};
				auditLog.after = {
					'roleName': this.role.roleName,
					'rights': this.getRightName(after)
				};				
				auditLog.metaData = Object.keys(before);
				return auditLog;
			}
			default: {
				return;
			}
		}

	}

	private getRightName(rights: any): Array<any> {
		return rights.map(e => e.rightName);
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
