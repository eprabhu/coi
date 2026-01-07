import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class UnitHierarchyService {
  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getHierarchylist() {
    return this._http.get(this._commonService.baseUrl + '/getUnitHierarchy');
  }
  getUnitList() {
    return this._http.get(this._commonService.baseUrl + '/getUnitsList');
  }
  addNewUnit(unitProperties) {
    return this._http.post(this._commonService.baseUrl + '/addNewUnit', unitProperties);
  }
  viewUnitDetails(unitNumber) {
    return this._http.post(this._commonService.baseUrl + '/getUnitDetail', {'unitNumber': unitNumber});
  }
  getRateMaintainanceData(unitId) {
    return this._http.post(this._commonService.baseUrl + '/getRates', {'unitNumber': unitId});
  }
  getlaRateMaintainanceData(unitId) {
    return this._http.post(this._commonService.baseUrl + '/getLARates', {'unitNumber': unitId});
  }
  saveInstituteRates(rate , flag) {
    return this._http.post(this._commonService.baseUrl + '/addRate', {'instituteRate': rate, 'campusFlag': flag});
  }
  saveLARates(rate, flag) {
    return this._http.post(this._commonService.baseUrl + '/addLARate', {'instituteLARate': rate, 'campusFlag': flag});
  }
  deleteRateData(deleteRate) {
    return this._http.post(this._commonService.baseUrl + '/deleteRate', {'instituteRate': deleteRate});
  }
  deleteLaRateData(deleteRate) {
    return this._http.post(this._commonService.baseUrl + '/deleteLARate', {'instituteLARate': deleteRate});
  }
  deleteUnitAdministrator ( administrator ) {
    return this._http.post(this._commonService.baseUrl + '/deleteUnitAdministrator', {'unitAdministrators': administrator});
  }
}
