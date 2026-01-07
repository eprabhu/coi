import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class DetailsBreakdownService {

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) {
    }

    loadClaimDetailBreakDown(params) {
        return this._http.post(this._commonService.baseUrl + '/loadClaimDetailBreakDown', params);
    }

    getPrevExcludedClaimSummaryDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/getPrevExcludedClaimSummaryDetails', params);
    }

    updateClaimSummaryExcludeFlag(params) {
        return this._http.post(this._commonService.baseUrl + '/updateClaimSummaryExcludeFlag', params);
    }

    saveOrUpdateClaimBreakDown(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaimBreakDown', params);
    }

    updateAdjustedIndirectCost(params) {
        return this._http.patch(this._commonService.baseUrl + '/updateAdjustedIndirectCost', params);
    }
}
