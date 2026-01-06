import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../../common/services/common.service';

@Injectable()
export class ProjectOutcomeService {

constructor(private _commonService: CommonService, private _http: HttpClient) { }

  loadAllProjectOutcomes(awardNumber) {
    return this._http.post( this._commonService.baseUrl + '/loadAllAwardProjectOutcomes', awardNumber);
  }

  downloadAttachment(awardAcheivementAttachId) {
    return this._http.get( this._commonService.baseUrl + '/downloadAwardAcheivementsAttachment' +
                          '?awardAcheivementId=' + awardAcheivementAttachId, {responseType: 'blob'});

  }
}
