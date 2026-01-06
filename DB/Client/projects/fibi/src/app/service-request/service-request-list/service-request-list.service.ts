import { HTTP_ERROR_STATUS } from './../../app-constants';
import { CommonService } from './../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdvanceSearch } from './service-request-list.interface';

@Injectable()
export class ServiceRequestListService {

    isAdvanceSearchMade = false;
    sortCountObj: any = {};
    advanceSearchBackup: AdvanceSearch;

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    loadServiceRequestDashBoard(params) {
        return this._http.post(`${this._commonService.baseUrl}/loadServiceRequestDashBoard`, params)
            .pipe(catchError((err) => {
                if (err.status === 400) {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid character(s) found in search');
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Service Request list failed. Please try again.');
                }
                return of();
            }));
    }

    exportServiceRequestDashBoard(params) {
        return this._http.post(this._commonService.baseUrl + '/exportServiceRequestDashBoard', params, {
            observe: 'response',
            responseType: 'blob'
        });
    }
}
