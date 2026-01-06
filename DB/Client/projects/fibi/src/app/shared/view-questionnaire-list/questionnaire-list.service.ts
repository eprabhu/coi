import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class QuestionnaireListService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }
    getApplicableQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
    }
    generateQuestionnaireReport(params) {
        return this._http.post(this._commonService.baseUrl + '/generateQuestionnaireReport', params, {
          observe: 'response',
          responseType: 'blob'
        });
      }
}
