import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
@Injectable()

export class ScoringService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getScoringCriteria(extReviewID: number) {
        return this._http.get(`${this._commonService.baseUrl}/externalReview/scoringCriteria/${extReviewID}`);
    }

}
