import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class MergeIpService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    mergeIP(data) {
        return this._http.post(this._commonService.baseUrl + '/mergeProposalToIP', data);
    }

}
