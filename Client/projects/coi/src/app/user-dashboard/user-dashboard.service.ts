import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '../common/services/common.service';

@Injectable()
export class UserDashboardService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    getAllRemaindersList() {
        return this._http.get(this._commonService.baseUrl + '/getAllRemaindersList');
    }

}
