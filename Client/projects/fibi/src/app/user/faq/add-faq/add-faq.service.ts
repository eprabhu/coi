import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class AddFaqService {

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  getCategory(params) {
    return this._http.post(this._commonService.baseUrl + '/listFaqCategory', params);
  }

  saveFaq(params) {
    return this._http.post(this._commonService.baseUrl + '/addFaqAttachment', params);
  }
}
