import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})

export class CommonAttachmentService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  addAgreementAttachment(agreementRequestId, newAttachments, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append('files', file);
    }
    formData.append('formDataJson', JSON.stringify({
      'newAttachments': newAttachments,
      'agreementRequestId': agreementRequestId
    }));
    return this._http.post(this._commonService.baseUrl + '/addAgreementAttachment', formData);
  }

}
