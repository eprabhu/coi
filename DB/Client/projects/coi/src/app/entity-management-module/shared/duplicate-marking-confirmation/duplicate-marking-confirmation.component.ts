import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { DataStoreEvent, DuplicateMarkingAPIReq, DupMarkingModalConfig, EntityCardDetails, EntityDetails } from '../entity-interface';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from 'projects/fibi/src/app/common/utilities/subscription-handler';
import { DuplicateMarkingConfirmationService } from './duplicate-marking-confirmation.service';
import { ActivatedRoute } from '@angular/router';
import { closeCommonModal, isEmptyObject, openCommonModal } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, ENTITY_VERIFICATION_STATUS, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { EntityDetailsCardConfig } from '../../../common/services/coi-common.interface';
import { EntityManagementService } from '../../entity-management.service';

@Component({
    selector: 'app-duplicate-marking-confirmation',
    templateUrl: './duplicate-marking-confirmation.component.html',
    styleUrls: ['./duplicate-marking-confirmation.component.scss'],
    providers: [DuplicateMarkingConfirmationService]
})

export class DuplicateMarkingConfirmationComponent implements OnInit, OnChanges, OnDestroy {

    @Input() dupMarkingModalConfig = new DupMarkingModalConfig();
    @Input() duplicateEntityDetails = new EntityCardDetails();
    @Output() emitAPISuccess = new EventEmitter<boolean>();

    $subscriptions: Subscription[] = [];
    entityCardConfig = new EntityDetailsCardConfig();
    description: string;
    mandatoryList = new Map();
    entityDetails: EntityDetails = new EntityDetails();
    ENTITY_DUPLICATE_MARKING_MODAL_ID = 'entity_duplicate_marking';
    originalEntityName: string;
    isSaving = false;

    constructor(private _dupMarkingService: DuplicateMarkingConfirmationService, private _entityManagementService: EntityManagementService,
        private _route: ActivatedRoute, private _commonService: CommonService, private _dataStorService: EntityDataStoreService) { }

    ngOnInit(): void {
        this.listenDataChangeFromStore();
        this.getDataFromStore();
    }

    ngOnChanges(): void {
        if (this.duplicateEntityDetails && !isEmptyObject(this.duplicateEntityDetails) && this.duplicateEntityDetails.entityId) {
            this.entityCardConfig.sharedEntityDetails = this.duplicateEntityDetails;
            this.entityCardConfig.cardType = 'DB_ENTITY';
            this.entityCardConfig.uniqueId = 'duplicate-pop';
            this.description = '';
            this.mandatoryList.clear();
            openCommonModal(this.ENTITY_DUPLICATE_MARKING_MODAL_ID);
        }
    }

    checkMandatory(): void {
        this.mandatoryList.clear();
        if (!this.description) {
            this.mandatoryList.set('description', 'Please enter the description.');
        }
    }

    private confirmAndMarkAsDuplicate(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this._entityManagementService.verifyEntity(this.entityDetails.entityId)
                    .subscribe(async (res: any) => {
                        this.isSaving = false;
                        this.setEntityAsDuplicate();
                    }, (_error: any) => {
                        this.isSaving = false;
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Entity duplicate marking failed, please try again.');
                    }));
        }   
    }
    
    private setEntityAsDuplicate(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            const IS_MODIFYING_ENTITY = this.entityDetails?.entityStatusType?.entityStatusTypeCode == ENTITY_VERIFICATION_STATUS.MODIFYING;
            this.$subscriptions.push(this._dupMarkingService.markAsDuplicate(this.getRequestObj()).subscribe((data: any) => {
                this.entityDetails.entityDocumentStatusType.documentStatusTypeCode = '3';
                this.entityDetails.entityDocumentStatusType.description = 'Duplicate';
                this.entityDetails.documentStatusTypeCode = '3';
                this.entityDetails.originalEntityId = this.duplicateEntityDetails.entityId;
                this.originalEntityName = this.duplicateEntityDetails.entityName;
                this.isSaving = false;
                this._commonService.hideSuccessErrorToast();
                this.clearValuesAndCloseModal('UPDATE_STORE_AND_EMIT');
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entity successfully marked as duplicate.');
                if (IS_MODIFYING_ENTITY) { this.reloadEntity() };
            }, err => {
                this.isSaving = false;
                if (IS_MODIFYING_ENTITY) {
                    this.reloadEntity();
                    this.clearValuesAndCloseModal('CLEAR_AND_EMIT');
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Entity duplicate marking failed, please try again from more action.');
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Entity duplicate marking failed, please try again.');
                };
            }
            ));
        }
    }

    private reloadEntity(): void {
        setTimeout(() => {
            this._commonService.$globalEventNotifier.next({ uniqueId: 'RELOAD_GLOBAL_ENTITY', content: { entityId: this.entityDetails?.entityId } });
        }, 200);
    }

    validateEntityAndProceedDuplicate(): void {
        this.checkMandatory();
        if (!this.mandatoryList.size && !this.isSaving) {
            const IS_MODIFYING_ENTITY = this.entityDetails?.entityStatusType?.entityStatusTypeCode == ENTITY_VERIFICATION_STATUS.MODIFYING;
            IS_MODIFYING_ENTITY ? this.confirmAndMarkAsDuplicate() : this.setEntityAsDuplicate();
        }
    }

    clearValuesAndCloseModal(type: 'UPDATE_STORE_AND_EMIT' | 'CLEAR_AND_EMIT' | 'CLEAR_AND_CLOSE' = 'CLEAR_AND_CLOSE'): void {
        closeCommonModal(this.ENTITY_DUPLICATE_MARKING_MODAL_ID);
        setTimeout(() => {
            this.description = '';
            this.mandatoryList.clear();
            this.entityCardConfig = new EntityDetailsCardConfig();
            if (['UPDATE_STORE_AND_EMIT', 'CLEAR_AND_EMIT'].includes(type)) {
                this.emitAPISuccess.emit(true);
            }
            if (type === 'UPDATE_STORE_AND_EMIT') {
                this._dataStorService.updateStore(['entityDetails', 'originalName'], { entityDetails: this.entityDetails, originalName: this.originalEntityName });
            }
        }, 200);
    }

    getRequestObj(): DuplicateMarkingAPIReq {
        const REQOBJ = new DuplicateMarkingAPIReq();
        REQOBJ.originalEntityId = this.duplicateEntityDetails.entityId;
        REQOBJ.duplicateEntityId = this._route.snapshot.queryParamMap.get('entityManageId');
        REQOBJ.description = this.description;
        return REQOBJ;
    }

    private getDataFromStore(): any {
        const ENTITY_DATA = this._dataStorService.getData();
        if (ENTITY_DATA && !isEmptyObject(ENTITY_DATA)) {
            this.entityDetails = ENTITY_DATA?.entityDetails;
            this.originalEntityName = ENTITY_DATA?.originalName;
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStorService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
