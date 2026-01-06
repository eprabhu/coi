import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AwardHistoryService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getAwardHistoryInfo(params) {
    return this._http.post(this._commonService.baseUrl + '/showAwardHistory', params);
  }

}
