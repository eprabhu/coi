import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class MedusaService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getContentJSON(medusaValue): Observable<any> {
    return this._http.post( this._commonService.baseUrl + '/getMedusa', medusaValue);
  }
  getMedusaDetails(medusaDetails) {
    return this._http.post( this._commonService.baseUrl + '/getMedusaMoreDetail', medusaDetails);
  }

  getServiceRequestDetailsForMedusaByModule(params) {
    return this._http.post( this._commonService.baseUrl + '/getServiceRequestDetailsForMedusaByModule', params);
  }
}
