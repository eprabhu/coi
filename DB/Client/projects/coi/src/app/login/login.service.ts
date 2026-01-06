import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../common/services/common.service";

@Injectable()
export class LoginService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {
    }

    login(credentials: any) {
        const requestObject = {username: credentials.username, password: credentials.password};
        return this._http.post(this._commonService.authUrl + '/login', requestObject, { observe: 'response' });
    }
}
