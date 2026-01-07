import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../../common/services/common.service';
import {Router} from '@angular/router';

@Injectable()
export class ProgressReportDetailsService {

  constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) { }

  loadProgressReportKPISummary(params) {
    return this._http.get(this._commonService.baseUrl + '/loadProgressReportKPISummary/' + params);
  }

  deleteKPISummaryDetail(kpiSummaryId: string, sectionCode: string, deleteId: string) {
    return this._http.delete(`${this._commonService.baseUrl}/deleteKPISummaryDetail/${kpiSummaryId}/${sectionCode}/${deleteId}`);
  }

  loadProgressReportKPILookups() {
    return this._http.get(this._commonService.baseUrl + '/loadProgressReportKPILookups');
  }
}
