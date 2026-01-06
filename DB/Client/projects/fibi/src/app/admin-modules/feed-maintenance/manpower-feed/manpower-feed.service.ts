import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ManpowerFeedService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getManpowerLookupSyncDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getManpowerLookupSyncDetails', params);
  }

  getAwardTriggerDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardTriggerDetails', params);
  }

  getPositionTriggerDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getPositionTriggerDetails', params);
  }

  getPositionErrorDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getPositionErrorDetails', params);
  }

  retriggerAwardWorkdayPrerequisite(params) {
    return this._http.post(this._commonService.baseUrl + '/retriggerAwardWorkdayPrerequisite', params);
  }

  getCostAllocationTriggerDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getCostAllocationTriggerDetails', params);
  }

  getCurrentCostAllocationDetails(params) {
    return this._http.post(this._commonService.baseUrl + '/getCurrentCostAllocationDetails', params);
  }

  retriggerWorkdayApi(params) {
    return this._http.post(this._commonService.baseUrl + '/retriggerWorkdayApi', params);
  }

  retriggerWorkdayClosePosition(params) {
    return this._http.post(this._commonService.baseUrl + '/retriggerWorkdayClosePosition', params);
  }

  updateManpowerInterfaceManually(params) {
    return this._http.post(this._commonService.baseUrl + '/updateManpowerInterfaceManually', params);
  }

  getWorkdayTerminations() {
    return this._http.get(this._commonService.baseUrl + '/getWorkdayTerminations');
  }

  getWorkdayJobProfile() {
    return this._http.get(this._commonService.baseUrl + '/getWorkdayJobProfile');
  }

  getManpowerDetails() {
    return this._http.get(this._commonService.baseUrl + '/getManpowerDetails');
  }

  getNationalityDetails() {
    return this._http.get(this._commonService.baseUrl + '/getNationalityDetails');
  }

  getJobProfileChanges() {
    return this._http.get(this._commonService.baseUrl + '/getJobProfileChanges');
  }

  getWorkdayLongLeave() {
    return this._http.get(this._commonService.baseUrl + '/getWorkdayLongLeave');
  }

  getManpowerLogDetail(params) {
    return this._http.post(this._commonService.baseUrl + '/getManpowerLogDetail', params);
  }

  costAllocationWithManualDates(param) {
    return this._http.post(this._commonService.baseUrl + '/costAllocationWithManualDates', param);
  }

  positionStatusApiWithManualDates(param) {
    return this._http.post(this._commonService.baseUrl + '/positionStatusApiWithManualDates', param);
  }

  startWorkdayTerminationsWithManualDates(param) {
    return this._http.post(this._commonService.baseUrl + '/startWorkdayTerminationsWithManualDates ', param);
  }

  startWorkdayLongLeaveWithManualDates(param) {
    return this._http.post(this._commonService.baseUrl + '/startWorkdayLongLeaveWithManualDates ', param);
  }

  getAwardManpowerErrors(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardManpowerErrors', params);
  }

  retriggerAllAwardManpowerInterface(params) {
    return this._http.post(this._commonService.baseUrl + '/retriggerAllAwardManpowerInterface', params);
  }

  reconcileCostAllocation() {
    return this._http.get(this._commonService.baseUrl + '/reconcileCostAllocation');
  }

}
