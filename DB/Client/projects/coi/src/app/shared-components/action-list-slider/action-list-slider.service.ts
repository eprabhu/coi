import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { Observable } from 'rxjs';
import { InboxObject } from '../../common/services/coi-common.interface';
import { ACTION_LIST_MODULES } from './action-list-constants';

@Injectable()
export class ActionListSliderService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

getActionList(inboxObj: InboxObject): Observable<any> {
  inboxObj.moduleCodes = inboxObj.moduleCode ? [inboxObj.moduleCode] : ACTION_LIST_MODULES;
  return this._http.post(this._commonService.fibiUrl + '/showInbox', inboxObj);
}

createTravelDisclosure(travelDisclosureRO: object) {
    return this._http.post(`${this._commonService.baseUrl}/travel/create`, travelDisclosureRO);
}

getRelationshipEntityDetails(personEntityId) {
    return this._http.get(`${this._commonService.baseUrl}/personEntity/${personEntityId}`);
}

}
