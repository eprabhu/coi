import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { ENTITY_VALIDATE_DUPLICATE_API } from '../entity-constants';
import { DuplicateCheckObj } from '../entity-interface';

@Injectable()
export class DuplicateEntityCheckService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    checkForDuplicate(duplicateCheckObj: DuplicateCheckObj) {
        return this._http.post(`${this._commonService.baseUrl}/${ENTITY_VALIDATE_DUPLICATE_API}`, duplicateCheckObj);
    }
}
