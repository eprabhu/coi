import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { Observable } from 'rxjs';
import { CmpCreationRO, CmpProjectType, CmpTemplateGroup } from '../management-plan.interface';

@Injectable()
export class ManagementPlanCreationFormService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    getCmpProjectTypes(): Observable<CmpProjectType[]> {
        return this._http.get<CmpProjectType[]>(`${this._commonService.baseUrl}/cmp/plan/project/types`);
    }

    getCmpTemplateTypes(): Observable<CmpTemplateGroup> {
        return this._http.get<CmpTemplateGroup>(`${this._commonService.baseUrl}/cmp/sec-templ-mapping`);
    }

    createManagementPlan(payload: any): Observable<any> {
        return this._http.post(this._commonService.baseUrl + '/cmp/plan', payload);
    }

    updateManagementPlan(params: CmpCreationRO): Observable<any> {
        return this._http.put<any>(`${this._commonService.baseUrl}/cmp/plan`, params);
    }

}
