import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { SubAwardOrganization } from '../shared/entity-interface';
import { Observable } from 'rxjs';
import { COUNTRY_CODE_FOR_MANDATORY_CHECK, ENTITY_ORGANIZATION_MANDATORY_DEFAULT_FIELD, ENTITY_ORGANIZATION_MANDATORY_SPECIFIC_FIELD } from '../shared/entity-constants';

@Injectable()
export class EntitySubAwardService {

    entitySubAwardOrganization = new SubAwardOrganization();

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    fetchEntitySubawardOrgDetails(entityId: string | number) {
        return this._http.get(`${this._commonService.baseUrl}/entity/organization/fetch/${entityId}`);
    }

    organizationDetailsAutoSave(autoSaveRO){
        return this._http.post(`${this._commonService.baseUrl}/entity/organization/save`, autoSaveRO);
    }

    updateOrganizationDetails(changedRO) {
        return this._http.patch(`${this._commonService.baseUrl}/entity/organization/update`, changedRO);
    }

    syncOrganizationWithEntity(entityId: string | number): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/entity/organization/syncWithEntity/${entityId}`, {});
    }

}

export function isOrganizationConditionSatisfied(entitySubAwardOrganization: SubAwardOrganization): boolean {
    const { subAwdOrgDetailsResponseDTO: ORGANIZATION_DETAILS, entityRisks: ORGANIZATION_RISK } = entitySubAwardOrganization;
    const HAS_ORGANIZATION_RISK = ORGANIZATION_RISK?.length;
    const IS_MANDATORY_REQUIRED = (COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(ORGANIZATION_DETAILS?.country?.countryCode) || COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(ORGANIZATION_DETAILS?.country?.countryTwoCode));	
    const ENTITY_CONFIRM_VALIDATION_FIELDS = IS_MANDATORY_REQUIRED ? ENTITY_ORGANIZATION_MANDATORY_SPECIFIC_FIELD : ENTITY_ORGANIZATION_MANDATORY_DEFAULT_FIELD;
    const IS_TAB_STATUS_ACTIVE = HAS_ORGANIZATION_RISK && ENTITY_CONFIRM_VALIDATION_FIELDS.every(field => {
        return field === 'organizationTypeCode'
            ? !!ORGANIZATION_DETAILS?.entityOrganizationType?.organizationTypeCode
            : !!ORGANIZATION_DETAILS?.[field];
    });
    return IS_TAB_STATUS_ACTIVE;
}
