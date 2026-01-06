import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ProgressReportCreateService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    getAwardProgressReportStartDate({ awardNumber, awardId, reportClassCode, dueDate }) {
        const url = `${this._commonService.baseUrl}/getAwardProgressReportStartDate/${awardNumber}/${awardId}/${reportClassCode}`
        + (dueDate ? `/${this.getDueDateTimestamp(dueDate)}` : '');
        return this._http.get(url);
    }

    getDueDateTimestamp(dueDate: Date): number {
        const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
        return dueDate.getTime() - userTimezoneOffset;
    }

    saveOrUpdateProgressReport(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProgressReport', params);
    }

    getProgressReportLookUpData() {
        return this._http.get(this._commonService.baseUrl + '/getProgressReportLookUpData');
      }
}
