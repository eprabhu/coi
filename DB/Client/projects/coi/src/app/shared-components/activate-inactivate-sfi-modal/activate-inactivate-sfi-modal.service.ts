import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ActivateInactivateSfiModalService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }


activateAndInactivateSfi(prams) {
  return this._http.put(this._commonService.baseUrl + '/personEntity/activateInactivate', prams);
}

  finalizeSfi(params) {
    return this._http.put(this._commonService.baseUrl + '/personEntity/finalize', params);
  }
}
