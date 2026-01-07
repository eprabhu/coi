import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';
import { Subject } from 'rxjs';
import { getParams } from '../../common/services/end-point.config';

@Injectable()
export class GrantCallService {
  endPointSearchOptions: any = {};
  httpOptions: any = {};
  isGrantActive = new Subject();
  isSaveGrantcall = new Subject();
  isMandatoryFilled = true;
  ioiFetchValues: any = {};
  ioiSubmit$ = new Subject();

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  createGrantCall() {
    return this._http.post(this._commonService.baseUrl + '/createGrantCall', {});
  }

  loadGrantById(params) {
    return this._http.post(this._commonService.baseUrl + '/loadGrantCallById', params);
  }

  fetchSponsorsBySponsorType(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchSponsorsBySponsorType', params);
  }

  addGrantCallAttachment(params) {
    return this._http.post(this._commonService.baseUrl + '/addGrantCallAttachment', params);
  }

  deleteGrantCallContact(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallContact', params);
  }

  deleteGrantCallAreaOfResearch(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallAreaOfResearch', params);
  }

  deleteGrantCallEligibility(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallEligibility', params);
  }

  deleteGrantCallAttachment(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallAttachment', params);
  }

  downloadAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadGrantCallAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  saveGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/saveGrantCallDetails', params);
  }

  publishGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/publishGrantCall', params);
  }
  sendEmailNotification(email) {
    return this._http.post(this._commonService.baseUrl + '/grandInvitation', email);
  }

  deleteGrantCallRelevantField(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallRelevantField', params);
  }

  fetchFundingSchemeBySponsor(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchFundingSchemeBySponsor', params);
  }

  archiveGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/archiveGrantCall', params);
  }

  downloadFundingSchemeAttachment(fundingSchemeAttachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadFundingSchemeAttachment', {
      headers: new HttpHeaders().set('attachmentId', fundingSchemeAttachmentId.toString()),
      responseType: 'blob'
    });
  }

  /**
   * Service call for get the list of role description
   */
  getRoleTypes(notifyObject) {
    return this._http.post(this._commonService.baseUrl + '/getRoleDescriptionByModuleCode', {
      'moduleCode': notifyObject.moduleCode,
      'subModuleCode': notifyObject.subModuleCode
    });
  }
  fetchKeyword(searchString) {
    return this._http.get(this._commonService.baseUrl + '/findKeyWords' + '?searchString=' + searchString);
  }

  deleteGrantCallKeyword(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallKeyword', params);
  }

  addScienceKeyword(params) {
    return this._http.post(this._commonService.baseUrl + '/addScienceKeyword', params);
  }

  /**
 * @param params will have fetchLimit as one of the values 
 * to specify limit of data to fetched,
 * it should be given inside params as {'fetchLimit' : requiredLimit}
 * requiredLimit can be either null or any valid number.
 * if no limit is specified default fetch limit 50 will be used.
 * if limit is null then full list will return, this may cause performance issue.
 * /findDepartment endpoint do not have limit in backend, so condition check added.
 */
  setEndPointSearchOptions(contextField, formatString, path, defaultValue, params = {}) {
    this.endPointSearchOptions.contextField = contextField;
    this.endPointSearchOptions.formatString = formatString;
    this.endPointSearchOptions.path = path;
    this.endPointSearchOptions.defaultValue = defaultValue;
    if (path == 'findDepartment') {
      this.endPointSearchOptions.params = params;
    } else {
      this.endPointSearchOptions.params = getParams(params);   
    } 
    return JSON.parse(JSON.stringify(this.endPointSearchOptions));
  }

  deleteGrantcall(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCall', params);
  }

  copyGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/copyGrantCall', params);
  }
  maintainSponsorData(params) {
    return this._http.post(this._commonService.baseUrl + '/saveSponsor', params);
  }
  fetchAllScoringCriteria(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchAllScoringCriteria', params);
  }
  saveOrUpdateGrantCallScoringCriteria(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantCallScoringCriteria', params);
  }
  deleteGrantCallScoringCriteria(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallScoringCriteria', params);
  }
  saveorUpdateProposalEvaluationScore(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalEvalautionScore', params);
  }
  getProposalByGrantCallId(params) {
    return this._http.post(this._commonService.baseUrl + '/getProposalByGrantCallId', params);
  }
  getScoreByProposalId(param) {
    return this._http.post(this._commonService.baseUrl + '/getCriteriaScoreByProposalId', param);
  }
  fetchAllEvaluationPanels(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchAllEvaluationPanels', params);
  }
  saveOrUpdateEvaluationPanel(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantCallEvaluationPanel', params);
  }
  deleteEvaluationPanel(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteEvaluationPanel', params);
  }
  saveProposalRankAndScore(params) {
    return this._http.post(this._commonService.baseUrl + '/updateProposalEvalautionRank', params);
  }
  saveAllProposals(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalEvalautionScores', params);
  }
  downloadWorkflowReviewerAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowReviewerAttachment', {
      headers: new HttpHeaders().set('workflowReviewerAttmntsId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  getRolodexData(rolodexId) {
    return this._http.post(this._commonService.baseUrl + '/getRolodexDetailById', { 'rolodexId': rolodexId });
  }
  checkCanDeleteGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/canDeleteGrantCall', params);
  }
  exportGrantCallEvaluationReport(params) {
    return this._http.post(this._commonService.baseUrl + '/exportGrantCallEvaluationReport', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  getPersonInformation(personId) {
    return this._http.post(this._commonService.baseUrl + '/getPersonPrimaryInformation', { 'personId': personId });
  }
}
