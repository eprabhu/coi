import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { OPA } from '../opa-interface';
import { MAINTAIN_DISCL_FROM_AFFILIATED_UNITS, OPA_REVIEW_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { DataStoreEvent } from '../../common/services/coi-common.interface';
import { OPA_COMMENTS_RIGHTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';

@Injectable()
export class DataStoreService {

    constructor(private _commonService: CommonService) { }

    private storeData = new OPA();
    disclosureStatus: any;
    dataChanged = false;
    opaDisclosureSectionConfig : any = {};

    dataEvent = new Subject<DataStoreEvent>();
    isRoutingReview = this._commonService.opaApprovalFlowType === 'ROUTING_REVIEW';

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
        this.dataEvent.next({ dependencies: KEYS, action: 'UPDATE' });
    }

    setStoreData(data): void {
        this.storeData = this.structuredClone(data);
        const KEYS = Object.keys(this.storeData);
        this.dataEvent.next({ dependencies: KEYS, action: 'REFRESH' });
    }

    private structuredClone(obj: any): any {
        const nativeCloneFunction = (window as any).structuredClone;
        return (typeof nativeCloneFunction === 'function') ? nativeCloneFunction(obj) : JSON.parse(JSON.stringify(obj));
    }

    isFormEditable(): boolean {
        if (this.storeData.opaDisclosure.opaDisclosureId) {
          return [OPA_REVIEW_STATUS.PENDING, OPA_REVIEW_STATUS.RETURNED, OPA_REVIEW_STATUS.WITHDRAWN]
              .includes(this.storeData.opaDisclosure.reviewStatusType.reviewStatusCode)
          && this.isLoggedInUser(this.storeData.opaDisclosure.personId);
        } else {
            return false;
        }
    }

    isLoggedInUser(personId: string) {
        return this._commonService?.getCurrentUserDetail('personID') === personId;
    }

    getCommentButtonVisibility(): boolean {
        const DISCLOSURE_OWNER = this.storeData.opaDisclosure?.personId === this._commonService.getCurrentUserDetail('personID');
        const IS_SHOW_COMMENT_BUTTON = this._commonService.getAvailableRight(OPA_COMMENTS_RIGHTS);
        return IS_SHOW_COMMENT_BUTTON || DISCLOSURE_OWNER || this._commonService.isOPAReviewer;
    }

    getIsAdminOrCanManageAffiliatedDiscl(): boolean {
        const { isHomeUnitSubmission, adminPersonId } = this.storeData.opaDisclosure || {};
        return this._commonService.getIsAdminOrCanManageAffiliatedDiscl(isHomeUnitSubmission, adminPersonId, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
    }

}
