import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './../common/services/common.service';

@Injectable()
export class TriageService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    postEvaluationLogic(params) {
        return this._http.post(this._commonService.baseUrl + '/evaluateTriageQuestionnaire', params).toPromise();
    }

    getTriageHeader(params) {
        return this._http.post(this._commonService.baseUrl + '/createTriageHeader', params).toPromise();
    }
}
