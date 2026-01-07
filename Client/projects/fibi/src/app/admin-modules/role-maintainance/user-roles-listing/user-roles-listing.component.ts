import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { NavigationService } from '../../../common/services/navigation.service';
import { fadeDown, slideInOut } from '../../../common/utilities/animations';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { PersonDetails, UnitDetails } from '../common/role-maintenance';
import { RoleMaintainanceService } from '../role-maintainance.service';
import { UserRolesListingService } from './user-roles-listing.service';

class RoleSearch {
	unitNumber = null;
	roleId = null;
	personId = null;
}

@Component({
	selector: 'app-user-roles-listing',
	templateUrl: './user-roles-listing.component.html',
	styleUrls: ['./user-roles-listing.component.css'],
	animations: [slideInOut, fadeDown],
	providers: [UserRolesListingService]
})
export class UserRolesListingComponent implements OnInit, OnDestroy {

	elasticSearchOptions: any = {};
	unitSearchOptions: any = {};
	roleSearchOptions: any = {};
	$subscriptions: Subscription[] = [];
	roleResults: any = [];
	personRoleName: any;
	roleSearchObject: RoleSearch = new RoleSearch();
	personRoleUnitList: any;
	isSaving = false;
	personRoleLists: any;
	roleDetails: any = {
		personId: '',
		unitNumber: ''
	};
	concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
	viewPerson: any;
	roleVisibleId: any;
	isRoleList = false;
	unitId: any;
	personId: any;
	clearField: boolean;
	deployMap = environment.deployUrl;
	viewRoleId: any;
	isShowRightsModal = false;

	constructor(
		private _elasticConfig: ElasticConfigService,
		private _userRoleService: UserRolesListingService,
		private _router: Router,
		private _activatedRoute: ActivatedRoute,
		public _roleMaintenanceService: RoleMaintainanceService,
		private _navigateService: NavigationService) { }

	ngOnInit() {
		this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
		this.unitSearchOptions = getEndPointOptionsForDepartment();
		this.setUnitIdAndPersonIdFromQueryParams();
		this.setUnitAndPersonSearch();
		this.fetchRolesForLookUpValues();
		this.setDefaultValues();
	}

	private setUnitAndPersonSearch(): void {
		if (this.unitId) {
			this.getUnitDetailsFromUnitHierarchy();
			this.getPersonDetailsFromPersonMaintenance();
			this._roleMaintenanceService.isSearchClicked = true;
			this.searchUserRolesByPersonIdAndUnitId();
		}
	}

	private getUnitDetailsFromUnitHierarchy(): void {
		this.roleSearchObject.unitNumber = this.unitId;
		this.roleDetails.unitNumber = this.unitId;
		this.fetchUnitName(this.unitId);
	}

	private getPersonDetailsFromPersonMaintenance(): void {
		if (this.personId) {
			this.roleSearchObject.personId = this.personId;
			this.fetchPersonData(this.personId);
		}
	}

	/** Fetches the corresponding Unit name with respect to the unitId given. */
	private fetchUnitName(unitId): void {
		this.$subscriptions.push(this._userRoleService.getUnitName(unitId).subscribe(
			(data: any) => {
				if (data) {
					this.unitSearchOptions.defaultValue = concatUnitNumberAndUnitName(unitId, data);
					this.unitSearchOptions = Object.assign({}, this.unitSearchOptions);
					const UNIT_OBJ = { 'unitNumber': unitId, 'unitName': data };
					this._roleMaintenanceService.tempAssignUnitDetails = Object.assign({}, UNIT_OBJ );
					this.unitChangeFunction(UNIT_OBJ);
				}
			}
		));
	}

	/** Fetches the corresponding Person name with respect to the personId given. */
	private fetchPersonData(personId): void {
		if (this.personId != null) {
			this.$subscriptions.push(this._userRoleService.getPersonData(personId).subscribe((data: any) => {
				if (data) {
					const PERSON_DETAILS: any = {};
					this.elasticSearchOptions.defaultValue = data.person.fullName;
					this.elasticSearchOptions = Object.assign({}, this.elasticSearchOptions);
					PERSON_DETAILS.full_name = data.person.fullName;
					PERSON_DETAILS.email_addr = data.person.emailAddress;
					PERSON_DETAILS.prncpl_id = data.person.personId;
					PERSON_DETAILS.unit_name = data.person.unit.unitName;
					PERSON_DETAILS.prncpl_nm = data.person.principalName;
					PERSON_DETAILS.primaryTitle = data.person.primaryTitle;
					PERSON_DETAILS.directory_title = data.directoryTitle;
					this.selectUserElasticResult(PERSON_DETAILS);
					this._roleMaintenanceService.tempAssignPersonDetails = Object.assign({}, this._roleMaintenanceService.assignPersonDetails);
				}
			}));
		}
	}

	/** Sets unit id and person id from query params. */
	private setUnitIdAndPersonIdFromQueryParams(): void {
		this.$subscriptions.push(this._activatedRoute.queryParams.subscribe(params => {
			params['unitId'] ? this.unitId = params['unitId'] : this.unitId = null;
			params['personId'] ? this.personId = params['personId'] : this.personId = null;
		}));
	}

	private setDefaultValues(): void {
		if (this._navigateService.previousURL.includes('userRoleMaintain')) {
			this.setSearchDefaultValue();
		} else {
			this.clearCommonObjects();
		}
	}

	private setSearchDefaultValue(): void {
		let personObj: any;
		let unitObj: any;
		if (this._navigateService.previousURL.includes('CO=E')) {
			// tslint:disable-next-line: max-line-length
			personObj = this._roleMaintenanceService.isPersonChangedAndSearched ? this._roleMaintenanceService.assignPersonDetails : this._roleMaintenanceService.tempAssignPersonDetails;
			unitObj = this._roleMaintenanceService.isUnitChangedAndSearched ? this._roleMaintenanceService.assignUnitDetails : this._roleMaintenanceService.tempAssignUnitDetails;
			if (!this._roleMaintenanceService.isPersonChangedAndSearched) {
				this._roleMaintenanceService.assignPersonDetails = Object.assign({}, this._roleMaintenanceService.tempAssignPersonDetails);
			}
			if (!this._roleMaintenanceService.isUnitChangedAndSearched) {
				this._roleMaintenanceService.assignUnitDetails = Object.assign({}, this._roleMaintenanceService.tempAssignUnitDetails);
			}
		} else {
			personObj = this._roleMaintenanceService.assignPersonDetails;
			unitObj = this._roleMaintenanceService.assignUnitDetails;
		}
		this.assignDefaultValues(personObj, unitObj);
	}

	private clearCommonObjects(): void {
			this._roleMaintenanceService.editPersonDetails = new PersonDetails();
			this._roleMaintenanceService.assignPersonDetails = new PersonDetails();
			this._roleMaintenanceService.editUnitDetails = new UnitDetails();
			this._roleMaintenanceService.assignUnitDetails = new UnitDetails();
			this._roleMaintenanceService.tempAssignPersonDetails = new PersonDetails();
			this._roleMaintenanceService.tempAssignUnitDetails = new UnitDetails();
	}

	private assignDefaultValues(personObj, unitObj): void {
		if (personObj.personId) {
			this.elasticSearchOptions.defaultValue = personObj.personName;
			this.roleSearchObject.personId = personObj.personId;
		}
		if (unitObj.unitNumber) {
			this.unitSearchOptions.defaultValue = concatUnitNumberAndUnitName(unitObj.unitNumber, unitObj.unitName);
			this.roleSearchObject.unitNumber = unitObj.unitNumber;
		}
		if (this._navigateService.previousURL.includes('CO=E')) {
			this.searchUserRolesByPersonIdAndUnitId();
		}
	}

	private setCompleterListOptionsForRoles(): void {
		this.roleSearchOptions.arrayList = this.roleResults;
		this.roleSearchOptions.contextField = 'roleName';
		this.roleSearchOptions.filterFields = 'roleName';
		this.roleSearchOptions.formatString = 'roleName';
	}

	private fetchRolesForLookUpValues(): void {
		this.$subscriptions.push(this._userRoleService.fetchRoles().subscribe(data => {
			this.roleResults = data;
			this.setCompleterListOptionsForRoles();
		}));
	}

	selectUserElasticResult(result): void {
		this._roleMaintenanceService.isPersonChangedAndSearched = false;
		result === null ? this.setBasicDetailsOfSelectedPersonNull() : this.setBasicDetailsOfSelectedPerson(result);
	}

	private setBasicDetailsOfSelectedPerson(result: any): void {
		this._roleMaintenanceService.assignPersonDetails.personName = result.full_name;
		this._roleMaintenanceService.assignPersonDetails.email_id = result.email_addr;
		this._roleMaintenanceService.assignPersonDetails.personId = result.prncpl_id;
		this._roleMaintenanceService.assignPersonDetails.unit_name = result.unit_name;
		this._roleMaintenanceService.assignPersonDetails.user_name = result.prncpl_nm;
		this._roleMaintenanceService.assignPersonDetails.primaryTitle = result.primaryTitle;
		this._roleMaintenanceService.assignPersonDetails.directoryTitle = result.directory_title;
		if (result.external) {
			this._roleMaintenanceService.assignPersonDetails.isExternalUser = result.external == 'Y' ? true : false;
		}
		this.roleSearchObject.personId = result.prncpl_id;
	}

	setBasicDetailsOfSelectedPersonNull(): void {
		this._roleMaintenanceService.assignPersonDetails = new PersonDetails();
		this.roleSearchObject.personId = null;
	}

	editPersonDetails(person): void {
		this._roleMaintenanceService.editPersonDetails.personName = person.fullName;
		this._roleMaintenanceService.editPersonDetails.user_name = person.userName;
		this._roleMaintenanceService.editPersonDetails.email_id = person.email;
		this._roleMaintenanceService.editPersonDetails.unit_name = person.unitName;
		this._roleMaintenanceService.editPersonDetails.unit_number = person.unitNumber;
		this._roleMaintenanceService.editPersonDetails.primaryTitle = person.primaryTitle;
		this._roleMaintenanceService.editPersonDetails.directoryTitle = person.directoryTitle;
		this._roleMaintenanceService.editPersonDetails.personId = person.personId;
		this._roleMaintenanceService.editPersonDetails.homeUnitName = person.personHomeUnitName;
		this._roleMaintenanceService.editUnitDetails.unitName = person.unitName;
		this._roleMaintenanceService.editUnitDetails.unitNumber = person.unitNumber;
		this._router.navigate(['fibi/role-maintainance/userRoleMaintain'],
		{ queryParams: { CO: 'E' } }
		);
	}

	unitChangeFunction(event: any): void {
		this._roleMaintenanceService.isUnitChangedAndSearched = false;
		if (event) {
			this._roleMaintenanceService.assignUnitDetails.unitName = event.unitName;
			this._roleMaintenanceService.assignUnitDetails.unitNumber = event.unitNumber;
			this.roleSearchObject.unitNumber = event.unitNumber;
		} else {
			this._roleMaintenanceService.assignUnitDetails = new UnitDetails();
			this.roleSearchObject.unitNumber = null;
		}
	}

	findRoles(event: any): void {
		if (event) {
			this.personRoleName = event.roleName;
			this.roleSearchObject.roleId = event.roleId;
		} else {
			this.personRoleName = null;
			this.roleSearchObject.roleId = null;
		}
	}

	searchUserRolesList() {
		this._roleMaintenanceService.tempAssignPersonDetails = Object.assign({}, this._roleMaintenanceService.assignPersonDetails);
		this._roleMaintenanceService.tempAssignUnitDetails = Object.assign({}, this._roleMaintenanceService.assignUnitDetails);
		this._roleMaintenanceService.isPersonChangedAndSearched = true;
		this._roleMaintenanceService.isUnitChangedAndSearched = true;
		this._roleMaintenanceService.isSearchClicked = true;
		this.searchUserRolesByPersonIdAndUnitId();
	}

	searchUserRolesByPersonIdAndUnitId(): void {
		this.personRoleUnitList = [];
		if (!this.isSaving) {
			this.isSaving = true;
			this.$subscriptions.push(this._userRoleService.getAssignedRoleLists(this.roleSearchObject).subscribe(data => {
				this.personRoleUnitList = data;
				this.isSaving = false;
			}, err => { this.isSaving = false; }));
		}
	}

	viewPersonRoles(personId, unitNumber, index): void {
		if (this.viewPerson !== index) {
			this.roleVisibleId = personId;
			this.personRoleLists = [];
			this.roleDetails.personId = personId;
			this.roleDetails.unitNumber = unitNumber;
			this.$subscriptions.push(this._userRoleService.getAssignedList(this.roleDetails).subscribe(
				(data: any) => {
					this.personRoleLists = data;
				}
			));
		}
	}

	setPersonIndex(i): void {
		this.viewPerson = this.viewPerson === i ?  null : i;
	}

	openAssignRoles(): void {
		this._roleMaintenanceService.isSearchClicked = false;
		this._router.navigate(['fibi/role-maintainance/userRoleMaintain'],
		{ queryParams: { CO: 'A' } });
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	closeModal(): void {
		this.isShowRightsModal = false;
	}

	viewRoleDetails(roleId): void {
		this.viewRoleId = roleId;
		this.isShowRightsModal = true;
	}

}
