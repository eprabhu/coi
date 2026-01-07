import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ActivityService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  setAttachment(negotiationData, uploadedFiles) {
    const formData = new FormData();
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
    }
    formData.append('formDataJson', JSON.stringify({ 'negotiationActivity': negotiationData }));
    return this._http.post(this._commonService.baseUrl + '/maintainNegotiationActivity', formData);
  }

}
