import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()

export class DuplicateMarkingConfirmationService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    markAsDuplicate(entityDetails) {
        return this._http.post(`${this._commonService.baseUrl}/entity/markDuplicate`, entityDetails);
    }
}
