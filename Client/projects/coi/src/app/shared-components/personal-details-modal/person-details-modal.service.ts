import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class PersonDetailsModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getPersonData(personId: string) {
        return this._http.post(this._commonService.fibiUrl + '/getPersonDetailById', { 'personId': personId });
    }

    getRolodexPersonData(rolodexId: string | number) {
        return this._http.post(this._commonService.fibiUrl + '/getRolodexDetailById', { 'rolodexId': rolodexId });
    }

    loadPersonTrainingList(params) {
        return this._http.post(this._commonService.fibiUrl + '/getTrainingDashboard', params);
    }

}
