import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()
export class SharedCommentService {

    constructor(private _http: HttpClient, public _commonService: CommonService) { }

    fetchProposalComments(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchProposalComments', params);
    }

    downloadProposalCommentAttachment(attachmentId) {
        return this._http.get(`${this._commonService.baseUrl}/downloadProposalCommentAttachment`, {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()), responseType: 'blob'
        });
    }

    saveOrUpdateProposalComment(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalcomment', params);
    }

    getInstituteProposalComments(proposalId: string) {
        return this._http.get(`${this._commonService.baseUrl}/fetchInstituteProposalComments/${proposalId}`);
    }

    saveOrUpdateInstituteProposalComment(params): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/saveOrUpdateInstituteProposalComment`, params);
    }
}
