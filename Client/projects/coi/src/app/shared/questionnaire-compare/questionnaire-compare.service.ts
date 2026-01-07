import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

@Injectable()
export class QuestionnaireCompareService {

	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	evaluateBusinessRule(data) {
		return this._http.post(this._commonService.baseUrl + '/ruleEvaluateQuestionnaire', data);
	}

}
