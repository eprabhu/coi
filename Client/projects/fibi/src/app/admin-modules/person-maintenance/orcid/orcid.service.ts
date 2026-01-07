import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class OrcidService {

constructor(private _http: HttpClient, private _commonService: CommonService) { }

getPersonOrcidWorks(params) {
  return this._http.post(this._commonService.baseUrl + '/getPersonOrcidWorks', params);
}

unLinkPersonOrcidWorkFromAward(params) {
  return this._http.post(this._commonService.baseUrl + '/unLinkPersonOrcidWorkFromAward', params);
}

getLinkedOrcidWorksOfAward(params) {
  return this._http.post(this._commonService.baseUrl + '/getLinkedOrcidWorksOfAward', params);
}

linkPersonOrcidWorksToAward(params) {
  return this._http.post(this._commonService.baseUrl + '/linkPersonOrcidWorksToAward', params);
}

}
