import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ToolKitService {

	constructor(private _http: HttpClient, public _commonService: CommonService) { }

	getIPHistory(proposalId) {
		return this._http.post(this._commonService.baseUrl + '/showInstituteProposalHistory', { 'proposalNumber': proposalId });
	}

	fetchHelpText(param) {
		return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param);
	}

}
