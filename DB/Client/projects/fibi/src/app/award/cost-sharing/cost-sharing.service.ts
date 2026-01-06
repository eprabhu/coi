import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class CostSharingService {
    constructor(private _http: HttpClient, private _commonService: CommonService) { }
    getCostShareData(params) {
        return this._http.post(this._commonService.baseUrl + '/getAwardCostShare', params);
    }
    addCostShare(params) {
        return this._http.post(this._commonService.baseUrl + '/saveAwardCostShare', params);
    }
    deleteCostShare(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteAwardCostShare', params);
    }
}
