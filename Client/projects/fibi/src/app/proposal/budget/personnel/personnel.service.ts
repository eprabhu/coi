import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class PersonnelService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  getPersonsRequiredData(params) {
    return this._http.post(this._commonService.baseUrl + '/getProposalBudgetPerson', params);
  }
  addOrUpdatePerson(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalBudgetPerson', params);
  }
  deletePerson(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteProposalBudgetPerson', params);
  }
  checkBudgetPersonAddedInBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/checkBudgetPersonAddedInBudget', params);
  }
}
