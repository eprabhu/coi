import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RoleService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchPersonRoles(requestData) {
    return this._http.post(this._commonService.baseUrl + '/fetchProposalPersonRoles', requestData);
  }
  maintainPersonRoles(requestData) {
    return this._http.post(this._commonService.baseUrl + '/maintainProposalPersonRoles', requestData);
  }
}
