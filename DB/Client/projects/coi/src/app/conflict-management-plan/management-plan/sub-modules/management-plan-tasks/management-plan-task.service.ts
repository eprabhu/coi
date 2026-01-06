import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { COI_CMP_MODULE_CODE } from 'projects/coi/src/app/conflict-management-plan/shared/management-plan-constants';
import { CmpTaskActionRequest, TaskCreateEditModalConfig, CmpTaskSaveRequest, TaskQuestionAnswerSaveRequest } from './task.interface';
import { Observable } from 'rxjs';

@Injectable()
export class ManagementPlanTaskService {

    taskCreateEditModalConfig = new TaskCreateEditModalConfig();
    private readonly moduleCode = COI_CMP_MODULE_CODE;
    private readonly baseUrl = `${this._commonService.baseUrl}/api/tasks/${this.moduleCode}`;

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    fetchTasks(cmpId): Observable<any> {
        return this._http.get(`${this.baseUrl}/${cmpId}`);
    }

    getTask(taskId: number): Observable<any> {
        return this._http.get(`${this.baseUrl}/getTask/${taskId}`);
    }

    saveTask(payload: CmpTaskSaveRequest): Observable<any> {
        const formData = this.buildFormData(payload) as FormData;
        if (payload?.taskId) {
            return this._http.put(`${this.baseUrl}`, formData);
        }
        return this._http.post(`${this.baseUrl}`, formData);
    }

    deleteTask(taskId: number): Observable<any> {
        return this._http.delete(`${this.baseUrl}/${taskId}`);
    }

    performTaskAction(request: CmpTaskActionRequest): Observable<any> {
        const formData = this.buildFormData(request);
        return this._http.post(`${this.baseUrl}/action/${request.taskId}`, formData);
    }

    saveQuestionAns(payload: TaskQuestionAnswerSaveRequest): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/cmp/tasks/saveQuestionAns`, payload);
    }

    getTaskLookUpData(): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/getTaskLookUpData`);
    }

    /**
     * The backend expects payload in `formDataJson` even when there are no attachments.
     */
    private buildFormData(payload: any): FormData {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify(payload));
        return formData;
    }
}


