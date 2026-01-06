import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../common/services/common.service';

@Injectable()
export class LoginService {

    leadUnits = new BehaviorSubject<any>([]); // lead units allowed for logged user
    leadUnitsVariable = this.leadUnits.asObservable();

    constructor( private http: HttpClient, private _commonService: CommonService ) { }

    login(username: string, password: string) {
        const params = {
                principalName: username,
                password: password
        };
        let headers: HttpHeaders = new HttpHeaders();
        headers = headers.append('externalAuth', 'N');
        return this.http.post(this._commonService.baseUrl + '/login', params, { headers, observe: 'response' });
    }

    setLeadUnits(leadUnits: any) {
        this.leadUnits = leadUnits ;
    }

    getLeadUnits() {
        return this.leadUnits;
    }

}
