import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()

export class AuditLogReportService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getAuditReportAsExcel(auditLog) {
        return this._http.post(this._commonService.baseUrl + '/generateAuditLogReport', auditLog, {
            observe: 'response',
            responseType: 'blob'
        });
    }

}
