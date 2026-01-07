import {Injectable} from '@angular/core';
import {CommonService} from '../../common/services/common.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class ReviewCommentsService {


    isEditParentComment = false;
    editParentCommentId = null;
    isEditOrReplyClicked = false;

    constructor(private _commonService: CommonService, private _http: HttpClient) {
    }

    getSectionsTypeCode(params) {
        return this._http.post(this._commonService.baseUrl + '/getCoiSectionsTypeCode', params);
    }

    getCoiReviewComments(params) {
        return this._http.post(this._commonService.baseUrl + '/reviewComments/fetch', params);
    }

    getOPAReviewComments(params) {
        return this._http.post(this._commonService.formUrl + '/formbuilder/reviewComments/fetch', params);
    }

    downloadAttachment(params) {
        return this._http.get(this._commonService.baseUrl + '/attachment/downloadDisclAttachment', {
            headers: new HttpHeaders().set('attachmentId', params.toString()),
            responseType: 'blob'
        });
    }

    deleteCOIAssignee(coiReviewCommentTagId) {
        return this._http.delete(`${this._commonService.baseUrl}/deleteCOIReviewCommentTags/${coiReviewCommentTagId}`);
    }

    deleteCOICommentAttachment(params) {
        return this._http.post(this._commonService.baseUrl + ' /attachment/deleteDisclAttachment', params);
    }

    deleteReviewComments(coiReviewCommentId, moduleCode) {
        return this._http.delete(`${this._commonService.baseUrl}/reviewComments/${coiReviewCommentId}/${moduleCode}`);
    }

    deleteFormBuilderReviewComments(coiReviewCommentId, moduleCode) {
        return this._http.delete(`${this._commonService.formUrl}/formbuilder/reviewComments/${coiReviewCommentId}/${moduleCode}`);
    }

    addCOIReviewComment(params: any) {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(this._commonService.baseUrl + '/reviewComments', formData);
    }

    addOPAReviewComment(params: any) {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(params));
        return this._http.post(this._commonService.formUrl + '/formbuilder/reviewComments', formData);
    }

    getEntityProjectRelations(moduleCode, moduleId, id, status, personId) {
        if (moduleCode == 3) {
          return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/project/relations', {
            'disclosureId': id,
            'proposalIdlinkedInDisclosure': moduleId,
            'disclosureStatusCode': status,
            'moduleCode': moduleCode,
            'moduleItemId': moduleId,
            'personId': personId,
          });
        } else {
          return this._http.post(this._commonService.baseUrl + '/fcoiDisclosure/project/relations', {
            'disclosureId': id,
            'disclosureStatusCode': status,
            'moduleCode': moduleCode,
            'moduleItemId': moduleId,
            'personId': personId
          });
        }
    }

    loadDisclAttachTypes() {
        return this._http.get(this._commonService.baseUrl + '/loadDisclAttachTypes');
    }

}
