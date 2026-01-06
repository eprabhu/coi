import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class KeyPersonService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  saveOrUpdateKeyPerson(person) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateIPKeyPerson', person);
  }

  addAwardPersonAttachment(attachments, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append('files', file, file.name);
    }
    formData.append('formDataJson', JSON.stringify({
      'newIPPersonAttachments': attachments
    }));
    return this._http.post(this._commonService.baseUrl + '/addIPPersonAttachment', formData);
  }

  downloadAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadIPPersonAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  deleteKeyPersonnel(proposalId: any, personId: any) {
    // let httpParams = new HttpParams();
    // httpParams.set('keyPersonId', personId)
    // const options = { params: httpParams };
    // return this._http.delete(this._commonService.baseUrl + '/deleteIPKeyPerson', );
    return this._http.delete(`${this._commonService.baseUrl}/deleteIPKeyPerson/${proposalId}/${personId}`);

  }

  getRolodexData(rolodexId) {
    return this._http.post(this._commonService.baseUrl + '/getRolodexDetailById', { 'rolodexId': rolodexId });
  }

  checkUnitRight(param: { unitNumber, rightName }) {
    return this._http.post(this._commonService.baseUrl + '/checkUnitRight', param);
  }

}

