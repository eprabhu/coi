import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class EntityAttachmentService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    fetchEntityAttachments(entityId) {
        return this._http.get(`${this._commonService.baseUrl}/entity/attachment/getAttachmentsByEntityId/${entityId}`);
    }

}
