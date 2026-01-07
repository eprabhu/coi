import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { CertificationLogRO, PersonNotifyMailRO } from '../common.interface';

@Injectable()
export class NotifyService {

  constructor(private _http: HttpClient, private _commonService: CommonService) { }


  getRoleTypes(notifyObject) {
    return this._http.post(this._commonService.baseUrl + '/getRoleDescriptionByModuleCode', {
      'moduleCode': notifyObject.moduleCode,
      'subModuleCode': notifyObject.subModuleCode
    });
  }

  sendEmailNotification(notificationObject, serviceName) {
    return this._http.post(this._commonService.baseUrl + serviceName, notificationObject);
}
  getPersonCertificationMailLog(params: CertificationLogRO) {
    return this._http.post(`${this._commonService.baseUrl}/personCertificationMailLog`, params);
  }

  getProposalPersonsForCertification(params) {
    return this._http.post(`${this._commonService.baseUrl}/proposalPersonsForCertification`, params);
  }

  sendPersonCertificationMail(params: PersonNotifyMailRO) {
    return this._http.post(`${this._commonService.baseUrl}/sendPersonCertificationMail`, params);
  }

}
