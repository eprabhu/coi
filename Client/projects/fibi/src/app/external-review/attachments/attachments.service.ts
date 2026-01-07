import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AttachmentsService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    getProposalGrantCallAttachments(proposalID: number) {
        return this._http.get(`${this._commonService.baseUrl}/externalReview/grantCallProposalAttachments/${proposalID}`);
    }

    getExternalReviewAttachments(extReviewID: number) {
        return this._http.get(`${this._commonService.baseUrl}/externalReview/attachments/${extReviewID}`);
    }

    getExtReviewAttachmentTypes() {
        return this._http.get(this._commonService.baseUrl + '/externalReview/attachmentTypes');
    }

    uploadExternalReviewAttachment(recallObject, uploadedFile, grantCallProposalAttachments) {
        const formData = new FormData();
        if (uploadedFile.length) {
            for (const file of uploadedFile) {
                formData.append('files', file, file.name);
            }
        }
        formData.append('fileFormData', JSON.stringify(recallObject));
        formData.append('grantCallProposalFormData', JSON.stringify(grantCallProposalAttachments));
        return this._http.post(this._commonService.baseUrl + '/externalReview/attachments', formData);
    }

    downloadReviewAttachment(extReviewAttachmentId: number) {
        return this._http.get(`${this._commonService.baseUrl}/externalReview/attachment/download/${extReviewAttachmentId}`, {
            responseType: 'blob'
        });
    }

    deleteExternalReviewAttachment(extReviewAttachmentId: number) {
        return this._http.delete(`${this._commonService.baseUrl}/externalReview/attachments/${extReviewAttachmentId}`);
    }

}



