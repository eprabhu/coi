import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PointOfContactService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

addPointOfContactData(params) {
    return this._http.post(this._commonService.baseUrl + '/addPointOfContact', params);
  }

  deleteGrantCallContact(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCallContact', params);
  }
}
