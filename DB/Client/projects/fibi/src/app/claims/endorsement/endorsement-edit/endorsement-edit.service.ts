import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {CommonService} from '../../../common/services/common.service';


@Injectable()
export class EndorsementEditService {

    constructor(private _http: HttpClient, private _commonService: CommonService, private _router: Router) {
    }

    saveOrUpdateClaim(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateClaim', params);
    }


}
