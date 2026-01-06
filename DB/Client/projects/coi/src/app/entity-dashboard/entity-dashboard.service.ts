import { Injectable } from '@angular/core';
import { CommonService } from '../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { HTTP_ERROR_STATUS } from '../app-constants';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ImportEntityRO } from './entity-batch/services/entity-batch.interface';
import { EntityDashDefaultValues, NameObject, SortCountObj, RelationshipDashboardRequest, EntityDashboardSearchRequest } from './entity-dashboard.interface';

@Injectable()

export class EntityDashboardService {

    constructor(private _commonService: CommonService, private _http: HttpClient) {}

    sort: any;
    entityDashDefaultValues = new EntityDashDefaultValues();
    isShowEntityNavBar = false;
    searchDefaultValues: NameObject = new NameObject();
    sortCountObject: SortCountObj = new SortCountObj();
    relationshipDashboardRequest = new RelationshipDashboardRequest();
    isAdvanceSearch = false;
    isViewAdvanceSearch = false;
    isAdvanceSearchMade = false;
    statusCodes: any = [
        { code: 'Y', description: 'Active' },
        { code: 'N', description: 'Inactive' },
        { code: 'D', description: 'Duplicate' },
    ];
    concurrentUpdateAction = '';
    entitySearchRequestObject = new EntityDashboardSearchRequest();
    importEntitySearchRO = new ImportEntityRO();
    sortCountObj: any = {};
    currentTab = '';

    getAllSystemEntityList(params) {
        return this._http.post(this._commonService.baseUrl + '/entity/getEntityDashboardData', params).pipe(catchError((err) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Entity List failed. Please try again.');
            return of();
        }));
    }

    // logFeedHistory(tabDetails) {
    //     return this._http.post(this._commonService.baseUrl + '/entity/logAction', tabDetails);
    // }

    modifyEntity(entityId: number, entityNumber: number) {
        return this._http.patch(`${this._commonService.baseUrl}/entity/modify/${entityId}/${entityNumber}`, {});
    }

    getEntityVersions(entityNumber: number) {
        return this._http.get(`${this._commonService.baseUrl}/entity/activeModifying/${entityNumber}/version`);
    }

    fetchBatches(importDetails: ImportEntityRO) {
        return this._http.post(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/fetchBatches`, importDetails);
    }

}
