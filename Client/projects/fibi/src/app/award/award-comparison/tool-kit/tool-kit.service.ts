import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ToolKitService {
    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getAwardHistoryInfo(params) {
        return this._http.post(this._commonService.baseUrl + '/showAwardHistory', params);
    }
    getAllReviewComments(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchAwardReviewCommentsByAwardId', params);
    }
    getFilterCommentReviewersList(params) {
        return this._http.post(this._commonService.baseUrl + '/getListOfAwardReviewPersons', params);
    }
    
    fetchHelpText(param) {
        return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param );
    }
}
