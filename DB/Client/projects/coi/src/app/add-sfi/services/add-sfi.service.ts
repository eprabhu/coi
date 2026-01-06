import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { Observable } from 'rxjs';

@Injectable()
export class AddSfiService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    createSFI(params: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/personEntity', params)
    }

    isEntityAdded(entityId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/isLinked/${entityId}/personEntity`);
    }

    addSFILookUp(): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/loadSFILookups');
    }

}
