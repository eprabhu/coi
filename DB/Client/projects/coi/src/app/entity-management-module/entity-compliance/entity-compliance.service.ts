import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { HttpClient } from '@angular/common/http';
import { EntityCompliance, ComplianceSaveUpdateRO } from '../shared/entity-interface';

@Injectable()
export class EntityComplianceService {

    entityCompliance = new EntityCompliance();

    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    fetchEntityComplianceDetails(entityId: number | string) {
        return this._http.get(`${this._commonService.baseUrl}/entity/compliance/fetch/${entityId}`);
    }

    saveComplianceDetails(autoSaveRO: ComplianceSaveUpdateRO) {
        return this._http.post(`${this._commonService.baseUrl}/entity/compliance/save`, autoSaveRO);
    }

    updateComplianceDetails(changedRO: ComplianceSaveUpdateRO) {
        return this._http.patch(`${this._commonService.baseUrl}/entity/compliance/update`, changedRO);
    }

    deleteComplianceEntityType(id: string | number) {
        return this._http.delete(`${this._commonService.baseUrl}/entity/compliance/delete/${id}`);
    }

}
