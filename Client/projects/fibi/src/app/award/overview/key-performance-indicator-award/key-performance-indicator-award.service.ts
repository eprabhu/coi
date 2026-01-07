import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class KeyPerformanceIndicatorAwardService {


constructor(private _http: HttpClient, private _commonService: CommonService) { }

saveOrUpdateAwardKpi(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardKPI', params);
}
deleteAwardKpi(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardKPI', params);
}
}
