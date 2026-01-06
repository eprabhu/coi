import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { RoleListService } from './role-list.service';

@Component({
	selector: 'app-roles-list',
	templateUrl: './roles-list.component.html',
	styleUrls: ['./roles-list.component.css'],
	providers: [AuditLogService,
				{provide: 'moduleName', useValue: 'ROLE_MAINTENANCE'}]
})
export class RolesListComponent implements OnInit {

	column = 'roleName';
	isDesc: any;
	direction: number = -1;
	searchText: any;
	viewRole: any;
	$subscriptions: Subscription[] = [];
	roleResults: any = [];
	roleId: any;
	roleName: any;
	roleOverview: any;
	isViewRight = false;
	searchedRolesList: any = [];

	constructor(private _rolesListService: RoleListService, private _auditLogService: AuditLogService) { }

	ngOnInit() {
		this.loadRoleList();
	}

	sortBy(property): void {
		this.column = property;
		this.direction = this.isDesc ? 1 : -1;
	}

	setRoleIndex(i): void {
		this.viewRole = this.viewRole === i ? null : i;
	}

	loadRoleList(): void {
		this.$subscriptions.push(this._rolesListService.fetchRoles().subscribe(
			(data) => {
				this.roleResults = data;
			}));
	}

	viewRoleDetails(roleId): void {
		this.$subscriptions.push(this._rolesListService.viewRoleOverview(roleId).subscribe(
			(data: any) => {
				this.roleOverview = data;
			}));
	}

	deleteRole(roleId, roleName): void {
		this.roleId = roleId;
		this.roleName = roleName;
	}

	deleteRoles(roleId): void {
		this.$subscriptions.push(this._rolesListService.deleteRole(roleId).subscribe(
			() => {
				this._auditLogService.saveAuditLog('D', {'roleName': this.roleName}, {}, 'ROLE_RIGHT', ['roleName'], roleId);
				this.loadRoleList();
			}));
	}

}