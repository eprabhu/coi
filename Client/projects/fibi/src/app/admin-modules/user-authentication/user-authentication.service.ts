import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

getExternalUserDetails(params) {
  return this._http.post(this._commonService.baseUrl + '/getExternalUserDetails', params);
}

updateApproveReject(params) {
  return this._http.post(this._commonService.baseUrl + '/updateApproveReject', params);
}

getExternalUserLoginDetails(param) {
  return this._http.post(this._commonService.baseUrl + '/getExternalUserLoginDetails', param);
}

}
