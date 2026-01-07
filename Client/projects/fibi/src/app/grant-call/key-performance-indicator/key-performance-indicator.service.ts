import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class KeyPerformanceIndicatorService {

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  getKpis() {
    return this._http.get(this._commonService.baseUrl + '/fetchAllKPIs');
  }

  saveorupdatekpi(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantCallKPI', params);
  }

  deleteKpis(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallKPI', params);
  }

  getKpiByGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/getKPIByGrantCall', params);
  }
}
