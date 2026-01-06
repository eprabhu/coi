import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { Observable } from 'rxjs';

@Injectable()
export class SharedEngagementService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  deleteSFI(params): Observable<any> {
    return this._http.delete(`${this._commonService.baseUrl}/personEntity/${params}`);
  }

  modifySfi(params): Observable<any> {
    return this._http.post(this._commonService.baseUrl + '/personEntity/modify', params);
  }

  createTravelDisclosure(travelDisclosureRO: object): Observable<any> {
    return this._http.post(`${this._commonService.baseUrl}/travel/create`, travelDisclosureRO);
  }

  updateTravelDisclosure(travelDisclosureRO: object): Observable<any> {
    return this._http.put(`${this._commonService.baseUrl}/travel/update`, travelDisclosureRO);
  }

}
