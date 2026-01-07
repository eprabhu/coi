/** Last updated by Ramlekshmy on 28-01-2020 */
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AttachmentsService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  addAgreementAttachment(agreementRequestId, newAttachments, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append( 'files', file );
    }
    formData.append( 'formDataJson', JSON.stringify( {'newAttachments': newAttachments,
                    'agreementRequestId': agreementRequestId} ) );
    return this._http.post( this._commonService.baseUrl + '/addAgreementAttachment', formData );
  }

  downloadAgreementAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadAgreementAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() )
        .set('exportType', ''),
        responseType: 'blob'
    } );
  }

  deleteAgreementAttachment( params ) {
    return this._http.post( this._commonService.baseUrl + '/deleteAgreementAttachment', params );
  }

  loadAgreementAttachments( params ) {
    return this._http.post( this._commonService.baseUrl + '/loadAgreementAttachments', params );
  }

  fetchSortedAgreementAttachments( params ) {
    return this._http.post( this._commonService.baseUrl + '/fetchSortedAgreementAttachments', params );
  }

  updateAttachmentDetails(data) {
    return this._http.post(this._commonService.baseUrl + '/updateAgreementAttachmentDetails', data);
  }

  exportAllAgreementAttachments (params) {
    return this._http.post( this._commonService.baseUrl + '/exportAllAgreementAttachments', params,
    {observe: 'response', responseType: 'blob'} );
  }

  downloadAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadNegotiationAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  downloadQuestionnaireAttachment(attachmentId) {
    return this._http.post(this._commonService.baseUrl + '/downloadQuesAttachment',
    {'questionnaireAnsAttachmentId': attachmentId }, {responseType: 'blob'});
  }

  getAttachmentActivityDetails(negotiationLocationId, negotiationActivityId) {
    return this._http.post(this._commonService.baseUrl + '/getAttachmentActivityDetails',
    {
      'negotiationLocationId' : negotiationLocationId,
      'negotiationActivityId' : negotiationActivityId
    });
  }

}
