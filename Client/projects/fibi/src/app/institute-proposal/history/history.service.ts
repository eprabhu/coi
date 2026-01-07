import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class HistoryService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }


  getProposalHistory(proposalId) {
    return this._http.get(`${this._commonService.baseUrl}/getIPActionHistory/${proposalId}`);
  }


}
