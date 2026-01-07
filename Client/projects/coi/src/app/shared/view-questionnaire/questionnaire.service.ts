import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';
import { QuestionnaireRequestObject } from './questionnaire.interface';

@Injectable()
export class QuestionnaireService {

  constructor( private _http: HttpClient, private _commonService: CommonService) { }

  getApplicableQuestionnaire( params ) {
    return this._http.post(this._commonService.fibiUrl + '/getApplicableQuestionnaire', params);
  }

  getQuestionnaire(data) {
    return this._http.post(this._commonService.fibiUrl + '/getQuestionnaire', data );
  }

  saveQuestionnaire(data, filesArray) {
    const formData = new FormData();
    if (filesArray.length > 0) {
      filesArray.forEach(file => {
        formData.append(file.questionId + '', file.attachment, file.attachment.name);
      });
    }
    formData.append('formDataJson', JSON.stringify(data));
    return this._http.post(this._commonService.fibiUrl + '/saveQuestionnaire', formData);
  }

  downloadAttachment(attachmentId, moduleItemCode) {
    return this._http.post(this._commonService.fibiUrl + '/downloadQuesAttachment',
    {'questionnaireAnsAttachmentId': attachmentId, 'moduleItemCode': moduleItemCode }, {responseType: 'blob'});
  }

  generateQuestionnaireReport(params) {
    return this._http.post(this._commonService.fibiUrl + '/generateQuestionnaireReport', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  evaluateBusinessRule(data) {
    return this._http.post(this._commonService.fibiUrl + '/ruleEvaluateQuestionnaire', data );
  }

    /**
     * API call for the autosave feature in questionnaires, applicable to all question types except attachments
     * - Shows a toaster with the below content till the API response is received
     */
    autoSaveQuestionnaire(data: QuestionnaireRequestObject) {
        this._commonService.showAutoSaveSpinner();
        return this._http.post(this._commonService.fibiUrl + '/saveQuestionnaire/v1', data);
    }

    /**
     * API call for the autosave feature in questionnaires, applicable to attachment type questions
     * - Shows a toaster with the below content till the API response is received
     */
    autoSaveQuestionnaireAttachment(formData: FormData) {
        this._commonService.showAutoSaveSpinner();
        return this._http.post(this._commonService.fibiUrl + '/saveAttachmentQuestionnaire/v1', formData);
    }

}
