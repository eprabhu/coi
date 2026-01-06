import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ExpandedViewService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getAgreementBasedOnCategory(params) {
    return this._http.post( this._commonService.baseUrl + '/getAgreementBasedOnCategory', params);
  }

  exportAgreementBasedOnCategory(params) {
    return this._http.post( this._commonService.baseUrl + '/exportAgreementBasedOnCategory', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
