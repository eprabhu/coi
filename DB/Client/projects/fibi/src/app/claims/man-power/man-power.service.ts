import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ManPowerService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  loadClaimManpower(params) {
    return this._http.post(this._commonService.baseUrl + '/loadClaimManpower', params);
  }

  saveOrUpdateClaimManpower(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaimManpower', params);
  }
}
