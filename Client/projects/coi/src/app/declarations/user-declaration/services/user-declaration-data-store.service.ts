import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { deepCloneObject } from '../../../common/utilities/custom-utilities';
import { Declaration, UserDeclaration } from '../../declaration.interface';
import { DataStoreEvent } from '../../../common/services/coi-common.interface';
import { DECLARATION_REVIEW_STATUS, DECLARATION_STATUS } from '../../declaration-constants';
import { MAINTAIN_DISCL_FROM_AFFILIATED_UNITS } from '../../../app-constants';

@Injectable()
export class UserDeclarationDataStoreService {

    constructor(private _commonService: CommonService) { }

    public storeData = new UserDeclaration();
    dataChanged = false;
    moduleSectionConfig: any = {};

    dataEvent = new Subject<DataStoreEvent>();

    getData(keys?: Array<string>): any {
        if (!keys) {
            return deepCloneObject(this.storeData);
        }
        const data: any = {};
        keys.forEach(key => {
            data[key] = this.storeData[key];
        });
        return deepCloneObject(data);
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
            this.storeData[key] = deepCloneObject(updatedData[key]);
        });
        this.dataEvent.next({ dependencies: KEYS, action: 'UPDATE'});
    }

    setStoreData(data: UserDeclaration): void {
        this.storeData = deepCloneObject(data);
        const KEYS = Object.keys(data);
        this.dataEvent.next({ dependencies: KEYS, action: 'REFRESH'});
    }

    getCommentButtonVisibility(): boolean {
        return true
        // const DISCLOSURE_OWNER = this.storeData.coiDisclosure.person.personId === this._commonService.getCurrentUserDetail('personID');
        // const IS_SHOW_COMMENT_BUTTON = this._commonService.getAvailableRight(FCOI_COMMENTS_RIGHTS);
        // return IS_SHOW_COMMENT_BUTTON || DISCLOSURE_OWNER || this._commonService.isCoiReviewer;
    }

    isFormEditable(): boolean {
        const DECLARATION: Declaration = this.storeData?.declaration;
        const EDITABLE_STATUSES: string[] = [
            DECLARATION_REVIEW_STATUS.PENDING.toString(),
            DECLARATION_REVIEW_STATUS.WITHDRAWN.toString(),
            DECLARATION_REVIEW_STATUS.RETURNED.toString(),
        ];
        const DECLARATION_REVIEW_STATUS_CODE = DECLARATION?.declarationReviewStatusType?.reviewStatusCode?.toString();
        const IS_CREATE_PERSON = this._commonService?.getCurrentUserDetail('personID') === DECLARATION?.person?.personId;
        const IS_DECLARATION_VOID = this.getDeclarationVoidStatus();
        return DECLARATION?.declarationId && IS_CREATE_PERSON && EDITABLE_STATUSES.includes(DECLARATION_REVIEW_STATUS_CODE) && !IS_DECLARATION_VOID;
    }

    getEditModeForDeclaration(): boolean {
        return this.storeData?.declaration.declarationStatusCode === DECLARATION_STATUS.PENDING;
    }

    getIsAdminOrCanManageAffiliatedDiscl(): boolean {
        const { isHomeUnitSubmission, adminPersonId } = this.storeData.declaration || {};
        return this._commonService.getIsAdminOrCanManageAffiliatedDiscl(isHomeUnitSubmission, adminPersonId, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
    }
   
    getDeclarationVoidStatus(): boolean {        
         return this.storeData?.declaration.declarationStatusCode === DECLARATION_STATUS.VOID;
    }
}
