import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityDetailsCardConfig, SharedEntityCardEvents, BatchEntityDetails, EntityBatchDetails } from '../../common/services/coi-common.interface';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { leftSlideInOut } from '../../common/utilities/animations';
import { PAGINATION_LIMIT, BATCH_REVIEW_STATUS_TYPE_CODE, BATCH_STATUS_TYPE_CODE, ENTITY_SOURCE_TYPE_CODE, BATCH_MATCH_TYPE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, BATCH_REVIEW_ACTION_TYPE_CODE, ENTITY_RIGHTS, IMPORT_ENTITY_MANAGE_RIGHTS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, openCommonModal, openInNewTab } from '../../common/utilities/custom-utilities';
import { BatchEntityRO, BatchEntity, FilterSearchAction, BulkConfirmationModal, BatchBulkActionType, BatchEntityBulkUpdateRO, BatchReviewConfirmation } from './services/entity-batch.interface';
import { EntityBatchService } from './services/entity-batch.service';
import { SUB_SECTION_CODES, BATCH_ENTITY_CONFIRMATION_TEXT, BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID, BATCH_ENTITY_BULK_REVIEW_MODAL_HEADER, BATCH_ENTITY_BULK_REVIEW_MODAL_INFO, BATCH_ENTITY_RE_REVIEW_VALIDATION_INFO_TEXT } from './services/entity-batch-constants';

@Component({
    selector: 'app-entity-batch',
    templateUrl: './entity-batch.component.html',
    styleUrls: ['./entity-batch.component.scss'],
    animations: [leftSlideInOut]
})
export class EntityBatchComponent implements OnInit, OnDestroy {

    isLoading = true;
    isSaving = false;
    selectedCount = 0;
    totalBatchCount = 0;
    isShowSelectAll = false;
    canViewCoiEntity = false;
    isDisableSelectAll = false;
    isAllEntitySelected = false;
    isShowCreateWithDnB = false;
    canManageImportEntity = false;
    isOpenValidationModal = false;
    $subscriptions: Subscription[] = [];
    SUB_SECTION_CODES = SUB_SECTION_CODES;
    savedBatchEntityRO = new BatchEntityRO();
    entityList: EntityDetailsCardConfig[] = [];
    filterSearchData = new FilterSearchAction();
    entityBatchDetails = new EntityBatchDetails();
    selectedReviewEntity: BatchEntityDetails = null;
    confirmationModal = new BulkConfirmationModal();
    $fetchBatchDetails = new Subject<BatchEntityRO>();
    BATCH_ENTITY_CONFIRMATION_TEXT = BATCH_ENTITY_CONFIRMATION_TEXT;
    selectedEntities: Record<string | number, BatchEntityDetails> = {};
    BATCH_BULK_REVIEW_SUBSECTION_CODE = SUB_SECTION_CODES.BATCH_ACTION;
    ENTITY_BATCH_MODAL_ID: string = 'coi-batch-entity-bulk-confirm-modal';
    BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID = BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID;
    ENTITY_BATCH_REVIEW_VALIDATION_MODAL_ID: string = 'coi-batch-entity-review-val-modal';
    BATCH_ENTITY_RE_REVIEW_VALIDATION_INFO_TEXT = BATCH_ENTITY_RE_REVIEW_VALIDATION_INFO_TEXT;
    modalConfig = new CommonModalConfig(this.ENTITY_BATCH_MODAL_ID, 'Confirm', 'Cancel', '');
    validationModalConfig = new CommonModalConfig(this.ENTITY_BATCH_REVIEW_VALIDATION_MODAL_ID, '', 'Close', 'lg');

    constructor(private _entityBatchService: EntityBatchService,
        private _commonService: CommonService, private _activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.setPermissions();
        this.validationModalConfig.styleOptions.closeBtnClass = 'invisible';
        this.loadBatchDetails();
        this.listenQueryParamChange();
        this.savedBatchEntityRO = this._entityBatchService.getBatchEntityRO(this._entityBatchService.currentBatchId);
        this.setBatchEntityData(this._entityBatchService.batchEntity);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setPermissions(): void {
        this.canViewCoiEntity = this._commonService.getAvailableRight(ENTITY_RIGHTS);
        this.canManageImportEntity = this._commonService.getAvailableRight(IMPORT_ENTITY_MANAGE_RIGHTS);
    }

    private listenQueryParamChange(): void {
        this.$subscriptions.push(
            this._activatedRoute.queryParams.subscribe(params => {
                const BATCH_ID = Number(params['batchId']);
                if (Number.isNaN(BATCH_ID)) {
                    this._entityBatchService.showErrorAndGoToDashboard();
                }
                if (BATCH_ID != this._entityBatchService.currentBatchId) {
                    this._entityBatchService.currentBatchId = BATCH_ID;
                    this.filterSearchData = new FilterSearchAction();
                    this.savedBatchEntityRO = this._entityBatchService.getBatchEntityRO(BATCH_ID);
                    this.$fetchBatchDetails.next();
                }
            }));
    }

    private loadBatchDetails(): void {
        this.$subscriptions.push(
            this.$fetchBatchDetails.pipe(
                switchMap(() => {
                    this.isLoading = true;
                    this.entityList = [];
                    this.clearSelectAll();
                    return this._entityBatchService.loadBatchDetails(this.savedBatchEntityRO).pipe(
                        catchError((error) => {
                            this.isLoading = false;
                            this._entityBatchService.showErrorAndGoToDashboard('Error in fetching batch entity details.');
                            return of(null);
                        })
                    );
                })
            ).subscribe(
                (res: BatchEntity) => {
                    this.checkBatchStatusCompleted(res) ? this.setBatchEntityData(res) : this._entityBatchService.showErrorAndGoToDashboard();
                }
            )
        );
    }

    private setBatchEntityData(res: BatchEntity): void {
        this._entityBatchService.batchEntity = res;
        this.totalBatchCount = res?.batchEntityDetailsCount || 0;
        this.entityBatchDetails = res?.batchDetail || new EntityBatchDetails();
        this.isShowSelectAll = this.canManageImportEntity && (this.getIsReviewPending(this.filterSearchData.currentReviewFilter) || !this.filterSearchData.currentReviewFilter);
        this.entityList = this.getFormattedEntityList(res?.batchEntityDetails, this.isShowSelectAll);
        this.setIsDisableSelectAll(res?.batchEntityDetails);
        this.isLoading = false;
    }

    private getFormattedEntityList(batchEntityDetails: BatchEntityDetails[], isShowCheckBox: boolean): EntityDetailsCardConfig[] {
        return batchEntityDetails?.map(entity => {
            const CARD_CONFIG = new EntityDetailsCardConfig();
            CARD_CONFIG.entireDetails = entity;
            CARD_CONFIG.sharedEntityDetails = {
                entityId: entity.entityId,
                entityName: entity?.srcDataName,
                dunsNumber: entity?.srcDunsNumber,
                ueiNumber: entity?.srcUei,
                cageNumber: entity?.srcCageNumber,
                primaryAddressLine1: entity?.srcAddressLine1,
                primaryAddressLine2: entity?.srcAddressLine2,
                state: entity?.srcState,
                city: entity?.srcCity,
                postCode: entity?.srcPostalCode,
                country: entity?.srcCountry,
                organizationId: this.entityBatchDetails?.batchSrcTypeCode == ENTITY_SOURCE_TYPE_CODE.ORGANIZATION ? entity?.srcDataCode : null,
                sponsorCode: this.entityBatchDetails?.batchSrcTypeCode == ENTITY_SOURCE_TYPE_CODE.SPONSOR ? entity?.srcDataCode : null,
                batchId: entity?.batchId,
                isExactDunsMatch: entity?.isExactDunsMatch,
                isMultipleDunsMatch: entity?.isMultipleDunsMatch,
                isNoDunsMatch: entity?.isNoDunsMatch,
                isDuplicateInBatch: entity?.isDuplicateInBatch,
                isDuplicateInEntitySys: entity?.isDuplicateInEntitySys,
                entityStageDetailId: entity?.entityStageDetailId,
                srcTypeCode: entity?.srcTypeCode,
                adminReviewStatusCode: entity?.adminReviewStatusCode,
                adminReviewStatusType: entity?.adminReviewStatusType,
                adminActionCode: entity?.adminActionCode,
                adminActionType: entity?.adminActionType,
            };
            CARD_CONFIG.cardType = 'BATCH_ENTITY';
            CARD_CONFIG.uniqueId = entity?.entityStageDetailId;
            CARD_CONFIG.displaySections = ['FOOTER', 'MATCH_TYPE'];
            const IS_REVIEW_PENDING_OR_ERROR = this.getIsReviewPending(entity?.adminReviewStatusCode);
            const IS_REVIEW_COMPLETED = [BATCH_REVIEW_STATUS_TYPE_CODE.COMPLETED].includes(entity?.adminReviewStatusCode);
            const IS_SHOW_RE_REVIEW = [BATCH_REVIEW_ACTION_TYPE_CODE.MARK_AS_DUPLICATE_INCLUDE, BATCH_REVIEW_ACTION_TYPE_CODE.MARK_AS_DUPLICATE_EXCLUDE, BATCH_REVIEW_ACTION_TYPE_CODE.MARK_AS_EXCLUDE].includes(entity?.adminActionCode);
            const IS_ENTITY_CREATED = [BATCH_REVIEW_ACTION_TYPE_CODE.CREATE_WITH_DUNS, BATCH_REVIEW_ACTION_TYPE_CODE.CREATE_WITHOUT_DUNS].includes(entity?.adminActionCode);
            CARD_CONFIG.inputOptions = {
                REVIEW: {
                    visible: this.canManageImportEntity && IS_REVIEW_PENDING_OR_ERROR,
                },
                RE_REVIEW: {
                    visible: this.canManageImportEntity && IS_REVIEW_COMPLETED && IS_SHOW_RE_REVIEW,
                },
                CHECK_BOX: {
                    visible: isShowCheckBox,
                    defaultValue: false, disable: !IS_REVIEW_PENDING_OR_ERROR
                },
                VIEW: {
                    visible: this.canViewCoiEntity && IS_REVIEW_COMPLETED && IS_ENTITY_CREATED && !!entity.entityId
                }
            };
            return CARD_CONFIG;
        }) || [];
    }

    private setIsDisableSelectAll(batchEntityDetails: BatchEntityDetails[]): void {
        const IS_ANY_REVIEW_PENDING_OR_ERROR = batchEntityDetails?.some(entity => this.getIsReviewPending(entity?.adminReviewStatusCode));
        this.isDisableSelectAll = !IS_ANY_REVIEW_PENDING_OR_ERROR;
    }

    private getToastMessage(actionType: BatchBulkActionType | 'RE_REVIEW', toastType: 'SUCCESS' | 'ERROR'): string {
        const ACTION_TOASTS: Record<BatchBulkActionType, { SUCCESS: string, ERROR: string }> = {
            'CREATION_WITH_DNB': {
                SUCCESS: 'Review successfully completed.',
                ERROR: 'Failed to create entity using D&B match.'
            },
            'EXCLUDE_FROM_CREATION': {
                SUCCESS: 'Entity successfully excluded from creation.',
                ERROR: 'Failed to exclude entity from creation.'
            },
            'CREATION_WITHOUT_DNB': {
                SUCCESS: 'Review successfully completed.',
                ERROR: 'Failed to create entity without using D&B match.'
            }
        };

        return ACTION_TOASTS[actionType]?.[toastType] || 'Action could not be completed.';
    }

    private batchEntityBulkUpdate(RO: BatchEntityBulkUpdateRO): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._entityBatchService.batchEntityBulkUpdate(RO).subscribe(
                    (res: any) => {
                        this.isSaving = false;
                        this.closeBatchConfirmModal();
                        this.$fetchBatchDetails.next();
                        this._commonService.showToast(HTTP_SUCCESS_STATUS, this.getToastMessage(this.confirmationModal.bulkAction, 'SUCCESS'));
                    }, (error: any) => {
                        this.isSaving = false;
                        if (error.status === 405) {
                            this.closeBatchConfirmModal();
                            this._commonService.concurrentUpdateAction = 'Batch Entity';
                        }
                        this._commonService.showToast(HTTP_ERROR_STATUS, this.getToastMessage(this.confirmationModal.bulkAction, 'ERROR'));
                    }
                )
            );
        }
    }

    private clearSelectAll(): void {
        this.entityList.forEach(entity => {
            entity.inputOptions.CHECK_BOX.defaultValue = false;
        });
        this.selectedCount = 0;
        this.selectedEntities = {};
        this.isAllEntitySelected = false;
    }

    private isEntitySelectable(entity: EntityDetailsCardConfig): boolean {
        const IS_REVIEW_PENDING_OR_ERROR = this.getIsReviewPending(entity?.entireDetails.adminReviewStatusCode);
        const IS_CHECK_BOX_SELECTED = entity?.inputOptions.CHECK_BOX.defaultValue;
        return IS_REVIEW_PENDING_OR_ERROR && IS_CHECK_BOX_SELECTED;
    }

    private getIsReviewPending(adminReviewStatusType: any[] | number): boolean {
        if (Array.isArray(adminReviewStatusType)) {
            return adminReviewStatusType.some((typeCode: any) => {
                return typeCode && [BATCH_REVIEW_STATUS_TYPE_CODE.PENDING, BATCH_REVIEW_STATUS_TYPE_CODE.ERROR].includes(Number(typeCode));
            });
        } else {
            return [BATCH_REVIEW_STATUS_TYPE_CODE.PENDING, BATCH_REVIEW_STATUS_TYPE_CODE.ERROR].includes(adminReviewStatusType);
        }        
    }

    private checkBatchStatusCompleted(batchEntity: BatchEntity): boolean {
        return batchEntity.batchDetail.batchStatusType.batchStatusCode === BATCH_STATUS_TYPE_CODE.COMPLETED;
    }

    private reviewActions(): void {
        const ENTITY_STAGE_ID_LIST = Object.keys(this.selectedEntities) || [];
        const batchEntityBulkUpdateRO: BatchEntityBulkUpdateRO = {
            action: this.confirmationModal.bulkAction,
            entityStageDetailIds: ENTITY_STAGE_ID_LIST,
            batchId: this._entityBatchService.currentBatchId
        };
        if (ENTITY_STAGE_ID_LIST.length) {
            this.batchEntityBulkUpdate(batchEntityBulkUpdateRO);
        }
    }

    private openReReviewSlider(): void {
        this.selectedReviewEntity = this.confirmationModal.selectedReviewEntity;
        this.closeBatchConfirmModal();
    }

    private closeBatchConfirmModal(): void {
        closeCommonModal(this.ENTITY_BATCH_MODAL_ID);
        setTimeout(() => {
            this.confirmationModal = new BulkConfirmationModal();
        }, 200);
    }

    private checkIfAllEntitiesSelected(): void {
        this.isAllEntitySelected = this.entityList.every(entity => this.isEntitySelectable(entity));
        this.isShowCreateWithDnB = Object.values(this.selectedEntities).every(entityDetails => entityDetails.isExactDunsMatch === true);
    }

    private toggleEntitySelection(batchEntityDetails: BatchEntityDetails): void {
        const entityStageDetailId = batchEntityDetails.entityStageDetailId;
        if (this.selectedEntities[entityStageDetailId]) {
            delete this.selectedEntities[entityStageDetailId];  // Deselect
            this.selectedCount--;  // Decrease counter
        } else {
            this.selectedEntities[entityStageDetailId] = batchEntityDetails;  // Select
            this.selectedCount++;  // Increase counter
        }
        this.checkIfAllEntitiesSelected();  // Check after each toggle
    }

    private openReReviewConfirmModal(selectedReviewEntity: BatchEntityDetails): void {
        if (selectedReviewEntity.canReReview) {
            this.confirmationModal = {
                bulkAction: null,
                modalHeader: 'Confirm Re-review',
                selectedReviewEntity: selectedReviewEntity,
                modalInfoText: BATCH_ENTITY_BULK_REVIEW_MODAL_INFO['RE_REVIEW'],
                modalHelpElementId: BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID['BATCH_ACTION']['RE_REVIEW']
            };
            setTimeout(() => {
                openCommonModal(this.ENTITY_BATCH_MODAL_ID);
            }, 200);
        } else {
            this.openValidationModal();
        }
    }

    private openValidationModal(): void {
        this.isOpenValidationModal = true;
        setTimeout(() => {
            openCommonModal(this.ENTITY_BATCH_REVIEW_VALIDATION_MODAL_ID);
        }, 200);
    }

    private closeValidationModal(): void {
        closeCommonModal(this.ENTITY_BATCH_REVIEW_VALIDATION_MODAL_ID);
        setTimeout(() => {
            this.isOpenValidationModal = false;
        }, 200);
    }

    selectAllEntities(): void {
        if (this.isAllEntitySelected) {
            this.selectedCount = 0;
            this.entityList.forEach(entity => {
                if (this.getIsReviewPending(entity?.entireDetails.adminReviewStatusCode)) {
                    this.selectedCount++;
                    entity.inputOptions.CHECK_BOX.defaultValue = true;
                    this.selectedEntities[entity?.entireDetails.entityStageDetailId] = entity?.entireDetails;
                }
            });
        } else {
            this.clearSelectAll();
        }
        this.isShowCreateWithDnB = Object.values(this.selectedEntities).every(entityDetails => entityDetails.isExactDunsMatch === true);
    }

    sharedEntityCardActions(event: SharedEntityCardEvents): void {
        switch (event.action) {
            case 'REVIEW':
                this.selectedReviewEntity = event.content.entityCardConfig.entireDetails;
                break;
            case 'RE_REVIEW':
                this.openReReviewConfirmModal(event.content.entityCardConfig.entireDetails);
                break;
            case 'CHECK_BOX':
                this.toggleEntitySelection(event.content.entityCardConfig.entireDetails);
                break
            case 'VIEW':
                openInNewTab('manage-entity/entity-overview?', ['entityManageId'], [event.content.sharedEntityDetails.entityId]);
                break;
            default: return;
        }
    }

    closeReviewSlider(event: BatchReviewConfirmation | null): void {
        this.selectedReviewEntity = null;
        if (event?.reviewAction) {
            this.$fetchBatchDetails.next();
        }
    }

    // Updates savedBatchEntityRO and triggers batch detail fetch
    filterSearchDataChange(event: FilterSearchAction): void {
        this.filterSearchData = event;
        const { searchText, currentMatchFilter, currentReviewFilter, currentAdminActionFilter } = this.filterSearchData;
        this.savedBatchEntityRO = {
            pageNumber: 1,
            searchKeyword: searchText,
            totalCount: PAGINATION_LIMIT,
            adminActionCodes: currentAdminActionFilter,
            adminReviewStatusCodes: currentReviewFilter,
            batchId: this._entityBatchService.currentBatchId,
            isNoDunsMatch: currentMatchFilter?.includes(BATCH_MATCH_TYPE.IS_NO_DUNS_MATCH),
            isExactDunsMatch: currentMatchFilter?.includes(BATCH_MATCH_TYPE.IS_EXACT_DUNS_MATCH),
            isDuplicateInBatch: currentMatchFilter?.includes(BATCH_MATCH_TYPE.IS_DUPLICATE_IN_BATCH),
            isMultipleDunsMatch: currentMatchFilter?.includes(BATCH_MATCH_TYPE.IS_MULTIPLE_DUNS_MATCH),
            isDuplicateInEntitySys: currentMatchFilter?.includes(BATCH_MATCH_TYPE.IS_DUPLICATE_IN_ENTITY_DB)
        };
        this.$fetchBatchDetails.next();
    }

    actionsOnPageChange(pageCount: number): void {
        if (this.savedBatchEntityRO.pageNumber !== pageCount) {
            this.savedBatchEntityRO.pageNumber = pageCount;
            this.$fetchBatchDetails.next();
        }
    }

    openBatchConfirmModal(bulkAction: BatchBulkActionType): void {
        this.confirmationModal = {
            bulkAction: bulkAction,
            modalHeader: BATCH_ENTITY_BULK_REVIEW_MODAL_HEADER[bulkAction],
            modalHelpElementId: BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID['BATCH_ACTION'][bulkAction],
            modalInfoText: BATCH_ENTITY_BULK_REVIEW_MODAL_INFO[bulkAction].replace('{{count}}', `<strong>${this.selectedCount?.toString()}</strong>`)
        };
        setTimeout(() => {
            openCommonModal(this.ENTITY_BATCH_MODAL_ID);
        }, 200);
    }

    batchConfirmationModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.closeBatchConfirmModal();
            case 'PRIMARY_BTN':
                return this.confirmationModal.bulkAction ? this.reviewActions() : this.openReReviewSlider();
            default: break;
        }
    }

    validationModalActions(modalAction: ModalActionEvent): void {
        if (modalAction.action) {
            this.closeValidationModal();
        }
    }

}
