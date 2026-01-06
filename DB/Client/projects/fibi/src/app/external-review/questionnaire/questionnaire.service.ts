import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class QuestionnaireService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getApplicableQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
    }

    fetchReviewQuestionnaire(extReviewId: number) {
        return this._http.get(`${this._commonService.baseUrl}/externalReview/questionnaire/${extReviewId}`);
    }

    saveReviewQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/externalReview/questionnaire', params);
    }

    deleteReviewQuestionnaire(extReviewQuestionnaireId: number) {
        return this._http.delete(`${this._commonService.baseUrl}/externalReview/questionnaire/${extReviewQuestionnaireId}`);
    }

}
