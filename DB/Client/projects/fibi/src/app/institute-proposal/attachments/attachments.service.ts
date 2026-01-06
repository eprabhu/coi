import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class AttachmentsService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getProposalAttachments(params) {
    return this._http.post(this._commonService.baseUrl + '/getInstituteProposalAttachments', params);
  }

  deleteAttachment(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteIPAttachment', params);
  }

  downloadProposalAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadInstituteProposalAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  downloadDevProposalAttachments(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadProposalAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  addProposalAttachment(uploadedFile, proposalId, newAttachments, proposalNumber) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append('files', file, file.name);
    }
    formData.append('formDataJson', JSON.stringify({
       proposalId, 'instituteProposalAttachments': newAttachments, proposalNumber
    }));
    return this._http.post(this._commonService.baseUrl + '/addIPAttachment', formData);
  }

  updateIPAttachmentDetails(data) {
    return this._http.post(this._commonService.baseUrl + '/updateIPAttachmentDetails', data);
  }

}
