import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class ExternalReviewService {

    moduleDetails: any = {
        'moduleItemCode': 0, 'moduleSubItemCode': 0,
        'moduleItemKey': 1, 'moduleSubItemKey': 0
    };
    externalSectionConfig: any;
    collapseReview = {};

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    externalReviewType() {
        return this._http.get(this._commonService.baseUrl + '/externalReview/serviceType');
    }

    saveExternalReview(params) {
        return this._http.post(this._commonService.baseUrl + '/externalReview', params);
    }

    updateExternalReview(params) {
        return this._http.put(this._commonService.baseUrl + '/externalReview', params);
    }

    getExternalReview(moduleItemCode: number, params) {
        return this._http.post(`${this._commonService.baseUrl}/externalReview/${moduleItemCode}`, params);
    }

    sendReview(extReviewID) {
        const formData = new FormData();
        formData.append('extReviewID', (extReviewID));
        return this._http.patch(this._commonService.baseUrl + '/externalReview', formData);
    }

}


