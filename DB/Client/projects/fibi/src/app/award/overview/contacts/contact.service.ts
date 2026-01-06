import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ContactService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  saveOrUpdateAwardContact(contact) {
    return this._http.post( this._commonService.baseUrl + '/saveOrUpdateAwardContact',
    {'awardContact': contact, 'awardId': contact.awardId} );
  }

  deleteContact(contact) {
    return this._http.post( this._commonService.baseUrl + '/deleteAwardContact', contact );
  }

  getRolodexData(rolodexId) {
    return this._http.post(this._commonService.baseUrl + '/getRolodexDetailById', {'rolodexId': rolodexId});
  }
}
