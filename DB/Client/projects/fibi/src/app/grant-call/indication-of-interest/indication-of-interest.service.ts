import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class IndicationOfInterestService {
    ioiTabName = 'MY_IOI';
  
    constructor(private _http: HttpClient, private _commonService: CommonService) { }
    fetchAllScoringCriteria() {
        return this._http.get(this._commonService.baseUrl + '/getRoleDescription');
    }
    fetchDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/createOrEditGrantCallIOI', params);
    }
    saveOrUpdateGrantCallIOI(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantIOIDetails', params);
    }
    deleteIOIMember(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteIOIMember', params);
    }
    addIOIMember(params) {
        return this._http.post(this._commonService.baseUrl + '/addIOIMember', params);
    }
    loadGrantCallIOIByGrantId(params) {
        return this._http.post(this._commonService.baseUrl + '/loadGrantCallIOIByGrantId', params);
    }
    deleteIOIListItem(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteIOIListItem', params);
    }
    getApplicableQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
    }
    loadQuestionnaireByGrantCallId(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchGrantCallIOIQuestionnaireByGrantId', params);
    }
    saveOrUpdateGrantCallIOIQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateGrantCallIOIQuestionnaire', params);
    }
    exportGrantCallIoi(params) {
        return this._http.post( this._commonService.baseUrl + '/exportIOIDatas', params, {
            observe: 'response',
            responseType: 'blob'
          });
      }
}
