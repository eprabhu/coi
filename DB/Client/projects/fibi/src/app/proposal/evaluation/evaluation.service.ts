import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class EvaluationService {

  navigationUrl: string;

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchEvaluationPanelsList(params) {
   return this._http.post( this._commonService.baseUrl + '/fetchEvaluationPanelsList', params );
  }
  saveProposalEvaluationPanelDetails(params) {
    return this._http.post( this._commonService.baseUrl + '/saveProposalEvaluationPanelDetails', params );
  }
  saveAdminEvaluationPanel(params) {
    return this._http.post( this._commonService.baseUrl + '/saveAdminEvaluationPanel', params );
  }
  startEvaluation(params) {
    return this._http.post( this._commonService.baseUrl + '/startEvaluation', params );
  }
  addEvaluationPanelPerson(params) {
    return this._http.post( this._commonService.baseUrl + '/addEvaluationPanelPerson', params );
  }
  deleteEvaluationPanelPerson(params) {
    return this._http.post( this._commonService.baseUrl + '/deleteEvaluationPanelPerson', params );
  }
  getScoreByProposalId(param) {
    return this._http.post(this._commonService.baseUrl + '/getCriteriaScoreByProposalId', param);
  }
  downloadWorkflowReviewerAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowReviewerAttachment', {
      headers: new HttpHeaders().set('workflowReviewerAttmntsId', attachmentId.toString()),
      responseType: 'blob'
    });
  }
}
