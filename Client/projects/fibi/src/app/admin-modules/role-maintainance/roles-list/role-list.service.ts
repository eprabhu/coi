import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class RoleListService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

fetchRoles() {
  return this._http.post( this._commonService.baseUrl + '/fetchAllRoles', { });
}

deleteRole(roleId) {
  return this._http.post( this._commonService.baseUrl + '/deleteRole',  {'roleId': roleId });
}

viewRoleOverview(roleId) {
  return this._http.post(this._commonService.baseUrl + '/roleInformation',  {'roleId': roleId});
}

getRoleTypes() {
  return this._http.post( this._commonService.baseUrl + '/createRole',  { });
}

getAssignedAndUnassignedRightsList(roleId) {
  return this._http.post( this._commonService.baseUrl + '/getAssignedAndUnassignedRights',  {'roleId': roleId });
}

saveRoleData(params) {
  return this._http.post( this._commonService.baseUrl + '/saveOrUpdateRole', params);
}

getRoleById(roleId) {
  return this._http.post( this._commonService.baseUrl + '/getRoleById',  {'roleId': roleId });
}

}
