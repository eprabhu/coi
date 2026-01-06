import { Injectable } from '@angular/core';
import { TravelCreateModalDetails, TravelDisclosure } from '../travel-disclosure.interface';
import { Subject } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS, TRAVEL_CERTIFICATION_TEXT } from '../travel-disclosure-constants';
import { EntityDetails } from '../../entity-management-module/shared/entity-interface';
import { TRAVEL_COMMENTS_RIGHTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { MAINTAIN_DISCL_FROM_AFFILIATED_UNITS } from '../../app-constants';

@Injectable()
export class TravelDataStoreService {

    private storeData: TravelDisclosure = new TravelDisclosure();
    dataEvent = new Subject();
    travelCreateModalDetails: TravelCreateModalDetails;
    storedCertifyTabPath  = '';
    travelSectionConfig: any = {};

    constructor(private _commonService: CommonService) { }

    setCreateModalDetails(travelCreateModalDetails: TravelCreateModalDetails): void {
        sessionStorage.setItem('travelCreateModalDetails', JSON.stringify(travelCreateModalDetails));
    }

    getCreateModalDetails(): TravelCreateModalDetails {
        this.travelCreateModalDetails = JSON.parse(sessionStorage.getItem('travelCreateModalDetails'));
        return this.travelCreateModalDetails;
    }

    removeCreateModalDetails(): void {
        sessionStorage.removeItem('travelCreateModalDetails');
    }

    getData(keys?: Array<string>): TravelDisclosure {
        if (!keys) {
            return this.structuredClone(this.storeData);
        }
        const DATA: any = {};
        keys.forEach(key => {
            DATA[key] = this.storeData[key];
        });
        return this.structuredClone(DATA);
    }

    getEntityDetails(): EntityDetails {
        return this.storeData?.personEntity?.coiEntity;
    }

    getTravelEntity() {
        const DATA = this.getData();
        const ENTITY: any = DATA?.personEntity && Object.keys(DATA.personEntity).length ? DATA.personEntity : {};
        ENTITY.coiEntity = DATA?.personEntity && Object.keys(DATA?.personEntity).length ? DATA?.personEntity?.coiEntity : {};
        ENTITY.coiEntity.country = DATA?.person && Object.keys(DATA?.person).length ? DATA?.person?.countryDetails : {};
        return ENTITY;
    }

    isExternal(): boolean {
        const DATA = this.getData();
        return DATA && DATA.travelerFundingTypeCode === '2';
    }

    getTravelDisclosureSubmitRO(): any {
        const DATA = this.getData();
        return {
            'travelDisclosureId': DATA.travelDisclosureId,
            'travelNumber': DATA.travelNumber,
            'certificationText': TRAVEL_CERTIFICATION_TEXT.replace(/\n/g, ' ').trim()

        }
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
        this.dataEvent.next(KEYS);
    }

    setStoreData(data: TravelDisclosure): void {
        const KEYS = Object.keys(data);
        this.storeData = this.structuredClone(data);
        this.dataEvent.next(KEYS);
    }

    private structuredClone(obj: TravelDisclosure): any {
        const nativeCloneFunction = (window as any).structuredClone;
        return (typeof nativeCloneFunction === 'function') ? nativeCloneFunction(obj) : JSON.parse(JSON.stringify(obj));
    }

    getEditModeForDisclosure(): boolean {
        if (this.storeData.travelDisclosureId) {
            return (CREATE_TRAVEL_DISCLOSURE_REVIEW_STATUS.includes(this.storeData.reviewStatusCode) && this.storeData.personId === this._commonService.getCurrentUserDetail('personID'));
        } else {
            return true;
        }
    }

    getCommentButtonVisibility(): boolean {
        const DISCLOSURE_OWNER = this.storeData?.person?.personId === this._commonService.getCurrentUserDetail('personID');
        const IS_SHOW_COMMENT_BUTTON = this._commonService.getAvailableRight(TRAVEL_COMMENTS_RIGHTS);
        return IS_SHOW_COMMENT_BUTTON || DISCLOSURE_OWNER;
    }

    getIsAdminOrCanManageAffiliatedDiscl(): boolean {
        const { isHomeUnitSubmission, adminPersonId } = this.storeData || {};
        return this._commonService.getIsAdminOrCanManageAffiliatedDiscl(isHomeUnitSubmission, adminPersonId, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
    }

}
