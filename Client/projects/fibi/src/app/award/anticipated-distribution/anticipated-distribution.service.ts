import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { AnticipatedDistributionPeriod, LoadAnticipatedObject } from './anticipated-distribution.interface';

@Injectable()
export class AnticipatedDistributionService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    loadAnticipatedDistribution(params: LoadAnticipatedObject): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/loadAnticipatedDistribution`, params);
    }

    saveOrUpdateAnticipatedDistribution(params: AnticipatedDistributionPeriod[]): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/saveOrUpdateAnticipatedDistribution`, params);
    }

    deleteAnticipatedDistribution(params: number): Observable<any> {
        return this._http.delete(`${this._commonService.baseUrl}/deleteAnticipatedDistribution/${params}`);
    }

}
