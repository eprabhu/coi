import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class UserRolesListingService {

	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	fetchRoles() {
		return this._http.post(this._commonService.baseUrl + '/fetchAllRoles', {});
	}

	getAssignedRoleLists(params) {
		return this._http.post(this._commonService.baseUrl + '/getAssignedRole', params);
	}

	getAssignedList(role) {
		return this._http.post(this._commonService.baseUrl + '/assignedRoleOfPerson', role);
	}

	getUnitName(unitId) {
		return this._http.post(this._commonService.baseUrl + '/getUnitName', { 'unitNumber': unitId });
	}

	getPersonData(personId) {
		return this._http.post(this._commonService.baseUrl + '/getPersonDetailById', { 'personId': personId });
	}
}
