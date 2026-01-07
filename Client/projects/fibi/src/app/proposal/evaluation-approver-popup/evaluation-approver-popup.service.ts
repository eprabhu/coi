import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationApproverPopupService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchScoringCriteriaByProposal(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchScoringCriteriaByProposal', params);
  }

  downloadWorkflowReviewerAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowReviewerAttachment', {
      headers: new HttpHeaders().set('workflowReviewerAttmntsId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  deleteWorkflowScoreComments(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteWorkflowScoreComments', params);
  }

  deleteWorkflowReviewerAttachment(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteWorkflowReviewerAttachment', params);
  }

  saveWorkflowScoreOrEndorseProposal(workflowObject, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append(file.key + '_' + file.file.name, file.file, file.file.name);
    }
    formData.append('formDataJson', JSON.stringify(workflowObject));
    return this._http.post(this._commonService.baseUrl + '/saveWorkflowScoreOrEndorseProposal', formData);
  }

}
