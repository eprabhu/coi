// Last updated by Krishnanunni on 2-11-2019
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { Subject } from 'rxjs';

@Injectable()
export class NegotiationService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  $deleteLocationId = new Subject();
  endpointSearchOptions: any = {
    contextField: '',
    formatString: '',
    path: '',
    defaultValue: ''
  };
  httpOptions: any = {};

  saveNegotiation(negotiations) {
    return this._http.post(this._commonService.baseUrl + '/saveNegotiationInfo', { 'negotiations': negotiations });
  }
  getLocationHistory(Params) {
    return this._http.post(this._commonService.baseUrl + '/getNegotiationLocationHistory', { 'negotiationId': Params });
  }
  setNewLocation(Params) {
    return this._http.post(this._commonService.baseUrl + '/setNegotiationLocation',
    { 'negotiationsLocation': Params});
  }
  deleteNegotiationLocation(Params) {
    return this._http.post(this._commonService.baseUrl + '/deleteNegotiationLocation', Params);
  }
  addNewActivity(negotiationsActivity) {
    return this._http.post(this._commonService.baseUrl + '/addNegotiationActivity', { 'negotiationsActivity': negotiationsActivity });
  }
  getActivityList(negotiationId) {
    return this._http.post(this._commonService.baseUrl + '/getNegotiationsActivityById', { 'negotiationId': negotiationId });
  }
  downloadFinalDocument(negotiationId) {
    return this._http.post(this._commonService.baseUrl + '/generateNegotiationReport', {
      moduleCode: '5', outputDataFormat: 'pdf',
      actionCode: '105',
      moduleItemKey: negotiationId
    }, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  setAttachment(negotiationData, uploadedFiles) {
    const formData = new FormData();
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
    }
    formData.append('formDataJson', JSON.stringify({ 'negotiationActivity': negotiationData }));
    return this._http.post(this._commonService.baseUrl + '/maintainNegotiationActivity', formData);
  }

  downloadAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadNegotiationAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }
  deleteActivity(activityValue) {
    return this._http.post(this._commonService.baseUrl + '/deleteActivity', { 'negotiationsActivity': activityValue });
  }
  deleteAttachmentByid(attachmentId) {
    return this._http.post(this._commonService.baseUrl + '/deleteActivityAttachments', { 'negotiationsAttachmentId': attachmentId });
  }
  submitNegotiation(params) {
    return this._http.post(this._commonService.baseUrl + '/submitNegotiation', params);
  }
  approveDisapproveNegotiations(formData) {
    return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', formData);
  }
  downloadRoutelogAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowsAttachments', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }
  /**
   * @param  {} contextField
   * @param  {} formatString
   * @param  {} path
   *returns the endpoint search object with respect to the the inputs.
   */
  setSearchOptions(contextField, formatString, path) {
    this.endpointSearchOptions.contextField = contextField;
    this.endpointSearchOptions.formatString = formatString;
    this.endpointSearchOptions.path = path;
    return JSON.parse(JSON.stringify(this.endpointSearchOptions));
  }

  /** sets endpoint search options
   * @param contextField
   * @param formatString
   * @param path
   * @param defaultValue
   * @param params
   */
  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }

  addNegotiationAttachment(formData) {
    return this._http.post(this._commonService.baseUrl + '/addNegotiationsAttachments', formData);
  }

  deleteNegotiationAttachment(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteNegotiationAttachment', params);
  }

  fetchSortedAttachments(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchSortedAttachments', params);
  }

  loadNegotiationAttachments(params) {
    return this._http.post(this._commonService.baseUrl + '/loadNegotiationAttachments', params);
  }

  updateAttachmentDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/updateAttachmentDetails', params);
  }

  downloadAllAttachments(params) {
    return this._http.post(this._commonService.baseUrl + '/exportSelectedNegotiationAttachments', params,
      { observe: 'response', responseType: 'blob' });
  }
  loadReviewComments(param) {
    return this._http.post(this._commonService.baseUrl + '/loadReviewComments', param);
  }
  addLocationComment(param, uploadedFiles) {
    const formData = new FormData();
    for (const file of uploadedFiles) {
      formData.append('files', file);
    }
    formData.append('formDataJson', JSON.stringify(param));
    return this._http.post(this._commonService.baseUrl + '/addLocationComment', formData);
  }
  deleteAgreementComment(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementComment', param);
  }

}
