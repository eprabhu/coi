import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { COI } from '../coi-interface';
import { CommonService } from '../../common/services/common.service';
import { FCOI_COMMENTS_RIGHTS } from '../../shared-components/coi-review-comments/coi-review-comments-constants';
import { DataStoreEvent } from '../../common/services/coi-common.interface';
import { MAINTAIN_DISCL_FROM_AFFILIATED_UNITS } from '../../app-constants';

@Injectable()
export class DataStoreService {

    constructor(private _commonService: CommonService) { }

    public storeData: COI = new COI();
    disclosureStatus: any;
    dataChanged = false;
    disclosureSectionConfig: any = {};
    emitValidationModalOpen = new Subject<boolean>();
    attemptedPath: string;
    isPendingWithdrawRequest = false;
    isShowEngagementRisk = false;
    dataEvent = new Subject<DataStoreEvent>();
    isRoutingReview = this._commonService.coiApprovalFlowType === 'ROUTING_REVIEW';

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

    setStoreData(data: COI): void {
        this.storeData = this.structuredClone(data);
        const KEYS = Object.keys(this.storeData);
        this.dataEvent.next({ dependencies: KEYS, action: 'REFRESH' });
    }

    private structuredClone(obj: any): any {
        const nativeCloneFunction = (window as any).structuredClone;
        return (typeof nativeCloneFunction === 'function') ? nativeCloneFunction(obj) : JSON.parse(JSON.stringify(obj));
    }

    getEditModeForCOI(): boolean {
        if (this.storeData.coiDisclosure) {
            return this.storeData.coiDisclosure.dispositionStatusCode === '1';
        } else {
            return false;
        }
    }

    getCommentButtonVisibility(): boolean{
        const DISCLOSURE_OWNER = this.storeData.coiDisclosure.person.personId === this._commonService.getCurrentUserDetail('personID');
        const IS_SHOW_COMMENT_BUTTON = this._commonService.getAvailableRight(FCOI_COMMENTS_RIGHTS);
        return IS_SHOW_COMMENT_BUTTON || DISCLOSURE_OWNER || this._commonService.isCoiReviewer;
    }

    getIsAdminOrCanManageAffiliatedDiscl(): boolean {
        const { isHomeUnitSubmission, adminPersonId } = this.storeData.coiDisclosure || {};
        return this._commonService.getIsAdminOrCanManageAffiliatedDiscl(isHomeUnitSubmission, adminPersonId, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
    }

}
