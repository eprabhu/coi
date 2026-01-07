import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class ManpowerComparisonService {

  constructor(private _http: HttpClient,
              private _commonService: CommonService) { }

  fetchManpowerDetails(awardId) {
    return this._http.get(this._commonService.baseUrl + '/fetchAwardManpowerForComparison', {
      headers: new HttpHeaders().set('awardId', awardId.toString())
    });
  }

  fetchManpowerResources(param) {
    return this._http.post(this._commonService.baseUrl + '/fetchManpowerResources', param);
  }

  getManpowerResourcesForComparison (param) {
    return this._http.post(this._commonService.baseUrl + '/getManpowerResourcesForComparison', param);
  }

}
