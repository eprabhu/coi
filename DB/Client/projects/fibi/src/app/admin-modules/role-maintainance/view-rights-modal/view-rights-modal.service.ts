import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ViewRightsModalService {

	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	viewRoleOverview(roleId) {
		return this._http.post(this._commonService.baseUrl + '/roleInformation', { 'roleId': roleId });
	}

}
