/** Last updated by Ramlekshmy I on 22-10-2019 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class DashboardService {
  isPropertyCheck: boolean;
  grantCallElasticSearchObject = null;
  sortCountObj: any = {};
  httpOptions: any = {};

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getUserNotification(params) {
    return this._http.post(this._commonService.baseUrl + '/getUserNotification', params);
  }

  openUnreadInbox(inboxId) {
    return this._http.post(this._commonService.baseUrl + '/markAsReadInboxMessage', { 'inboxId': inboxId });
  }

  // tslint:disable-next-line:member-ordering
  dashboardRequestObject = {
    property1: '',
    property2: '',
    property3: '',
    property4: '',
    property5: '',
    property6: '',
    property7: '',
    property8: '',
    property9: '',
    property10: '',
    property11: '',
    property13: '',
    property14: '',
    pageNumber: 20,
    sortBy: 'updateTimeStamp',
    sort: {},
    reverse: 'DESC',
    tabIndex: null,
    userName: localStorage.getItem(''),
    personId: this._commonService.getCurrentUserDetail('personID'),
    currentPage: 1,
    isUnitAdmin: (this._commonService.getCurrentUserDetail('unitAdmin') === 'true'),
    unitNumber: this._commonService.getCurrentUserDetail('unitNumber'),
    provost: (this._commonService.getCurrentUserDetail('provost') === 'true'),
    reviewer: (this._commonService.getCurrentUserDetail('reviewer') === 'true'),
    isGrantAdmin: (this._commonService.getCurrentUserDetail('grantAdmin') === 'true'),
    isDEC: (this._commonService.getCurrentUserDetail('dec') === 'true'),
    isURC: (this._commonService.getCurrentUserDetail('urc') === 'true'),
    isResearcher: (this._commonService.getCurrentUserDetail('researcher') === 'true'),
    isIRBSecretariat: (localStorage.getItem('irbsecretariat') === 'true'),
    isHOD: (localStorage.getItem('hod') === 'true'),
    isOrttDirector: (localStorage.getItem('orttDirector') === 'true'),
    tabName: null,
    grantCallId: null,
    canCreateGrantCall: false,
    advancedSearch: 'L'
  };
  resetAllSearchAndSortProperties() {
    this.dashboardRequestObject.property1 = '';
    this.dashboardRequestObject.property2 = '';
    this.dashboardRequestObject.property3 = '';
    this.dashboardRequestObject.property4 = '';
    this.dashboardRequestObject.property5 = '';
    this.dashboardRequestObject.property6 = '';
    this.dashboardRequestObject.property7 = '';
    this.dashboardRequestObject.property8 = '';
    this.dashboardRequestObject.property9 = '';
    this.dashboardRequestObject.property10 = '';
    this.dashboardRequestObject.property11 = '';
    this.dashboardRequestObject.sortBy = 'updateTimeStamp';
    this.dashboardRequestObject.reverse = 'DESC';
    this.dashboardRequestObject.sort = {};
    this.sortCountObj = {};
  }

  clearGrantCallElasticSearchObject() {
    this.grantCallElasticSearchObject = null;
  }

  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }
  getActionList(inboxObj) {
    return this._http.post(this._commonService.baseUrl + '/showInbox', inboxObj);
  }
}
