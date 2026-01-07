
import {of as observableOf,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';

import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class OverviewService {
  private debounceTimer: any;
  constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) { }
    getLookupData( params ) {
      return this._http.post( this._commonService.baseUrl + '/getAwardLookupData', params );
    }
    getAwardGeneralData( params ) {
      return this._http.post( this._commonService.baseUrl + '/getAwardGeneralInfo', params ).pipe(
      catchError(error => {
        console.log('Retrieval error', error);
        if (error.status === 403) {
          // name is given based on the values assinged in forbidden component please refer forbidden.component.ts
          this._commonService.forbiddenModule = '1';
          this._router.navigate(['/fibi/error/403']);
          return observableOf(null);
        } else {
          this._router.navigate(['/fibi/dashboard/awardList']);
          return observableOf(null);
        }
      }));
    }
    saveAward(params) {
      return this._http.post( this._commonService.baseUrl + '/saveAwardGeneralInfo', params );
    }
    saveSpecialReview(params) {
      return this._http.post( this._commonService.baseUrl + '/saveAwardSpecialReview', params );
    }
    deleteSpecialReview(params) {
      return this._http.post( this._commonService.baseUrl + '/deleteAwardSpecialReview', params);
    }
    addSubcontract(params) {
      return this._http.post( this._commonService.baseUrl + '/saveAwardSubContract', params );
    }
    deleteSubcontract(params) {
       return this._http.post( this._commonService.baseUrl + '/deleteAwardSubContract', params);
    }
    deleteProposalKeyword(params) {
      return this._http.post( this._commonService.baseUrl + '/deleteAwardKeyword', params );
    }
    maintainInstituteProposal(params) {
      return this._http.post( this._commonService.baseUrl + '/linkInstituteProposalToAward', params );
    }
    getLeadUnitName(unitId) {
      return this._http.post( this._commonService.baseUrl + '/getUnitName', {'unitNumber': unitId} );
    }
    getSponsorName(sponsorCode) {
      return this._http.post( this._commonService.baseUrl + '/getSponsorName', {'sponsorCode': sponsorCode} );
    }
    addScienceKeyword(params) {
      return this._http.post( this._commonService.baseUrl + '/addScienceKeyword', params );
    }
    getAwardFunds(params) {
      return this._http.post( this._commonService.baseUrl + '/getAwardFunds', params);
    }
    unlinkGrantCallFromAward(params) {
      return this._http.post(this._commonService.baseUrl + '/unlinkGrantCallFromAward', params);
    }
    addAwardAreaOfResearch(params) {
      return this._http.post(this._commonService.baseUrl + '/addAwardAreaOfResearch', params);
    }
    deleteAwardResearchArea(params) {
      return this._http.post(this._commonService.baseUrl + '/deleteAwardResearchArea', params);
    }
    saveDescriptionOfAward(params) {
      return this._http.post(this._commonService.baseUrl + '/saveDescriptionOfAward', params);
    }
    updateReportTermsInAward(params) {
      return this._http.post(this._commonService.baseUrl + '/updateReportTermsInAward', params);
    }
    canLinkInstituteProposal(proposalId: number) {
      return this._http.get(`${this._commonService.baseUrl}/canLinkInstituteProposal/${proposalId}`);
    }
}
