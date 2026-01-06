import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../common/services/common.service';


@Injectable()

export class ExpandedWidgetsService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getDetailedViewOfWidget(params) {
    return this._http.post(this._commonService.baseUrl + '/getDetailedViewOfWidget', params);
  }

  exportResearchSummaryData(params) {
    return this._http.post(this._commonService.baseUrl + '/exportResearchSummaryDatas', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  getQuestionResults() {
    return this._http.post(this._commonService.baseUrl + '/showUnansweredQuestions', {'limit': 0});
  }

}
