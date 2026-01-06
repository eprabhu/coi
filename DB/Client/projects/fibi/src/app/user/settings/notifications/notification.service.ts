/** last updated by Anjitha on 12-12-2019 **/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class NotificationService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchUserNotification() {
    return this._http.get( this._commonService.baseUrl + '/fetchUserNotification');
  }

  activateOrDeactivateUserNotification(params) {
    return this._http.post( this._commonService.baseUrl + '/activateOrDeactivateUserNotification', params);
  }
}
