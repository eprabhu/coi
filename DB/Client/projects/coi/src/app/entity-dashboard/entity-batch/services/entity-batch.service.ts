import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { PAGINATION_LIMIT, COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../../app-constants';
import { BatchEntityRO, BatchEntityDuplicateRO, CreateImportEntityRO, BatchEntityBulkUpdateRO, BatchEntityLookups, BatchEntity } from './entity-batch.interface';
import { Router } from '@angular/router';

@Injectable()
export class EntityBatchService {

    entityBatchSectionConfig = {};
    entityBatchLookups: BatchEntityLookups;
    batchEntity: BatchEntity;
    currentBatchId: number = null;

    constructor(private _router: Router, private _commonService: CommonService, private _http: HttpClient) {}

    getBatchEntityRO(batchId: number): BatchEntityRO {
        return {
            pageNumber: 1,
            totalCount: PAGINATION_LIMIT,
            batchId: batchId,
            searchKeyword: null,
            isExactDunsMatch: null,
            isMultipleDunsMatch: null,
            isNoDunsMatch: null,
            isDuplicateInBatch: null,
            isDuplicateInEntitySys: null,
            adminReviewStatusCodes: null,
            adminActionCodes: null
        };
    }
    
    showErrorAndGoToDashboard(toastMessage = COMMON_ERROR_TOAST_MSG): void {
        this._router.navigate(['/coi/entity-dashboard']);
        this._commonService.showToast(HTTP_ERROR_STATUS, toastMessage);
    }

    loadBatchDetails(importDetails: BatchEntityRO) {
        return this._http.post(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/batchDetails`, importDetails);
    }

    confirmBatchLinkOrExclude(duplicateRO: BatchEntityDuplicateRO) {
        return this._http.patch(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/entityDetails`, duplicateRO);
    }

    getBatchEntityDuplicatesById(entityStageDetailId: number) {
        return this._http.get(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/entityDetail/${entityStageDetailId}`);
    }

    getDbEntityDuplicatesById(entityStageDetailId: number) {
        return this._http.get(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/entityDetail/${entityStageDetailId}/systemMatch`);
    }

    getDNBEntityDuplicatesById(entityStageDetailId: number) {
        return this._http.get(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/entityDetail/${entityStageDetailId}/dunsMatch`);
    }

    validateExcludingSource(entityStageDetailId: number) {
        return this._http.get(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/entityDetail/${entityStageDetailId}/validateExcludingSource`);
    }

    createImportEntity(createImportEntityRO: CreateImportEntityRO) {
        return this._http.post(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/createEntity`, createImportEntityRO);
    }

    batchEntityBulkUpdate(bulkUpdateRO: BatchEntityBulkUpdateRO) {
        return this._http.post(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/batchDetails/bulkUpdate`, bulkUpdateRO);
    }

    getBatchEntityLookups() {
        return this._http.get(`${this._commonService.fibiCOIConnectUrl}/fibi-coi-connect/entityCleanUp/lookups`);
    }

}
