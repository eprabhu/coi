import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ReviewService {

    headerTop: string = '200px'

    constructor(
        private _http: HttpClient,
        private _commonService: CommonService
    ) { }

    saveOrUpdateCoiReview(params: any) {
        return this._http.post(this._commonService.baseUrl + '/opa/review', params);
    }

    getCoiReview(disclosureId: number) {
        return this._http.get(`${this._commonService.baseUrl}/opa/review/${disclosureId}`);
    }

    deleteReview(coiReviewId: any) {
        return this._http.delete(`${this._commonService.baseUrl}/opa/review/${coiReviewId}`);
    }

    reviewHistory(disclosureId: any) {
        return this._http.get(`${this._commonService.baseUrl}/opa/review/history/${disclosureId}`);
    }

}
