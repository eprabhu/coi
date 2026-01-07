import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../common/services/common.service';

@Injectable()

export class ServiceRequestService {

    sectionConfigurations: any = {};
    isServiceRequestDataChange = false;
    serviceRequestTitle: string;

    constructor(
        private _http: HttpClient,
        private _commonService: CommonService
    ) { }

    createServiceRequest(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/createServiceRequest`);
    }

    saveOrUpdateServiceRequest(params): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/saveOrUpdateServiceRequest`, params);
    }

    loadServiceRequestById(serviceRequestId): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadServiceRequestById/${serviceRequestId}`);
    }

    submitServiceRequest(requestId, commentData): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/submitServiceRequest`,
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
            'newAttachments': commentData.attachment,
            'serviceRequestStatus': commentData.serviceRequestStatus
        }));
        return formData;
    }

    getApplicableQuestionnaire(params): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
    }

    maintainReportWorkFlow(requestObject, uploadedFile): Observable<any> {
        const approveFormData = new FormData();
        for (const file of uploadedFile) {
            approveFormData.append('file', file, file.name);
        }
        approveFormData.append('formDataJson', JSON.stringify(requestObject));
        approveFormData.append('moduleCode', '20');
        approveFormData.append('subModuleCode', '0');
        return this._http.post(`${this._commonService.baseUrl}/approveOrRejectWorkflow`, approveFormData);
    }

    assignReviewer(assignRequest, uploadedFile, newAttachments): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/assignReviewer`,
            this.setFromDataForAssignReviewer(assignRequest, uploadedFile, newAttachments));
    }

    setFromDataForAssignReviewer(assignRequest, uploadedFile, newAttachments): FormData {
        const formData = new FormData();
        if (uploadedFile.length) {
            for (const file of uploadedFile) {
                formData.append('files', file, file.fileName);
            }
        }
        formData.append('formDataJson', JSON.stringify({
            'serviceRequestId': assignRequest.serviceRequestId,
            'isReturnServiceRequest': assignRequest.isReturnServiceRequest,
            'serviceRequestHistory': assignRequest.serviceRequestHistory,
            'assigneePersonId': assignRequest.assigneePersonId,
            'adminGroupId': assignRequest.adminGroupId,
            'isAddAsWatcher': assignRequest.isAddAsWatcher,
            'serviceRequestComment': assignRequest.serviceRequestComment,
            'newAttachments': newAttachments
        }));
        return formData;
    }

    resolveServiceRequest(requestId, comment, uploadedFile, newAttachments): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/resolveServiceRequest`,
            this.setFromDataForResolve(requestId, comment, uploadedFile, newAttachments));
    }

    setFromDataForResolve(requestId, comment, uploadedFile, newAttachments): FormData {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.fileName);
        }
        formData.append('formDataJson', JSON.stringify({
            'serviceRequestId': requestId,
            'serviceRequestComment': comment,
            'newAttachments': newAttachments
        }));
        return formData;
    }

    loadLookups(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/loadSRInitialData`);
    }

    getLetterTemplates() {
        return this._http.get(this._commonService.baseUrl + '/letterTemplate/20');
    }

    printServiceRequest(params) {
        return this._http.post(this._commonService.baseUrl + '/generateServiceRequestReport', params, { responseType: 'blob' });
    }

}
