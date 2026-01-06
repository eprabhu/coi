import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConsultingService } from '../services/consulting.service';
import { CommonService } from '../../common/services/common.service';
import { CONSULTING_ENTITY_FIELD_ELEMENT_ID } from '../consulting-form-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { ConsultingFormStoreData, ConsultingForm } from '../consulting-form.interface';
import { ConsultingFormDataStoreService } from '../services/consulting-data-store.service';
import { setEntityObjectFromElasticResult } from '../../common/utilities/elastic-utilities';
import { ENTITY_MANDATORY_REPORTER_FIELDS } from '../../entity-management-module/shared/entity-constants';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { DataStoreEvent, EntityCreationModalConfig, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { closeCommonModal, deepCloneObject, isEmptyObject, openCommonModal } from '../../common/utilities/custom-utilities';
import { FBConfiguration, FormBuilderStatusEvent } from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { EntityRequestFields, EntityUpdateClass, EntityDetails, EntityCreationResponse } from "../../entity-management-module/shared/entity-interface";
import {
    COMMON_ERROR_TOAST_MSG, CONSULTING_MODULE_CODE, CONSULTING_SUB_MODULE_CODE,
    ENTITY_SOURCE_TYPE_CODE, HTTP_ERROR_STATUS, NEW_FORM_HEADER_MSG, NEW_FORM_VERSION_MSG
} from '../../app-constants';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

    formList: any[] = [];
    isFormLoading = true;
    isFormEditMode = false;
    consultingData = new ConsultingFormStoreData();
    fbConfiguration = new FBConfiguration();

    isSaving = false;
    clearField: any = false;
    entitySearchOptions: any = {};
    entityDetails = new EntityDetails();
    entityCreationModalObj = new EntityUpdateClass();
    CONSULTING_ENTITY_FIELD_ELEMENT_ID = CONSULTING_ENTITY_FIELD_ELEMENT_ID;
    entityConfirmModalConfig = new CommonModalConfig('coi-consulting-entity-confirm-modal', 'Confirm', 'Cancel', 'lg');

    versionModalMsg = NEW_FORM_VERSION_MSG;
    versionModalHeader = NEW_FORM_HEADER_MSG;
    versionModalConfig = new CommonModalConfig('NEW_VERSION_INFO_MODAL', 'Cancel', '');

    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(private _router: Router,
        private _commonService: CommonService,
        public consultingService: ConsultingService,
        private _elasticConfig: ElasticConfigService,
        private _consultingFormDataStore: ConsultingFormDataStoreService) {}

    ngOnInit(): void {
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenDataChangeFromStore();
        this.listenToGlobalNotifier();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this._commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            const EVENT_DATA = data?.content || null;
            if (data.uniqueId === 'ENTITY_CREATION_MODAL' && data.content.triggeredFrom === 'CONSULTING_ADD') {
                if (EVENT_DATA?.entityDetails) {
                    this.entityDetails = new EntityDetails();
                    this.entityCreationModalObj = deepCloneObject(EVENT_DATA.entityDetails);
                    if (this.entityCreationModalObj.entityId) {
                        this.updateEntityDetails(this.entityCreationModalObj.entityId, this.entityCreationModalObj.entityRequestFields.entityNumber);
                        this.saveConsultingEntityDetails();
                    } else {
                        this.createNewEntity();
                    }
                } else {
                    this.clearEntitySearchDetails();
                }
            }
        }));
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._consultingFormDataStore.dataEvent
                .subscribe((storeEvent: DataStoreEvent) => {
                    this.getDataFromStore(storeEvent);
                })
        );
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const CONSULTING_FORM = this._consultingFormDataStore.getData();
        if (isEmptyObject(CONSULTING_FORM)) { return; }
        this.consultingData = CONSULTING_FORM;
        if (storeEvent.action === 'REFRESH') {
            this.setEntityDetails();
            this.getApplicableForms();
        } else {
            this.updateFormEditMode();
        }
    }

    private getApplicableForms(): void {
        this.isFormLoading = true;
        this.$subscriptions.push(
            this.consultingService.getApplicableForms(this.consultingData?.consultingForm)
                .subscribe({
                    next: (data: any) => {
                        this.formList = data || [];
                        const FORM_STATUS_MAP: Map<number, 'Y' | 'N'> = this.consultingService.setFormStatus(this.formList);
                        setTimeout(() => {
                            const FORM_BUILDER_ID = this.consultingService.setFormBuilderId(
                                this.formList[0],
                                this._consultingFormDataStore.isFormEditable()
                            );
                            FORM_BUILDER_ID ? this.configureForm(FORM_STATUS_MAP) : (this.isFormLoading = false);
                        });
                    },
                    error: () => {
                        this.updateFormEditMode();
                        this.isFormLoading = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }));
    }

    private configureForm(formStatusMap: Map<number, 'Y' | 'N'>): void {
        this.fbConfiguration = {
            ...this.fbConfiguration,
            formBuilderId: this.consultingService.formBuilderId,
            moduleItemCode: CONSULTING_MODULE_CODE.toString(),
            moduleSubItemCode: CONSULTING_SUB_MODULE_CODE.toString(),
            moduleItemKey: this.consultingData?.consultingForm?.disclosureId?.toString(),
            moduleSubItemKey: '0',
            documentOwnerPersonId: this.consultingData?.consultingForm?.person?.personId
        };
        if (formStatusMap.get(Number(this.consultingService.formBuilderId)) === 'Y') {
            this.fbConfiguration.formBuilderId = this.consultingService.answeredFormId;
            this.fbConfiguration.newFormBuilderId = this.consultingService.formBuilderId;
            this.consultingService.formBuilderEvents.next({ eventType: 'REVISION_REQUESTED', data: this.fbConfiguration });
            this.timeOutRef = setTimeout(() => {
                openCommonModal(this.versionModalConfig.namings.modalName);
            }, 200);
            formStatusMap.set(Number(this.consultingService.formBuilderId), 'N');
        } else {
            this.consultingService.formBuilderEvents.next({ eventType: 'CONFIGURATION', data: this.fbConfiguration });
        }
        this.updateFormEditMode();
    }

    private updateFormEditMode(): void {
        const IS_FORM_EDIT_MODE = this._consultingFormDataStore.isFormEditable();
        this.consultingService.formBuilderEvents.next({ eventType: 'IS_EDIT_MODE', data: IS_FORM_EDIT_MODE });
        this.isFormEditMode = IS_FORM_EDIT_MODE;
    }

    private setEntityDetails(): void {
        if (this.consultingData?.consultingForm?.entity) {
            this.entityDetails = deepCloneObject(this.consultingData.consultingForm.entity);
            this.setEntityDefaultValue(this.entityDetails?.entityName);
            this.consultingService.consultingEntity = this.entityDetails;
        } else {
            this.entityDetails = new EntityDetails;
            this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        }
    }

    private openEntityCreateModal(): void {
        const NEW_ENTITY_DETAILS = new EntityRequestFields();
        NEW_ENTITY_DETAILS.entityName = this.entityDetails?.entityName?.trim();
        const ENTITY_CREATION_MODAL = new EntityCreationModalConfig();
        ENTITY_CREATION_MODAL.triggeredFrom = 'CONSULTING_ADD';
        ENTITY_CREATION_MODAL.entityDetails = NEW_ENTITY_DETAILS;
        ENTITY_CREATION_MODAL.mandatoryFieldsList = ENTITY_MANDATORY_REPORTER_FIELDS;
        this._commonService.openNewEntityCreateModal(ENTITY_CREATION_MODAL);
    }

    private confirmEntityDetails(): void {
        this.consultingService.consultingEntity = this.entityDetails;
        this.saveConsultingEntityDetails();
    }

    private clearEntityConfirmModal(): void {
        this.clearField = new String('true');
        this.entityDetails = new EntityDetails();
        this.consultingService.consultingEntity = this.entityDetails;
        this.setEntityDefaultValue(this.entityDetails.entityName);
    }

    private setEntityDefaultValue(entityName: string): void {
        this.clearField = new String('false');
        this.entitySearchOptions.defaultValue = entityName;
    }

    private clearEntitySearchDetails(): void {
        this.entityDetails = new EntityDetails;
        this.entityCreationModalObj = new EntityUpdateClass();
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
    }

    private getCreateEntityPayload(entityRequestFields: EntityUpdateClass): EntityUpdateClass {
        const ENTITY_REQUEST_FIELDS = deepCloneObject(entityRequestFields);
        const MODIFIED_PAYLOAD: EntityUpdateClass = { ...ENTITY_REQUEST_FIELDS };
        delete MODIFIED_PAYLOAD.entityRequestFields?.country;
        delete MODIFIED_PAYLOAD.entityRequestFields?.stateDetails;
        delete MODIFIED_PAYLOAD.entityRequestFields?.coiEntityType;
        delete MODIFIED_PAYLOAD.entityRequestFields?.entityOwnershipType;
        MODIFIED_PAYLOAD.entityRequestFields.entitySourceTypeCode = ENTITY_SOURCE_TYPE_CODE.DISCLOSURE_REPORTER;
        MODIFIED_PAYLOAD.entityId = null;
        return MODIFIED_PAYLOAD;
    }

    private createNewEntity(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const MODIFIED_PAYLOAD = this.getCreateEntityPayload(this.entityCreationModalObj);
            this.$subscriptions.push(
                this._commonService.createEntity(MODIFIED_PAYLOAD)
                    .subscribe((data: EntityCreationResponse) => {
                        if (data) {
                            this.entityDetails = deepCloneObject(this.entityCreationModalObj.entityRequestFields);
                            this.updateEntityDetails(data.entityId, data.entityNumber);
                            this.entityCreationModalObj = new EntityUpdateClass();
                            this.isSaving = false;
                            this.saveConsultingEntityDetails();
                        }
                    }, (error: any) => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in creating entity.');
                    }));
        }
    }

    private saveConsultingEntityDetails(): void {
        this.$subscriptions.push(
            this.consultingService.saveConsultingEntityDetails({
                entityId: this.entityDetails?.entityId,
                entityNumber: this.entityDetails?.entityNumber,
                disclosureId: this.consultingData?.consultingForm?.disclosureId
            }).subscribe((consultingForm: ConsultingForm) => {
                this._consultingFormDataStore.updateStore(['consultingForm'], { consultingForm });
                this.consultingService.consultingEntity = consultingForm?.entity;
                this.updateFormValidationList();
            }, (error: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
    }

    private updateFormValidationList(): void {
        this.consultingService.setCustomValidationList();
        const VALIDATION_LIST = this.consultingService.validationList.filter(({ componentId }) => componentId !== CONSULTING_ENTITY_FIELD_ELEMENT_ID);
        this.consultingService.updateFormValidationList(VALIDATION_LIST);
    }

    private updateEntityDetails(entityId: number | string, entityNumber: number | string): void {
        this.entityDetails.entityNumber = entityNumber;
        this.entityDetails.entityId = entityId;
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        this.entitySearchOptions.defaultValue = this.entityCreationModalObj?.entityRequestFields?.entityName;
    }

    formBuilderDataChanged(formEvent: FormBuilderStatusEvent): void {
        switch (formEvent?.action) {
            case 'COPY_FORM_FETCHING_COMPLETE':
            case 'FORM_FETCHING_COMPLETE':
                this.isFormLoading = false;
                this.consultingService.setTopDynamically();
                break;
            case 'CHANGED':
                this._commonService.setChangesAvailable(true);
                this.consultingService.isFormBuilderDataChangePresent = true;
                break;
            case 'SAVE_COMPLETE':
                const EVENT = { ...formEvent, isFormBuilderDataChangePresent: this.consultingService.isFormBuilderDataChangePresent }
                this.consultingService.triggerConsultingFormActions('FORM_SAVE_COMPLETE', EVENT);
                this.consultingService.isAnyAutoSaveFailed = false;
                break;
            case 'ERROR':
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                break;
            case 'AUTO_SAVE_ERROR':
                this._commonService.setChangesAvailable(false);
                this.consultingService.isAnyAutoSaveFailed = true;
                break;
            default: break;
        }
    }

    selectedEvent(event: any): void {
        if (event) {
            this.clearField = new String('false');
            event = setEntityObjectFromElasticResult(event);
            this.entityDetails = event;
            openCommonModal(this.entityConfirmModalConfig.namings.modalName);
        } else {
            this.entityDetails = new EntityDetails();
            if (this.consultingService.consultingEntity?.entityId) {
                this.saveConsultingEntityDetails();
            }
            this.consultingService.consultingEntity = new EntityDetails();
        }
        this.entityCreationModalObj = new EntityUpdateClass();
    }

    addNewEntity(entityName: string): void {
        this.clearEntitySearchDetails();
        this.entitySearchOptions.defaultValue = entityName;
        this.entityDetails.entityName = entityName;
        this.openEntityCreateModal();
    }

    viewEntity(entityId: string): void {
        this._router.navigate(['/coi/entity-management/entity-details'], { queryParams: { entityManageId: entityId } });
    }

    entityConfirmModalAction(modalActionEvent: ModalActionEvent) {
        closeCommonModal(this.entityConfirmModalConfig.namings.modalName);
        setTimeout(() => {
            if (modalActionEvent.action === 'PRIMARY_BTN') {
                this.confirmEntityDetails();
            } else {
                this.clearEntityConfirmModal();
            }
        }, 200);
    }

    versionModalPostConfirmation(modalActionEvent: ModalActionEvent): void {
        closeCommonModal(this.versionModalConfig.namings.modalName);
    }

    triggerSubmit(): void {
        this.consultingService.triggerConsultingFormActions('FORM_SUBMIT');
    }

}
