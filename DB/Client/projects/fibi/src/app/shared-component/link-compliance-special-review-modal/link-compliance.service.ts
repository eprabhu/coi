import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class LinkComplianceService {
  constructor(
    private _http: HttpClient,
    private _commonService: CommonService
  ) { }

  loadProtocolDetail(params) {
    return this._http.post(this._commonService.baseUrl + '/loadProtocolDetail', params);
  }

}
