import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ExpandedActionListService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getActionList(inboxObj) {
    return this._http.post(this._commonService.baseUrl + '/showInbox', inboxObj);
  }

  openUnreadInbox(inboxId) {
    return this._http.post(this._commonService.baseUrl + '/markAsReadInboxMessage', { 'inboxId': inboxId });
  }

}
