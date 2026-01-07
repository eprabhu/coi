import { Component, Input, OnInit } from '@angular/core';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { Subject, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { combineAddress, openCommonModal } from '../../common/utilities/custom-utilities';
import { DuplicateCheckObj, EntityCardDetails, EntityUpdateClass } from '../../entity-management-module/shared/entity-interface';
import { ENTITY_MANDATORY_REPORTER_FIELDS } from '../../entity-management-module/shared/entity-constants';
import { EntityCreationConfig, EntityDetailsCardConfig, SharedEntityCardEvents } from '../../common/services/coi-common.interface';
import { DuplicateEntityCheckService } from '../../entity-management-module/shared/duplicate-entity-check/duplicate-entity-check.service';
import { COMMON_ERROR_TOAST_MSG, ENTITY_VERIFICATION_STATUS, HTTP_ERROR_STATUS } from '../../app-constants';

@Component({
    selector: 'app-shared-entity-creation-modal',
    templateUrl: './shared-entity-creation-modal.component.html',
    styleUrls: ['./shared-entity-creation-modal.component.scss']
})
export class SharedEntityCreationModalComponent implements OnInit {

    @Input() entityCreationConfig = new EntityCreationConfig();

    $performAction = new Subject<'SAVE_AND_VALIDATE' | 'VALIDATE_ONLY'>();
    ENTITY_CREATION_MODAL_ID = 'coi-create-new-entity-modal';
    modalConfig = new CommonModalConfig(this.ENTITY_CREATION_MODAL_ID, 'Save', 'Cancel', 'xl');
    newEntityDetails = new EntityUpdateClass();
    entityMandatoryReporterFields = ENTITY_MANDATORY_REPORTER_FIELDS;
    isDuplicateEntitiesAvailable = false;
    $subscriptions: Subscription[] = [];
    entitiesWithConfigDetails: EntityDetailsCardConfig[] = [];

    constructor(public commonService: CommonService, private _duplicateCheckService: DuplicateEntityCheckService) { }

    ngOnInit(): void {
        setTimeout(() => {
            openCommonModal(this.ENTITY_CREATION_MODAL_ID);
        });
    }

    private createNewEntity(): void {
        this.$performAction.next('VALIDATE_ONLY');
        if (this.newEntityDetails?.entityRequestFields?.entityName) {
            if (this.entityCreationConfig.isDuplicateCheckNeeded) {
                this.getDuplicateEntities(this.newEntityDetails);
            } else {
                this.closeNewEntityCreateModal(this.newEntityDetails);
            }
        }
    }

    private closeNewEntityCreateModal(entityDetails: EntityUpdateClass | null): void {
        this.commonService.$globalEventNotifier.next({ uniqueId: 'ENTITY_CREATION_MODAL', content: { triggeredFrom: this.entityCreationConfig.triggeredFrom, entityDetails: entityDetails } });
        this.commonService.closeNewEntityCreateModal();
    }

    private getDuplicateEntities(event: EntityUpdateClass): void {
        const ENTITY_DETAILS = new DuplicateCheckObj();
        ENTITY_DETAILS.entityName = event.entityRequestFields.entityName;
        ENTITY_DETAILS.countryCode = event.entityRequestFields.countryCode;
        ENTITY_DETAILS.primaryAddressLine1 = event.entityRequestFields.primaryAddressLine1;
        this.performDuplicateCheck(ENTITY_DETAILS);
    }

    private performDuplicateCheck(data:DuplicateCheckObj): void {
        if (!data.primaryAddressLine2) {
            delete data['primaryAddressLine2'];
        }
        this.$subscriptions.push(this._duplicateCheckService.checkForDuplicate(data).subscribe((data: EntityCardDetails[] = []) => {
            const DUPLICATE_ENTITIES = data?.filter((entity: EntityCardDetails) => entity?.entityStatusTypeCode?.toString() === ENTITY_VERIFICATION_STATUS.VERIFIED.toString());
            if (DUPLICATE_ENTITIES.length) {
                DUPLICATE_ENTITIES.forEach(ele => ele.primaryAddress = combineAddress(ele.primaryAddressLine1, ele.primaryAddressLine2));
                this.entitiesWithConfigDetails = this.setEntityConfigs(DUPLICATE_ENTITIES);
                this.modalConfig = new CommonModalConfig(this.ENTITY_CREATION_MODAL_ID, 'Create as New', 'Cancel', 'xl');
                this.isDuplicateEntitiesAvailable = true;
            } else {
                this.closeNewEntityCreateModal(this.newEntityDetails);
            }
        }, error => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
        ));
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
                })),
                entityNumber: entity.entityNumber,
            };
            CARD_CONFIG.uniqueId = entity.entityId;
            CARD_CONFIG.displaySections = [];
            CARD_CONFIG.cardType = 'DB_ENTITY';
            CARD_CONFIG.inputOptions = {
                USE_THIS: { visible: true }
            };
            return CARD_CONFIG;
        }) || [];
    }

    private handleEntityCreationFlow(): void {
        if (this.isDuplicateEntitiesAvailable) {
            // if duplicates are listed and user still wants to create a new entity
            this.closeNewEntityCreateModal(this.newEntityDetails);
        } else {
            // if no duplicates are present, directly create a new entity
            this.createNewEntity();
        }
    }

    private handleEntityCancelFlow(): void {
        if (this.isDuplicateEntitiesAvailable) {
            // if user clicks cancel after duplicates are listed, go to entity creation form with already filled data
            if (this.newEntityDetails?.entityRequestFields) {
                this.entityCreationConfig.entityDetails = { ...this.newEntityDetails.entityRequestFields };
            }
            this.modalConfig = new CommonModalConfig(this.ENTITY_CREATION_MODAL_ID, 'Save', 'Cancel', 'xl');
            this.isDuplicateEntitiesAvailable = false;
        } else {
            // if user clicks cancel from entity creation form , close the modal
            this.closeNewEntityCreateModal(null);
        }
    }
    
    postConfirmation(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.handleEntityCreationFlow();
        } else {
            this.handleEntityCancelFlow();
        }
    }

    getNewEntityDetails(event: EntityUpdateClass): void {
        this.newEntityDetails = event;
    }

    actionsFromCard(event: SharedEntityCardEvents) {
        if (event.action === 'USE_THIS') {
            const SELECTED_ENTITY_DETAILS: EntityUpdateClass = {
                entityId: event.content.sharedEntityDetails.entityId,
                entityRequestFields: {
                    entityName: event.content.sharedEntityDetails?.entityName,
                    country: event?.content?.sharedEntityDetails?.country,
                    postCode: event?.content?.sharedEntityDetails.postCode,
                    websiteAddress: event?.content?.sharedEntityDetails?.website,
                    dunsNumber: event?.content?.sharedEntityDetails?.dunsNumber,
                    ueiNumber: event?.content?.sharedEntityDetails?.ueiNumber,
                    cageNumber: event?.content?.sharedEntityDetails?.cageNumber,
                    state: event?.content?.sharedEntityDetails?.state,
                    stateDetails: event?.content?.sharedEntityDetails?.stateDetails,
                    entityNumber: event?.content?.sharedEntityDetails?.entityNumber
                }
            }
            this.closeNewEntityCreateModal(SELECTED_ENTITY_DETAILS);
        }
    }
}
