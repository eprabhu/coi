import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DataStoreEvent, DuplicateCheckObj, EntireEntityDetails, EntityDetails, EntityTabStatus, SponsorUpdateClass, SubAwardOrgUpdateClass } from './shared/entity-interface';
import { CommonService } from '../common/services/common.service';
import { ENTITY_COMPLIANCE_RIGHT, ENTITY_DOCUMENT_STATUS_TYPE, ENTITY_ORGANIZATION_RIGHT, ENTITY_SOURCE_TYPE_CODE, ENTITY_SPONSOR_RIGHT, ENTITY_VERIFICATION_STATUS, FEED_STATUS_CODE, UPDATED_BY_SYSTEM } from '../app-constants';
import { canUpdateSponsorFeed, canUpdateOrgFeed } from './entity-management.service';
import { HttpClient } from '@angular/common/http';
import { COUNTRY_CODE_FOR_MANDATORY_CHECK, ENTITY_MANDATORY_FIELDS, ENTITY_MANDATORY_WITHOUT_ADDRESS, ENTITY_VERSION_STATUS, OverviewTabSection } from './shared/entity-constants';

@Injectable()

export class EntityDataStoreService {
    constructor(private _commonService: CommonService, private _http: HttpClient) { }

    private storeData = new EntireEntityDetails();
    entitySectionConfig: any = {};
    entityRiskType: any[] = [];
    dataEvent = new Subject<DataStoreEvent>();
    canLogModificationHistory = false;

    getEditMode(): boolean {
        return this.storeData?.entityDetails?.entityDocumentStatusType?.documentStatusTypeCode === ENTITY_DOCUMENT_STATUS_TYPE.ACTIVE &&
               ([ENTITY_VERIFICATION_STATUS.UNVERIFIED, ENTITY_VERIFICATION_STATUS.MODIFYING, ENTITY_VERIFICATION_STATUS.DUNS_REFRESH].includes(this.storeData?.entityDetails?.entityStatusType?.entityStatusTypeCode))
               && this.storeData.entityDetails?.versionStatus != ENTITY_VERSION_STATUS.CANCELLED;
    }

    checkDunsMatchedForSelectedVersion(): boolean {
        const IS_DUNS_MATCHED_ON_SELECTED_VERSION = this.storeData?.entityDetails?.isDunsMatched;
        return IS_DUNS_MATCHED_ON_SELECTED_VERSION;
    }

    getIsSystemCreatedEntity(): boolean {
        return this.storeData?.entityDetails.createdBy === UPDATED_BY_SYSTEM;
    }

    // All Mandatory fields(Entity Name, Address 1, City,State,Country,Zip/postal code)
    getIsEntityOverviewGreenTick(): boolean {
        const ENTITY_DETAILS = this.storeData?.entityDetails;
        if (!ENTITY_DETAILS) { return false; }
        const IS_MANDATORY_REQUIRED = (COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(ENTITY_DETAILS.country?.countryCode) || COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(ENTITY_DETAILS.country?.countryTwoCode));
        const ENTITY_CONFIRM_VALIDATION_FIELDS = IS_MANDATORY_REQUIRED ? ENTITY_MANDATORY_FIELDS : ENTITY_MANDATORY_WITHOUT_ADDRESS;
        const IS_TAB_STATUS_ACTIVE = ENTITY_CONFIRM_VALIDATION_FIELDS.every(field => ENTITY_DETAILS[field]);
        return IS_TAB_STATUS_ACTIVE;
    }

    getData(keys?: Array<string>): any {
        if (!keys) {
            return this.structuredClone(this.storeData);
        }
        const data: any = {};
        keys.forEach(key => {
            data[key] = this.storeData[key];
        });
        return this.structuredClone(data);
    }

    updateStore(updatedData: string[], variable): void {
        const UPDATED_DATA = {};
        updatedData.forEach(element => {
            UPDATED_DATA[element] = variable[element];
        });
        this.manualDataUpdate(UPDATED_DATA);
    }

    manualDataUpdate(updatedData: any): void {
        const KEYS = Object.keys(updatedData);
        KEYS.forEach(key => {
            this.storeData[key] = this.structuredClone(updatedData[key]);
        });
        this.dataEvent.next({dependencies: KEYS, action: 'UPDATE'});
    }

    setStoreData(data: any): void {
        this.storeData = this.structuredClone(data);
        const KEYS = Object.keys(this.storeData);
        this.dataEvent.next({dependencies: KEYS, action: 'REFRESH'});
    }

    getFilterRiskByCode(code: 'EN' | 'SP' | 'OR' | 'CO' | ''): any[] {
        return this.entityRiskType.length ? this.entityRiskType.filter(ele => ele.riskCategoryCode == code) : this.entityRiskType;
    }

    private structuredClone(obj: any): any {
        const nativeCloneFunction = (window as any).structuredClone;
        return (typeof nativeCloneFunction === 'function') ? nativeCloneFunction(obj) : JSON.parse(JSON.stringify(obj));
    }

    updateModifiedFlag(entityDetails: EntityDetails, isModified: boolean) {
        this.updateStore(['entityDetails'], { entityDetails });
    }

    updateFeedStatus(entityTabStatus: EntityTabStatus, type: 'ORG'|'SPONSOR'|'BOTH') {
        if((type === 'ORG' || type === 'BOTH') && this.storeData?.entityTabStatus?.entity_sub_org_info) {
            entityTabStatus.organization_feed_status_code = FEED_STATUS_CODE.READY_TO_FEED;
            entityTabStatus.organization_feed_status = 'Ready to Feed';
        }
        if((type === 'SPONSOR' || type === 'BOTH') && this.storeData?.entityTabStatus?.entity_sponsor_info) {
            entityTabStatus.sponsor_feed_status_code = FEED_STATUS_CODE.READY_TO_FEED;
            entityTabStatus.sponsor_feed_status = 'Ready to Feed';
        }
        this.updateStore(['entityTabStatus'], { entityTabStatus });
    }

    enableModificationHistoryTracking() {
        // this.canLogModificationHistory = this.storeData?.entityDetails?.entityStatusType?.entityStatusTypeCode === ENTITY_VERIFICATION_STATUS.VERIFIED;
    }

    getApiCalls(entityId, reqObj): any[] {
        const REQUEST = [];
        const SPONSOR_REQ_OBJ: SponsorUpdateClass = { entityId, entitySponsorFields: { feedStatusCode: FEED_STATUS_CODE.READY_TO_FEED }, isChangeInAddress: false };
        if(canUpdateSponsorFeed(reqObj) && this.storeData?.entityTabStatus?.entity_sponsor_info) {
            REQUEST.push(this._http.patch(`${this._commonService.baseUrl}/entity/sponsor/update`, SPONSOR_REQ_OBJ));
        }
        const SUBAWARD_REQ_OBJ: SubAwardOrgUpdateClass = { entityId, subAwardOrgFields: { feedStatusCode: FEED_STATUS_CODE.READY_TO_FEED }, isChangeInAddress: false};
        if(canUpdateOrgFeed(reqObj) && this.storeData?.entityTabStatus?.entity_sub_org_info) {
            REQUEST.push(this._http.patch(`${this._commonService.baseUrl}/entity/organization/update`, SUBAWARD_REQ_OBJ));
        }
        return REQUEST;
    }

    getDuplicateCheckRO(): DuplicateCheckObj {
        const DUPLICATE_ENTITY_RO = new DuplicateCheckObj();
        DUPLICATE_ENTITY_RO.entityName = this.storeData?.entityDetails?.entityName;
        DUPLICATE_ENTITY_RO.countryCode = this.storeData?.entityDetails?.countryCode;
        DUPLICATE_ENTITY_RO.entityNumber = this.storeData?.entityDetails?.entityNumber;
        DUPLICATE_ENTITY_RO.primaryAddressLine1 = this.storeData?.entityDetails?.primaryAddressLine1;
        if (this.storeData?.entityDetails?.primaryAddressLine2) {
            DUPLICATE_ENTITY_RO.primaryAddressLine2 = this.storeData?.entityDetails?.primaryAddressLine2;
        }
        return DUPLICATE_ENTITY_RO;
    }

    getOverviewEditRight(sectionId: string | number): boolean {
        let hasRight = false;
        const HAS_MANAGE_ENTITY_RIGHT = this._commonService.getAvailableRight(['MANAGE_ENTITY']);
        const OVERVIEW_TAB_SECTION_IDS = this.getTabSectionIds();
        if (!OVERVIEW_TAB_SECTION_IDS.includes(sectionId)) return HAS_MANAGE_ENTITY_RIGHT;
        const ENTITY_DETAILS = this.storeData?.entityDetails;
        if (ENTITY_DETAILS.entitySourceTypeCode === ENTITY_SOURCE_TYPE_CODE.DST) {
            hasRight = HAS_MANAGE_ENTITY_RIGHT && this._commonService.getAvailableRight([...ENTITY_SPONSOR_RIGHT, ...ENTITY_ORGANIZATION_RIGHT]);
        } else {
            hasRight = HAS_MANAGE_ENTITY_RIGHT;
            if (ENTITY_DETAILS.entitySourceTypeCode === ENTITY_SOURCE_TYPE_CODE.COMPLIANCE) {
                hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY', ...ENTITY_COMPLIANCE_RIGHT], 'EVERY');
            }
            if (ENTITY_DETAILS.entitySourceTypeCode === ENTITY_SOURCE_TYPE_CODE.ENTITY_ADMIN) {
                hasRight = HAS_MANAGE_ENTITY_RIGHT;
            }
            if (this.storeData?.sponsorTypeCode) {
                hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY', ...ENTITY_SPONSOR_RIGHT], 'EVERY');
            }
            if (this.storeData?.organizationTypeCode) {
                hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY', ...ENTITY_ORGANIZATION_RIGHT], 'EVERY');
            }
        }
        return hasRight;
    }

    private getTabSectionIds() {
       return Array.from(OverviewTabSection.values()).flatMap(section => {
            const ids = [section.sectionId];
            if (section.subSections) {
                ids.push(...Array.from(section.subSections.values()).map(s => s.sectionId));
            }
            return ids;
        });
        
    }

}
