import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class ReviewSectionService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  loadBudgetByProposalId(params) {
    return this._http.post( this._commonService.baseUrl + '/loadBudgetByProposalId', params);
  }
}
