import { CommonService } from './../../common/services/common.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class EvaluationService {

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  fetchAllEvaluationPanels(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchAllEvaluationPanels', params);
  }

  saveOrUpdateEvaluationPanel(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantCallEvaluationPanel', params);

  }

  deleteEvaluationPanel(params) {
      return this._http.post(this._commonService.baseUrl + '/deleteEvaluationPanel', params);
  }
}
