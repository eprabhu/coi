import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class AttachmentService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

downloadProposalAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadProposalAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  proposalAttachmentData(params) {
    return this._http.post(this._commonService.baseUrl + '/loadProposalAttachments',params );
  }
}
