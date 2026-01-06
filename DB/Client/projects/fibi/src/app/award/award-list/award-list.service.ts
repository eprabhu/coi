import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { AwardDashboardRequest } from '../award-interfaces';
@Injectable()

export class AwardListService {
	isAdvanceSearch = false;
	sortCountObj: any = {};
	awardRequestObject = new AwardDashboardRequest();
	sponsorAdvanceSearchDefaultValue = '';
	awardRequestExtraDetails = {
		fullName: '',
		grantCallName: '',
		unitName: '',
		isEmployeeFlag: true
	};
	constructor(private _http: HttpClient, private _commonService: CommonService) { }

	checkReturnResult(property: string) {
		return property !== '';
	}

	setHttpOptions(contextField, formatString, path, defaultValue, params) {
		const httpOptions: any = {};
		httpOptions.contextField = contextField;
		httpOptions.formatString = formatString;
		httpOptions.path = path;
		httpOptions.defaultValue = defaultValue;
		httpOptions.params = params;
		return JSON.parse(JSON.stringify(httpOptions));
	}

	getAwardDashBoardList(params) {
		return this._http.post(this._commonService.baseUrl + '/fibiAwardDashBoard', params).pipe(catchError((err) => {
			if (err.status === 400) {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid character(s) found in search.');
			} else {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Award List failed. Please try again.');
			}
			return of();
		}));
	}

	exportAwardDashboardData(params) {
		return this._http.post(this._commonService.baseUrl + '/exportAwardDashboardDatas', params, {
			observe: 'response',
			responseType: 'blob'
		});
	}

	copyAward(params) {
		return this._http.post(this._commonService.baseUrl + '/copyAward', params);
	}

	getAwardVersions(params) {
		return this._http.post(this._commonService.baseUrl + '/getAwardVersions', params);
	}

	deleteAward(awardId: number) {
		return this._http.delete(`${this._commonService.baseUrl}/deleteAward/${awardId}`);
	}

	canDeleteAward(awardId: number) {
		return this._http.get(`${this._commonService.baseUrl}/canDeleteAward/${awardId}`);
	}
}
