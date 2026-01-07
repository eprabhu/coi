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
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateCoiReview', params);
    }

    deleteReview(coiReviewId: any) {
        return this._http.delete(`${this._commonService.baseUrl}/deleteReview/${coiReviewId}`);
    }

    reviewHistory(disclosureId: any) {
        return this._http.get(`${this._commonService.baseUrl}/reviewHistory/${disclosureId}`);
    }

}
