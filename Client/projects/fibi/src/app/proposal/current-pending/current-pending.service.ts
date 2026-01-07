import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class CurrentPendingService {

  constructor(private _http: HttpClient, private _commonService: CommonService,
    private _activatedRoute: ActivatedRoute) { }

  getCurrentAndPendingList(params) {
    return this._http.post(this._commonService.baseUrl + '/getCurrentAndPendingList', params);
  }

  fetchCurrentAndPendingDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getCPDetailsForSelectedPersons', params);
  }

  getPersonList(params) {
    return this._http.post(this._commonService.baseUrl + '/getPersonList', params);
  }

  excludeCurrentAndPendingDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/excludeCurrentAndPendingDetails', params);
  }

  saveCurrentPendingList(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateCPReportExtDetail', { 'cpReportProjectDetailExt': params });
  }

  exportCurrentAndPendingDetails(personId) {
    return this._http.get(this._commonService.baseUrl + '/exportCurrentAndPending', {
      headers: new HttpHeaders().set('moduleCode', '3').set('moduleItemKey',
        this._activatedRoute.snapshot.queryParamMap.get('proposalId')).set('personId', personId.toString()),
      responseType: 'blob'
    });
  }

  exportAllCurrentAndPendingDetails() {
    return this._http.get(this._commonService.baseUrl + '/exportCurrentAndPending', {
      headers: new HttpHeaders().set('moduleCode', '3').set('moduleItemKey',
        this._activatedRoute.snapshot.queryParamMap.get('proposalId')),
      responseType: 'blob'
    });
  }

  addExternalFundingSupport(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateCPExternalProjectDetail', { 'externalProjectDetail': params });
  }

  deleteProposalSponsor( params ) {
    return this._http.post( this._commonService.baseUrl + '/deleteCPExternalProjectDetail', params );
  }
}
