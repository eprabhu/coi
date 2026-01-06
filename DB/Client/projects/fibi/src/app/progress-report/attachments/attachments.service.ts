/** Last updated by Ayush on 26-10-2020 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AttachmentsService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    loadProgressReportAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/loadProgressReportAttachments', params);
    }

    saveOrUpdateProgressReportAttachment(requestObject, uploadedFiles = []) {
        const formData = new FormData();
        for (const file of uploadedFiles) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify(requestObject));
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProgressReportAttachment', formData);
    }

    downloadProgressReportAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadProgressReportAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()), responseType: 'blob'
        });
    }

}
