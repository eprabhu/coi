import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ClaimSummaryService {

    public $forecastAttachment = new BehaviorSubject<any>(null);

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    setForecastAttachment(attachment) {
        this.$forecastAttachment.next(attachment);
    }

    loadClaimReimbursement(params) {
        return this._http.post(this._commonService.baseUrl + '/loadClaimReimbursement', params);
    }

    saveOrUpdateClaimAttachment(requestObject, uploadedFiles) {
        const formData = new FormData();
        for (const file of uploadedFiles) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify(requestObject));
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaimAttachment', formData);
    }

    loadClaimAdvance(params) {
        return this._http.post(this._commonService.baseUrl + '/loadClaimAdvance', params);
    }

    downloadClaimForcastTemplate() {
        return this._http.get(this._commonService.baseUrl + '/downloadClaimForcastTemplate', {
           responseType: 'blob'
        });
    }
}
