import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class AttachmentsService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

downloadAwardAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadAwardAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  awardAttachmentData(params) {
    return this._http.post(this._commonService.baseUrl + '/getAttachmentDetails',params );
  }
}
