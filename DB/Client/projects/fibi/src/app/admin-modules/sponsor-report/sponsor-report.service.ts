import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable()
export class SponsorReportService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

$modalAction = new Subject();

deleteSponsorReport(id: any) {
  return this._http.delete(`${this._commonService.baseUrl}/deleteSponsorReport/${id}`);
}

reportsTermsLookUpData(awardId) {
  return this._http.post(this._commonService.baseUrl + '/getReportLookupData', { 'awardId': awardId });

}

fetchFundingSchemeBySponsor(params) {
  return this._http.post(this._commonService.baseUrl + '/fetchFundingSchemeBySponsor', params);
}

fetchReportTypeByReportClass(reportClassCode) {
  return this._http.get(this._commonService.baseUrl + '/fetchReportByReportClass' + '?reportClassCode=' + reportClassCode );
}

fetchAllSponsorReport(params) {
  return this._http.post(this._commonService.baseUrl + '/searchSponsorReport', params);
}

saveOrUpdateSponsorReport(params) {
  return this._http.post(this._commonService.baseUrl + '/saveOrUpdateSponsorReport', params);
}

}
