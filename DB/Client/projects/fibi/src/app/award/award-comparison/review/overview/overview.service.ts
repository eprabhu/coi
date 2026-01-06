import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';


@Injectable()
export class OverviewService {

constructor( private _http: HttpClient, private _commonService: CommonService) { }

getAwardGeneralData( params ) {
    return this._http.post( this._commonService.baseUrl + '/getAwardGeneralInfo', params );
}

downloadAwardPersonAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadAwardPersonAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

}
