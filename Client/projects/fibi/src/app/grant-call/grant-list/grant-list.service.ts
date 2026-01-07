import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
@Injectable()

export class GrantListService {
  sortCountObj: any = {};
constructor(private _http: HttpClient, private _commonService: CommonService) { }

grantCallRequestServiceObject = {
  property1: '',
  property2: '',
  property3: [],
  property4: '',
  property5: [],
  property6: [],
  property7: '',
  property13: '',
  property14: '',
  sortBy: 'updateTimeStamp',
  sort: {},
  isCalenderRequired : false,
  pageNumber : 20,
  currentPage : 1,
  advancedSearch : 'L'
};

checkReturnResult(prorp) {
  return prorp !== '';
}

deleteGrantcall(params) {
  return this._http.post(this._commonService.baseUrl + '/deleteGrantCall', params);
}

getGrantCallDashBoardList(params) {
  return this._http.post(this._commonService.baseUrl + '/fibiGrantCallDashBoard', params);
}

copyGrantCall(params) {
  return this._http.post(this._commonService.baseUrl + '/copyGrantCall', params);
}

checkCanDeleteGrantCall(params) {
  return this._http.post(this._commonService.baseUrl + '/canDeleteGrantCall', params);
}

exportGrantCallDashboardData(params) {
  return this._http.post(this._commonService.baseUrl + '/exportGrantCallDashboardData', params, {
    observe: 'response',
    responseType: 'blob'
  });
}

}
