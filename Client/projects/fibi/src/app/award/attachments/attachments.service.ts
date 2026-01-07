/** Last updated by Ramlekshmy on 28-01-2020 */
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AttachmentsService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  addAwardAttachment(sequenceNumber, awardId, awardNumber, newAttachments, uploadedFile, leadUnit) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append( 'files', file, file.name );
    }
    formData.append( 'formDataJson', JSON.stringify( {'newAttachments': newAttachments,
                    'awardSequenceNumber': sequenceNumber,
                    'awardId': awardId, 'awardNumber': awardNumber,
                    'awardLeadUnitNumber': leadUnit} ) );
    return this._http.post( this._commonService.baseUrl + '/addAwardAttachments', formData );
  }

  downloadAwardAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadAwardAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  deleteAwardAttachment( params ) {
    return this._http.post( this._commonService.baseUrl + '/deleteAwardAttachment', params );
  }

  awardAttachmentLookUpData(params) {
    return this._http.post(this._commonService.baseUrl + '/getAttachmentDetails', params );
  }

  updateAttachmentDetails( params ) {
    return this._http.post( this._commonService.baseUrl + '/updateAwardAttachmentDetails', params );
  }

  exportAllAwardAttachments (params) {
    return this._http.post( this._commonService.baseUrl + '/exportAllAwardAttachments', params,
    {observe: 'response', responseType: 'blob'} );
  }

}
