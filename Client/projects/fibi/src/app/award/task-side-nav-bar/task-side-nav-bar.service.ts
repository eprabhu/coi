import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TaskSideNavBarService {

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    fetchTasksByParams(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchTasksByParams', params);
    }
    startTask(params) {
        return this._http.post(this._commonService.baseUrl + '/startTask', params);
    }
    completeTask(params) {
        return this._http.post(this._commonService.baseUrl + '/completeTask', params);
    }
    cancelTask(params) {
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

    getTaskLookUpData() {
        return this._http.get(this._commonService.baseUrl + '/getTaskLookUpData');
    }

}
