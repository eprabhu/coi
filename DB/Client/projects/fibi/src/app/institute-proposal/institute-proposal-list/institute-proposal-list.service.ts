import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()

export class InstituteProposalListService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  sortCountObj: any = {};
  httpOptions: any = {};
  proposalRequestServiceObject = {
    property1: '',
    property2: '',
    property3: [],
    property4: [],
    property5: '',
    property6: '',
    property7: [],
    pageNumber: 20,
    sort: {},
    sortBy: 'updateTimeStamp',
    reverse: 'DESC',
    currentPage: 1,
    tabName: 'ALL_PROPOSALS',
    advancedSearch: 'L',
  };
  sponsorAdvanceSearchDefaultValue = '';
  /** For setting default Value of elastic, end point  in advance search */
  proposalRequestExtraData = {
    fullName: '',
    isEmployeeflag: true
  };

  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }

checkReturnResult(prorp) {
  return prorp !== '';
}
getInstituteProposalDashBoardList(params) {
  return this._http.post(this._commonService.baseUrl + '/fibiInstituteProposalDashBoard', params);
}
exportInstiuteProposalDashboardDatas(params) {
  return this._http.post(this._commonService.baseUrl + '/exportInstiuteProposalDashboardDatas', params, {
    observe: 'response',
    responseType: 'blob'
  });
}

  getIPVersionsDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getIPVersions', params);
  }
}
