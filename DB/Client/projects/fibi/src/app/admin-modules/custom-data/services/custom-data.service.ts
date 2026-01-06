
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class CustomDataService {

  moduleCode: any;

  constructor( private _http: HttpClient, private _commonService: CommonService) { }
  getDataTypes() {
    return this._http.get(this._commonService.baseUrl + '/getCustomElementDataTypes');
  }
  getModuleList() {
    return this._http.get(this._commonService.baseUrl + '/getApplicableModules');
  }
  saveCustomdata(params) {
    return this._http.post(this._commonService.baseUrl + '/configureCustomElement', params);
  }
  getAllCustomData() {
    return this._http.post(this._commonService.baseUrl + '/fetchAllCustomElement', {} );
  }
  updateStatus(customDataElementId) {
    return this._http.post
          (this._commonService.baseUrl + '/activeDeactivateCustomElementById', { 'customDataElementId': customDataElementId });
  }
  getCustomData(customDataElementId) {
     return this._http.post(this._commonService.baseUrl + '/fetchCustomElementById', { 'customDataElementId': customDataElementId });
  }
  getSystemLookupDetails(dataTypeCode) {
    return this._http.post(this._commonService.baseUrl + '/getSystemLookupByCustomType', { 'dataTypeCode': dataTypeCode });
  }
  getCustomElements(moduleCode) {
    return this._http.get(this._commonService.baseUrl + '/customElements/' + moduleCode);
  }
  saveCustomdataOrder(params, moduleCode) {
    return this._http.put(this._commonService.baseUrl + '/customElements/' + moduleCode, params);
  }
  updateCustomElementRequired(customDataElementId, moduleCode) {
    return this._http.patch(this._commonService.baseUrl + '/customElements/' + customDataElementId + '/' + moduleCode, {});
  }
  getCusElementModules() {
    return this._http.get(this._commonService.baseUrl + '/customElements/modules');
  }
}
