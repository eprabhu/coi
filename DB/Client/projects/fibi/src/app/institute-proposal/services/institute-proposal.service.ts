import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { InstituteProposal } from '../institute-proposal-interfaces';

@Injectable()
export class InstituteProposalService {

  httpOptions: any = {};
  ipSectionConfig: any = {};

  isTriggerStatus = new Subject();
  isInstituteProposalDataChange = false;
  ipTitle: any;

  public instituteProposalData = new BehaviorSubject<InstituteProposal>(null);

  constructor(private _http: HttpClient, public _commonService: CommonService) { }

  loadProposalById(params) {
    return this._http.post(this._commonService.baseUrl + '/loadInstProposalById', params);
  }

  downloadProposalAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadInstituteProposalAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }
  setInstituteProposalData(ipData) {
    this.instituteProposalData.next(ipData);
  }
  downloadProposalPersonAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadProposalPersonAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }
  saveOrUpdateIpDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateInstituteProposal', params);
  }

  getRolodexData(rolodexId) {
    return this._http.post(this._commonService.baseUrl + '/getRolodexDetailById', { 'rolodexId': rolodexId });
  }

  createNewIPVersion(params) {
    return this._http.post(this._commonService.baseUrl + '/createNewIPVersion', params);
  }

  changeIpStatus(params) {
    return this._http.post(this._commonService.baseUrl + '/changeIPStatus', params);
  }

  submitIPVersion(params) {
    return this._http.post(`${this._commonService.baseUrl}/submitInstituteProposal`, params);
  }
  evaluateValidation(params) {
    return this._http.post(this._commonService.baseUrl + '/evaluateValidationRule', params).toPromise();
  }

  getLetterTemplates() {
    return this._http.get(this._commonService.baseUrl + '/letterTemplate/2');
}

  printInstituteProposal(params) {
  return this._http.post(this._commonService.baseUrl + '/generateIpReport', params, {responseType: 'blob'});
}
  deleteIPKeyword(proposalId, keywordId) {
    return this._http.delete( this._commonService.baseUrl + `/deleteIPKeyword/${proposalId}/${keywordId}`);
  }

  addScienceKeyword(params) {
    return this._http.post( this._commonService.baseUrl + '/addScienceKeyword', params );
  }

  withdrawIP(params) {
    return this._http.post(this._commonService.baseUrl + '/cancelIP', params);
  }

  getIPVersionsDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getIPVersions', params);
  }
  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }

}
