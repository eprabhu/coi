import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class MapService {

  constructor(private http: HttpClient,  private _commonService: CommonService) { }

  getDashboardMapList() {
    return this.http.get(this._commonService.baseUrl + '/getMapList');
  }
  getRoleDescription() {
    return this.http.get(this._commonService.baseUrl + '/getRoleDescription');
  }
  getUnitLists() {
    return this.http.get(this._commonService.baseUrl + '/getUnitLists');
  }
  getMapDetailsById(mapId) {

    return this.http.post(this._commonService.baseUrl + '/getMapDetailsById', { 'mapId': mapId });
  }
  insertMap(mapDetails) {
    return this.http.post(this._commonService.baseUrl + '/insertMap', {mapDetails });
  }
  updateMap(mapDetails) {

    return this.http.post(this._commonService.baseUrl + '/updateMap', { 'mapDetails': mapDetails });
  }
  deleteMap(mapId) {
    return this.http.post(this._commonService.baseUrl + '/deleteMap', { 'mapId': mapId });
  }
  fetchWorkflowMapType() {
    return this.http.get(this._commonService.baseUrl + '/fetchWorkflowMapType');
  }
}
