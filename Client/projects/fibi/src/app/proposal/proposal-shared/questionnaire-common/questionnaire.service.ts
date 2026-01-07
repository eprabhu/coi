/** last updated by Ramlekshmy on 18-11-2019 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class QuestionnaireService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  generateQuestionnaireReport(params) {
    return this._http.post(this._commonService.baseUrl + '/generateQuestionnaireReport', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
