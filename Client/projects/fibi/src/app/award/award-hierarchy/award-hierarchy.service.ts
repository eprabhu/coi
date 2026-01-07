
import { of as observableOf, Observable, BehaviorSubject } from 'rxjs';


import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AwardHierarchyService {
    private currentab = new BehaviorSubject<string>('award_home');
    currentvalue = this.currentab.asObservable();

    constructor(private _commonService: CommonService,
        private _http: HttpClient, private _router: Router) { }

    loadAwardHierarchy(awardNumber: string, selectedAwardNumber: string) {
        const params = {
            awardNumber: awardNumber,
            selectedAwardNumber: selectedAwardNumber
        };
        return this._http.post(this._commonService.baseUrl + '/getAwardHierarchy', params);
    }

    changeCurrenttab(tab: string) {
        this.currentab.next(tab);
    }

    public loadAwardSummary(awardId: string): Observable<JSON> {
        const params = {
            awardId: awardId
        };
        return this._http.post(this._commonService.baseUrl + '/getAwardSummary', params).pipe(
            catchError(error => {
                console.log('Retrieval error', error);
                if (error.status === 403) {
                    // name is given based on the values assinged in forbidden component please refer forbidden.component.ts
                    this._commonService.forbiddenModule = '1';
                    this._router.navigate(['/fibi/error/403']);
                    return observableOf(null);
                } else {
                    this._router.navigate(['/fibi/dashboard/awardList']);
                    return observableOf(null);
                }
            }));
    }

    getAwardlist(awardNumber) {
        return this._http.post(this._commonService.baseUrl + '/getAwardHierarchyData', { 'selectedAwardNumber': awardNumber });
    }
    maintainAward(params) {
        return this._http.post(this._commonService.baseUrl + '/maintainAwardHierarchy', params);
    }

    getAwardVersions(params) {
        return this._http.post(this._commonService.baseUrl + '/getAwardVersions', params);
    }
}
