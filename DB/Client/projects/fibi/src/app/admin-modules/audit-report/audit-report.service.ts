import { Observable } from 'rxjs';
import { AuditReport } from './audit-report';

import { HttpClient } from '@angular/common/http'; 
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AuditReportService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  auditReportTypes(): Observable<any> {
    return this._http.get(`${this._commonService.baseUrl}/auditReportTypes`);
  }

  exportAuditReportBasedOnType(params) {
    return this._http.post(this._commonService.baseUrl + '/exportAuditReport', params,  {
      observe: 'response',
      responseType: 'blob'
    });
  }
}