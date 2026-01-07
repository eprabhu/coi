import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

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
    const formData = new FormData();
    if (filesArray.length > 0) {
      filesArray.forEach(file => {
        formData.append(file.questionId + '', file.attachment, file.attachment.name);
      });
    }
    formData.append('formDataJson', JSON.stringify(data));
    return this._http.post(this._commonService.baseUrl + '/saveQuestionnaire', formData);
  }

  downloadAttachment(attachmentId) {
    return this._http.post(this._commonService.baseUrl + '/downloadQuesAttachment',
    {'questionnaireAnsAttachmentId': attachmentId }, {responseType: 'blob'});
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
