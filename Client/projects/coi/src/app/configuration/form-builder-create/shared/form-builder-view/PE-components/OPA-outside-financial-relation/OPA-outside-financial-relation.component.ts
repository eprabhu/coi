import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilderService } from '../../form-builder.service';
import { OPACompUncompService } from '../OPA-comp-uncomp/OPA-comp-uncomp.service';
import { getEndPointForEntity } from '../../search-configurations';
import { EntitySaveRO, OutsideFinRelation, OutsideFinRelationPE, RelationShipSaveRO } from './interface';
import { parseDateWithoutTimestamp } from '../../../../../../common/utilities/date-utilities';
import { openInNewTab } from '../../../../../../common/utilities/custom-utilities';
import { trigger, animate, keyframes, transition, style, query, stagger} from '@angular/animations';
import { deepCloneObject } from '../../../../../../../../../fibi/src/app/common/utilities/custom-utilities';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';


export const leftSlideInOut = trigger('leftSlideInOut', [
    transition(':enter', [
      animate('300ms ease-in-out', keyframes([
        style({ opacity: 0, transform: 'translateX(-20px)', offset: 0 }),
        style({ opacity: .3, transform: 'translateX(-10px)', offset: 0.3 }),
        style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 }),
      ]))
    ]),
    transition(':leave', [
      animate('300ms ease-in-out', keyframes([
        style({ opacity: 1, transform: 'translateX(0)', offset: 0 }),
        style({ opacity: .3, transform: 'translateX(-5px)', offset: 0.3 }),
        style({ opacity: 0, transform: 'translateX(-10px)', offset: 1.0 }),
      ]))
    ])
  ]);
  export const listAnimation = trigger('listAnimation', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        stagger('100ms', [
          animate('400ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])], { optional: true }
      )
    ])
  ]);


@Component({
    selector: 'app-OPA-outside-financial-relation',
    templateUrl: './OPA-outside-financial-relation.component.html',
    styleUrls: ['./OPA-outside-financial-relation.component.scss'],
    providers: [OPACompUncompService],
    animations: [leftSlideInOut, listAnimation]
})
export class OPAOutsideFinancialRelationComponent implements OnInit {

    @Input() componentData = new OutsideFinRelationPE();
    @Input() formBuilderId;
    @Input() externalEvents: Subject<any> = new Subject<any>();
    @Output() childEvents: EventEmitter<any> = new EventEmitter<any>();
    @Input() isFormEditable = true;
    @Input() sectionHeading = '';
    id: number;
    entitySearchOptions: any = {};
    entityDetails: any = {};
    outsideFinRelationData = new OutsideFinRelation();
    editIndex = -1;
    deleteIndex: number;
    $subscriptions = [];
    isDuplicate = false;
    myEntities = [];
    filteredEntities = [];
    currentTab: 'MY_ENTITIES'| 'ADD_ENTITY' = 'MY_ENTITIES';
    currentFilter: 'ALL' | 'INCOMPLETE' | 'COMPLETE' | 'INACTIVE' = 'ALL';
    eventType: 'LINK'| 'NEW' =  'NEW';
    relationshipTypeCache = {};
    isEntitySelected = false;

    constructor(private _formBuilder: FormBuilderService, private _api: OPACompUncompService, private _commonService: CommonService) { }

    ngOnInit() {
        this.generateId();
        this.entitySearchOptions = getEndPointForEntity(this._formBuilder.baseURL);
        this.listenForExternalEvents();
    }

    generateId() {
        this.id = new Date().getTime();
    }

    listenForExternalEvents(): void {
        this.$subscriptions.push(this.externalEvents.subscribe(res => {
            if (this.outsideFinRelationData.actionType === 'SAVE') {
                this.editIndex === -1 ? this.componentData.data.push(res.data.data[0]) :
                    this.componentData.data[this.editIndex] = res.data.data[0];
                if (this.eventType === 'NEW') {
                    document.getElementById('OUTSIDE_FIN_REL_ADD_BTN' + this.id).click();
                }
                if (this.eventType === 'LINK') {
                    this.removeFromMyEntities();
                }

            } else if (this.outsideFinRelationData.actionType === 'DELETE' && this.deleteIndex > -1) {
                this.componentData.data.splice(this.deleteIndex, 1);
                document.getElementById('OUTSIDE_FIN_REL_DELETE_BTN' + this.id).click();
            }
            this.clearData();
        }));
    }

    clearData() {
        this.entitySearchOptions = getEndPointForEntity(this._formBuilder.baseURL);
        this.outsideFinRelationData = new OutsideFinRelation();
        this.entityDetails = {};
        this.editIndex = -1;
        this.deleteIndex = -1;
        this.currentTab = 'MY_ENTITIES';
        this.isDuplicate = false;
    }

    async addRowItem() {
        if (this.isDuplicate) {
            return null;
        }
        const RO: RelationShipSaveRO | EntitySaveRO = this.setEntityROForSave(this.entityDetails);
        try {
            const RESPONSE = await this._api.saveEntityOrRelation(RO);
            this.setPersonEntityId(RESPONSE);
            this.setEntityInfoForOutsideFinRelationData();
            this.childEvents.emit({ action: 'ADD', data: this.outsideFinRelationData });
            this.emitEditOrSaveAction('ADD', this.outsideFinRelationData);
        } catch (err) {
            if ((err.status === 405)) {
                this.setEntityInfoForOutsideFinRelationData();
                this.childEvents.emit({action: 'ADD', data: this.outsideFinRelationData});
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
            ENTITY_SAVE_RO.staffInvolvement = this.outsideFinRelationData.personsRelationWithEntity;
            this._commonService.isUnifiedQuestionnaireEnabled ? ENTITY_SAVE_RO.perEntDisclTypeSelection = [2] : ENTITY_SAVE_RO.validPersonEntityRelTypeCodes = [5];
            return ENTITY_SAVE_RO;
        }
    }

    private setPersonEntityId(response): void {
        if (!this.entityDetails.personEntityId) {
            this.entityDetails.personEntityId = response.personEntityId;
            this.emitEditOrSaveAction('NEW_SFI', this.outsideFinRelationData);
        }
    }

    private setEntityInfoForOutsideFinRelationData(): void {
        this.outsideFinRelationData.entityInfo.countryName = this.entityDetails.countryName;
        this.outsideFinRelationData.entityInfo.entityName = this.entityDetails.entityName;
        this.outsideFinRelationData.entityInfo.entityType = this.entityDetails.entityType;
        this.outsideFinRelationData.entityInfo.relationship = this.entityDetails.validPersonEntityRelType;
        this.outsideFinRelationData.entityInfo.entityRiskCategory = this.entityDetails.entityRiskCategory;
        this.outsideFinRelationData.entityInfo.isFormCompleted = this.entityDetails.isFormCompleted ? 'Y' : 'N';
        this.outsideFinRelationData.entityInfo.sfiVersionStatus = this.entityDetails.personEntityVersionStatus;
        this.outsideFinRelationData.entityInfo.involvementStartDate = parseDateWithoutTimestamp(new Date());

        this.outsideFinRelationData.personEntityId = this.entityDetails.personEntityId;
        this.outsideFinRelationData.opaDisclosureId = this.formBuilderId;
        this.outsideFinRelationData.actionType = 'SAVE';
        this.outsideFinRelationData.opaOutsideFinancialInterestId = null;
    }

    editEntityItem(outsideFinRelation: OutsideFinRelation  , index): void {
        this.currentTab = 'ADD_ENTITY';
        this.outsideFinRelationData = deepCloneObject(outsideFinRelation);
        this.editIndex = index;
        this.entityDetails = outsideFinRelation.entityInfo;
    }

    updateEntity() {
        delete this.outsideFinRelationData.updateTimestamp;
        this.outsideFinRelationData.actionType = 'SAVE';
        this.childEvents.emit({action: 'UPDATE', data: this.outsideFinRelationData});
        this.emitEditOrSaveAction('UPDATE', this.outsideFinRelationData);
    }

    deleteEntity() {
        delete this.outsideFinRelationData.updateTimestamp;
        this.outsideFinRelationData.actionType = 'DELETE';
        this.childEvents.emit({action: 'DELETE', data: this.outsideFinRelationData});
        this.emitEditOrSaveAction('DELETE', this.outsideFinRelationData);
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

    checkDuplicate(personEntityId) {
        return this.componentData.data.findIndex(E => E.personEntityId === personEntityId);
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

    viewSlider(personEntityId) {
        openInNewTab('entity-details/entity?', ['personEntityId', 'mode'], [personEntityId, 'view']);
    }

    getMyEntities(): void {
        this._api.getEntities().subscribe((data: any) => {
            this.myEntities = data;
            this.markLinkableEntities();
            this.setFilter(this.currentFilter);
        });
    }

    markLinkableEntities() {
        this.myEntities = this.myEntities.filter(E => !!!this.componentData.data.find(P => P.personEntityId === E.personEntityId));
    }

    linkEntity(entity) {
        this.eventType = 'LINK';
        this.entityDetails = entity;
        this.addRowItem();
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

    removeFromMyEntities() {
        let INDEX = this.filteredEntities.findIndex(E => this.entityDetails.personEntityId === E.personEntityId);
        if (INDEX > -1) {
            this.filteredEntities.splice(INDEX, 1);
        }
        INDEX = this.myEntities.findIndex(E => this.entityDetails.personEntityId === E.personEntityId);
        if (INDEX > -1) {
            this.myEntities.splice(INDEX, 1);
        }
    }

    getEntityRelationTypePills(validPersonEntityRelType: string) {
        if (validPersonEntityRelType) {
            if (this.relationshipTypeCache[validPersonEntityRelType]) {
                return this.relationshipTypeCache[validPersonEntityRelType];
            }
            const ENTITY_REL_TYPES = validPersonEntityRelType.split(':;:');
            this.relationshipTypeCache[validPersonEntityRelType] = ENTITY_REL_TYPES.map(entity => {
                const relationshipType = entity.split(':');
                return {relationshipType: relationshipType[0] || '', description: relationshipType[1] || ''};
            });
            return this.relationshipTypeCache[validPersonEntityRelType];
        }
    }

    emitEditOrSaveAction(actionPerformed, event) {
        this._formBuilder.$formBuilderActionEvents.next({action: actionPerformed, actionResponse: event, component: this.componentData});
    }

}
