import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ScoringCriteriaService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

fetchAllScoringCriteria(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchAllScoringCriteria', params);
  }
  saveOrUpdateGrantCallScoringCriteria(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantCallScoringCriteria', params);
  }
  deleteGrantCallScoringCriteria(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallScoringCriteria', params);
  }

}
