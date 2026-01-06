import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { Observable } from 'rxjs';
import { InboxObject } from '../../../services/coi-common.interface';
import { ACTION_LIST_MODULES } from '../../../../shared-components/action-list-slider/action-list-constants';

@Injectable()
export class ExpandedActionListService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getActionList(inboxObj: InboxObject): Observable<any> {
    inboxObj.moduleCodes = inboxObj.moduleCode ? [inboxObj.moduleCode] : ACTION_LIST_MODULES;
    return this._http.post(this._commonService.fibiUrl + '/showInbox', inboxObj);
  }

  openUnreadInbox(inboxId) {
    return this._http.post(this._commonService.baseUrl + '/markAsReadInboxMessage', { 'inboxId': inboxId });
  }

  getActionLogEntries(notifications) {
    return this._http.post(this._commonService.baseUrl + '/fetchAllActiolListEntriesForBanners', notifications );
  }

}
