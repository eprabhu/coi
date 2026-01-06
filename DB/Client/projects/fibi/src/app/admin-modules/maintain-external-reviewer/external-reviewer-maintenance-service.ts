import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { ExtReviewer } from './reviewer-maintenance.interface';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class ExtReviewerMaintenanceService {
    extReviewer: ExtReviewer = new ExtReviewer();
    mode: string;
    $externalReviewerDetails = new BehaviorSubject<object>({});
    isDataChange = false;
    navigationUrl = '';
    $lookUpData = new BehaviorSubject<object>({});
    lookUpData: any = {};

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    async getMaintainReviewerPermission() {
        return await this._commonService.checkPermissionAllowed('MAINTAIN_EXTERNAL_REVIEW');
    }

    fetchExternalReviewerData(params) {
        return this._http.post(this._commonService.baseUrl + '/getAllExtReviewers ', params);
    }

    getAllExtReviewersLookup() {
        return this._http.get(this._commonService.baseUrl + '/getAllExtReviewersLookup ');
    }

    saveOrUpdateExtReviewer(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateExtReviewer ', params);
    }
    saveOrUpdateuserAccess(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateuserAccess ', params);
    }
    saveOrUpdateAdditionalDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAdditionalDetails ', params);
    }

    addExternalReviewerAttachment(newAttachments, uploadedFile) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file);
        }
        formData.append('formDataJson', JSON.stringify({
            'extReviewerAttachments': newAttachments
        }));
        return this._http.post(this._commonService.baseUrl + '/addExtReviewerAttachment', formData);
    }

    deleteExternalReviewerAttachment(extReviewerAttachmentId: number) {
        return this._http.delete(`${this._commonService.baseUrl}/deleteExtReviewerAttachment/${extReviewerAttachmentId}`);
    }

    updateAttachmentDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/updateExtAttachment', { 'extReviewerAttachment': params });
    }

    downloadAttachment(reviewerAttachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadExternalReviewerAttachment', {
            headers: new HttpHeaders().set('externalReviewerAttachmentId', reviewerAttachmentId.toString()),
            responseType: 'blob'
        });
    }

    loadExternalReviewerDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/getExtReviewerDetailById', params);
    }

    setExternalReviewerDetails(externalReviewerDetails: any) {
        this.$externalReviewerDetails.next(externalReviewerDetails);
    }

    setLookUpData(data: any) {
        this.$lookUpData.next(data);
    }

    resetExternalReviewerPassword(externalReviewerId: any) {
        // tslint:disable-next-line: max-line-length
        return this._http.patch(this._commonService.baseUrl + '/resetExternalReviewerPassword/' + externalReviewerId, {}, { responseType: 'text' });
    }

    addSpecialismKeyword(params: any) {
        return this._http.post(this._commonService.baseUrl + '/addSpecialismKeyword', params);
    }
    
    addAffiliationInstitution(params: any) {
        return this._http.post(this._commonService.baseUrl + '/addAffiliationInstitution', params);
    }
}


