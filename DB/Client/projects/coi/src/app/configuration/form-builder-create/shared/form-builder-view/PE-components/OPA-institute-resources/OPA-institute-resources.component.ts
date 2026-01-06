import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilderService } from '../../form-builder.service';
import { openInNewTab } from '../../../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../../../../common/utilities/date-utilities';
import { getEndPointForEntity } from '../../search-configurations';
import { Subject, Subscription } from 'rxjs';
import { OPAInstituteResourcesService } from './OPA-institute-resources.service';
import { leftSlideInOut, listAnimation } from '../OPA-comp-uncomp/OPA-comp-uncomp.component';
import { deepCloneObject } from '../../../../../../../../../fibi/src/app/common/utilities/custom-utilities';
import { EntityDetails, EntitySaveRO, OPAInstituteResources, OPAInstituteResourcesPE, RelationShipSaveRO } from './OPA-institute-resources.interface';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';

@Component({
    selector: 'app-OPA-institute-resources',
    templateUrl: './OPA-institute-resources.component.html',
    styleUrls: ['./OPA-institute-resources.component.scss'],
    providers: [OPAInstituteResourcesService],
    animations: [listAnimation, leftSlideInOut]
})
export class OPAInstituteResourceUseComponent implements OnInit {

    @Input() componentData = new OPAInstituteResourcesPE();
    @Input() isFormEditable = true;
    @Input() formBuilderId;
    @Input() externalEvents: Subject<any> = new Subject<any>();
    @Output() childEvents: EventEmitter<any> = new EventEmitter<any>();
    @Input() sectionHeading = '';
    currentFilter: 'ALL' | 'INCOMPLETE' | 'COMPLETE' | 'INACTIVE' = 'ALL';
    currentTab: 'MY_ENTITIES' | 'ADD_ENTITY' = 'MY_ENTITIES';
    eventType: 'LINK' | 'NEW' = 'NEW';
    myEntities: EntityDetails[] = [];
    filteredEntities: EntityDetails[] = [];
    $subscriptions: Subscription[] = [];
    relationshipTypeCache = {};
    entityDetails: any = {};
    editIndex = -1;
    id: number;
    deleteIndex: number;
    entitySearchOptions: any = {};
    useOfInstituteResourcesData = new OPAInstituteResources();
    isDuplicate = false;
    isEntitySelected = false;

    constructor( private _formBuilder: FormBuilderService, private _api: OPAInstituteResourcesService, private _commonService: CommonService ) { }

    ngOnInit(): void {
        this.generateId();
        this.entitySearchOptions = getEndPointForEntity(this._formBuilder.baseURL);
        this.listenForExternalEvents();
    }

    getMyEntities(): void {
        this._api.getEntities().subscribe((data: EntityDetails[]) => {
            this.myEntities = data;
            this.markLinkableEntities();
            this.setFilter(this.currentFilter);
        });
    }

    markLinkableEntities(): void {
        this.myEntities = this.myEntities.filter(E => !this.componentData.data.find(P => P.personEntityId === E.personEntityId));
    }

    setFilter(filterType: 'ALL' | 'INCOMPLETE' | 'COMPLETE' | 'INACTIVE') {
        this.currentFilter = filterType;
        switch (this.currentFilter) {
            case 'ALL' : this.filteredEntities = this.myEntities; break;
            case 'COMPLETE' : this.filteredEntities =
                this.myEntities.filter(E => (E.personEntityVersionStatus === 'ACTIVE' || E.personEntityVersionStatus === 'ARCHIVE') && E.isFormCompleted); break;
            case 'INACTIVE' : this.filteredEntities =
                this.myEntities.filter(E => E.personEntityVersionStatus === 'INACTIVE'); break;
            case 'INCOMPLETE' : this.filteredEntities =
                this.myEntities.filter(E => (E.personEntityVersionStatus === 'ACTIVE' || E.personEntityVersionStatus === 'ARCHIVE') && !E.isFormCompleted); break;
        }
    }

    getClassForStatus(versionStatus, isFormCompleted) {
        return versionStatus === 'ACTIVE' || versionStatus == 'ARCHIVE' ? (isFormCompleted == 'Y' || isFormCompleted === true) ? 't-active-ribbon' : 't-incomplete-ribbon' : 't-inactive-ribbon';
    }

    getClassForStatusInModal(versionStatus, isFormCompleted) {
        return versionStatus === 'ACTIVE' || versionStatus == 'ARCHIVE' ? (isFormCompleted == 'Y' || isFormCompleted === true) ? 'active-ribbon' : 'incomplete-ribbon' : 'inactive-ribbon';
    }

    getDescriptionForStatus(versionStatus, isFormCompleted) {
        return versionStatus === 'ACTIVE' || versionStatus == 'ARCHIVE' ? (isFormCompleted == 'Y' || isFormCompleted === true) ? 'Complete' : 'Incomplete' : 'Inactive';
    }

    getClassForStatusInModalCard(versionStatus, isFormCompleted) {
        return versionStatus === 'ACTIVE' || versionStatus == 'ARCHIVE' ? (isFormCompleted == 'Y' || isFormCompleted === true) ? 'status-complete' : 'status-incomplete' : 'status-inactive';
    }

    viewSlider(personEntityId): void {
        openInNewTab('entity-details/entity?', ['personEntityId', 'mode'], [personEntityId, 'view']);
    }

    getEntityRelationTypePills(validPersonEntityRelType: string) {
        if (validPersonEntityRelType) {
            if (this.relationshipTypeCache[validPersonEntityRelType]) {
                return this.relationshipTypeCache[validPersonEntityRelType];
            }
            const ENTITY_REL_TYPES = validPersonEntityRelType.split(':;:');
            this.relationshipTypeCache[validPersonEntityRelType] = ENTITY_REL_TYPES.map(entity => {
                const RELATIONSHIP_TYPE = entity.split(':');
                return { relationshipType: RELATIONSHIP_TYPE[0] || '', description: RELATIONSHIP_TYPE[1] || '' };
            });
            return this.relationshipTypeCache[validPersonEntityRelType];
        }
    }

    editEntityItem(outsideFinRelationData: any , index): void {
        this.useOfInstituteResourcesData = deepCloneObject(outsideFinRelationData);
        this.editIndex = index;
        this.entityDetails = outsideFinRelationData.entityInfo;
        this.currentTab = 'ADD_ENTITY';
    }

    updateEntity(): void {
        delete this.useOfInstituteResourcesData.updateTimestamp;
        this.useOfInstituteResourcesData.actionType = 'SAVE';
        this.childEvents.emit({action: 'UPDATE', data: this.useOfInstituteResourcesData});
        this.emitEditOrSaveAction('UPDATE', this.useOfInstituteResourcesData);
    }

    generateId(): void {
        this.id = new Date().getTime();
    }

    viewEntityDetails(id): void {
        window.open(window.location.origin + window.location.pathname + '#/coi/entity-management/entity-details?entityManageId=' + id);
    }

    linkEntity(entity): void {
        this.eventType = 'LINK';
        this.entityDetails = entity;
        this.addRowItem();
    }

    async addRowItem() {
        if (this.isDuplicate) {
            return null;
        }
        const RO: RelationShipSaveRO | EntitySaveRO = this.setEntityROForSave(this.entityDetails);
        try {
            const RESPONSE = await this._api.saveEntityOrRelation(RO);
            this.setPersonEntityId(RESPONSE);
            this.setEntityInfoForInstResources();
            this.childEvents.emit({ action: 'ADD', data: this.useOfInstituteResourcesData });
            this.emitEditOrSaveAction('ADD', this.useOfInstituteResourcesData);
        } catch (err) {
            if ((err.status === 405)) {
                this.setEntityInfoForInstResources();
                this.childEvents.emit({ action: 'ADD', data: this.useOfInstituteResourcesData });
            }
        }
    }

    setEntityROForSave(entity: any): EntitySaveRO | RelationShipSaveRO {
        if (this.entityDetails.personEntityId) {
            const RELATION_RO = new RelationShipSaveRO();
            RELATION_RO.personEntityId = this.entityDetails.personEntityId;
            this._commonService.isUnifiedQuestionnaireEnabled ? RELATION_RO.disclTypeCodes = [2] : RELATION_RO.validPersonEntityRelTypeCodes = [5];
            return RELATION_RO;
        } else {
            const ENTITY_SAVE_RO = new EntitySaveRO();
            ENTITY_SAVE_RO.entityId = entity.entityId;
            ENTITY_SAVE_RO.entityNumber = entity.entityNumber;
            ENTITY_SAVE_RO.involvementStartDate = parseDateWithoutTimestamp(new Date());
            this._commonService.isUnifiedQuestionnaireEnabled ? ENTITY_SAVE_RO.perEntDisclTypeSelection = [2] : ENTITY_SAVE_RO.validPersonEntityRelTypeCodes = [5];
            return ENTITY_SAVE_RO;
        }
    }

    private setPersonEntityId(response): void {
        if (!this.entityDetails.personEntityId) {
            this.entityDetails.personEntityId = response.personEntityId;
            this.emitEditOrSaveAction('NEW_SFI', this.useOfInstituteResourcesData);
        }
    }

    private setEntityInfoForInstResources(): void {
        this.useOfInstituteResourcesData.personEntityId = this.entityDetails.personEntityId;
        this.useOfInstituteResourcesData.opaDisclosureId = this.formBuilderId;
        this.useOfInstituteResourcesData.actionType = 'SAVE';
        this.useOfInstituteResourcesData.entityInfo.isFormCompleted = this.entityDetails.isFormCompleted ? 'Y' : 'N';
    }

    deleteEntity(): void {
        delete this.useOfInstituteResourcesData.updateTimestamp;
        this.useOfInstituteResourcesData.actionType = 'DELETE';
        this.childEvents.emit({ action: 'DELETE', data: this.useOfInstituteResourcesData });
        this.emitEditOrSaveAction('DELETE', this.useOfInstituteResourcesData);
    }

    clearData() {
        this.entitySearchOptions = getEndPointForEntity(this._formBuilder.baseURL);
        this.entityDetails = {};
        this.editIndex = -1;
        this.deleteIndex = -1;
        this.currentTab = 'MY_ENTITIES';
        this.useOfInstituteResourcesData = new OPAInstituteResources();
        this.isDuplicate = false;
    }

    listenForExternalEvents(): void {
        this.$subscriptions.push(this.externalEvents.subscribe(res => {
            if (this.useOfInstituteResourcesData.actionType === 'SAVE') {
                this.editIndex === -1 ? this.componentData.data.push(res.data.data[0]) :
                    this.componentData.data[this.editIndex] = res.data.data[0];
                if (this.eventType === 'NEW') {
                    document.getElementById('OPA_INST_RES_ADD_BTN' + this.id).click();
                }
                if (this.eventType === 'LINK') {
                    this.removeFromMyEntities();
                }
            } else if (this.useOfInstituteResourcesData.actionType === 'DELETE' && this.deleteIndex > -1) {
                this.componentData.data.splice(this.deleteIndex, 1);
                document.getElementById('OPA_INST_RES_DELETE_BTN' + this.id).click();
            }
            this.clearData();
        }));
    }

    removeFromMyEntities(): void {
        let INDEX = this.filteredEntities.findIndex(E => this.entityDetails.personEntityId === E.personEntityId);
        if (INDEX > -1) {
            this.filteredEntities.splice(INDEX, 1);
        }
        INDEX = this.myEntities.findIndex(E => this.entityDetails.personEntityId === E.personEntityId);
        if (INDEX > -1) {
            this.myEntities.splice(INDEX, 1);
        }
    }

    entitySelected(entity: any): void {
        if (entity) {
            const INDEX = this.checkDuplicate(entity.personEntityId);
            this.isDuplicate = INDEX === -1 || INDEX === this.editIndex ? false : true;
            this.entityDetails = entity;
            this.isEntitySelected = true;
        } else {
            this.entitySearchOptions = getEndPointForEntity(this._formBuilder.baseURL);
            this.entityDetails = {};
            this.isDuplicate = false;
            this.isEntitySelected = false;
        }
    }

    checkDuplicate(personEntityId): number {
        return this.componentData.data.findIndex(E => E.personEntityId === personEntityId);
    }

    emitEditOrSaveAction(actionPerformed, event) {
        this._formBuilder.$formBuilderActionEvents.next({action: actionPerformed, actionResponse: event, component: this.componentData});
    }

}
