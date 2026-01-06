import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { COI_REVIEW_COMMENTS_IDENTIFIER } from '../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsActions } from '../../../shared-components/coi-review-comments/coi-review-comments.interface';
import { AddEntityReviewCommentsRO } from '../entity-interface';
import { Observable } from 'rxjs';

@Injectable()
export class EntityReviewCommentsService {

    constructor(private _commonService: CommonService, private _http: HttpClient) {}

    notifyGlobalEvent(action: COIReviewCommentsActions, content?: {}): void {
        this._commonService.$globalEventNotifier.next({
            uniqueId: COI_REVIEW_COMMENTS_IDENTIFIER,
            content: { action, ...content }
        });
    }

    getAllReviewComments(entityNumber: number | string) {
        return this._http.get(`${this._commonService.baseUrl}/entity/comments/getEntityCommentsByEntityNumber/${entityNumber}`);
    }

    getReviewCommentsBySection(entityNumber: number | string, sectionCode: number | string) {
        return this._http.get(`${this._commonService.baseUrl}/entity/comments/fetchAllBySectionCode/${sectionCode}/${entityNumber}`);
    }

    getEntityReviewComments(entityNumber: number | string, sectionCode?: number | string) {
        if (sectionCode) {
            return this.getReviewCommentsBySection(entityNumber, sectionCode);
        } else {
            return this.getAllReviewComments(entityNumber);
        }
    }

    addEntityReviewComment(params: AddEntityReviewCommentsRO) {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(`${this._commonService.baseUrl}/entity/comments`, formData);
    }

    updateEntityReviewComment(params: AddEntityReviewCommentsRO) {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.patch(`${this._commonService.baseUrl}/entity/comments`, params);
    }

    deleteReviewComments(sectionCode:  number | string, commentId: number | string) {
        return this._http.delete(`${this._commonService.baseUrl}/entity/comments/delete/${sectionCode}/${commentId}`);
    }

    resolveComment(commentId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/entity/comments/resolveEntityComment/${commentId}`, { responseType: 'text' });
    }

}
