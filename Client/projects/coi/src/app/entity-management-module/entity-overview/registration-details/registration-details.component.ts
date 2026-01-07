import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataStoreEvent, RegistrationDetails} from '../../shared/entity-interface';
import {hideModal, isEmptyObject, openModal} from 'projects/fibi/src/app/common/utilities/custom-utilities';
import {Subscription} from 'rxjs';
import {EntityOverviewService} from '../entity-overview.service';
import {EntityDataStoreService} from '../../entity-data-store.service';
import {CommonService} from '../../../common/services/common.service';
import {COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../app-constants';
import {CommonModalConfig, ModalActionEvent} from '../../../shared-components/common-modal/common-modal.interface';
import {closeCommonModal, openCommonModal} from '../../../common/utilities/custom-utilities';
import {subscriptionHandler} from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { REGISTRATION_DETAILS } from '../../shared/entity-constants';

@Component({
    selector: 'app-registration-details',
    templateUrl: './registration-details.component.html',
    styleUrls: ['./registration-details.component.scss']
})
export class RegistrationDetailsComponent implements OnInit, OnDestroy {

    registrationDetails: RegistrationDetails = new RegistrationDetails();
    entityRegistrationTypeOption = 'ENTITY_REGISTRATION_TYPE#REG_TYPE_CODE#false#true';
    mandatoryList = new Map();
    $subscriptions: Subscription[] = [];
    entityId: any;
    entityRegistrations: any;
    selectedType: any;
    selectedRegistrationType = [];
    isEditIndex: null | number = null;
    isEditMode = false;
    deleteEntityRegistrationId = null;
    isSaving = false;
    entityRegistrationDefaultValue = '';
    modalConfig = new CommonModalConfig('register-delete-confirm-modal', 'Delete', 'Cancel');
    canManageEntity = false;
    REGISTRATION_DETAILS = REGISTRATION_DETAILS;
    isDunsViewMode = false;

    constructor(private _entityOverviewService: EntityOverviewService,
                private _dataStoreService: EntityDataStoreService,
                private _commonService: CommonService) {
    }

    addRegistrationDetails(event) {
        if (event) {
            openModal('addRegistrationDetails', {
                backdrop: 'static',
                keyboard: true,
                focus: false
            });
        }
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore() {
        const entityData = this._dataStoreService.getData();
        if (isEmptyObject(entityData)) {
            return;
        }
        this.entityId = entityData?.entityDetails?.entityId;
        this.entityRegistrations = entityData.entityRegistrations;
        this.isEditMode = this._dataStoreService.getEditMode() && this._dataStoreService.getOverviewEditRight(REGISTRATION_DETAILS.sectionId);
        this.isDunsViewMode = this._dataStoreService.checkDunsMatchedForSelectedVersion();
        this.checkUserHasRight();
    }

    private getHasDuplicateTypeCode(regTypeCode: string, entityRegistrationId: number | null): boolean {
        return this.entityRegistrations?.some((risk: any) => risk?.regTypeCode === regTypeCode && risk?.entityRegistrationId !== entityRegistrationId);
    }

    clearRegistrationDetails() {
        hideModal('addRegistrationDetails');
        setTimeout(() => {
            this.registrationDetails = new RegistrationDetails();
            this.mandatoryList.clear();
            this.selectedType = '';
            this.selectedRegistrationType = [];
            this.entityRegistrationDefaultValue = '';
            this.isEditIndex = null;
            this.isSaving = false;
            this.deleteEntityRegistrationId = null;
        }, 200);
    }

    addRegistration() {
        if (!this.isSaving && this.validateEntityRegistration()) {
            this.isSaving = true;
            this.registrationDetails.entityId = this.entityId;
            this.$subscriptions.push(this._entityOverviewService.addRegistrationDetails(this.registrationDetails).subscribe((data: any) => {
                if (data) {
                    const registration: any = {};
                    registration.entityRegistrationId = data.entityRegistrationId;
                    registration.regTypeCode = this.selectedType[0].code;
                    registration.registrationTypeDescription = this.selectedType[0]?.description;
                    registration.regNumber = this.registrationDetails.regNumber;
                    this.entityRegistrations.unshift(registration);
                    this._dataStoreService.enableModificationHistoryTracking();
                    this.updateDataStore();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Registration details added successfully.');
                }
                this.clearRegistrationDetails();
            }, (_err: any) => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    entityRegistrationTypeSelect(event) {
        if (event) {
            this.registrationDetails.regTypeCode = event[0]?.code;
            this.selectedType = event;
        } else {
            this.registrationDetails.regTypeCode = null;
            this.selectedType = null;
        }
    }

    validateEntityRegistration(): boolean {
        this.mandatoryList.clear();
        const { regTypeCode, regNumber, entityRegistrationId } = this.registrationDetails;
        if (!regTypeCode) {
            this.mandatoryList.set('regTypeCode', 'Please select registration type.');
        }  else if (this.getHasDuplicateTypeCode(regTypeCode, entityRegistrationId)) {
            this.mandatoryList.set('regTypeCode', 'The registration type has already been added. Please update the existing type to make any changes.');
        }
        if (!regNumber) {
            this.mandatoryList.set('registrationNumber', 'Please enter registration number.');
        }
        return this.mandatoryList.size === 0;
    }

    editRelationship(registration: any, index: number) {
        this.isEditIndex = index;
        this.setRegistrationDetails(registration);
        openModal('addRegistrationDetails');
    }

    setRegistrationDetails(registration) {
        this.registrationDetails.entityId = this.entityId;
        this.registrationDetails.regTypeCode = registration.regTypeCode;
        this.registrationDetails.entityRegistrationId = registration.entityRegistrationId;
        this.registrationDetails.regNumber = registration.regNumber;
        this.entityRegistrationDefaultValue = registration.registrationType ?
            registration.registrationType.description : registration.registrationTypeDescription;
    }

    editRegistration() {
        if (!this.isSaving && this.validateEntityRegistration()) {
            this.isSaving = true;
            this.registrationDetails.entityId = this.entityId;
            this.$subscriptions.push(this._entityOverviewService
                .updateRegistrationDetails(this.registrationDetails).subscribe((data: any) => {
                    this.updateAndArrangeData();
                    this._dataStoreService.enableModificationHistoryTracking();
                    this.updateDataStore();
                    this.clearRegistrationDetails();
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Registration details updated successfully.');
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    this.isSaving = false;
                }));
        }
    }

    private updateAndArrangeData(): void {
        const UPDATED_REGISTRATION = this.entityRegistrations.splice(this.isEditIndex, 1)[0];
        UPDATED_REGISTRATION.registrationTypeDescription = this.selectedType?.[0] ? this.selectedType[0]?.description : this.entityRegistrationDefaultValue;
        UPDATED_REGISTRATION.regNumber = this.registrationDetails.regNumber;
        UPDATED_REGISTRATION.regTypeCode = this.registrationDetails.regTypeCode;
        UPDATED_REGISTRATION.registrationType = null;
        this.entityRegistrations.unshift(UPDATED_REGISTRATION);
    }

    postConfirmation(modalAction: ModalActionEvent) {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteRegistration(this.deleteEntityRegistrationId);
        } else {
            this.clearRegistrationDetails();
        }
        closeCommonModal('register-delete-confirm-modal');
    }

    confirmDelete(registration, index: number) {
        this.isEditIndex = index;
        this.deleteEntityRegistrationId = registration.entityRegistrationId;
        this.entityRegistrationDefaultValue = registration.registrationType ?
            registration.registrationType.description : registration.registrationTypeDescription;
        openCommonModal('register-delete-confirm-modal');
    }

    deleteRegistration(entityRegistrationId) {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._entityOverviewService.deleteRegistrationDetails(entityRegistrationId).subscribe((data: any) => {
                if (data) {
                    this.entityRegistrations.splice(this.isEditIndex, 1);
                    this._dataStoreService.enableModificationHistoryTracking();
                    this.updateDataStore();
                    this.clearRegistrationDetails();
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Registration details deleted successfully.');
                }
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    updateDataStore() {
        this._dataStoreService.updateStore(['entityRegistrations'], {'entityRegistrations': this.entityRegistrations});
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    checkUserHasRight(): void {
        this.canManageEntity = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME');
    }

}
