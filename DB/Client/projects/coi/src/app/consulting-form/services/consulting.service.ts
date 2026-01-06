import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from '../../common/header/header.service';
import { CommonService } from '../../common/services/common.service';
import { COIFormValidation } from '../../common/services/coi-common.interface';
import { CONSULTING_ENTITY_FIELD_ELEMENT_ID } from '../consulting-form-constants';
import { ConsultingEntitySaveRO, ConsultingForm } from '../consulting-form.interface';
import { EntityDetails } from '../../entity-management-module/shared/entity-interface';
import { CONSULTING_MODULE_CODE, CONSULTING_SUB_MODULE_CODE } from '../../app-constants';
import { ValidationConfig } from '../../configuration/form-builder-create/shared/form-validator/form-validator.interface';
import { FormBuilderEvent } from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';

export type ConsultingFormActionType = 'FORM_SUBMIT' | 'FORM_SAVE_COMPLETE' | 'CERTIFY_AND_SUBMIT';

@Injectable()
export class ConsultingService {

    validationList = [];
    previousHomeUrl = '';
    isAnyAutoSaveFailed = false;
    previousConsultingRouteUrl = '';
    formBuilderId: number | null = null;
    answeredFormId: number | null = null;
    isFormBuilderDataChangePresent = false;
    consultingEntity = new EntityDetails();
    validationConfig = new ValidationConfig();
    customValidationList: COIFormValidation[] = [];
    formBuilderEvents = new Subject<FormBuilderEvent>();

    private timeoutRef: ReturnType<typeof setTimeout>;

    constructor(private _http: HttpClient, private _commonService: CommonService, private _headerService: HeaderService,) {}

    triggerConsultingFormSave(): void {
        this.formBuilderEvents.next({ eventType: 'SAVE' });
    }

    triggerConsultingFormActions(actionType: ConsultingFormActionType, data?: any) {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_CONSULTING_FORM_ACTIONS', content: { actionType: actionType, ...data } });
    }

    clearConsultingServiceData(): void {
        this.validationList = [];
        this.formBuilderId = null;
        this.answeredFormId = null;
        this.customValidationList = [];
        this.isFormBuilderDataChangePresent = false;
        this.consultingEntity = new EntityDetails();
        this.validationConfig = new ValidationConfig();
        this.timeoutRef && clearTimeout(this.timeoutRef);
    }

    setCustomValidationList(): void {
        this.customValidationList = [];
        if (!this.consultingEntity?.entityId) {
            this.customValidationList.push({
                validationType: 'VM',
                validationMessage: 'Please add an entity name',
                componentId: CONSULTING_ENTITY_FIELD_ELEMENT_ID,
                formBuilderId: this.formBuilderId
            });
        }
    }

    updateFormValidationList(validationList: any[]): void {
        this.validationList = validationList;
        this._headerService.$globalPersistentEventNotifier.$formValidationList.next(this.validationList);
    }

    getApplicableForms(consultingForm: ConsultingForm): Observable<any> {
        const { person, disclosureId } = consultingForm || {};
        const REQUEST_OBJECT = this._commonService.getApplicableFormRO(
            CONSULTING_MODULE_CODE.toString(),
            CONSULTING_SUB_MODULE_CODE.toString(),
            person?.personId,
            disclosureId?.toString()
        );
        return this._commonService.getApplicableForms(REQUEST_OBJECT);
    }

    setFormStatus(formList: any[]): Map<number, 'Y' | 'N'> {
        const FORM_STATUS_MAP = new Map<number, 'Y' | 'N'>();
        formList.forEach((form: any) => {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                FORM_STATUS_MAP.set(Number(form?.answeredFormId), 'N');
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                this.answeredFormId = form?.answeredFormId;
                FORM_STATUS_MAP.set(Number(form?.activeFormId), 'Y');
            } else {
                FORM_STATUS_MAP.set(Number(form?.activeFormId), 'N');
            }
        });
        return FORM_STATUS_MAP;
    }

    setFormBuilderId(form: any, isEditable: boolean): number | null {
        let FORM_BUILDER_ID: number | null = null;
        if (isEditable) {
            if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'N') {
                FORM_BUILDER_ID = form?.answeredFormId;
            } else if (form?.answeredFormId && form?.activeFormId && form?.revisionRequired === 'Y') {
                FORM_BUILDER_ID = form?.activeFormId;
            } else {
                FORM_BUILDER_ID = form?.activeFormId;
            }
        } else {
            FORM_BUILDER_ID = form?.answeredFormId || form?.activeFormId;
        }
        this.formBuilderId = FORM_BUILDER_ID;
        return FORM_BUILDER_ID;
    }

    setTopForConsulting(): void {
        this.timeoutRef && clearTimeout(this.timeoutRef);
        this.timeoutRef = setTimeout(() => {
            const HEADER = document.getElementById('coi-consulting-form-header');
            const getHeight = (element: HTMLElement | null) => element ? element.offsetHeight + 20 : 0;
            const TOP_POSITION = getHeight(HEADER);
            this.validationConfig.headerOffSetValue = TOP_POSITION;
        }, 0);
    }

    setTopDynamically(): void {
        setTimeout(() => {
            const STICKY_HEADER = document.querySelector<HTMLElement>('.header-sticky');
            if (STICKY_HEADER) {
                const ELEMENTS = document.querySelectorAll('.form-builder-sticky-header');
                if (ELEMENTS.length) {
                    ELEMENTS.forEach((element: HTMLElement) => {
                        element.style.top = STICKY_HEADER.offsetHeight + 50 + 'px';
                    });
                }
                const TABLE_STICKY_HEADER = document.querySelectorAll('.form-builder-table-header');
                if (TABLE_STICKY_HEADER.length) {
                    TABLE_STICKY_HEADER.forEach((element: HTMLElement) => {
                        element.style.top = STICKY_HEADER.offsetHeight + 101 + 'px';
                    });
                }
            }
        }, 1000);
    }

    loadConsultingFormHeader(disclosureId: string | number): Observable<any> {
        return this._http.get(this._commonService.baseUrl + '/consultingDisclosure/getDisclosureHeader/' + disclosureId);
    }

    submitConsulting(disclosureId: string | number): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/consultingDisclosure/submit`, { disclosureId });
    }

    withdrawConsulting(params: any): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/consultingDisclosure/withdraw`, params);
    }

    returnConsulting(params: any): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/consultingDisclosure/return`, params);
    }

    completeFinalReview(disclosureId: string | number): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/consultingDisclosure/complete/${disclosureId}`, {});
    }

    disclosureHistory(disclosureId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/consultingDisclosure/history/${disclosureId}`);
    }

    saveConsultingEntityDetails(params: ConsultingEntitySaveRO): Observable<any> {
        return this._http.patch(this._commonService.baseUrl + '/consultingDisclosure/saveEntityDetails', params);
    }

}
