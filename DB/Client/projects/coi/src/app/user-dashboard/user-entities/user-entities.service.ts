import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../../common/services/common.service";
import { catchError } from 'rxjs/operators';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { of } from 'rxjs';
import { FetchEachOrAllEngagementsRO } from '../../common/services/coi-common.interface';

@Injectable()
export class UserEntitiesService {

  constructor(private _http: HttpClient,
              private _commonService: CommonService) { }

  getSFIDashboard(param: FetchEachOrAllEngagementsRO) {
    return this._commonService.fetchEachOrAllEngagements(param).pipe(catchError((err) => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching entities list failed. Please try again.');
        return of();
    }));
  }
  
  createTravelDisclosure(travelDisclosureRO: object) {
    return this._http.post(`${this._commonService.baseUrl}/travel/create`, travelDisclosureRO);
  }

  updateTravelDisclosure(travelDisclosureRO: object) {
    return this._http.put(`${this._commonService.baseUrl}/travel/update`, travelDisclosureRO);
  }
}
