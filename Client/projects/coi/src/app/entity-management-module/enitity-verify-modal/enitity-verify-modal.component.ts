import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, isEmptyObject, openCommonModal } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { EntityDataStoreService } from '../entity-data-store.service';
import { DataStoreEvent, EntireEntityDetails, EntityCardDetails, EntityDetails, EntityTabStatus, ErrorSubSections,
    UnifiedVerifyFields, VerifyEntitySection, VerifyModalAction, VerifyValidation, VerifyValidationConfig } from '../shared/entity-interface';
import { EntityManagementService } from '../entity-management.service'
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { Router } from '@angular/router';
import { BASIC_DETAILS, DUPLICATE_MARK_CONFIRMATION_TEXT, ENTITY_VERIFY_FIELD_WARNING_HELP_TEXT_ID, ENTITY_VERIFY_FIELD_SECTION_URL, ENTITY_VERIFY_FIELD_TAB_SECTION, EntitySectionType, ENTITY_VERIFY_FIELD_ERROR_HELP_TEXT_ID } from '../shared/entity-constants';

@Component({
    selector: 'app-enitity-verify-modal',
    templateUrl: './enitity-verify-modal.component.html',
    styleUrls: ['./enitity-verify-modal.component.scss']
})
export class EnitityVerifyModalComponent implements OnInit {

    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    ENTITY_VERIFY_MODAL_ID: string = 'coi-entity-verify-modal';
    modalSection = {
        entity: false,
        sponsor: false,
        organization: false,
        duplicateMatch: false,
    }
    isSaving = false;
    hasErrorValidation = false;
    validateResult: VerifyValidation;
    verifyConfig: VerifyValidationConfig[] = [];
    matchedDuplicateEntities: EntityCardDetails[] = [];
    entityTabStatus: EntityTabStatus = new EntityTabStatus();
    DUPLICATE_MARK_CONFIRMATION_TEXT = DUPLICATE_MARK_CONFIRMATION_TEXT;
    entityVerifyModalConfig = new CommonModalConfig(this.ENTITY_VERIFY_MODAL_ID, 'Confirm', 'Cancel', 'lg');

    @Input() hasConfirmedNoDuplicate = false;
    @Input() modalType: 'CONFIRM' | 'VALIDATION' = 'CONFIRM';
    @Output() verifyModalAction = new EventEmitter<VerifyModalAction>();

    constructor(private _router: Router,
        private _commonService: CommonService,
        private _dataStoreService: EntityDataStoreService,
        private _entityManagementService: EntityManagementService) {}

    ngOnInit(): void {
        this.listenDataChangeFromStore();
        this.getDataFromStore();
        this.validateEntityDetails();
        this.entityVerifyModalConfig.namings.primaryBtnName = this.modalType === 'CONFIRM' ? 'Confirm' : '';
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private validateEntityDetails(): void {
        this.$subscriptions.push(
            this._entityManagementService.validateEntityDetails(this.entityDetails.entityId)
                .subscribe((validateResult: VerifyValidation) => {
                    if (validateResult) {
                        this.validateResult = validateResult;
                        this.hasErrorValidation = this.validateResult.overview?.ValidationType === 'VE' || this.validateResult.sponsor?.ValidationType === 'VE' || this.validateResult.organization?.ValidationType === 'VE';
                        this.setModalData(validateResult);
                        if (this.hasErrorValidation && this.modalType === 'CONFIRM') {
                            this.updateVerifyButtonState();
                            this.openEntityVerifyModal();
                        } else {
                            this.checkForDuplicate();
                        }
                    } else {
                        this.showErrorAndCloseModal();
                    }
                }, (error: any) => {
                    this.showErrorAndCloseModal();
                }));
    }

    private showErrorAndCloseModal(): void {
        this.closeEntityVerifyModal({ action: 'API_FAILED' });
        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    private checkForDuplicate(): void {
        this.$subscriptions.push(
            this._entityManagementService.checkForDuplicate(this._dataStoreService.getDuplicateCheckRO())
                .subscribe((duplicateMatch: any) => {
                    this.matchedDuplicateEntities = Array.isArray(duplicateMatch) ? duplicateMatch : [];
                    this.matchedDuplicateEntities = this.matchedDuplicateEntities?.filter((entity: EntityCardDetails) => entity?.entityId != this.entityDetails?.entityId);
                    this.updateVerifyButtonState();
                    this.openEntityVerifyModal();
                }));
    }

    private validateSections(verifyValidation: VerifyValidation): void {
        for (const section of Object.keys(verifyValidation) as VerifyEntitySection[]) {
            const { fields, ValidationType, ValidationMessage } = this.validateResult[section] || {};
            const IS_COMPLETE = Object.values(fields)?.every(Boolean);
            this.verifyConfig.push({
                fields,
                section,
                ValidationType,
                ValidationMessage,
                alertClass: IS_COMPLETE ? 'success' : ValidationType === 'VE' ? 'danger' : 'warning',
                alertText: IS_COMPLETE ? 'Completed' : ValidationType === 'VE' ? 'Error' : 'Warning',
                errorSubSections: IS_COMPLETE ? [] : this.getFieldConfig(fields, section)
            });
        }
    }

    private getFieldConfig(fields: UnifiedVerifyFields, section: VerifyEntitySection): ErrorSubSections[] {
        const VALIDATION_TYPE = this.validateResult[section]?.ValidationType;
        const FIELD_CONFIG: ErrorSubSections[] = [];
        // Check for false fields and create ErrorSubSections for them
        for (const [FIELD, IS_VALID] of Object.entries(fields) as [keyof UnifiedVerifyFields, boolean][]) {
            if (!IS_VALID) {
                const NEW_SECTION = ENTITY_VERIFY_FIELD_TAB_SECTION[FIELD];
                const IS_SECTION_ADDED = FIELD_CONFIG?.some((config: ErrorSubSections) => config?.subsection?.sectionName === NEW_SECTION?.sectionName)
                if (!IS_SECTION_ADDED && NEW_SECTION) {
                    FIELD_CONFIG.push({
                        fieldName: FIELD,
                        subsection: NEW_SECTION,
                        navigateTo: ENTITY_VERIFY_FIELD_SECTION_URL[FIELD],
                        helpTextElementId: VALIDATION_TYPE === 'VE' ? ENTITY_VERIFY_FIELD_ERROR_HELP_TEXT_ID[FIELD] : ENTITY_VERIFY_FIELD_WARNING_HELP_TEXT_ID[FIELD],
                        title: `Click here to navigate to ${NEW_SECTION?.sectionName?.toLowerCase()}`,
                        ariaLabel: `Click here to navigate to ${NEW_SECTION?.sectionName?.toLowerCase()}`,
                    });
                }
            }
        }
        return FIELD_CONFIG;
    }
    
    private setModalData(validateResult: VerifyValidation): void {
        const { organization, overview, sponsor } = this.validateResult || {};
        this.validateSections(validateResult);
        this.modalSection.entity = !Object.values(overview?.fields)?.includes(false);
        this.modalSection.sponsor = !Object.values(sponsor?.fields)?.includes(false);
        this.modalSection.organization = !Object.values(organization?.fields)?.includes(false);
        this.updateVerifyButtonState();
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.updateVerifyButtonState();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            }));
    }

    private verify(modalAction: ModalActionEvent): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._entityManagementService.verifyEntity(this.entityDetails.entityId)
                    .subscribe(async (res: any) => {
                        this.entityTabStatus = res;
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entity confirmed successfully.');
                        this.entityDetails.entityStatusType = {
                            entityStatusTypeCode: "1",
                            description: "Verified",
                        };
                        this.entityDetails.entityStatusTypeCode = '1';
                        this.closeEntityVerifyModal(modalAction);
                        this.reloadEntity();
                        this._commonService.hideSuccessErrorToast();
                        this.navigateToSection('entity-overview', BASIC_DETAILS);
                        this.isSaving = false;
                    }, (_error: any) => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Entity confirmation failed, please try again.');
                    }));
        }
    }

    private reloadEntity(): void {
        setTimeout(() => {
            this._commonService.$globalEventNotifier.next({ uniqueId: 'RELOAD_GLOBAL_ENTITY', content: { entityId: this.entityDetails?.entityId } });
        }, 200);
    }

    entityVerifyModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.closeEntityVerifyModal(modalAction);
            case 'PRIMARY_BTN':
                return this.verify(modalAction);
            default: break;
        }
    }

    openEntityVerifyModal(): void {
        setTimeout(() => {
            openCommonModal(this.ENTITY_VERIFY_MODAL_ID);
        }, 200);
    }

    closeEntityVerifyModal(modalAction: VerifyModalAction): void {
        closeCommonModal(this.ENTITY_VERIFY_MODAL_ID);
        setTimeout(() => {
            this.verifyModalAction.emit(modalAction);
        }, 200);
    }

    navigateToSection(navigateTo: 'entity-overview' | 'entity-sponsor' | 'entity-subaward' | 'entity-duplicate', section?: EntitySectionType): void {
        const VIEW_MODE_MAP: any = {
            'entity-overview': { action: 'VIEW_OVERVIEW' },
            'entity-sponsor': { action: 'VIEW_SPONSOR' },
            'entity-subaward': { action: 'VIEW_SUBAWARD' },
            'entity-duplicate': { action: 'VIEW_DUPLICATE', event: { hasConfirmedNoDuplicate: this.hasConfirmedNoDuplicate } }
        };
        this.closeEntityVerifyModal(VIEW_MODE_MAP[navigateTo]);
        if (navigateTo !== 'entity-duplicate') {
            this._entityManagementService.scrollToSelectedSection(section?.sectionId, section?.subSectionId);
            this._router.navigate([`/coi/manage-entity/${navigateTo}`], { queryParamsHandling: 'merge' });
        }
    }

    updateVerifyButtonState(): void {
        if (this.modalType === 'CONFIRM') {
            this.modalSection.duplicateMatch = !(this.matchedDuplicateEntities?.length && !this.hasConfirmedNoDuplicate)
            this.entityVerifyModalConfig.ADAOptions.isDisablePrimaryBtn = this.hasErrorValidation || !this.modalSection.duplicateMatch;
        }
    }

}
