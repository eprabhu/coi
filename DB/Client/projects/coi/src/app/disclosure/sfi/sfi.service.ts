import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class SfiService {

    previousURL= '';
    isSFIRequired = false;

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    deleteSFI(params) {
        return this._http.delete(`${this._commonService.baseUrl}/personEntity/${params}`);
    }

    createSFI(params) {
        return this._http.post(this._commonService.baseUrl + '/personEntity', params)
    }

    saveOrUpdateCoiEntity(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateCoiEntity', params)
    }

    getSFIDetails(coiFinancialEntityId) {
        return this._http.get(`${this._commonService.baseUrl}/getSFIDetails/${coiFinancialEntityId}`)
    }

    saveOrUpdateCoiFinancialEntityDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/personEntity/addRelationship', params);
    }
    getEntityDetails(entityId) {
      return this._http.get(`${this._commonService.baseUrl}/getEntityDetails/${entityId}`);
    }
}
