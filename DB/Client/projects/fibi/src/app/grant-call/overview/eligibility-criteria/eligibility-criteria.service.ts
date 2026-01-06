import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EligibilityCriteriaService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

addGrantCallEligibility(params) {
    return this._http.post(this._commonService.baseUrl + '/saveGrantCallEligibilityCriteria', params);
  }

deleteGrantCallEligibility(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallEligibility', params);
  }

}
