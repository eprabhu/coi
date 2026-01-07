import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class CostShareService {
    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getCostShareData(awardId) {
        return this._http.post(this._commonService.baseUrl + '/getAwardCostShare', { 'awardId': awardId });
    }
}
