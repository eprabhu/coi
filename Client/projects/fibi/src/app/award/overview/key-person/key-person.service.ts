import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class KeyPersonService {

  constructor(private http: HttpClient, private _commonService: CommonService) { }

  maintainKeyPersonnel( person, type ) {
    return this.http.post( this._commonService.baseUrl + '/saveOrUpdateKeyPersonnel',
                          {'awardPerson': person, 'awardId': person.awardId, 'acType': type } );
  }

  addAwardPersonAttachment( awardPersonAttachment, uploadedFile ) {
    const formData = new FormData();
      for (const file of uploadedFile) {
        formData.append('files', file, file.name);
      }
      formData.append('formDataJson', JSON.stringify({
        'newPersonAttachments': awardPersonAttachment, 'userFullName': this._commonService.getCurrentUserDetail('fullName')
      }));
    return this.http.post( this._commonService.baseUrl + '/addAwardPersonAttachment', formData );
  }

  downloadAwardPersonAttachment( attachmentId ) {
    return this.http.get( this._commonService.baseUrl + '/downloadAwardPersonAttachment', {
        headers: new HttpHeaders().set( 'attachmentId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }
  
  deleteKeyPersonnel(person) {
    return this.http.post( this._commonService.baseUrl + '/deleteKeyPersonnel', person );
  }


  getRolodexData(rolodexId) {
    return this.http.post(this._commonService.baseUrl + '/getRolodexDetailById', {'rolodexId': rolodexId});
  }

  saveOrUpdateAwardKeyPersonTimesheet(person) {
    return this.http.post(this._commonService.baseUrl + '/saveOrUpdateAwardKeyPersonTimesheet', person);
  }

  getAwardKeyPersonTimesheetDetails(person) {
    return this.http.post(this._commonService.baseUrl + '/getAwardKeyPersonTimesheetDetails', person);
  }

  generateAwardKeyPersonTimesheetReport(params) {
    return this.http.post(this._commonService.baseUrl + '/generateAwardKeyPersonTimesheetReport', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
