import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class EntityDetailsModalService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    getEntityDetails(entityId: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/fetch/${entityId}`);
    }

    getAllEntityVersion(entityNumber: number | string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/version/${entityNumber}`);
    }

}
