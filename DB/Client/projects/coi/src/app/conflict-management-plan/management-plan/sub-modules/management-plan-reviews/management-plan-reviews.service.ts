import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { Observable } from 'rxjs';
import { CmpSaveReviewRO } from '../../../shared/management-plan.interface';

@Injectable()
export class ManagementPlanReviewsService {

    headerTop: string = '200px'

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    saveOrUpdateCoiReview(params: CmpSaveReviewRO): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/cmp/review', params);
    }

    fetchCmpReviews(cmpId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/review/${cmpId}`);
    }

    deleteReview(reviewId: string | number): Observable<any> {
        return this._http.delete(`${this._commonService.baseUrl}/cmp/review/${reviewId}`);
    }

    reviewHistory(cmpId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/cmp/review/history/${cmpId}`);
    }

}
