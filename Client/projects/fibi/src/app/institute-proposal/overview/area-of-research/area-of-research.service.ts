import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class AreaOfResearchService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  saveOrUpdateAreaOfResearch(data) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateIPAreaOfResearch', data);
  }

  deleteAreaOfResearch(proposalId, areaOfResearchId) {
    return this._http.delete(`${this._commonService.baseUrl}/deleteIPAreaOfResearch/${proposalId}/${areaOfResearchId}`);
  }

  saveMoreInfo(data) {
    return this._http.post(this._commonService.baseUrl + '/saveIPMoreInformation', data);
  }

}
