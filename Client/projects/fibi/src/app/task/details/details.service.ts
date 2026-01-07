import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable()
export class DetailsService {

    isTaskRouteChangeTrigger = new Subject();
    isTaskBypassOrAlternateApproverTrigger = new Subject();
    taskAwardId: number;

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    getTaskLookUpData() {
        return this._http.get(this._commonService.baseUrl + '/getTaskLookUpData');
    }

    saveTask(taskDetails, taskAttachments, updateUser, uploadedFile, taskId, leadUnitNumber) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify({
            'task': taskDetails,
            'taskAttachments': taskAttachments, 'updateUser': updateUser,
            'subModuleCode': 2,
            'moduleCode': 1,
            'personId': this._commonService.getCurrentUserDetail('personID'),
            'leadUnitNumber': leadUnitNumber
        }));
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateTask', formData);
    }

    downloadTaskAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadTaskAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }
    deleteTaskAttachment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteTaskAttachment', params);
    }

    loadTaskDetailsById(params) {
        return this._http.post(this._commonService.baseUrl + '/loadTaskDetailsById', params);
    }
    fetchTaskHistory(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchTaskHistory', params);
    }
    fetchTaskCommentsByTaskId( params ) {
        return this._http.post(this._commonService.baseUrl + '/fetchTaskCommentsByTaskId', params);
    }
    saveOrUpdateTaskComment(taskId, taskComment, taskCommentAttachments, updateUser, uploadedFile) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify({
            'taskId':  taskId, 'taskComment': taskComment,
            'taskCommentAttachments': taskCommentAttachments, 'updateUser': updateUser
        }));
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateTaskComment', formData);
    }
    reAssignTask( params ) {
        return this._http.post(this._commonService.baseUrl + '/reassignTask', params);
    }
    deleteTaskCommentAttachment( params ) {
        return this._http.post(this._commonService.baseUrl + '/deleteTaskCommentAttachment', params);
    }
    deleteTaskComment( params ) {
        return this._http.post(this._commonService.baseUrl + '/deleteTaskComment', params);
    }
    loadTaskWorkflowDetailsById( params ) {
        return this._http.post(this._commonService.baseUrl + '/loadTaskWorkflowDetailsById', params);
    }
    startTask( params ) {
        return this._http.post(this._commonService.baseUrl + '/startTask', params);
    }
    completeTask( params ) {
        return this._http.post(this._commonService.baseUrl + '/completeTask', params);
    }
    cancelTask( params ) {
        return this._http.post(this._commonService.baseUrl + '/cancelTask', params);
    }
    maintainTaskWorkFlow(requestObject, uploadedFile) {
        const approveFormData = new FormData();
        if (uploadedFile) {
            for (let i = 0; i < uploadedFile.length; i++) {
                approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        approveFormData.append('formDataJson', JSON.stringify(requestObject));
        approveFormData.append('moduleCode', '1');
        approveFormData.append('subModuleCode', '2');
        return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow ', approveFormData);
    }
    downloadTaskCommentAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadTaskCommentAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }
    notifyTaskAssignee( params ) {
        return this._http.post(this._commonService.baseUrl + '/notifyTaskAssignee', params);
    }

    validateCreateTask( params ) {
        return this._http.post(this._commonService.baseUrl + '/validateCreateTask', params);
    }
}
