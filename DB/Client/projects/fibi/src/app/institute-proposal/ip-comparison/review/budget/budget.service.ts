import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class BudgetService {

	constructor(private _commonService: CommonService, private _http: HttpClient) { }

	proposalBudgetHeader(param) {
		return this._http.get(`${this._commonService.baseUrl}/loadIPBudgetsByProposalId/${param}`);
	}

}
