/** last updated by Aravind on 5-11-2019 **/

import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class WorkflowEngineService {

	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	downloadRoutelogAttachment(attachmentId) {
		return this._http.get(this._commonService.fibiUrl + '/downloadWorkflowAttachment', {
			headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
			responseType: 'blob'
		});
	}
	maintainWorkFlow(formData, moduleCode) {
		return this._http.post(`${this._commonService.baseUrl}${this.getRelativeGatewayPath(moduleCode)}/approveOrRejectWorkflow`, formData);
	}
	addAlternateApprover(alternateApproverObj) {
		return this._http.post(`${this._commonService.baseUrl}${this.getRelativeGatewayPath(alternateApproverObj.moduleCode)}/addAlternativeApprover`, alternateApproverObj);
	}
	addSequentialStop(sequentialStopObject) {
		return this._http.post(`${this._commonService.baseUrl}${this.getRelativeGatewayPath(sequentialStopObject.moduleCode)}/addSequentialStop`, sequentialStopObject);
	}
	fetchScoringCriteriaByProposal(params) {
		return this._http.post(this._commonService.baseUrl + '/fetchScoringCriteriaByProposal', params);
	}
	downloadWorkflowReviewerAttachment(attachmentId) {
		return this._http.get(this._commonService.fibiUrl + '/downloadWorkflowReviewerAttachment', {
			headers: new HttpHeaders().set('workflowReviewerAttmntsId', attachmentId.toString()),
			responseType: 'blob'
		});
	}

	private getRelativeGatewayPath(moduleCode: string) {
		switch (moduleCode) {
			case '20': return '/fibi-service-request';
			case '13': return '/fibi-agreement';
			default: return '';
		}
	}

}
