import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()

export class OverviewService {

    constructor(
        private _http: HttpClient,
        private _commonService: CommonService
    ) { }

    saveServiceRequestWatcher(param): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/saveServiceRequestWatcher`, param);
    }

    deleteServiceRequestWatcher(watcherId: number): Observable<any> {
        return this._http.delete(`${this._commonService.baseUrl}/deleteServiceRequestWatcher/${watcherId}`);
    }

    loadModuleDetail(moduleCode: number, moduleItemKey: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadModuleDetail/${moduleCode}/${moduleItemKey}`);
    }
    
    getPersonInformation(personId) {
		return this._http.post(this._commonService.baseUrl + '/getPersonPrimaryInformation', {'personId': personId});
	}   

}
