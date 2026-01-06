import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ManPowerService {

  manpowerCategory: any = {};

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchAllManpowerLookUpDatas(awardId) {
    return this._http.get(this._commonService.baseUrl + '/fetchAllManpowerLookUpDatas', {
      headers: new HttpHeaders().set('awardId', awardId.toString())
    });
  }

  saveOrUpdateManpowerResource(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateManpowerResource', params);
  }

  deleteManpowerResource(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteManpowerResource', params);
  }

  fetchManpowerDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchManpowerDetails', params);
  }

  fetchManpowerPayrollDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchManpowerPayrollDetails', params);
  }

  fetchHelpText(param) {
    return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param);
  }

  calculatePlannedSalary(param) {
    return this._http.post(this._commonService.baseUrl + '/calculatePlannedSalary', param);
  }

  overrideActualCommittedAmount(param) {
    return this._http.post(this._commonService.baseUrl + '/overrideActualCommittedAmount', param);
  }

  fetchManpowerResources(param) {
    return this._http.post(this._commonService.baseUrl + '/fetchManpowerResources', param);
  }
  getResourceDetail(param) {
    return this._http.post(this._commonService.baseUrl + '/getResourceDetail', param);
  }

}
