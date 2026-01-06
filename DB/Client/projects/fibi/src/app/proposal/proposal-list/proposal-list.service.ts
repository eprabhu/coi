import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import {catchError} from 'rxjs/operators';
import {HTTP_ERROR_STATUS} from '../../app-constants';
import {of} from 'rxjs';
import { ProposalDashBoardRequest } from '../proposal-interfaces';

@Injectable()

export class ProposalListService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  isAdvanceSearch = false;
  grantCallElasticSearchObject = null;
  sortCountObj: any = {};
  proposalRequestServiceObject = new ProposalDashBoardRequest();
  sponsorAdvanceSearchDefaultValue = '';
  /** For setting default Value of elastic, end point  in advance search */
  proposalRequestExtraData = {
    fullName: '',
    grantCallName: '',
    isEmployee: true
  };

  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    const httpOptions: any = {};
    httpOptions.contextField = contextField;
    httpOptions.formatString = formatString;
    httpOptions.path = path;
    httpOptions.defaultValue = defaultValue;
    httpOptions.params = params;
    return JSON.parse(JSON.stringify(httpOptions));
  }

  checkReturnResult(prorp) {
    return prorp !== '';
  }

  getProposalDashBoardList(params) {
    return this._http.post(this._commonService.baseUrl + '/fibiProposalDashBoard', params).pipe(catchError((err) => {
      if (err.status === 400) {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Invalid character(s) found in search.');
      } else {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Proposal list failed. Please try again.');
      }
      return of();
    }));
  }

  exportProposalDashboardData(params) {
    return this._http.post(this._commonService.baseUrl + '/exportProposalDashboardDatas', params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  downloadRouteLogAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadWorkflowAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  deleteProposal(params) {
    return this._http.post(this._commonService.baseUrl + '/deleteProposal', params);
  }

  copyProposal(proposal) {
    return this._http.post(this._commonService.baseUrl + '/copyProposal', proposal);
  }

  printEntireProposal(params) {
    return this._http.post( this._commonService.baseUrl + '/printEntireProposal', params, {responseType: 'blob'} );
    }

  getProposalAndReviewSummary(params) {
    return this._http.post(this._commonService.baseUrl + '/getProposalAndReviewSummary', params);
  }
  saveProposalRank(params) {
    return this._http.post(this._commonService.baseUrl + '/saveRankFromDashboard', params);
  }

  fetchEvaluationStop(params) {
    return this._http.post(this._commonService.baseUrl + '/fetchEvaluationStop', params);
  }

  approveOrDisapproveReview(params) {
    return this._http.post(this._commonService.baseUrl + '/approveOrDisapproveReview', params);
  }

  clearGrantCallElasticSearchObject() {
    this.grantCallElasticSearchObject = null;
  }

  addReview(params) {
    return this._http.post(this._commonService.baseUrl + '/addReview', params);
  }

  createAwardFromProposal(params) {
    return this._http.post( this._commonService.baseUrl + '/createAwardFromProposal', params );
  }

  canDeleteProposalDetail(params: {homeUnitNumber, proposalId}) {
    return this._http.post(this._commonService.baseUrl + '/canDeleteProposal', params);
  }

}
