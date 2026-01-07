import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class BudgetService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    getBudgetData(proposalId): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadIPBudgetsByProposalId/${proposalId}`);
    }

    saveOrUpdateIPBudgetData(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateIPBudgetData', params)
    }
}
