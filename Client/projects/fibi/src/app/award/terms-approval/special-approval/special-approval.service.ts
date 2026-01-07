import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class SpecialApprovalService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

reportsTermsLookUpData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getTermsLookupData', { 'awardId': awardId });
  }
  addSpecialApproval(termData) {
    return this._http.post(this._commonService.baseUrl + '/maintainSpecialApproval', termData);
  }
  reportsTermsGweneralData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getAwardReportsAndTerms', { 'awardId': awardId });
  }
  deleteForeignTravel(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardReportsAndTerms', params);
  }
  deleteEquipment(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardReportsAndTerms', params);
  }
}
