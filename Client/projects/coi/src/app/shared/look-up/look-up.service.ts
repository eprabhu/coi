import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LookUpService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

getLookupData(params) {
   return this._http.post(this._commonService.fibiUrl + '/getLookUpDatas', params );
}

}
