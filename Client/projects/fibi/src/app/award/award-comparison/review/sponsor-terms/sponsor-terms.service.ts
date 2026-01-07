import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class SponsorTermsService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

  termsData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getTermsData', { 'awardId': awardId });
  }
  reportsTermsLookUpData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getTermsLookupData', { 'awardId': awardId });
  }
}
