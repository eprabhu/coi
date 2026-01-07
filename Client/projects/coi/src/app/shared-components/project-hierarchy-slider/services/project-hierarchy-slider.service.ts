import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';

@Injectable()
export class ProjectHierarchySliderService {

    activeProjectNumber: string | null = null;
    activeProjectTypeCode: string | number | null = null;

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    fetchHierarchyProjectTree(moduleCode: string | number | null, projectNumber: string | null) {
        return this._http.get(`${this._commonService.baseUrl}/hierarchy/projectTree/${moduleCode}/${projectNumber}`);
    }

    fetchHierarchyProjectDetails(moduleCode: string | number | null, projectNumber: string | null) {
        return this._http.get(`${this._commonService.baseUrl}/hierarchy/projectDetails/${moduleCode}/${projectNumber}`);
    }
}
