import { CommonService } from '../../../common/services/common.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BudgetSummaryService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchBudgetAPIData(param) : Observable<any> {
    return this._http.post(this._commonService.baseUrl + '/fetchBudgetAPIData', param);
  }

  generateAwardBudgetIntegrationReport(param): Observable<any> {
    return this._http.post(this._commonService.baseUrl + '/generateAwardBudgetIntegrationReport', param,
    {observe: 'response', responseType: 'blob' });
  }

}
