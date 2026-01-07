import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DataStoreEvent, EntityExternalIdMappings, OtherReferenceId} from '../../shared/entity-interface';
import {Subscription} from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import {EntityOverviewService} from '../entity-overview.service';
import {COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS} from '../../../app-constants';
import {CommonService} from '../../../common/services/common.service';
import {EntityDataStoreService} from '../../entity-data-store.service';
import {CommonModalConfig, ModalActionEvent} from "../../../shared-components/common-modal/common-modal.interface";
import {closeCommonModal, hideModal, isEmptyObject, openCommonModal, openModal} from "../../../common/utilities/custom-utilities";
import { EntityManagementService } from '../../entity-management.service';
import { OTHER_REFERENCE_IDS } from '../../shared/entity-constants';

@Component({
    selector: 'app-other-reference-id',
    templateUrl: './other-reference-id.component.html',
    styleUrls: ['./other-reference-id.component.scss']
})
export class OtherReferenceIdComponent implements OnInit, OnDestroy {

    otherReferenceIdObj: OtherReferenceId = new OtherReferenceId();
    coiCurrencyOptions = 'entity_external_id_type#EXTERNAL_ID_TYPE_CODE#false#false';
    @Input() sectionName: any;
    @Input() sectionId: any;
    mandatoryList = new Map();
    externalReferences: EntityExternalIdMappings[] = [];
    selectedReference = null;
    isEditIndex = null;
    isEditMode = false;
    isSaving = false;
    entityId = null;
    defaultRefType = null;
    selectedRefType = [];
    $subscriptions: Subscription[] = [];
    CONFIRMATION_MODAL_ID = 'ref-delete-confirm-modal';
    modalConfig = new CommonModalConfig(this.CONFIRMATION_MODAL_ID, 'Delete', 'Cancel');
    canManageEntity = false;
    isShowCommentButton = false;
    commentCount = 0;

    constructor(private _entityOverviewService: EntityOverviewService,
                private _commonService: CommonService,
                public entityManagementService: EntityManagementService,
                private _dataStoreService: EntityDataStoreService) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(OTHER_REFERENCE_IDS);
    }

    listenDataChangeFromStore() {
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
        this.commentCount = entityData.commentCountList?.[OTHER_REFERENCE_IDS.sectionTypeCode] || 0;
        this.externalReferences = entityData.entityExternalIdMappings;
        this.isEditMode = this._dataStoreService.getEditMode();
        this.checkUserHasRight();
    }


    addOtherRefId(event) {
        openModal('otherReferenceIdModal');
    }

    onReferenceIdTypeSelected(event) {
        if (event && event.length) {
            this.otherReferenceIdObj.externalIdTypeCode = event[0].code;
            this.selectedReference = event[0];
        } else {
            this.otherReferenceIdObj.externalIdTypeCode = null;
            this.selectedReference = null;
        }
    }

    addOtherReferenceID() {
        if (this.entityMandatoryValidation()) {
            this.isEditIndex != null ? this.updateExternalReference() : this.addExternalReference();
        }
    }

    clearOtherReferenceID() {
        this.mandatoryList.clear();
        this.otherReferenceIdObj = new OtherReferenceId();
        this.defaultRefType = null;
        this.isEditIndex = null;
        this.selectedRefType = [];
        this.selectedReference = null;
        hideModal('otherReferenceIdModal');
    }

    entityMandatoryValidation() {
        this.mandatoryList.clear();
        if (!this.otherReferenceIdObj.externalIdTypeCode) {
            this.mandatoryList.set('referenceType', 'Please select reference type.');
        }
        if (!this.otherReferenceIdObj.externalId) {
            this.mandatoryList.set('referenceId', 'Please enter reference id.');
        }
        if (!this.otherReferenceIdObj.description) {
            this.mandatoryList.set('description', 'Please enter reference description.');
        }
        return !this.mandatoryList.size;
    }

    addExternalReference() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.otherReferenceIdObj.entityId = this.entityId;
            this.$subscriptions.push(this._entityOverviewService.saveExternalReference(this.otherReferenceIdObj).subscribe((res: any) => {
                const newReference: any = this.otherReferenceIdObj;
                newReference.entityExternalMappingId = res.entityExternalMappingId;
                newReference.entityExternalIdType = this.selectedReference;
                this.externalReferences.unshift(newReference);
                this._dataStoreService.enableModificationHistoryTracking();
                this.updateDataStore();
                this.clearOtherReferenceID();
                this.isSaving = false;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reference ID added successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    editRef(reference: EntityExternalIdMappings, index: number) {
        this.isEditIndex = index;
        this.setRefObj(reference);
        openModal('otherReferenceIdModal');
    }

    private setRefObj(reference: EntityExternalIdMappings) {
        this.otherReferenceIdObj.entityId = this.entityId;
        this.otherReferenceIdObj.externalId = reference.externalId;
        this.otherReferenceIdObj.description = reference.description;
        this.otherReferenceIdObj.externalIdTypeCode = reference.externalIdTypeCode;
        this.otherReferenceIdObj.entityExternalMappingId = reference.entityExternalMappingId;
        this.defaultRefType = reference.entityExternalIdType.description;
        this.selectedReference = reference.entityExternalIdType;
    }

    confirmDeleteRef(reference: EntityExternalIdMappings, index: number) {
        this.isEditIndex = index;
        this.selectedReference = reference;
        openCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    postConfirmation(modalAction: ModalActionEvent) {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.deleteRef();
        }
        closeCommonModal(this.CONFIRMATION_MODAL_ID);
    }

    deleteRef() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._entityOverviewService
                .deleteExternalReference(this.selectedReference.entityExternalMappingId)
                .subscribe((res: any) => {
                    this.externalReferences.splice(this.isEditIndex, 1);
                    this._dataStoreService.enableModificationHistoryTracking();
                    this.updateDataStore();
                    this.clearOtherReferenceID();
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reference ID deleted successfully.');
            }, err => {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
        }
    }

    updateExternalReference() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.otherReferenceIdObj.entityId = this.entityId;
            this.$subscriptions.push(this._entityOverviewService.updateExternalReference(this.otherReferenceIdObj).subscribe((res: any) => {
                this._dataStoreService.enableModificationHistoryTracking();
                this.updateExternalReferences();
                this.updateDataStore();
                this.clearOtherReferenceID();
                this.isSaving = false;
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reference ID updated successfully.');
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                this.isSaving = false;
            }));
        }
    }

    private updateExternalReferences() {
        const UPDATED_REFERENCE = this.externalReferences.splice(this.isEditIndex, 1)[0];
        UPDATED_REFERENCE.externalId = this.otherReferenceIdObj.externalId;
        UPDATED_REFERENCE.description = this.otherReferenceIdObj.description;
        this.setRefIdType(UPDATED_REFERENCE);
    }

    setRefIdType(currentRef: any) {
        const SELECTED_REFERENCE = this.selectedReference;
        if (SELECTED_REFERENCE?.description || currentRef?.entityExternalIdTypeDescription) {
            currentRef.entityExternalIdTypeDescription = SELECTED_REFERENCE.description || currentRef.entityExternalIdTypeDescription;
        }
        if (SELECTED_REFERENCE || currentRef?.entityExternalIdType) {
            currentRef.entityExternalIdType = SELECTED_REFERENCE || currentRef.entityExternalIdType;
        }
        currentRef.externalIdTypeCode = this.otherReferenceIdObj.externalIdTypeCode;
        this.externalReferences.unshift(currentRef);
    }

    updateDataStore() {
        this._dataStoreService.updateStore(['entityExternalIdMappings'], {'entityExternalIdMappings': this.externalReferences});
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    checkUserHasRight(): void {
        const hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') &&
            this._dataStoreService.getOverviewEditRight(this.sectionId);
        if (!hasRight) {
            this.isEditMode = false;
        }
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: OTHER_REFERENCE_IDS.commentTypeCode,
            sectionTypeCode: OTHER_REFERENCE_IDS.sectionTypeCode
        });
    }

}
