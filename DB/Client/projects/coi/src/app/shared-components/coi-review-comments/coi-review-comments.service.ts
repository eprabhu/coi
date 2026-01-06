import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from './coi-review-comments-constants';
import { FetchReviewCommentRO, AddReviewCommentRO } from '../coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsActions } from './coi-review-comments.interface';
import { Observable } from 'rxjs';

@Injectable()
export class CoiReviewCommentsService {

    constructor(private _commonService: CommonService, private _http: HttpClient) {}

    notifyGlobalEvent(action: COIReviewCommentsActions, content?: {}): void {
        this._commonService.$globalEventNotifier.next({
            uniqueId: COI_REVIEW_COMMENTS_IDENTIFIER,
            content: { action, ...content }
        });
    }

    getCoiReviewComments(params: FetchReviewCommentRO) {
        return this._http.post(`${this._commonService.baseUrl}/reviewComments/fetch`, params);
    }

    saveCOIReviewComment(params: AddReviewCommentRO) {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(`${this._commonService.baseUrl}/reviewComments`, formData);
    }

    deleteReviewComments(coiReviewCommentId: number | string, moduleCode: number | string) {
        return this._http.delete(`${this._commonService.baseUrl}/reviewComments/${coiReviewCommentId}/${moduleCode}`);
    }

    addProjectOverviewComment(params: AddReviewCommentRO): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/project/saveComment', params, { responseType: 'text' });
    }

    updateProjectOverviewComment(params: AddReviewCommentRO): Observable<any> {
        return this._http.patch(this._commonService.baseUrl + '/project/updateComment', params, { responseType: 'text' });
    }

    deleteProjectOverviewComments(CommentId: string | number): Observable<any> {
        return this._http.delete(`${this._commonService.baseUrl}/project/deleteComment/${CommentId}`, { responseType: 'text' });
    }

    resolveComment(commentId: string | number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/reviewComments/resolve`, {commentId: commentId}, { responseType: 'text' });
    }

    projectCommentsResolve(commentId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/project/resolveProjectComment/${commentId}`, { responseType: 'text' });
    }

}
