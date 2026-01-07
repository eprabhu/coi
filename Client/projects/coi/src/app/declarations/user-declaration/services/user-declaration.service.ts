import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../common/services/common.service';
import { COI_DECLARATION_MODULE_CODE } from '../../declaration-constants';
import { Declaration, DeclarationActionRO, UserDeclaration } from '../../declaration.interface';
import { CommonModalConfig } from '../../../shared-components/common-modal/common-modal.interface';
import { FormBuilderEvent } from '../../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { ValidationConfig } from '../../../configuration/form-builder-create/shared/form-validator/form-validator.interface';

export type DeclarationActionType = 'FORM_SUBMIT' | 'FORM_SAVE_COMPLETE' | 'CERTIFY_AND_SUBMIT';

@Injectable()
export class UserDeclarationService {

    constructor(private _http: HttpClient, private _commonService: CommonService) {}

    previousHomeUrl = '';
    previousRouteUrl = '';
    validationList = [];
    formBuilderId: number;
    answeredFormId: number;
    isAnyAutoSaveFailed = false;
    isShowOverallHistory = false;
    isFormBuilderDataChangePresent = false;
    validationConfig = new ValidationConfig();
    formBuilderEvents = new Subject<FormBuilderEvent>();
    declarationTopTimeout: ReturnType<typeof setTimeout>;
    unSavedConfirmModalConfig = new CommonModalConfig('declaration-unsaved-confirm-modal', 'Stay On Page', 'Leave Page');

    triggerDeclarationSave(): void {
        this.formBuilderEvents.next({ eventType: 'SAVE' });
    }

    triggerDeclarationActions(actionType: DeclarationActionType, data?: any) {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRIGGER_USER_DECLARATION_ACTIONS', content: { actionType: actionType, ...data } });
    }

    fetchDeclarationById(declarationId: string | number): Observable<UserDeclaration> {
        return this._http.get<UserDeclaration>(`${this._commonService.baseUrl}/declaration/fetch/${declarationId}`);
    }

    submitDeclaration(declarationId: string | number, declarationTypeCode: string | number): Observable<any> {
        return this._http.post(`${this._commonService.baseUrl}/declaration/submit`, { declarationId, declarationTypeCode });
    }

    completeAdminReview(param: DeclarationActionRO): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/declaration/completeAdminReview`, param);
    }

    withdrawDeclaration(param: DeclarationActionRO): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/declaration/withdraw`, param);
    }

    returnDeclaration(param: DeclarationActionRO): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/declaration/return`, param);
    }

    getDeclarationHistory(declarationId: string | number): Observable<any> {
        return this._http.get(`${this._commonService.baseUrl}/declaration/logs/${declarationId}`);
    }

    markAsVoid(declarationId: string | number): Observable<any> {
        return this._http.patch(`${this._commonService.baseUrl}/declaration/markAsVoid`, { declarationId });
    }

    clearDeclarationServiceData(): void {
        this.validationList = [];
        this.formBuilderId = null;
        this.answeredFormId = null;
        this.validationConfig = new ValidationConfig();
    }

    setTopForDeclaration(): void {
        this.declarationTopTimeout && clearTimeout(this.declarationTopTimeout);
        this.declarationTopTimeout = setTimeout(() => {
            const HEADER = document.getElementById('coi-user-declaration-header');
            const getHeight = (element: HTMLElement | null) => element ? element.offsetHeight + 20 : 0;
            const TOP_POSITION = getHeight(HEADER);
            this.validationConfig.headerOffSetValue = TOP_POSITION;
        },0);
    }

    getApplicableForms(declaration: Declaration): Observable<any> {
        const { declarationId, declarationTypeCode, person } = declaration || {};
        const REQUEST_OBJECT = this._commonService.getApplicableFormRO(
            COI_DECLARATION_MODULE_CODE.toString(),
            declarationTypeCode?.toString(),
            person?.personId,
            declarationId?.toString()
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

}
