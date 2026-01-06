import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class CommentsService {

    constructor(
        private _http: HttpClient,
        private _commonService: CommonService
    ) { }

    getSRCommentsAndAttachments(requestId: number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/getSRCommentsAndAttachments/${requestId}`);
    }

    addServiceRequestCommentAndAttachment(requestId, commentData): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/addServiceRequestCommentAndAttachment`,
            this.setFromDataForComment(requestId, commentData));
    }

    setFromDataForComment(requestId, commentData): FormData {
        const formData = new FormData();
        for (const file of commentData.uploadedFile) {
            formData.append('files', file, file.fileName);
        }
        formData.append('formDataJson', JSON.stringify({
            'serviceRequestId': requestId,
            'serviceRequestComment': commentData.comment,
            'newAttachments': commentData.attachment
        }));
        return formData;
    }

    downloadServiceRequestAttachment(attachmentId): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/downloadServiceRequestAttachment`, {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

}
