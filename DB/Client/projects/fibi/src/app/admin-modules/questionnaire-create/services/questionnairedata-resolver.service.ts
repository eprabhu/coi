import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class QuestionnaireDataResolverService implements Resolve<any> {
    constructor(private _http: HttpClient, private _commonService: CommonService ) {}
    requestObject = {
        'questionnaireId': null
    };
    resolve(route: ActivatedRouteSnapshot) {
        if (route.queryParams.id) {
            this.requestObject.questionnaireId = route.queryParams.id.substr(2);
            return this._http.post(this._commonService.baseUrl + '/editQuestionnaire', this.requestObject);
        } else {
            return this._http.get(this._commonService.baseUrl + '/createQuestionnaire');
        }
    }
}
