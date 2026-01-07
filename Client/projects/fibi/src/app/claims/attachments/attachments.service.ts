/** Last updated by Ayush on 26-10-2020 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AttachmentsService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    loadClaimAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/loadClaimAttachments', params);
    }

    saveOrUpdateClaimAttachment(requestObject, uploadedFiles = []) {
        const formData = new FormData();
        for (const file of uploadedFiles) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify(requestObject));
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaimAttachment', formData);
    }

    downloadClaimAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadClaimAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()), responseType: 'blob'
        });
    }

}
