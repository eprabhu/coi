import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class EntityRiskSliderService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getRiskLookup() {
        return this._http.get(this._commonService.baseUrl + '/fcoiDisclosure/risk');
    }

    saveRisk(params) {
        return this._http.put(this._commonService.baseUrl + '/fcoiDisclosure/modifyRisk', params);
    }

    getDisclosureRiskHistory(params) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/history', params);
    }

}
