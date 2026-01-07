import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ToolKitService {
    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getProposalHistoryInfo(proposalId) {
      return this._http.get(`${this._commonService.baseUrl}/showProposalHistory/${proposalId}`);
    }
        
    fetchHelpText(param) {
      return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param );
  }
}

