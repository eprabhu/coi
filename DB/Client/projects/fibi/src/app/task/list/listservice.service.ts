import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ListserviceService {

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  fetchTasksByParams(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchTasksByParams', params);
  }
  getTaskLookUpData() {
    return this._http.get(this._commonService.baseUrl + '/getTaskLookUpData');
  }
  advancedSearchForTask(params) {
    return this._http.post(this._commonService.baseUrl + '/advancedSearchForTask', params);
  }
}
