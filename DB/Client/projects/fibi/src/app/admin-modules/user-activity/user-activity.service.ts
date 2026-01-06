import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class UserActivityService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

getPersonLoginDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getPersonLoginDetails', params);
  }

exportUserActivityDatas(params) {
    return this._http.post(this._commonService.baseUrl + '/exportUserActivityDatas', params,
    {observe: 'response', responseType: 'blob' });
  }

  getHomeUnitDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getHomeUnitDetails', params);
  }
}
