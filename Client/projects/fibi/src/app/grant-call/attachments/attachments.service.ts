import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AttachmentsService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    addGrantCallAttachment(uploadedFile, grantCall, newAttachments) {
     const formData = new FormData();
      for (const file of uploadedFile) {
        formData.append('files', file, file.name);
      }
      formData.append('formDataJson', JSON.stringify({
        'grantCall': grantCall,
        'newAttachments': newAttachments, 'userFullName': this._commonService.getCurrentUserDetail('fullName')
      }));
        return this._http.post(this._commonService.baseUrl + '/addGrantCallAttachment', formData);
    }

    deleteGrantCallAttachment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteGrantCallAttachment', params);
    }

    downloadAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadGrantCallAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    downloadFundingSchemeAttachment(fundingSchemeAttachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadFundingSchemeAttachment', {
            headers: new HttpHeaders().set('attachmentId', fundingSchemeAttachmentId.toString()),
            responseType: 'blob'
        });
    }
}
