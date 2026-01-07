import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()

export class UserRoleService {

	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	getUnAssignedList(role) {
		return this._http.post(this._commonService.baseUrl + '/unassignedRoleOfPerson', role);
	}

	getAssignedList(role) {
		return this._http.post(this._commonService.baseUrl + '/assignedRoleOfPerson', role);
	}

	assignRoles(assignedList) {
		return this._http.post(this._commonService.baseUrl + '/savePersonRoles', assignedList);
	}

}
