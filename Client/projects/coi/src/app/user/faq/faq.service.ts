import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class faqService{

  faqList: any = [];
    constructor(private _commonService: CommonService, private _http: HttpClient) { }

  getFaq(params) {
    return this._http.post(this._commonService.baseUrl + '/coiCustom/fetchFaqDetails', params);
  }
  
  getAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadFaqAttachment', {
      headers: new HttpHeaders().set('faqAttachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }
}
