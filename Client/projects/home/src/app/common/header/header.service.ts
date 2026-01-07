import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

constructor(private _commonService: CommonService,  private _http: HttpClient) { }

getAllNotifications() {
    return this._http.get(this._commonService.baseUrl + '/fetchSystemAllNotification');
}

markNotificationRead(params) {
	return this._http.post(this._commonService.baseUrl + '/markNotificationsAsRead', params);
}

}
