import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class AttachmentService {

constructor(private _http: HttpClient, public _commonService: CommonService) { }

  loadIPAttachments(params) {
    return this._http.post(this._commonService.baseUrl + '/getInstituteProposalAttachments', params);
  }

  downloadProposalAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadInstituteProposalAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }
}
