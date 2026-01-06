import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class CompleteDisclosureHistoryService {

    constructor(private _http: HttpClient,
        private _commonService: CommonService,) { }

    getDisclosureHistory(param) {
        return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/historyDashboard', param);
    }

}
