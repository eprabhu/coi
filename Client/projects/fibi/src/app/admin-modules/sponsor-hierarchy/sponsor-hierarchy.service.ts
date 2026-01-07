import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { SelectOrDeleteEvent } from './sponsor-hierarchy-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SponsorHierarchyService {
  dataEvent = new Subject<SelectOrDeleteEvent>();
  selectedGroupId: number;
  shObject: any;
  shNewObject: any;
  sponsorHierarchyList: any;
  emptyGroupStatus: boolean;

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  triggerEventWithGroupId(dataEventType: SelectOrDeleteEvent, groupId: number = null, shObject: any = null,
    shNewObject: any = null, emptyGroupStatus: boolean = false) {
      if (groupId) {
       this.selectedGroupId = groupId;
      }
      if (shObject != null) {
        this.shObject = shObject;
      }
      if (shNewObject != null) {
        this.shNewObject = shNewObject;
      }
      if (emptyGroupStatus) {
        this.emptyGroupStatus = emptyGroupStatus;
      }
    this.dataEvent.next(dataEventType);
  }

  sponsorHierarchies() {
    return this._http.get(this._commonService.baseUrl + '/sponsorHierarchies');
  }

  sponsorHierarchy(id) {
    return this._http.post(this._commonService.baseUrl + '/sponsorHierarchy/hierarchy', { 'sponsorGroupId': id });
  }

  updateSponsorHierarchy(editObj) {
    return this._http.put(this._commonService.baseUrl + '/sponsorHierarchy', editObj );
  }

  deleteSponsorHierarchy(deleteObj) {
    return this._http.delete(this._commonService.baseUrl + '/sponsorHierarchy/' + deleteObj );
  }

  createSponsorHierarchy(createObj) {
    return this._http.post(this._commonService.baseUrl + '/sponsorHierarchy', createObj );
  }

}
