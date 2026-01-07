import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { Observable } from 'rxjs';

@Injectable()
export class SharedAttachmentService {

    constructor(private _http: HttpClient,
        private _commonService: CommonService
    ) { }

    fetchAllAttachments(disclosureOrPersonId, loadAttachmentListEndpoint: string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}${loadAttachmentListEndpoint}/${disclosureOrPersonId}`);
    }

    deleteAttachment(attachmentNumber: number, deleteAttachmentEndpoint: string): Observable<any> {
        const url = `${this._commonService.baseUrl}${deleteAttachmentEndpoint}?attachmentNumber=${attachmentNumber}`;
        return this._http.delete(url, { responseType: 'text' });
    }

    downloadAttachment(attachmentId, downloadAttachmentEndpoint: string): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}${downloadAttachmentEndpoint}`, {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

}
