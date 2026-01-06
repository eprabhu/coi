import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class QuestionnaireService {

  constructor( private _http: HttpClient, private _commonService: CommonService) { }

  getApplicableQuestionnaire( params ) {
    return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
  }

  getQuestionnaire(data) {
    return this._http.post(this._commonService.baseUrl + '/getQuestionnaire', data );
  }

  saveQuestionnaire(data, filesArray) {
    const FORM_DATA = new FormData();
    if (filesArray.length > 0) {
      filesArray.forEach(file => {
        FORM_DATA.append(file.questionId + '', file.attachment, file.attachment.name);
      });
    }
    FORM_DATA.append('formDataJson', JSON.stringify(data));
    return this._http.post(this._commonService.baseUrl + '/saveQuestionnaire', FORM_DATA);
  }

  downloadAttachment(attachmentId) {
    return this._http.get(this._commonService.formUrl + `/formbuilder/downloadQnAttachment/${attachmentId}`,
      {responseType: 'blob'});
  }

  generateQuestionnaireReport(params) {
    return this._http.post(this._commonService.baseUrl + '/generateQuestionnaireReport', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  evaluateBusinessRule(data) {
    return this._http.post(this._commonService.baseUrl + '/ruleEvaluateQuestionnaire', data );
  }

}
