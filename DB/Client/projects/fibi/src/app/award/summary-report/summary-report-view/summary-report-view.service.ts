import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../../common/services/common.service';

@Injectable()
export class SummaryReportViewService {

  constructor(private _http: HttpClient, private _commonService: CommonService) {
  }

  loadProgressReportForAward(awardNumber) {
      return this._http.get(this._commonService.baseUrl + '/loadProgressReportForAward/' + awardNumber);
  }
  reportsData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getReportsData', { 'awardId': awardId });
  }
  reportsTermsLookUpData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getReportLookupData', { 'awardId': awardId });
  }

}
