import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_FOR_DISCLOSURE_PROJECT } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Observable } from 'rxjs';

@Injectable()
export class CoiCountModalService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }
    
    getDisclosureDetails(disclosureId: number) {
        return this._http.get(`${this._commonService.baseUrl}/getDisclosureDetailsForSFI/${disclosureId}`);
    }

    getDisclosureProjects(disclosureId: number) {
        return this._http.get(`${this._commonService.baseUrl}${URL_FOR_DISCLOSURE_PROJECT.replace('{disclosureId}', disclosureId.toString())}`);
    }

    fetchDisclosureAttachments(disclosureId: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/disclosure/attachment/getAttachmentsByDisclId/${disclosureId}`);
    }

    downloadAwardAttachment(attachmentId): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/disclosure/attachment/download`, {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

}
