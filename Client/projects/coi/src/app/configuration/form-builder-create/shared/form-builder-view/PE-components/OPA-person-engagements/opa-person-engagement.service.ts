import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { Observable } from 'rxjs';
import { OpaPersonEngagementFetchRO } from '../../../common.interface';

@Injectable()
export class OpaPersonEngagementService {

    constructor(private _http: HttpClient,
        private _commonService: CommonService) { }

    fetchEngagementAfterAction(opaPersonEngagementRO: OpaPersonEngagementFetchRO): Observable<any> {
        return this._http.post(this._commonService.formUrl + '/formbuilder/fetchOpaDisclPersonEntityRel', opaPersonEngagementRO);
    }

}
