import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class SupportService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  createSupportQuestion( params ) {
    return this._http.post( this._commonService.baseUrl + '/createSupportQuestion', params );
  }

  loadSupportQuestions( params ) {
    return this._http.post( this._commonService.baseUrl + '/loadSupportQuestions', params );
  }

  downloadSupportAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadSupportAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  addSupportComment( formData ) {
    return this._http.post( this._commonService.baseUrl + '/addSupportComment', formData );
  }

}
