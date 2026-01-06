import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ChangePasswordService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  changePassword(params) {
    return this._http.post( this._commonService.baseUrl + '/changePassword', params);
  }
}
