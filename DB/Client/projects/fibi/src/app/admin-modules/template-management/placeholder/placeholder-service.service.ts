import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class PlaceholderServiceService {

constructor( private _http: HttpClient, private _commonService: CommonService) {}   

loadAllFormPlaceHolders() {
    return this._http.get(this._commonService.baseUrl + '/loadAllFormPlaceHolders');
    }

loadAllQuestionsPlaceHolders(agreementTypeCode){
    return this._http.post(this._commonService.baseUrl + '/loadAllQuestionsPlaceHolders',agreementTypeCode);
}

loadAllClausesPlaceHolders(agreementTypeCode){
    return this._http.post(this._commonService.baseUrl + '/loadAllClausesTemplates',agreementTypeCode);
}
}
