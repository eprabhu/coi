import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMON_ERROR_TOAST_MSG, ENTITY_DOCUMENT_STATUS_TYPE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { DataStoreEvent, DuplicateMarkingAPIReq, ElasticEntityResult, EntireEntityDetails, EntityCardDetails, EntityDetails } from '../shared/entity-interface';
import { closeCommonModal, isEmptyObject, openCommonModal, openInNewTab } from '../../common/utilities/custom-utilities';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { EntityDataStoreService } from '../entity-data-store.service';
import { Subject, Subscription } from 'rxjs';
import { EntityManagementService } from '../entity-management.service';
import { setEntityObjectFromElasticResult } from '../../common/utilities/elastic-utilities';
import { EntityDetailsCardConfig } from '../../common/services/coi-common.interface';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
class StatusChange {
    selectedType: string = null;
    description = '';
}

class StatusType {
    documentStatusTypeCode: string;
    description: string;
}

@Component({
    selector: 'app-entity-status-modal-change',
    templateUrl: './entity-status-change.component.html',
    styleUrls: ['./entity-status-change.component.scss']
})
export class EntityStatusChangeComponent {

    ENTITY_DUPLICATE = ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE;
    statusChangeObject = new StatusChange();
    mandatoryList = new Map();
    entityStatusTypeList: StatusType[] = [];
    matchedDuplicateEntites: EntityCardDetails[] = [];
    entitySearchOptions: any = {};
    $subscriptions: Subscription[] = [];
    entityClearField: any = false;
    STATUS_CHANGE_MODAL_ID = 'entity_status_change_modal';
    statusChangeModalConfig = new CommonModalConfig(this.STATUS_CHANGE_MODAL_ID, 'Proceed', 'Cancel', 'lg');
    entityDetails = new EntityDetails();
    isSaving = false;
    entityInfoText = `To mark an entity as a duplicate, choose a duplicate from the system-identified list if
                    available, or use the entity search box to find and select one. The entity will then be
                    marked as a duplicate of the selected entity.`;

    @Input() $triggerModalOpen = new Subject<boolean>();
    @Input() entityCardDetails = new EntityDetailsCardConfig();
    @Output() openDuplicatesSlider = new EventEmitter<any>();

    constructor(private _elasticConfig: ElasticConfigService,
        public dataStore: EntityDataStoreService,
        private _entityManagementService: EntityManagementService,
        private _route: ActivatedRoute,
        private _commonService: CommonService
    ) { }

    ngOnInit() {
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenModalOpen();
        this.fetchStatusType();
    }

    private listenModalOpen() {
        this.$subscriptions.push(this.$triggerModalOpen.subscribe((data: boolean) => {
            if (data) {
                openCommonModal(this.STATUS_CHANGE_MODAL_ID);
                this.entityClearField = new String('true');
            }
        }))
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this.dataStore.getData();
        if (!ENTITY_DATA || isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.statusChangeObject.selectedType = ENTITY_DATA.entityDetails?.documentStatusTypeCode;
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this.dataStore.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    statusChangeModalAction(event: ModalActionEvent): void {
        if (event.action === 'PRIMARY_BTN') {
            if (this.checkForMandatory()) {
                this.changeEntityStatus();
            }
        } else {
            this.clearModalAndClose();
        }
    }

    private changeEntityStatus(): void {
        if (this.statusChangeObject.selectedType === ENTITY_DOCUMENT_STATUS_TYPE.ACTIVE) {
            this.activateInactiveEntity('activateEntity');
        } else if (this.statusChangeObject.selectedType === ENTITY_DOCUMENT_STATUS_TYPE.INACTIVE) {
            this.activateInactiveEntity('inActivateEntity');
        } else if (this.statusChangeObject.selectedType === ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE) {
            this.markAsDuplicate();
        }
    }

    private markAsDuplicate(): void {
        if(!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._entityManagementService.markAsDuplicate(this.getRequestObj()).subscribe((data) => {
                this.isSaving = false;
                this.updateValues(this.ENTITY_DUPLICATE, 'Duplicate');
                this.entityDetails.originalEntityId = this.entityCardDetails?.sharedEntityDetails?.entityId;
                const ORIGINAL_ENTITY_NAME = this.entityCardDetails?.sharedEntityDetails?.entityName;
                this.dataStore.updateStore(['entityDetails', 'originalName'], { entityDetails: this.entityDetails, originalName: ORIGINAL_ENTITY_NAME });
                this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Entity updated successfully');
            }, error => {
                this.isSaving = false;
                if(error && error.status === 405) {
                    this._commonService.concurrentUpdateAction = 'Mark as duplicate';
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            }
            ));
        }
    }

    private updateValues(code: string, description: string): void {
        this.entityDetails.entityDocumentStatusType.documentStatusTypeCode = code;
        this.entityDetails.entityDocumentStatusType.description = description;
        this.entityDetails.documentStatusTypeCode = code;
        this.clearModalAndClose();
    }

    private checkForMandatory(): boolean {
        this.mandatoryList.delete('statusType');
        this.mandatoryList.delete('description');
        this.mandatoryList.delete('entityCard');
        this.setInvalidStatusType(); // for checking selectedType matches with actual entity status.
        if (!this.statusChangeObject.selectedType) {
            this.mandatoryList.set('statusType', 'Please select a status type.');
        }
        if (!this.statusChangeObject.description) {
            this.mandatoryList.set('description', 'Please enter the description.');
        }
        if (this.statusChangeObject.selectedType === this.ENTITY_DUPLICATE && (!this.entityCardDetails?.uniqueId || isEmptyObject(this.entityCardDetails?.sharedEntityDetails))) {
            this.mandatoryList.set('entityCard', 'Please select an entity from view duplicates or search for an entity.');
        }
        return !this.mandatoryList.size ? true : false;
    }

    clearModalAndClose(): void {
        closeCommonModal(this.STATUS_CHANGE_MODAL_ID);
        setTimeout(() => {
            this.mandatoryList.clear();
            this.statusChangeObject = new StatusChange();
            this.statusChangeObject.selectedType = this.entityDetails.documentStatusTypeCode;
            this.entityClearField = new String('true');
            this.entityCardDetails = new EntityDetailsCardConfig();
        }, 200);
    }

    private activateInactiveEntity(apiName: 'activateEntity' | 'inActivateEntity'): void {
        if(!this.isSaving) {
            const REQ_OBJ = { entityId: this.entityDetails.entityId, comment: this.statusChangeObject.description };
            this.isSaving = true;
            this.$subscriptions.push(
                this._entityManagementService[apiName](REQ_OBJ).subscribe((data: any) => {
                    this.isSaving = false;
                    apiName === 'activateEntity' ? this.updateValues(ENTITY_DOCUMENT_STATUS_TYPE.ACTIVE, 'Active') : this.updateValues(ENTITY_DOCUMENT_STATUS_TYPE.INACTIVE, 'Inactive');
                    this.dataStore.updateStore(['entityDetails'], { 'entityDetails': this.entityDetails });
                    if (apiName === 'activateEntity' && this.dataStore.getEditMode()) {
                        this._entityManagementService.triggerEntityMandatoryValidation();
                    }
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, `Entity ${apiName === 'activateEntity' ? 'Activated' : 'Inactivated'} successfully`);
                }, error => {
                    this.isSaving = false;
                    if(error && error.status === 405) {
                        this._commonService.concurrentUpdateAction = apiName === 'activateEntity' ? 'Activation' : 'Inactivation';
                    } else {
                        this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                    }
                }
            ));
        }
    }

    onStatusTypeChange(): void {
        this.entityCardDetails = new EntityDetailsCardConfig();
        this.setInvalidStatusType(); // for checking selectedType matches with actual entity status.
        if (this.statusChangeObject.selectedType === ENTITY_DOCUMENT_STATUS_TYPE.DUPLICATE) {
            this.checkForDuplicates();
        }
    }

    private setInvalidStatusType() {
        this.mandatoryList.delete('statusType');
        this.mandatoryList.delete('inValidType');
        if (this.statusChangeObject.selectedType && (this.statusChangeObject.selectedType == this.entityDetails?.entityDocumentStatusType?.documentStatusTypeCode) && (this.statusChangeObject.selectedType == this.entityDetails?.documentStatusTypeCode)) {
            this.mandatoryList.set('inValidType', 'You are trying to update the entity status with the current status of the entity.');
        }
    }

    private checkForDuplicates(): void {
        this.$subscriptions.push(this._entityManagementService.checkForDuplicate(this.dataStore.getDuplicateCheckRO()).subscribe((data: any) => {
            if (data?.length) {
                this.matchedDuplicateEntites = data.filter(ele => ele.entityId != this.entityDetails?.entityId);
            }
        }));
    }

    actionsFromCard(event: any): void {
        openInNewTab('manage-entity/entity-overview?', ['entityManageId'], [event.content.sharedEntityDetails.entityId]);
    }

    selectedEvent(event): void {
        if (event) {
            this.entityClearField = new String('false');
            event = setEntityObjectFromElasticResult(event);
            this.entityCardDetails = this.getCardDetails(event);
        } else {
            this.mandatoryList.delete('sameEntity');
            this.entityCardDetails = null;
        }
    }

    private getCardDetails(entity: ElasticEntityResult): EntityDetailsCardConfig {
        const CARD_CONFIG = new EntityDetailsCardConfig();
        CARD_CONFIG.entireDetails = entity;
        CARD_CONFIG.sharedEntityDetails = {
            entityId: entity?.entityId,
            entityName: entity?.entityName,
            primaryAddressLine1: entity?.primaryAddressLine1,
            primaryAddressLine2: entity?.primaryAddressLine2,
            state: entity?.state,
            city: entity?.city,
            postCode: entity?.zipCode,
            country: entity?.country,
            website: entity?.webURL,
            dunsNumber: entity?.dunsNumber,
            foreignName: entity?.foreignName,
            ueiNumber: entity?.ueiNumber,
            priorName: entity?.priorName,
            cageNumber: entity?.cageNumber,
            organizationId: entity?.organizationId,
            sponsorCode: entity?.sponsorCode,
            ownershipType: entity?.entityOwnershipType?.description,
            businessEntityType: entity?.businessType,
            isForeign: entity?.isForeign,
            foreignNames: entity?.foreignName?.trim() ? [{ foreignName: entity?.foreignName, id: null }] : null
        };
        CARD_CONFIG.uniqueId = entity?.entityId;
        CARD_CONFIG.displaySections = [];
        CARD_CONFIG.cardType = 'DB_ENTITY';
        CARD_CONFIG.inputOptions = {
            VIEW: { visible: true }
        };
        return CARD_CONFIG;
    }

    navigateToSection() {
        closeCommonModal(this.STATUS_CHANGE_MODAL_ID);
        this.openDuplicatesSlider.emit({ entityCardDetails: this.entityCardDetails });
    }

    getRequestObj(): DuplicateMarkingAPIReq {
        const REQOBJ = new DuplicateMarkingAPIReq();
        REQOBJ.originalEntityId = this.entityCardDetails.sharedEntityDetails.entityId;
        REQOBJ.duplicateEntityId = this._route.snapshot.queryParamMap.get('entityManageId');
        REQOBJ.description = this.statusChangeObject.description;
        return REQOBJ;
    }

    private fetchStatusType() {
        this.$subscriptions.push(this._entityManagementService.fetchStatusList().subscribe((data: any) => {
            if(data?.length) {
                this.entityStatusTypeList = data;
            }
        }))
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
