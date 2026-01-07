import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { NEW_ENTITY_DETAILS_CARD_ORDER } from '../../app-constants';
import { EntityUpdateClass } from '../../entity-management-module/shared/entity-interface';
import { combineAddress, deepCloneObject } from '../../common/utilities/custom-utilities';
import { ENTITY_MANDATORY_REPORTER_FIELDS } from '../../entity-management-module/shared/entity-constants';
import { EntityCreationModalConfig, EntityCreationSource } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-shared-entity-info-card',
    templateUrl: './shared-entity-info-card.component.html',
    styleUrls: ['./shared-entity-info-card.component.scss']
})
export class SharedEntityInfoCardComponent implements OnChanges {

    @Input() entityDetails: any = {};
    @Input() triggeredFrom: 'ENTITY_RISK_SLIDER' | 'CONSULTING_FORM' | 'ENGAGEMENT_FORM' | 'CMP' | null = null;
    @Input() isEditMode = false;
    @Input() customClass = '';

    @Output() emitEntityId = new EventEmitter<any>();

    cardOrder = NEW_ENTITY_DETAILS_CARD_ORDER;
    primaryAddress = '';

    constructor(private _commonService: CommonService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entityDetails'] && this.entityDetails) {
            // Filters out any null, undefined, or empty string values and Joins the address lines with a comma and space
            this.primaryAddress = combineAddress(this.entityDetails?.primaryAddressLine1, this.entityDetails?.primaryAddressLine2);
        }
    }

    public viewEntityDetails(entityId: any) {
        this.emitEntityId.emit(entityId);
    }

    editEntityDetails(entityDetails: any): void {
        const TRIGGERED_FROM_MAP: { [key: string]: EntityCreationSource } = {
            ENGAGEMENT_FORM: 'ENGAGEMENT_EDIT',
            CONSULTING_FORM: 'CONSULTING_EDIT',
            CMP: 'CMP_EDIT'
        };
        const ENTITY_DETAILS_FOR_EDIT: EntityUpdateClass = deepCloneObject(entityDetails);
        const NEW_ENTITY_DETAILS = this.mapEntityDetailsToRequest(ENTITY_DETAILS_FOR_EDIT);
        const ENTITY_CREATION_MODAL = new EntityCreationModalConfig();
        ENTITY_CREATION_MODAL.triggeredFrom = TRIGGERED_FROM_MAP[this.triggeredFrom] || null;
        ENTITY_CREATION_MODAL.entityDetails = NEW_ENTITY_DETAILS.entityRequestFields;
        ENTITY_CREATION_MODAL.coiEntityType = deepCloneObject(entityDetails.coiEntityType);
        ENTITY_CREATION_MODAL.mandatoryFieldsList = ENTITY_MANDATORY_REPORTER_FIELDS;
        ENTITY_CREATION_MODAL.fieldCustomClass.ENTITY_NAME = 'col-12';
        ENTITY_CREATION_MODAL.fieldCustomClass.ENTITY_TYPE = 'col-md-12 col-lg-4';
        ENTITY_CREATION_MODAL.fieldCustomClass.OWNERSHIP_TYPE = 'col-md-12 col-lg-4';
        ENTITY_CREATION_MODAL.fieldCustomClass.COUNTRY = 'col-md-12 col-lg-4';
        this._commonService.openNewEntityCreateModal(ENTITY_CREATION_MODAL);
    }

    private mapEntityDetailsToRequest(entityDetails): EntityUpdateClass {
        const NEW_ENTITY_DETAILS = new EntityUpdateClass();
        NEW_ENTITY_DETAILS.entityRequestFields.entityName = entityDetails?.entityName;
        NEW_ENTITY_DETAILS.entityRequestFields.entityOwnershipType.description = entityDetails?.entityOwnershipType?.description;
        NEW_ENTITY_DETAILS.entityRequestFields.entityOwnershipType.ownershipTypeCode = entityDetails?.entityOwnershipType?.ownershipTypeCode;
        NEW_ENTITY_DETAILS.entityRequestFields.entityOwnershipTypeCode = entityDetails?.entityOwnershipTypeCode;
        NEW_ENTITY_DETAILS.entityRequestFields.primaryAddressLine1 = entityDetails?.primaryAddressLine1;
        NEW_ENTITY_DETAILS.entityRequestFields.primaryAddressLine2 = entityDetails?.primaryAddressLine2;
        NEW_ENTITY_DETAILS.entityRequestFields.city = entityDetails?.city;
        NEW_ENTITY_DETAILS.entityRequestFields.state = entityDetails?.state;
        NEW_ENTITY_DETAILS.entityRequestFields.stateDetails = entityDetails?.stateDetails;
        NEW_ENTITY_DETAILS.entityRequestFields.countryCode = entityDetails?.countryCode;
        NEW_ENTITY_DETAILS.entityRequestFields.country.countryName = entityDetails?.country?.countryName;
        NEW_ENTITY_DETAILS.entityRequestFields.postCode = entityDetails?.postCode;
        NEW_ENTITY_DETAILS.entityRequestFields.phoneNumber = entityDetails?.phoneNumber;
        NEW_ENTITY_DETAILS.entityRequestFields.dunsNumber = entityDetails?.dunsNumber;
        NEW_ENTITY_DETAILS.entityRequestFields.ueiNumber = entityDetails?.ueiNumber;
        NEW_ENTITY_DETAILS.entityRequestFields.cageNumber = entityDetails?.cageNumber;
        NEW_ENTITY_DETAILS.entityRequestFields.certifiedEmail = entityDetails?.certifiedEmail;
        NEW_ENTITY_DETAILS.entityRequestFields.websiteAddress = entityDetails?.websiteAddress;
        return NEW_ENTITY_DETAILS;
    }

}
