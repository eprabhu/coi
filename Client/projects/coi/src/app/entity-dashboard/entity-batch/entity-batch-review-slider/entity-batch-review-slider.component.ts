import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { closeCoiSlider, closeCommonModal, deepCloneObject, openCoiSlider, openCommonModal, openInNewTab, resetRadioButtons } from '../../../common/utilities/custom-utilities';
import { EntityDetailsCardConfig, BatchEntityDunsMatch, SharedEntityCardEvents, BatchEntityDetails, EntityBatchDetails } from '../../../common/services/coi-common.interface';
import { CommonService } from '../../../common/services/common.service';
import { BATCH_ENTITY_DETAILS_CARD_FOOTER_ORDER, BATCH_ENTITY_DETAILS_CARD_ORDER, BATCH_ENTITY_REVIEW_STATUS_BADGE, BATCH_REVIEW_ACTION_TYPE_CODE, ENTITY_SOURCE_TYPE_CODE, COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, ENTITY_RIGHTS } from '../../../app-constants';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { EntityDetails } from '../../../entity-management-module/shared/entity-interface';
import { BatchReviewConfirmation, BatchReviewStepType, BatchReviewActionType, BatchEntityDuplicateRO, CreateImportEntityRO } from '../services/entity-batch.interface';
import { EntityBatchService } from '../services/entity-batch.service';
import { BATCH_ENTITY_CONFIRMATION_TEXT, BATCH_ENTITY_DUNS_STEP_EXCLUDE_INFO_TEXT, BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID, BATCH_ENTITY_REVIEW_MODAL_HEADER, BATCH_ENTITY_REVIEW_MODAL_INFO, BATCH_ENTITY_REVIEW_SLIDER_HEADER, BATCH_ENTITY_REVIEW_SLIDER_INFO, BATCH_ENTITY_SOURCE_SELECTED_EXCLUDE_INFO_TEXT, SUB_SECTION_CODES } from '../services/entity-batch-constants';
import { getMailingAddressString } from '../../../entity-management-module/entity-management.service';

@Component({
    selector: 'app-entity-batch-review-slider',
    templateUrl: './entity-batch-review-slider.component.html',
    styleUrls: ['./entity-batch-review-slider.component.scss']
})
export class EntityBatchReviewSliderComponent implements OnInit, OnDestroy {

    @Input() batchDetails = new EntityBatchDetails();
    @Input() batchEntityDetails = new BatchEntityDetails();
    @Output() closeSlider = new EventEmitter<BatchReviewConfirmation>();

    isSaving = false;
    isLoading = false;
    primaryAddress = '';
    isOpenSlider = false;
    isDisableRadioBtn = true;
    canViewCoiEntity = false;
    isDisableProceedBtn = true;
    isOpenValidationModal = false;
    isSourceSelectedEntity = false;
    $subscriptions: Subscription[] = [];
    confirmationModal = new BatchReviewConfirmation();
    sourceSelectedValidateList: EntityDetailsCardConfig[] = [];
    currentReviewStep: BatchReviewStepType = 'BATCH_DUPLICATES';
    
    ENTITY_SOURCE_TYPE_CODE = ENTITY_SOURCE_TYPE_CODE;
    SUB_SECTION_CODES = SUB_SECTION_CODES;
    BATCH_REVIEW_ACTION_TYPE_CODE = BATCH_REVIEW_ACTION_TYPE_CODE;
    BATCH_ENTITY_CONFIRMATION_TEXT = BATCH_ENTITY_CONFIRMATION_TEXT;
    BATCH_ENTITY_DETAILS_CARD_ORDER = BATCH_ENTITY_DETAILS_CARD_ORDER;
    BATCH_ENTITY_REVIEW_SLIDER_INFO = BATCH_ENTITY_REVIEW_SLIDER_INFO;
    BATCH_ENTITY_REVIEW_STATUS_BADGE = BATCH_ENTITY_REVIEW_STATUS_BADGE;
    BATCH_ENTITY_REVIEW_SLIDER_HEADER = BATCH_ENTITY_REVIEW_SLIDER_HEADER;
    BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID = BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID;
    BATCH_ENTITY_DETAILS_CARD_FOOTER_ORDER = BATCH_ENTITY_DETAILS_CARD_FOOTER_ORDER;
    BATCH_ENTITY_SOURCE_SELECTED_EXCLUDE_INFO_TEXT = BATCH_ENTITY_SOURCE_SELECTED_EXCLUDE_INFO_TEXT;
    
    BATCH_ENTITY_REVIEW_SLIDER_ID = 'batch-entity-review-slider';
    ENTITY_BATCH_CONFIRM_MODAL_ID = 'coi-batch-entity-confirm-modal';
    SOURCE_SELECTED_VALIDATION_MODAL_ID = 'coi-batch-entity-source-selected-modal';
    confirmationModalConfig = new CommonModalConfig(this.ENTITY_BATCH_CONFIRM_MODAL_ID, 'Confirm', 'Cancel', '');
    validationModalConfig = new CommonModalConfig(this.SOURCE_SELECTED_VALIDATION_MODAL_ID, '', 'Close', 'xl');

    duplicateEntity: Record<BatchReviewStepType, EntityDetailsCardConfig[] | any[]> = {
        BATCH_DUPLICATES: null,
        DB_DUPLICATES: null,
        DNB_MATCHES: null
    }
    currentReviewAction: Record<BatchReviewStepType, BatchReviewActionType> = {
        BATCH_DUPLICATES: null,
        DB_DUPLICATES: null,
        DNB_MATCHES: null
    };
    selectedEntityCard: Record<BatchReviewStepType, EntityDetailsCardConfig> = {
        BATCH_DUPLICATES: null,
        DB_DUPLICATES: null,
        DNB_MATCHES: null
    };

    constructor(private _commonService: CommonService, private _entityBatchService: EntityBatchService) {}

    ngOnInit(): void {
        this.setPermissions();
        this.validationModalConfig.styleOptions.closeBtnClass = 'invisible';
        this.isSourceSelectedEntity = this.batchEntityDetails?.adminActionType?.adminActionCode == BATCH_REVIEW_ACTION_TYPE_CODE.SOURCE_SELECTED;
        // if review action is source selected then go to db duplicate step. else go to batch duplicate step.
        if (this.isSourceSelectedEntity) {
            this.getDbEntityDuplicatesById();
        } else {
            this.getBatchEntityDuplicatesById();
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private setPermissions(): void {
        this.canViewCoiEntity = this._commonService.getAvailableRight(ENTITY_RIGHTS);
    }

    private clearReviewSlider(reviewDetails: BatchReviewConfirmation = null): void {
        this.isOpenSlider = false;
        this.closeSlider.emit(reviewDetails);
    }

    private openReviewSlider(currentReviewStep: BatchReviewStepType): void {
        this.currentReviewStep = currentReviewStep;
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            const { srcAddressLine1, srcAddressLine2 } = this.batchEntityDetails;
            this.primaryAddress = [srcAddressLine1, srcAddressLine2].filter(Boolean).join(', ');
            setTimeout(() => {
                openCoiSlider(this.BATCH_ENTITY_REVIEW_SLIDER_ID);
            }, 100);
        }
    }

    private getBatchEntityDuplicatesById(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.$subscriptions.push(
                this._entityBatchService.getBatchEntityDuplicatesById(this.batchEntityDetails.entityStageDetailId)
                    .subscribe((res: BatchEntityDetails[]) => {
                        this.setDefaultBtnState('DISABLE_RADIO', 'SHOW_PROCEED');
                        this.duplicateEntity.BATCH_DUPLICATES = this.getBatchEntityList(res);
                        this.duplicateEntity.BATCH_DUPLICATES.length ? this.openReviewSlider('BATCH_DUPLICATES') : this.getDbEntityDuplicatesById();
                    }, (error: any) => {
                        this.handleErrorAndClearSlider();
                    }));
        }
    }

    private getDbEntityDuplicatesById(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.$subscriptions.push(
                this._entityBatchService.getDbEntityDuplicatesById(this.batchEntityDetails.entityStageDetailId)
                    .subscribe((res: EntityDetails[] | any) => {
                        this.setDefaultBtnState('DISABLE_RADIO', 'SHOW_PROCEED');
                        this.duplicateEntity.DB_DUPLICATES = this.getDbEntityList(res);
                        this.handleDbDuplicateCheck();
                    }, (error: any) => {
                        this.handleErrorAndClearSlider();
                    }));
        }
    }

    private getDNBEntityDuplicatesById(): void {
        if (!this.isLoading) {
            this.isLoading = true;
            this.$subscriptions.push(
                this._entityBatchService.getDNBEntityDuplicatesById(this.batchEntityDetails.entityStageDetailId)
                    .subscribe((res: BatchEntityDunsMatch[]) => {
                        this.setDefaultBtnState('SHOW_RADIO', 'DISABLE_PROCEED');
                        this.duplicateEntity.DNB_MATCHES = this.getDNBEntityList(res);
                        this.openReviewSlider('DNB_MATCHES');
                    }, (error: any) => {
                        this.handleErrorAndClearSlider();
                    }));
        }
    }

    private setDefaultBtnState(radioBtnState: 'DISABLE_RADIO' | 'SHOW_RADIO', proceedBtnState: 'DISABLE_PROCEED' | 'SHOW_PROCEED'): void {
        this.isLoading = false;
        this.isDisableRadioBtn = radioBtnState === 'DISABLE_RADIO';
        this.isDisableProceedBtn = proceedBtnState === 'DISABLE_PROCEED';
    }

    private handleErrorAndClearSlider(): void {
        this.isLoading = false;
        if (!this.isOpenSlider) {
            this.clearReviewSlider();
        }
        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    private handleErrorAndConcurrency(error: any): void {
        this.isSaving = false;
        if (error.status === 405) {
            this.closeBatchConfirmModal();
            this._commonService.concurrentUpdateAction = 'batch entity';
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
    }

    private handleSuccessAndCloseSlider(REVIEW_DETAILS: any): void {
        this.isSaving = false;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Review successfully completed.');
        this.closeBatchConfirmModal();
        this.closeReviewSlider('CLOSE_AND_CLEAR', REVIEW_DETAILS);
    }

    private getBatchEntityList(batchEntityDetails: BatchEntityDetails[]): EntityDetailsCardConfig[] {
        return batchEntityDetails?.map(entity => {
            const CARD_CONFIG = new EntityDetailsCardConfig();
            CARD_CONFIG.entireDetails = entity;
            CARD_CONFIG.sharedEntityDetails = {
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
                organizationId: this.batchDetails?.batchSrcTypeCode == ENTITY_SOURCE_TYPE_CODE.ORGANIZATION ? entity?.srcDataCode : null,
                sponsorCode: this.batchDetails?.batchSrcTypeCode == ENTITY_SOURCE_TYPE_CODE.SPONSOR ? entity?.srcDataCode : null,
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
                adminActionType: entity?.adminActionType
            };
            CARD_CONFIG.displaySections = ['FOOTER'];
            CARD_CONFIG.uniqueId = entity?.entityStageDetailId;
            CARD_CONFIG.cardType = 'BATCH_ENTITY';
            CARD_CONFIG.inputOptions = {
                SET_AS_ORIGINAL: { visible: true, defaultValue: false, inputType: 'TOGGLE' }
            };
            return CARD_CONFIG;
        }) || [];
    }

    private getDbEntityList(batchEntityDetails: EntityDetails[]): EntityDetailsCardConfig[] {
        return batchEntityDetails?.map(entity => {
            const CARD_CONFIG = new EntityDetailsCardConfig();
            CARD_CONFIG.entireDetails = entity;
            CARD_CONFIG.sharedEntityDetails = {
                entityId: entity?.entityId,
                entityName: entity?.entityName,
                dunsNumber: entity?.dunsNumber,
                ueiNumber: entity?.ueiNumber,
                cageNumber: entity?.cageNumber,
                primaryAddressLine1: entity?.primaryAddressLine1,
                primaryAddressLine2: entity?.primaryAddressLine2,
                state: entity?.state,
                city: entity?.city,
                postCode: entity?.postCode,
                country: entity?.country,
                foreignName: entity?.foreignName,
                foreignNames: entity?.foreignNames,
                priorName: entity?.priorName,
                ownershipType: entity?.entityOwnershipType?.description,
                organizationId: entity?.organizationId,
                sponsorCode: entity?.sponsorCode,
                website: entity?.websiteAddress,
                businessEntityType: entity?.entityBusinessType,
                isForeign: entity?.isForeign,
                entityFamilyTreeRoles: entity?.entityFamilyTreeRoles?.map(role => ({
                    description: role.familyRoleType?.description,
                    typeCode: role.familyRoleTypeCode,
                }))
            };
            CARD_CONFIG.uniqueId = entity?.entityId;
            CARD_CONFIG.displaySections = [];
            CARD_CONFIG.cardType = 'DB_ENTITY';
            CARD_CONFIG.inputOptions = {
                SET_AS_ORIGINAL: { visible: true, defaultValue: false, inputType: 'TOGGLE' },
                VIEW: { visible: this.canViewCoiEntity }
            };
            return CARD_CONFIG;
        }) || [];
    }

    private getDNBEntityList(batchEntityDetails: BatchEntityDunsMatch[]): EntityDetailsCardConfig[] {
        return batchEntityDetails?.map(entity => {
            const CARD_CONFIG = new EntityDetailsCardConfig();
            CARD_CONFIG.entireDetails = entity;
            CARD_CONFIG.sharedEntityDetails = {
                entityName: entity?.entityName,
                dunsNumber: entity?.dunsNumber,
                ueiNumber: entity?.ueiNumber,
                cageNumber: entity?.cageNumber,
                primaryAddressLine1: entity?.primaryAddressLine1,
                primaryAddressLine2: entity?.primaryAddressLine2,
                state: entity?.state,
                city: entity?.city,
                postCode: entity?.postCode,
                confidenceScore: entity?.confidenceScore,
                ownershipType: entity?.ownershipType,
                businessEntityType: entity?.businessEntityType,
                website: entity?.websiteAddress?.[0]?.url,
                entityFamilyTreeRoles: entity?.corporateLinkage?.familytreeRolesPlayed,
                country: {
                    countryName: entity?.country,
                    countryCode: entity?.countryCode
                },
                entityId: entity?.entityDetails?.entityId,
                mailingAddress: getMailingAddressString(entity?.mailingAddress)
            };
            CARD_CONFIG.uniqueId = entity?.dunsNumber;
            const IS_ALREADY_EXIST_DUNS = !!entity?.entityDetails?.entityId;
            CARD_CONFIG.displaySections = IS_ALREADY_EXIST_DUNS ? ['ALREADY_EXIST_DUNS'] : [];
            CARD_CONFIG.cardType = 'DUNS_MATCH_ENTITY';
            CARD_CONFIG.inputOptions = {
                USE_THIS: { visible: !IS_ALREADY_EXIST_DUNS, defaultValue: false, inputType: 'TOGGLE' }
            };
            return CARD_CONFIG;
        }) || [];
    }

    private getSourceRelatedEntityList(batchEntityDetails: BatchEntityDetails[]): EntityDetailsCardConfig[] {
        return batchEntityDetails?.map(entity => {
            const CARD_CONFIG = new EntityDetailsCardConfig();
            CARD_CONFIG.entireDetails = entity;
            CARD_CONFIG.sharedEntityDetails = {
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
                organizationId: this.batchDetails?.batchSrcTypeCode == ENTITY_SOURCE_TYPE_CODE.ORGANIZATION ? entity?.srcDataCode : null,
                sponsorCode: this.batchDetails?.batchSrcTypeCode == ENTITY_SOURCE_TYPE_CODE.SPONSOR ? entity?.srcDataCode : null,
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
                adminActionType: entity?.adminActionType
            };
            CARD_CONFIG.displaySections = [];
            CARD_CONFIG.columnClass = 'col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl-3';
            CARD_CONFIG.uniqueId = entity?.entityStageDetailId;
            CARD_CONFIG.cardType = 'BATCH_ENTITY';
            CARD_CONFIG.inputOptions = {};
            return CARD_CONFIG;
        }) || [];
    }

    private handleDbDuplicateCheck(): void {
        if (this.duplicateEntity.DB_DUPLICATES.length) {
            this.openReviewSlider('DB_DUPLICATES');
        } else if (this.currentReviewAction['BATCH_DUPLICATES'] === 'LINK_TO_ORIGINAL') {
            this.openBatchConfirmModal('BATCH_DUPLICATES');
        } else {
            this.getDNBEntityDuplicatesById();
        }
    }

    private toggleEntityAction(event: SharedEntityCardEvents): void {
        this.resetReviewRadioActions();
        const ACTON_TYPE = event.action;
        const IS_TOGGLE_ON = event.content.currentValue;
        const SELECTED_ENTITY_DETAILS = event.content.entityCardConfig;
        this.isDisableRadioBtn = ACTON_TYPE === 'SET_AS_ORIGINAL' ? !IS_TOGGLE_ON : IS_TOGGLE_ON;
        this.isDisableProceedBtn = this.getProceedBtnStatus();
        this.duplicateEntity[this.currentReviewStep]?.forEach(entity =>
            entity.inputOptions[ACTON_TYPE].defaultValue = IS_TOGGLE_ON && entity?.uniqueId === SELECTED_ENTITY_DETAILS.uniqueId
        );
    }

    private resetReviewRadioActions(): void {
        this.currentReviewAction[this.currentReviewStep] = null;
        resetRadioButtons('coi-entity-batch-radio');
    }

    /**
     * Executes the review action based on the current review step and action, 
     * determining the appropriate confirmation request object (RO) to send.
     */
    private reviewActions(): void {
        switch (true) {
            case this.confirmationModal.reviewStep === 'BATCH_DUPLICATES' && ['LINK_TO_ORIGINAL', 'EXCLUDE_FROM_CREATION'].includes(this.currentReviewAction['BATCH_DUPLICATES']):
                this.confirmBatchLinkOrExclude(this.getConfirmationRO('BATCH_DUPLICATES'));
                break;

            case this.confirmationModal.reviewStep === 'DB_DUPLICATES' && ['LINK_TO_ORIGINAL', 'EXCLUDE_FROM_CREATION'].includes(this.currentReviewAction['DB_DUPLICATES']):
                this.confirmBatchLinkOrExclude(this.getConfirmationRO('DB_DUPLICATES'));
                break;

            case this.confirmationModal.reviewStep === 'DNB_MATCHES' && this.currentReviewAction['DNB_MATCHES'] === 'EXCLUDE_FROM_CREATION':
                this.confirmBatchLinkOrExclude(this.getConfirmationRO('DNB_MATCHES'));
                break;

            case this.confirmationModal.reviewStep === 'DNB_MATCHES' && this.currentReviewAction['DNB_MATCHES'] === 'CREATION_WITHOUT_DNB':
                this.createImportEntity(this.getCreationRO('CREATION_WITHOUT_DNB'));
                break;

            case this.confirmationModal.reviewStep === 'DNB_MATCHES' && this.selectedEntityCard['DNB_MATCHES'] !== null:
                this.createImportEntity(this.getCreationRO('CREATION_WITH_DNB'));
                break;

            default:
                break;
        }
    }

    /**
     * Generates the confirmation request object (RO) based on the review step.
     * 
     * @param reviewStep - The current review step, such as 'BATCH_DUPLICATES', 'DB_DUPLICATES', or 'DNB_MATCHES'.
     * @returns A BatchEntityDuplicateRO object based on the current action.
     */
    private getConfirmationRO(reviewStep: BatchReviewStepType): BatchEntityDuplicateRO {
        const SELECTED_ENTITY_DETAILS = this.selectedEntityCard[reviewStep]?.sharedEntityDetails;
        return {
            batchId: this.batchEntityDetails?.batchId,
            canReReview: this.batchEntityDetails?.canReReview,
            adminReviewStatusCode: this.batchEntityDetails?.adminActionCode,
            entityId: reviewStep === 'DB_DUPLICATES' ? SELECTED_ENTITY_DETAILS?.entityId : undefined,
            originalEntityDetailId: reviewStep === 'BATCH_DUPLICATES' ? SELECTED_ENTITY_DETAILS?.entityStageDetailId : undefined,
            excludedEntityDetailId: this.currentReviewAction[reviewStep] === 'EXCLUDE_FROM_CREATION' ? this.batchEntityDetails?.entityStageDetailId : undefined,
            duplicateEntityDetailId: this.currentReviewAction[reviewStep] === 'LINK_TO_ORIGINAL' ? this.batchEntityDetails?.entityStageDetailId : undefined,
            entityStageDetailId: this.batchEntityDetails?.entityStageDetailId,
            adminActionCode: this.batchEntityDetails?.adminActionCode,
        };
    }

    private getCreationRO(reviewStep: 'CREATION_WITHOUT_DNB' | 'CREATION_WITH_DNB'): CreateImportEntityRO {
        const DUNS_DETAILS: BatchEntityDunsMatch | null = reviewStep === 'CREATION_WITH_DNB' ? this.confirmationModal.selectedEntityCard.entireDetails : null
        return {
            highestConfidenceCode: DUNS_DETAILS ? DUNS_DETAILS?.confidenceScore : this.batchEntityDetails?.highestConfidenceCode,
            srcAddressLine1: DUNS_DETAILS ? DUNS_DETAILS?.primaryAddressLine1 : this.batchEntityDetails?.srcAddressLine1,
            srcAddressLine2: DUNS_DETAILS ? DUNS_DETAILS?.primaryAddressLine2 : this.batchEntityDetails?.srcAddressLine2,
            srcCountryCode: DUNS_DETAILS ? DUNS_DETAILS?.countryCode : this.batchEntityDetails?.srcCountryCode,
            srcDunsNumber: DUNS_DETAILS ? DUNS_DETAILS?.dunsNumber : this.batchEntityDetails?.srcDunsNumber,
            srcCageNumber: DUNS_DETAILS ? DUNS_DETAILS?.cageNumber : this.batchEntityDetails?.srcCageNumber,
            srcPostalCode: DUNS_DETAILS ? DUNS_DETAILS?.postCode : this.batchEntityDetails?.srcPostalCode,
            srcDataName: DUNS_DETAILS ? DUNS_DETAILS?.entityName : this.batchEntityDetails?.srcDataName,
            srcUei: DUNS_DETAILS ? DUNS_DETAILS?.ueiNumber : this.batchEntityDetails?.srcUei,
            srcState: DUNS_DETAILS ? DUNS_DETAILS?.state : this.batchEntityDetails?.srcState,
            srcCity: DUNS_DETAILS ? DUNS_DETAILS?.city : this.batchEntityDetails?.srcCity,
            createWithDuns: DUNS_DETAILS ? true : false,
            srcEmailAddress: DUNS_DETAILS ? null : this.batchEntityDetails?.srcEmailAddress,
            srcPhoneNumber: DUNS_DETAILS ? null : this.batchEntityDetails?.srcPhoneNumber,
            batchId: this.batchEntityDetails?.batchId,
            groupNumber: this.batchEntityDetails?.groupNumber,
            entityStageDetailId: this.batchEntityDetails?.entityStageDetailId,
            adminActionCode: this.batchEntityDetails?.adminActionCode
        };
    }

    /**
     * Confirms the batch duplicate action by sending a confirmation request.
     * 
     * @param RO - The request object (RO) containing batch entity duplicate details.
     */
    private confirmBatchLinkOrExclude(RO: BatchEntityDuplicateRO): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const REVIEW_DETAILS = deepCloneObject(this.confirmationModal);
            this.$subscriptions.push(
                this._entityBatchService.confirmBatchLinkOrExclude(RO).subscribe(
                    (res: any) => {
                        this.handleSuccessAndCloseSlider(REVIEW_DETAILS);
                    }, (error: any) => {
                        this.handleErrorAndConcurrency(error);
                    }
                )
            );
        }
    }

    private createImportEntity(RO: CreateImportEntityRO): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const REVIEW_DETAILS = deepCloneObject(this.confirmationModal);
            this.$subscriptions.push(
                this._entityBatchService.createImportEntity(RO).subscribe(
                    (res: any) => {
                        this.handleSuccessAndCloseSlider(REVIEW_DETAILS);
                    }, (error: any) => {
                        this.handleErrorAndConcurrency(error);
                    }
                )
            );
        }
    }

    private checkAndOpenValidationModal(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._entityBatchService.validateExcludingSource(this.batchEntityDetails.entityStageDetailId)
                    .subscribe((res: BatchEntityDetails[]) => {
                        this.isSaving = false;
                        this.sourceSelectedValidateList = this.getSourceRelatedEntityList(res);
                        this.openValidationModal();
                    }, (error: any) => {
                        this.handleErrorAndConcurrency(error);
                        this.openValidationModal();
                    }));
        }
    }

    private openValidationModal(): void {
        this.isOpenValidationModal = true;
        this.validationModalConfig.displayOptions.modalSize = this.sourceSelectedValidateList?.length ? 'xl' : 'lg';
        setTimeout(() => {
            openCommonModal(this.SOURCE_SELECTED_VALIDATION_MODAL_ID);
        }, 200);
    }

    private closeValidationModal(): void {
        closeCommonModal(this.SOURCE_SELECTED_VALIDATION_MODAL_ID);
        setTimeout(() => {
            this.isOpenValidationModal = false;
        }, 200);
    }

    /**
     * Handles database duplicates by either setting the review step to 'DB_DUPLICATES' 
     * or calling a function to fetch entity database duplicates.
     */
    private handleDbDuplicates(): void {
        if (this.duplicateEntity.DB_DUPLICATES === null) {
            this.getDbEntityDuplicatesById();
        } else if (this.duplicateEntity.DB_DUPLICATES.length) {
            this.currentReviewStep = 'DB_DUPLICATES';
            this.isDisableRadioBtn = !this.selectedEntityCard['DB_DUPLICATES'];
            this.isDisableProceedBtn = this.getProceedBtnStatus();
        } else {
            this.handleDNBMatches();
        }
    }

    /**
     * Handles DNB matches by either calling a function to fetch DNB entity duplicates 
     * or setting the review step to 'DNB_MATCHES'.
     */
    private handleDNBMatches(): void {
        if (this.duplicateEntity.DNB_MATCHES === null) {
            this.getDNBEntityDuplicatesById();
        } else {
            this.currentReviewStep = 'DNB_MATCHES';
            this.isDisableRadioBtn = !!this.selectedEntityCard['DNB_MATCHES'];
            this.isDisableProceedBtn = this.getProceedBtnStatus();
        }
    }

    /**
     * Updates the current review step and disables the radio button based on the action.
     * @param step The review step to navigate to.
     * @returns true if the step was updated, false otherwise.
     */
    private updateReviewStep(step: 'DB_DUPLICATES' | 'BATCH_DUPLICATES'): boolean {
        if (this.duplicateEntity[step]?.length) {
            this.currentReviewStep = step;
            this.isDisableRadioBtn = !this.selectedEntityCard[this.currentReviewStep];
            this.isDisableProceedBtn = this.getProceedBtnStatus();
            return true;
        }
        return false;
    }

    /**
     * Determines if the batch confirmation modal should be opened based on various conditions
     * related to the current review step and action. If a specific combination of actions
     * and review steps is found, it returns `true`.
     *
     * @returns `true` if the batch confirmation modal should be opened; otherwise, `false`.
     */
    private shouldOpenBatchConfirmModal(): boolean {
        const CURRENT_STEP = this.currentReviewStep;
        const CURRENT_REVIEW_ACTION = this.currentReviewAction;
        const IS_EXCLUDE_FROM_CREATION = CURRENT_REVIEW_ACTION[CURRENT_STEP] === 'EXCLUDE_FROM_CREATION';
        const IS_DNB_MATCHES_WITH_CREATION = CURRENT_STEP === 'DNB_MATCHES' && this.selectedEntityCard['DNB_MATCHES'] !== null;
        const IS_DNB_MATCHES_WITHOUT_CREATION = CURRENT_STEP === 'DNB_MATCHES' && CURRENT_REVIEW_ACTION['DNB_MATCHES'] === 'CREATION_WITHOUT_DNB';
        const IS_DB_DUPLICATES_LINK_TO_ORIGINAL = CURRENT_STEP === 'DB_DUPLICATES' && CURRENT_REVIEW_ACTION['DB_DUPLICATES'] === 'LINK_TO_ORIGINAL';
        const IS_DB_DUPLICATES_EMPTY = CURRENT_STEP === 'DB_DUPLICATES' && CURRENT_REVIEW_ACTION['DB_DUPLICATES'] === null;
        const IS_BATCH_DUPLICATES_LINK_TO_ORIGINAL = CURRENT_REVIEW_ACTION['BATCH_DUPLICATES'] === 'LINK_TO_ORIGINAL';
        const IS_DB_DUPLICATES_LENGTH_EMPTY = this.duplicateEntity['DB_DUPLICATES'] !== null && !this.duplicateEntity['DB_DUPLICATES'].length;
        const IS_BATCH_DUPLICATE_AND_DB_DUPLICATE_EMPTY = CURRENT_STEP === 'BATCH_DUPLICATES' && IS_BATCH_DUPLICATES_LINK_TO_ORIGINAL && IS_DB_DUPLICATES_LENGTH_EMPTY;
        // Determine if modal should be opened and call the method accordingly
        if (IS_BATCH_DUPLICATES_LINK_TO_ORIGINAL && IS_DB_DUPLICATES_EMPTY) {
            this.openBatchConfirmModal('BATCH_DUPLICATES');
            return true;
        }
        if (IS_EXCLUDE_FROM_CREATION || IS_DB_DUPLICATES_LINK_TO_ORIGINAL ||
            IS_DNB_MATCHES_WITHOUT_CREATION || IS_DNB_MATCHES_WITH_CREATION ||
            IS_BATCH_DUPLICATE_AND_DB_DUPLICATE_EMPTY) {
            this.openBatchConfirmModal();
            return true;
        }
        return false;
    }

    /**
     * Checks whether the button should be disabled based on the current review action and 
     * the presence of selected entity cards.
     * 
     * @returns {boolean} True if the button should be disabled, otherwise false.
     */
    private getProceedBtnStatus(): boolean {
        const DUPLICATE_ACTIONS = ['LINK_TO_ORIGINAL', 'EXCLUDE_FROM_CREATION'];
        const DNB_ACTIONS = ['CREATION_WITHOUT_DNB', 'EXCLUDE_FROM_CREATION'];
        
        const IS_DUPLICATE_ACTIONS = DUPLICATE_ACTIONS.includes(this.currentReviewAction?.[this.currentReviewStep]);
        const IS_DNB_MATCHES_EXCLUDED = DNB_ACTIONS.includes(this.currentReviewAction?.['DNB_MATCHES']);
        const IS_SELECTED_ENTITY_CARD_PRESENT = this.selectedEntityCard?.[this.currentReviewStep];
        const IS_NOT_DNB_MATCHES_CARD_PRESENT = !this.selectedEntityCard?.['DNB_MATCHES'];

        return (
            (!IS_DUPLICATE_ACTIONS && IS_SELECTED_ENTITY_CARD_PRESENT && this.currentReviewStep !== 'DNB_MATCHES') ||
            (!IS_DNB_MATCHES_EXCLUDED && IS_NOT_DNB_MATCHES_CARD_PRESENT && this.currentReviewStep === 'DNB_MATCHES')
        );
    }

    /**
     * Opens the batch confirmation modal with configured details based on the review step and action.
     * Sets modal properties like header, info text, and display options according to the
     * selected entity card and review action. If the review step requires DNB matches,
     * adjusts modal size and button labels accordingly.
     * 
     * @param reviewStep - Optional; defaults to the current review step (`this.currentReviewStep`).
     */
    private openBatchConfirmModal(reviewStep: BatchReviewStepType = this.currentReviewStep): void {
        const IS_CREATE_WITH_DNB = this.selectedEntityCard['DNB_MATCHES'];
        const IS_DUNS_MATCH_STEP = reviewStep === 'DNB_MATCHES';
        const IS_BATCH_DUPLICATE_STEP = reviewStep === 'BATCH_DUPLICATES';
        const CURRENT_REVIEW_ACTION = IS_DUNS_MATCH_STEP && IS_CREATE_WITH_DNB ? 'CREATION_WITH_DNB' : this.currentReviewAction[reviewStep];
        const IS_DUNS_AND_EXCLUDE_CREATION = IS_DUNS_MATCH_STEP && CURRENT_REVIEW_ACTION ==='EXCLUDE_FROM_CREATION';
        const DUPLICATE_SOURCE = IS_BATCH_DUPLICATE_STEP ? 'batch' : 'entity database';
    
        this.confirmationModal = {
            reviewStep: reviewStep,
            reviewAction: CURRENT_REVIEW_ACTION,
            modalHeader: BATCH_ENTITY_REVIEW_MODAL_HEADER[CURRENT_REVIEW_ACTION],
            modalHelpSubSectionId: SUB_SECTION_CODES[reviewStep],
            modalHelpElementId: BATCH_ENTITY_REVIEW_HELP_ELEMENT_ID[reviewStep][CURRENT_REVIEW_ACTION],
            modalInfoText: IS_DUNS_AND_EXCLUDE_CREATION ? BATCH_ENTITY_DUNS_STEP_EXCLUDE_INFO_TEXT : (BATCH_ENTITY_REVIEW_MODAL_INFO[CURRENT_REVIEW_ACTION].replace('{{duplicateSource}}', DUPLICATE_SOURCE)),
            selectedEntityCard: this.selectedEntityCard[reviewStep]
        };
        if (IS_DUNS_MATCH_STEP && ['CREATION_WITHOUT_DNB', 'EXCLUDE_FROM_CREATION'].includes(this.currentReviewAction['DNB_MATCHES'])) {
            this.confirmationModalConfig.displayOptions.modalSize = '';
        } else {
            this.confirmationModalConfig.displayOptions.modalSize = 'xl';
            this.confirmationModal.selectedEntityCard.columnClass = 'col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl-3';
            this.confirmationModal.selectedEntityCard.inputOptions = {};
            this.confirmationModal.selectedEntityCard.displaySections = [];
        }
        const IS_CREATE_WITHOUT_DNB = this.currentReviewAction['DNB_MATCHES'] === 'CREATION_WITHOUT_DNB';
        const IS_CREATE_MODAL = IS_DUNS_MATCH_STEP && (IS_CREATE_WITHOUT_DNB || IS_CREATE_WITH_DNB);
        this.confirmationModalConfig.namings.primaryBtnName = IS_CREATE_MODAL ? 'Create Entity' : 'Confirm';
        setTimeout(() => {
            openCommonModal(this.ENTITY_BATCH_CONFIRM_MODAL_ID);
        }, 200);
    }

    private closeBatchConfirmModal(): void {
        closeCommonModal(this.ENTITY_BATCH_CONFIRM_MODAL_ID);
        setTimeout(() => {
            this.confirmationModal = new BatchReviewConfirmation();
        }, 200);
    }

    /**
     * Navigates to the previous review step based on available duplicate entities.
     * Updates the `currentReviewStep` and disables radio buttons as necessary.
     */
    navigateToPrev(): void {
        if (this.currentReviewStep === 'DNB_MATCHES') {
            // Try to update to DB_DUPLICATES first
            if (!this.updateReviewStep('DB_DUPLICATES')) {
                // If DB_DUPLICATES is not valid, update to BATCH_DUPLICATES
                this.updateReviewStep('BATCH_DUPLICATES');
            }
        } else if (this.currentReviewStep === 'DB_DUPLICATES') {
            // Directly update to BATCH_DUPLICATES if currently in DB_DUPLICATES
            this.updateReviewStep('BATCH_DUPLICATES');
        }
    }

    /**
     * Proceeds to the next step in the review process based on the current review step.
     * If specific conditions are met, it opens the batch confirmation modal; otherwise,
     * it advances to the next step in the review workflow.
     */
    proceedToNextStep(): void {
        // only for reviewing source selected exclude entity
        const IS_REVIEW_ACTION_EXCLUDE = this.currentReviewAction[this.currentReviewStep] === 'EXCLUDE_FROM_CREATION';
        const IS_SHOW_VALIDATION_MODAL = this.isSourceSelectedEntity && IS_REVIEW_ACTION_EXCLUDE;
        if (IS_SHOW_VALIDATION_MODAL) {
            return this.checkAndOpenValidationModal(); 
        }

        // for confirmation cases
        if (this.shouldOpenBatchConfirmModal()) {
            return; // Modal opened, exit early
        }

        // Handle next step based on `currentReviewStep`
        switch (this.currentReviewStep) {
            case 'BATCH_DUPLICATES':
                this.handleDbDuplicates();
                break;
            case 'DB_DUPLICATES':
                this.handleDNBMatches();
                break;
        }
    }

    closeReviewSlider(action: 'CLEAR' | 'CLOSE_AND_CLEAR' = 'CLEAR', reviewDetails: BatchReviewConfirmation = null): void {
        if (action === 'CLOSE_AND_CLEAR') {
            closeCoiSlider(this.BATCH_ENTITY_REVIEW_SLIDER_ID);
        }
        setTimeout(() => {
            this.clearReviewSlider(reviewDetails);
        }, 500);
    }

    changeAction(type: 'LINK_TO_ORIGINAL' | 'EXCLUDE_FROM_CREATION' | 'CREATION_WITHOUT_DNB'): void {
        this.currentReviewAction[this.currentReviewStep] = type;
        this.isDisableProceedBtn = this.getProceedBtnStatus();
    }

    sharedEntityCardActions(event: SharedEntityCardEvents): void {
        switch (event.action) {
            case 'USE_THIS':
            case 'SET_AS_ORIGINAL':
                this.selectedEntityCard[this.currentReviewStep] = event.content.currentValue ? deepCloneObject(event.content.entityCardConfig) : null;
                this.currentReviewAction[this.currentReviewStep] = event.content.currentValue ? this.currentReviewAction[this.currentReviewStep] : null;
                this.toggleEntityAction(event);
                break;
            case 'VIEW':
                openInNewTab('manage-entity/entity-overview?', ['entityManageId'], [event.content.sharedEntityDetails.entityId]);
                break;
            default: break;
        }
    }

    batchConfirmationModalActions(modalAction: ModalActionEvent): void {
        switch (modalAction.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN':
                return this.closeBatchConfirmModal();
            case 'PRIMARY_BTN':
                return this.reviewActions();
            default: break;
        }
    }

    validationModalActions(modalAction: ModalActionEvent): void {
        if (modalAction.action) {
            this.closeValidationModal();
        }
    }

}
