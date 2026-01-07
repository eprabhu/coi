import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';


@Injectable()
export class PersonnelService {

  constructor( private _http: HttpClient, private _commonService: CommonService ) { }

  getAwardBudgetPerson(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardBudgetPerson', params);
  }

  saveOrUpdateAwardBudgetPerson(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardBudgetPerson', params);
  }

  deletePerson(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteAwardBudgetPerson', params);
  }

  checkAwardBudgetPersonAddedInBudget(params) {
    return this._http.post(this._commonService.baseUrl + '/checkAwardBudgetPersonAddedInBudget', params);
  }
}
