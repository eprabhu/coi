import { DuplicateEntityCheckService } from './duplicate-entity-check.service';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DuplicateActionType, DuplicateCheckObj, ENTITY_DUPLICATE_MATCH_MODAL_ID, ENTITY_DUPLICATE_MATCH_SLIDER_ID, EntityCardDetails, EntityDupCheckConfig} from '../entity-interface';
import { CommonService } from '../../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonModalConfig, ModalActionEvent } from '../../../shared-components/common-modal/common-modal.interface';
import { closeCoiSlider, closeCommonModal, combineAddress, isEmptyObject, openCoiSlider, openCommonModal, openInNewTab } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { EntityDetailsCardConfig, SharedEntityCardEvents } from '../../../common/services/coi-common.interface';

@Component({
    selector: 'app-duplicate-entity-check',
    templateUrl: './duplicate-entity-check.component.html',
    styleUrls: ['./duplicate-entity-check.component.scss'],
    providers: [DuplicateEntityCheckService]
})
export class DuplicateEntityCheckComponent implements OnChanges, OnDestroy {

    @Input() entityDupCheckConfig = new EntityDupCheckConfig();
    @Input() dupCheckPayload = new DuplicateCheckObj();
    @Output() actionResponse = new EventEmitter<{action: DuplicateActionType, event?: any, entityCardDetails?: EntityDetailsCardConfig}>();
    @Output() openModal = new EventEmitter<{action: 'OPEN_MODAL' , event?: any}>();

    $subscriptions: Subscription[] = [];
    matchedDuplicateEntites: EntityCardDetails[] = [];
    entitiesWithConfigDetails: EntityDetailsCardConfig []=[];
    ENTITY_DUPLICATE_MATCH_SLIDER_ID = ENTITY_DUPLICATE_MATCH_SLIDER_ID;
    duplicateEntityModalConfig = new CommonModalConfig(ENTITY_DUPLICATE_MATCH_MODAL_ID, this.entityDupCheckConfig.primaryButton, 'Cancel', 'xl');

    constructor(private _duplicateCheckService: DuplicateEntityCheckService, private _commonService: CommonService) { }

    ngOnChanges() {
        if (this.dupCheckPayload && !isEmptyObject(this.dupCheckPayload)) {
            this.performDuplicateCheck();
        }
    }
    private performDuplicateCheck(): void {
        if(!this.dupCheckPayload.primaryAddressLine2) {
            delete this.dupCheckPayload['primaryAddressLine2'];
        }
        this.$subscriptions.push(this._duplicateCheckService.checkForDuplicate(this.dupCheckPayload).subscribe((data: EntityCardDetails[] = []) => {
            if (data?.length) {
                this.matchedDuplicateEntites = data;
                if (this.entityDupCheckConfig?.entityIdToFilter) {
                    this.matchedDuplicateEntites = this.matchedDuplicateEntites?.filter((entity: EntityCardDetails) => entity?.entityId != this.entityDupCheckConfig?.entityIdToFilter);
                }
                this.matchedDuplicateEntites.forEach(ele => ele.primaryAddress = combineAddress(ele.primaryAddressLine1 , ele.primaryAddressLine2));
                this.entitiesWithConfigDetails = this.setEntityConfigs(this.matchedDuplicateEntites);
                const ENTITY_CONFIG = this.entitiesWithConfigDetails.find(ele => ele.sharedEntityDetails.entityId == this.entityDupCheckConfig.entityCardDetails?.sharedEntityDetails?.entityId);
                if (ENTITY_CONFIG) {
                    ENTITY_CONFIG.inputOptions = { ...ENTITY_CONFIG.inputOptions, SET_AS_ORIGINAL: { ...ENTITY_CONFIG.inputOptions.SET_AS_ORIGINAL, defaultValue: true }};
                }
                if (this.entityDupCheckConfig.duplicateView === 'MODAL_VIEW') {
                    openCommonModal(ENTITY_DUPLICATE_MATCH_MODAL_ID);
                } else if (this.entityDupCheckConfig.duplicateView === 'SLIDER_VIEW') {
                    openCoiSlider(ENTITY_DUPLICATE_MATCH_SLIDER_ID);
                }
            } else {
                this.actionResponse.emit({ action: 'NOT_FOUND' });
            }
        }, error => {
            this.actionResponse.emit({ action: 'API_FAILED' });
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
        ));
    }

    modalAction(event: ModalActionEvent) {
        this.actionResponse.emit({ action: event.action });
        closeCommonModal(ENTITY_DUPLICATE_MATCH_MODAL_ID);
    }

    closeDuplicateSlider(action: DuplicateActionType, event?: any, entityCardDetails?: any): void {
        setTimeout(() => {
            this.clearDuplicateSlider(action, event, entityCardDetails);
        }, 200);
    }

    private clearDuplicateSlider(action: DuplicateActionType, event?: any, entityCardDetails?: any): void {
        this.matchedDuplicateEntites = [];
        this.actionResponse.emit({ action, event, entityCardDetails});
    }

    updateVerifyButtonState(): void {
        if (this.entityDupCheckConfig.hasConfirmedNoDuplicate) {
            closeCoiSlider(ENTITY_DUPLICATE_MATCH_SLIDER_ID);
            this.closeDuplicateSlider('CHECK_BOX', this.entityDupCheckConfig);
        }
    }

    openConfirmationModal(action: 'USE' | 'OPEN_MODAL', entity: EntityCardDetails) {
        if(action === 'OPEN_MODAL') {
            this.openModal.emit({action: action, event: entity});
        }
    }

    private setEntityConfigs(entityDetails: any[]): EntityDetailsCardConfig[] {
        return entityDetails?.map(entity => {
            const CARD_CONFIG = new EntityDetailsCardConfig();
            CARD_CONFIG.entireDetails = entity;
            CARD_CONFIG.sharedEntityDetails = {
                entityId: entity.entityId,
                entityName: entity.entityName,
                dunsNumber: entity.dunsNumber,
                ueiNumber: entity.ueiNumber,
                cageNumber: entity.cageNumber,
                primaryAddressLine1: entity.primaryAddressLine1,
                primaryAddressLine2: entity.primaryAddressLine2,
                state: entity.state,
                city: entity.city,
                postCode: entity.postalCode,
                country: entity.country,
                website: entity.website,
                organizationId: entity.organizationId,
                sponsorCode: entity.sponsorCode,
                ownershipType: entity.ownershipType,
                priorName: entity.priorName,
                foreignName: entity.foreignName,
                foreignNames: entity?.foreignNames,
                businessEntityType: entity?.entityBusinessType,
                entityFamilyTreeRoles: entity?.entityFamilyTreeRoles?.map(role => ({
                    description: role.familyRoleType?.description,
                    typeCode: role.familyRoleTypeCode,
                }))
            };
            CARD_CONFIG.uniqueId = entity.entityId;
            CARD_CONFIG.displaySections = [];
            CARD_CONFIG.cardType = 'DB_ENTITY';
            CARD_CONFIG.inputOptions = this.entityDupCheckConfig.entityActions;
            return CARD_CONFIG;
        }) || [];
    }

    actionsFromCard(event: SharedEntityCardEvents) {
        if(event.action === 'VIEW') {
            openInNewTab('manage-entity/entity-overview?', ['entityManageId'], [event.content.sharedEntityDetails.entityId]);
        } else if (event.action === 'SET_AS_ORIGINAL' && event.content.entityCardConfig.inputOptions.SET_AS_ORIGINAL.inputType === 'TOGGLE') {
            this.entityDupCheckConfig.entityCardDetails = event.content.entityCardConfig;
            if(event.content.currentValue) {
                closeCoiSlider(ENTITY_DUPLICATE_MATCH_SLIDER_ID);
                this.closeDuplicateSlider('CLOSE_BTN', undefined, event.content.entityCardConfig);
                event.content.entityCardConfig.inputOptions.SET_AS_ORIGINAL.visible = false;
            }
        } else if (event.action === 'SET_AS_ORIGINAL' && event.content.entityCardConfig.inputOptions.SET_AS_ORIGINAL.inputType === 'BUTTON') {
            this.openModal.emit({action: 'OPEN_MODAL', event: event.content.sharedEntityDetails});
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
