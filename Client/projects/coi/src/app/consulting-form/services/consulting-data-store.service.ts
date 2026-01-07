import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { DataStoreEvent } from '../../common/services/coi-common.interface';
import { ConsultingFormStoreData, ConsultingForm } from '../consulting-form.interface';
import { CONSULTING_DISPOSITION_STATUS, CONSULTING_REVIEW_STATUS, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS } from '../../app-constants';

@Injectable()
export class ConsultingFormDataStoreService {

    private storeData = new ConsultingFormStoreData();
    dataEvent = new Subject<DataStoreEvent>();

    constructor(private _commonService: CommonService) { }

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

    setStoreData(data: ConsultingFormStoreData): void {
        this.storeData = deepCloneObject(data);
        const KEYS = Object.keys(data);
        this.dataEvent.next({ dependencies: KEYS, action: 'REFRESH'});
    }

    isFormEditable(): boolean {
        const CONSULTING_FORM: ConsultingForm = this.storeData?.consultingForm;
        const EDITABLE_STATUSES: string[] = [
            CONSULTING_REVIEW_STATUS.PENDING.toString(),
            CONSULTING_REVIEW_STATUS.WITHDRAWN.toString(),
            CONSULTING_REVIEW_STATUS.RETURNED.toString(),
        ];
        const DECLARATION_REVIEW_STATUS_CODE = CONSULTING_FORM?.reviewStatusType.reviewStatusCode?.toString();
        const IS_CREATE_PERSON = this._commonService.getCurrentUserDetail('personID') === CONSULTING_FORM?.person?.personId;
        return CONSULTING_FORM?.disclosureId && IS_CREATE_PERSON && EDITABLE_STATUSES.includes(DECLARATION_REVIEW_STATUS_CODE);
    }

    getEditModeForConsulting(): boolean {
        return this.storeData?.consultingForm.dispositionStatusCode === CONSULTING_DISPOSITION_STATUS.PENDING;
    }

    getIsAdminOrCanManageAffiliatedDoc(): boolean {
        return true;
        // const { isHomeUnitSubmission, adminPersonId } = this.storeData.consultingForm || {};
        // return this._commonService.getIsAdminOrCanManageAffiliatedDiscl(isHomeUnitSubmission, adminPersonId, MAINTAIN_DISCL_FROM_AFFILIATED_UNITS);
    }

}
