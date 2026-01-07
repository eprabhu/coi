import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../../common/services/common.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HTTP_ERROR_STATUS } from '../../app-constants';


@Injectable()
export class ProgressReportListService {
  sortCountObject: any = {};
  httpOptions: any = {};
  dashboardRequestObject: any = {
    property1: '',
    property2: '',
    property3: '',
    property4: '',
    property5: '',
    property6: '',
    property7: '',
    property8: [],
    property9: '',
    property10: '',
    property11: [],
    property12: '',
    property13: '',
    pageNumber: 20,
    sort: {},
    tabName: 'PENDING_PR',
    advancedSearch: 'L',
    sortBy: '',
    currentPage: 1
  };
  /** For storing default Value of end point or elastic search */
  dashboardRequestExtraData: any = {
    unitName: '',
    fullName: '',
    isEmployeeFlag: true
  };

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getProgressReportDashBoardList(params) {
    return this._http.post(this._commonService.baseUrl + '/fibiProgressReportDashBoard', params).pipe(catchError((err) => {
      this._commonService.showToast(HTTP_ERROR_STATUS, err.status === 400
                                   ? 'Invalid character(s) found in search'
                                   : 'Fetching Progress Report list failed. Please try again.');
      return of();
    }));
  }

  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }
}
