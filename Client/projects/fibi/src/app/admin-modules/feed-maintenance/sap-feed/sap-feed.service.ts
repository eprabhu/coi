import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { Subject } from 'rxjs';

@Injectable()

export class SapFeedService {

  sapFileProcessInfoText = new Subject<any>();

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  getBatchDetails(parms) {
    return this._http.post(this._commonService.baseUrl + '/getBatchDetailDashboard', parms);
 }
 
 getInterfaceDetails(feedId) {
  return this._http.post(this._commonService.baseUrl + '/getSapAwardFeedDetails', feedId);
 }
 
 getBatchHistory(parms) {
  return this._http.post(this._commonService.baseUrl + '/getBatchDetailDashboard', parms);
 }
 
 updateFeedStatus(reqObj) {
  return this._http.post(this._commonService.baseUrl + '/updateFeedStatus', reqObj);
 }
 
 reInterface(reqObj) {
  return this._http.post(this._commonService.baseUrl + '/reInterfaceSapAwardFeed', reqObj);
 }
 
 manualResponseProcess() {
  return this._http.get(this._commonService.baseUrl + '/fastIntegrationResponseProcessing');
 }

 getSapBatchFeedAttachment(reqObj) {
  return this._http.post(this._commonService.baseUrl + '/exportSapGeneratedAttachments', reqObj, {
    responseType: 'blob'
  });
 }
 
 generateBatch(reqObj) {
  return this._http.post(this._commonService.baseUrl + '/fastIntegration', reqObj);
 }

 reTrigger(batchId) {
  return this._http.post(this._commonService.baseUrl + '/sapFeedReTrigger', batchId);
 }

 notifyPi(reqObj) {
  return this._http.post(this._commonService.baseUrl + '/notifyPI', reqObj);
 }

 /**
  * @param userActionsList
  * This will set info text for SAP File Response process action (Action code : 8)
  * which will be called from child modules of Batch Details, Pending Feeds and Batch History.
  */
  setSapFileProcessInfoText(userActionsList) {
    const sapActionObj = userActionsList && userActionsList.length ?
    userActionsList.find(action => action.userActionCode === '8') : null;
    sapActionObj ? this.sapFileProcessInfoText.next(sapActionObj.description) : this.sapFileProcessInfoText.next(null);
  }

  exportSapFeedReport(param: any) {
    return this._http.post(this._commonService.baseUrl + '/generateSapFeedReport', param, {
      observe: 'response',
      responseType: 'blob'
    });
  }

}
