import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { Observable } from 'rxjs';

@Injectable()
export class CommentsService {

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getAllReviewComments(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchAwardReviewCommentsByAwardId', params);
    }

    saveComment(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAwardReviewComment',
         {'awardReviewComment': params,
          'awardId' : params.awardId,
          'personId': this._commonService.getCurrentUserDetail('personID')});
    }

    getCommentslist(params) {
        return this._http.post(this._commonService.baseUrl + '/getReviewCommentsByProtocol', params);
    }
    resolveComment(params) {
        return this._http.post(this._commonService.baseUrl + '/resolveAwardReviewComment', params);
    }
    deleteComment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteAwardReviewComment', { 'awardReviewCommentId': params });
    }

    downloadServiceRequestAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadServiceRequestAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    deleteServiceRequestAttachment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteSRAttachment', params);
    }

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

}

