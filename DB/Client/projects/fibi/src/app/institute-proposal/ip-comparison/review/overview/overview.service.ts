import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class OverviewService {

	$childComparisonData = new Subject();
	$childMethod = new Subject();

	constructor(private _commonService: CommonService, private _http: HttpClient) { }

	downloadAttachment(attachmentId) {
		return this._http.get(this._commonService.baseUrl + '/downloadAwardPersonAttachment', {
			headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
			responseType: 'blob'
		});
	}

	loadProposalById(params) {
		return this._http.post(this._commonService.baseUrl + '/loadInstProposalById', params);
	}

	setCurrentMethodDataForChild(data) {
		this.$childMethod.next(data);
	}
}
