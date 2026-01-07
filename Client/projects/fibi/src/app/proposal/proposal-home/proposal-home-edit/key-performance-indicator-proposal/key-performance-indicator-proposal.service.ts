import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';


@Injectable()
export class KeyPerformanceIndicatorProposalService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

saveOrUpdateProposalKPIs(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalKPI', params);
  }
}
