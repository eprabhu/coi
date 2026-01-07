import { CommonService } from './../../../../common/services/common.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProjectCostOverviewViewService {
  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  getAwardFunds(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardFunds', params);
  }
}
