import { Injectable , EventEmitter} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { Subject } from 'rxjs';

@Injectable()
export class ReportingRequirementsService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }

  reportsTermsLookUpData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getReportLookupData', { 'awardId': awardId });
  }
  reportsData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getReportsData', { 'awardId': awardId });
  }
  maintainReports(reportData) {
    return this._http.post(this._commonService.baseUrl + '/maintainReports', reportData);
  }
  addSpecialApproval(termData) {
    return this._http.post(this._commonService.baseUrl + '/maintainSpecialApproval', termData);
  }
  reportsTermsGweneralData(awardId) {
    return this._http.post(this._commonService.baseUrl + '/getAwardReportsAndTerms', { 'awardId': awardId });
  }
  deleteForeignTravel(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardReportsAndTerms', params);
  }
  deleteEquipment(params) {
    return this._http.post(this._commonService.baseUrl + '/getAwardReportsAndTerms', params);
  }
  // getReportTrackingDetails(params) {
  //   return this._http.post(this._commonService.baseUrl + '/getReportTrackingDetails', params);
  // }
  saveReportTrackingDetails(params) {
    const serviceName = !this._commonService.isWafEnabled ? '/saveReportTrackingDetails' : '/saveReportTrackingDetailsForWaf';
    return this._http.post(this._commonService.baseUrl + serviceName, params);
  }

  deleteReportTrackingAttachment( formData ) {
    return this._http.post( this._commonService.baseUrl + '/deleteReportTrackingAttachment', formData );
  }

  downloadAwardReportTrackingAttachment( attachmentId ) {
    return this._http.get( this._commonService.baseUrl + '/downloadAwardReportTrackingAttachment', {
        headers: new HttpHeaders().set( 'awardReportTrackingFileId', attachmentId.toString() ),
        responseType: 'blob'
    } );
  }

  fetchReportTypeByReportClass(reportClassCode) {
    return this._http.get(this._commonService.baseUrl + '/fetchReportByReportClass' + '?reportClassCode=' + reportClassCode );
  }

  getReportTrackingAttachmentVersions(awardReportTrackingId) {
    return this._http.get(this._commonService.baseUrl + '/getReportTrackingAttachmentVersions/' + awardReportTrackingId);
  }

  saveOrUpdateReportTracking(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateReportTracking ', params);
  }

  deleteReportTracking(awardReportTracking) {
    return this._http.post(this._commonService.baseUrl + '/deleteReportTracking' , awardReportTracking);
  }

  fetchHelpText(param) {
    return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param );
  }

  calculateOrGenerateOccurrence(params) {
    return this._http.post(this._commonService.baseUrl + '/calculateOrGenerateOccurrence ', params);
  }
}

