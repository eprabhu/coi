import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ModularBudgetService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getProposalModularBudget(param) {
    return this._http.post( this._commonService.baseUrl + '/proposalModularBudget', param );
  }
  saveModularBudget(param) {
    return this._http.post( this._commonService.baseUrl + '/saveProposalModularBudget', param );
  }
  deleteIndirectLine(param) {
    return this._http.post( this._commonService.baseUrl + '/deleteModularBudgetInDirectLine', param );
  }

}
