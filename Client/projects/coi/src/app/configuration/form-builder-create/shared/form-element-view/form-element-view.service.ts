import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class FormElementViewService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  getCustomData(moduleCode, moduleItemKey) {
    return this._http.post(this._commonService.baseUrl + '/getApplicatbleCustomElement', { 'moduleCode': moduleCode ,
                                                                                           'moduleItemKey': moduleItemKey});
  }
  saveCustomData(params) {
    return this._http.post(this._commonService.baseUrl + '/saveCustomResponse', params);
  }
}
