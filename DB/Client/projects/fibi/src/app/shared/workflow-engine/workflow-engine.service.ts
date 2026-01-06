/** last updated by Aravind on 5-11-2019 **/

import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class WorkflowEngineService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

downloadRoutelogAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
}
maintainWorkFlow(formData) {
  return this._http.post( this._commonService.baseUrl + '/approveOrRejectWorkflow', formData );
}
addAlternateApprover(alternateApproverObj) {
  return this._http.post( this._commonService.baseUrl + '/addAlternativeApprover ', alternateApproverObj );
}
addSequentialStop (sequentialStopObject) {
  return this._http.post( this._commonService.baseUrl + '/addSequentialStop', sequentialStopObject );
}
fetchScoringCriteriaByProposal(params) {
  return this._http.post(this._commonService.baseUrl + '/fetchScoringCriteriaByProposal', params);
}
downloadWorkflowReviewerAttachment(attachmentId ) {
  return this._http.get(this._commonService.baseUrl + '/downloadWorkflowReviewerAttachment', {
      headers: new HttpHeaders().set('workflowReviewerAttmntsId', attachmentId.toString()),
      responseType: 'blob'
  } );
}
}
