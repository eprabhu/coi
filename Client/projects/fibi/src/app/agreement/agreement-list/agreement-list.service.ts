import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { of } from 'rxjs';

@Injectable()

export class AgreementListService {
  isPropertyCheck: boolean;
  grantCallElasticSearchObject = null;
  sortCountObj: any = {};
  httpOptions: any = {};
  deployMap = environment.deployUrl;
  agreementRequestObject = {
    property1: '',
    property2: '',
    property3: [],
    property4: [],
    property5: '',
    property6: [],
    property7: '',
    property8: '',
    property9: '',
    property10: '',
    property14: [],
    property15: [],
    property16: '',
    property17: '',
    property18: '',
    property19: '',
    property20: [],
    pageNumber: 20,
    sortBy: 'updateTimeStamp',
    sort: {},
    tabName: 'ALL_AGREEMENTS',
    advancedSearch: 'L',
    personId: '',
    currentPage: 1,
    reverse: ''
  };

  nameObject = {
    requestorName: '',
    piName: '',
    negotiatorName: '',
    unitName: '',
    adminName: '',
    personType: 'EMPLOYEE'
  };

  lookUpObject = {
    organisationType: '',
    agreementType: '',
    agreementStatus: '',
    reviewStatus: ''
  };

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  fetchAllReportData() {
    return this._http.post(this._commonService.baseUrl + '/fetchReportData', {});
  }

  assignAgreementAdmin(params) {
    return this._http.post(this._commonService.baseUrl + '/assignAgreementAdmin', params);
  }

  /** fetches dashboard data for all dashboard components
   * @param  {} params
   */
  getDashboardList(params) {
    return this._http.post(this._commonService.baseUrl + '/fibiDashBoard', params);
  }

  getAgreementDashBoardList(params) {
    return this._http.post(this._commonService.baseUrl + '/fibiAgreementDashBoard', params).pipe(
      catchError((err) => {
        if (err.status === 400) {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid character(s) found in search');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Agreement list fetching failed. Please try again.');
        }
        return of();
      }));
  }

  getNegotiationDashBoardList(params) {
    return this._http.post(this._commonService.baseUrl + '/fibiNegotiationDashBoard', params);
  }
  /** fetches document type and component names to export data
   * @param  {} params
   */
  exportAgreementDasboardDatas(params) {
    return this._http.post(this._commonService.baseUrl + '/exportAgreementDashboardDatas', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** fetches detailed report of selected report type
   * @param params
   */
  fetchApplicationReport(params) {
    return this._http.post(this._commonService.baseUrl + '/applicationReport', params);
  }

  /** fetches research-summary chart datas
   * @param params
   */
  getResearchSummaryData(params) {
    return this._http.post(this._commonService.baseUrl + '/getResearchSummaryData', params);
  }
  getUserNotification(params) {
    return this._http.post(this._commonService.baseUrl + '/getUserNotification', params);
  }
  getLocationList() {
    return this._http.get(this._commonService.baseUrl + '/getLocation');
  }
  getActivityList() {
    return this._http.get(this._commonService.baseUrl + '/getActivityType');
  }
  setNewLocation(Params) {
    return this._http.post(this._commonService.baseUrl + '/setNegotiationLocation', { 'negotiationsLocation': Params });
  }
  setNegotiationActivity(negotiationData, uploadedFiles) {
    const formData = new FormData();
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
    }
    formData.append('formDataJson', JSON.stringify({ 'negotiationActivity': negotiationData }));
    return this._http.post(this._commonService.baseUrl + '/maintainNegotiationActivity', formData);
  }
  getLocationListById(negotiationId) {
    return this._http.post(this._commonService.baseUrl + '/getLocationById', { 'negotiationId': negotiationId });
  }

  getActionList(inboxObj) {
    return this._http.post(this._commonService.baseUrl + '/showInbox', inboxObj);
  }
  openUnreadInbox(inboxId) {
    return this._http.post(this._commonService.baseUrl + '/markAsReadInboxMessage', { 'inboxId': inboxId });
  }

  getProposalAndReviewSummary(params) {
    return this._http.post(this._commonService.baseUrl + '/getProposalAndReviewSummary', params);
  }
  createRequest() {
    return this._http.get(this._commonService.baseUrl + '/getServiceRequestTypes');
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
    property19: '',
    property20: '',	
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
  getDashboardObject() {
    this.dashboardRequestObject.isUnitAdmin = (this._commonService.getCurrentUserDetail('unitAdmin') === 'true');
    this.dashboardRequestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.dashboardRequestObject.unitNumber = this._commonService.getCurrentUserDetail('unitNumber'),
      this.dashboardRequestObject.userName = this._commonService.getCurrentUserDetail('userName');
    this.dashboardRequestObject.provost = (this._commonService.getCurrentUserDetail('provost') === 'true');
    this.dashboardRequestObject.reviewer = (this._commonService.getCurrentUserDetail('reviewer') === 'true');
    this.dashboardRequestObject.isGrantAdmin = (this._commonService.getCurrentUserDetail('grantAdmin') === 'true');
    this.dashboardRequestObject.isDEC = (this._commonService.getCurrentUserDetail('dec') === 'true');
    this.dashboardRequestObject.isURC = (this._commonService.getCurrentUserDetail('urc') === 'true');
    this.dashboardRequestObject.isResearcher = (this._commonService.getCurrentUserDetail('researcher') === 'true');
    this.dashboardRequestObject.isIRBSecretariat = (localStorage.getItem('irbsecretariat') === 'true');
    this.dashboardRequestObject.isHOD = (localStorage.getItem('hod') === 'true');
    this.dashboardRequestObject.isOrttDirector = (localStorage.getItem('orttDirector') === 'true');
    return this.dashboardRequestObject;
  }
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
    this.dashboardRequestObject.property19 = '';
    this.dashboardRequestObject.sortBy = 'updateTimeStamp';
    this.dashboardRequestObject.reverse = 'DESC';
    this.dashboardRequestObject.sort = {};
    this.sortCountObj = {};
  }
  checkAllSearchProperties() {
    if (this.checkReturnResult(this.dashboardRequestObject.property1) || this.checkReturnResult(this.dashboardRequestObject.property2) ||
      this.checkReturnResult(this.dashboardRequestObject.property3) || this.checkReturnResult(this.dashboardRequestObject.property4) ||
      this.checkReturnResult(this.dashboardRequestObject.property5) || this.checkReturnResult(this.dashboardRequestObject.property6) ||
      this.checkReturnResult(this.dashboardRequestObject.property7) || this.checkReturnResult(this.dashboardRequestObject.property8) ||
      this.checkReturnResult(this.dashboardRequestObject.property9) || this.checkReturnResult(this.dashboardRequestObject.property10) ||
      this.checkReturnResult(this.dashboardRequestObject.property11) || this.checkReturnResult(this.dashboardRequestObject.property19)){      return true;
    }
  }
  checkReturnResult(prorp) {
    return prorp !== '';
  }

  deleteGrantcall(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteGrantCall', params);
  }

  copyGrantCall(params) {
    return this._http.post(this._commonService.baseUrl + '/copyGrantCall', params);
  }

  copyProposal(proposal) {
    return this._http.post(this._commonService.baseUrl + '/copyProposal', proposal);
  }

  deleteProposal(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteProposal', params);
  }

  addReview(params) {
    return this._http.post(this._commonService.baseUrl + '/addReview', params);
  }

  saveProposalRank(params) {
    return this._http.post(this._commonService.baseUrl + '/saveRankFromDashboard', params);
  }

  fetchEvaluationStop(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchEvaluationStop', params);
  }
  /* exports proposal as zip */
  printEntireProposal(proposalId) {
    return this._http.get(this._commonService.baseUrl + '/printEntireProposal', {
      headers: new HttpHeaders().set('proposalId', proposalId.toString()).
        set('userName', this._commonService.getCurrentUserDetail('userName')).
        set('personId', this._commonService.getCurrentUserDetail('personID')),
      responseType: 'blob'
    });
  }

  clearGrantCallElasticSearchObject() {
    this.grantCallElasticSearchObject = null;
  }

  downloadRoutelogAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  getServiceRequestTypes() {
    return this._http.get(this._commonService.baseUrl + '/getServiceRequestTypes');
  }

  saveVariationRequset(formData) {
    return this._http.post(this._commonService.baseUrl + '/createAwardVariationRequest', formData);
  }

  approveOrDisapproveReview(params) {
    return this._http.post(this._commonService.baseUrl + '/approveOrDisapproveReview', params);
  }
  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }

  canCreateAwardTask(params) {
    return this._http.post(this._commonService.baseUrl + '/canCreateAwardTask', params);
  }

  loadAgreementById(agreementId) {
    return this._http.post(this._commonService.baseUrl + '/loadAgreementById',
      {
        'agreementRequestId': agreementId,
        'personId': this._commonService.getCurrentUserDetail('personID'),
        'loginUserName': this._commonService.getCurrentUserDetail('userName')
      });
  }

  getId() {
    return this._http.get(this.deployMap + 'assets/app-config.json');
  }

  clearAdvanceSearchOptions() {
    this.agreementRequestObject.property1 = '';
    this.agreementRequestObject.property2 = '';
    this.agreementRequestObject.property3 = [];
    this.agreementRequestObject.property4 = [];
    this.agreementRequestObject.property5 = '';
    this.agreementRequestObject.property6 = [];
    this.agreementRequestObject.property7 = '';
    this.agreementRequestObject.property8 = '';
    this.agreementRequestObject.property9 = '';
    this.agreementRequestObject.property10 = '';
    this.agreementRequestObject.property14 = [];
    this.agreementRequestObject.property15 = [];
    this.agreementRequestObject.property16 = '';
    this.agreementRequestObject.property17 = '';
    this.agreementRequestObject.property18 = '';
    this.agreementRequestObject.property19 = '';
    this.agreementRequestObject.property20 = [];	
    this.agreementRequestObject.advancedSearch = 'L';
  }

  clearNameObject() {
    this.nameObject.unitName = '';
    this.nameObject.requestorName = '';
    this.nameObject.piName = '';
    this.nameObject.negotiatorName = '';
    this.nameObject.adminName = '';
    this.nameObject.personType = 'EMPLOYEE'
  }

  clearLookUpObject() {
    this.lookUpObject.reviewStatus = '';
    this.lookUpObject.organisationType = '';
    this.lookUpObject.agreementType = '';
    this.lookUpObject.agreementStatus = '';
  }
}
