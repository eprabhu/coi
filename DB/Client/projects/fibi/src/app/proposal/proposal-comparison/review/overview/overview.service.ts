import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class OverviewService {

  constructor( private _http: HttpClient, private _commonService: CommonService) { }

  loadProposalById( params ) {
    return this._http.post( this._commonService.baseUrl + '/loadProposalById', params, );
  }
  downloadProposalPersonAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadProposalPersonAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }
}
