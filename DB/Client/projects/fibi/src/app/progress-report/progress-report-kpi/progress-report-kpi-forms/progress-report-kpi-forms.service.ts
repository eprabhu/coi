import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../../common/services/common.service';
import {Router} from '@angular/router';

@Injectable()
export class ProgressReportKpiFormsService {

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) {
    }

    loadProgressReportKPISummaryDetails(kpiSummaryId, sectionCode) {
        return this._http.get(`${this._commonService.baseUrl}/loadProgressReportKPISummaryDetails/${kpiSummaryId}/${sectionCode}`);
    }

    saveOrUpdateKPISummaryDetails(params) {
      return this._http.post(this._commonService.baseUrl + '/saveOrUpdateKPISummaryDetails', params);
    }

    deleteKPISummaryDetail(kpiSummaryId: string, sectionCode: string, deleteId: string) {
      return this._http.delete(`${this._commonService.baseUrl}/deleteKPISummaryDetail/${kpiSummaryId}/${sectionCode}/${deleteId}`);
    }

    loadProgressReportKPILookups() {
      return this._http.get(this._commonService.baseUrl + '/loadProgressReportKPILookups');
    }

    fetchHelpText(param) {
      return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param );
    }
}
