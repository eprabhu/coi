import { COMMON_ERROR_TOAST_MSG, ENTITY_VERIFICATION_STATUS, HTTP_SUCCESS_STATUS, RelationshipType } from './../../app-constants';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { CORPORATE_FAMILY, CorporateFamilyTab, ENTITY_VERSION_STATUS, CORPORATE_TREE_CONFIRMED_INFO_TEXT, CORPORATE_TREE_UNCONFIRMED_INFO_TEXT } from '../shared/entity-constants';
import { EntityDataStoreService } from '../entity-data-store.service';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { closeCommonModal, isEmptyObject, openCommonModal, openInNewTab } from '../../common/utilities/custom-utilities';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { setEntityObjectFromElasticResult } from '../../common/utilities/elastic-utilities';
import { DataStoreEvent, EntireEntityDetails, EntityDetails, EntityVersion } from '../shared/entity-interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { interval, Subject, Subscription } from 'rxjs';
import { EntityCorporateFamilyService } from './entity-corporate-family.service';
import { CorporateFamilySection, CorporateTreeServiceResponse, CorporateTreeUnlinkRO, EntityTreeStructure, NewTreeClass, RelationshipClass } from './entity-corporate-family.interface';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { debounce } from 'rxjs/operators';
import { EntityManagementService } from '../entity-management.service';

@Component({
    selector: 'app-entity-corporate-family',
    templateUrl: './entity-corporate-family.component.html',
    styleUrls: ['./entity-corporate-family.component.scss']
})
export class EntityCorporateFamilyComponent implements OnInit, OnDestroy {

    corporateFamilyObj = new CorporateFamilySection();
    isTreeEmpty = true;
    isEditMode = false;
    ADD_RELATION_MODAL_ID = 'ENTITY_ADD_RELATIONS_MODAL';
    UNLINK_CONFIRMATION_MODAL_ID = 'UNLINK_CONFIRMATION_MODAL';
    addRelationModalConfig = new CommonModalConfig(this.ADD_RELATION_MODAL_ID, 'Add Relation', 'Cancel');
    unLinkConfirmationModalConfig = new CommonModalConfig(this.UNLINK_CONFIRMATION_MODAL_ID, 'Unlink', 'Cancel');
    relationsObj = new RelationshipClass();
    entitySearchOptions: any = {};
    entityClearField: any = false;
    mandatoryList = new Map();
    relationshipTypeList = [
        { code: RelationshipType.Parent, description: 'Parent' },
        { code: RelationshipType.Child, description: 'Child' }
    ];
    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    searchText: string;
    currentEntity = new EntityTreeStructure();
    currentParentEntity = new EntityTreeStructure();
    modalAction: 'ADD' | 'EDIT' | null;
    parentExistErrorMsg: string;
    entityAlreadyPresent = false;
    $searchDebounceEvent = new Subject<string>();
    flattenedArrayForSearch: any = [];
    isSmallScreen = false;
    isShowCommentButton = false;
    commentCount = 0;
    infoText = '';
    canManageCorporateFamily = false;
    activeEntityVersion: EntityVersion | null = null;

    constructor(private _commonService: CommonService,
        public _entityCorporateFamilyService: EntityCorporateFamilyService,
        public entityManagementService: EntityManagementService,
        private _dataStoreService: EntityDataStoreService, private _elasticConfig: ElasticConfigService) { }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.entitySearchOptions = this._elasticConfig.getElasticForActiveVerifiedEntity();
        this.addRelationModalConfig.displayOptions.modalSize = 'lg';
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchFamilyTree();
        this.listenDebounceEvent();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(CORPORATE_FAMILY);
    }

    private listenDebounceEvent(): void {
        this.$subscriptions.push(this.$searchDebounceEvent.pipe(debounce(() => interval(500))).subscribe((data: any) => {
            if (data) {
                this._entityCorporateFamilyService.foundEntitiesId = this.searchText ? this.filterArray() : [];
            }
        }
        ));
    }

    private filterArray(): number[] {
        return this.flattenedArrayForSearch.filter(obj => {
            const KEYS = Object.keys(obj)[0];
            const { name, duns } = obj[KEYS];
            return (name?.toLowerCase()?.includes(this.searchText.toLowerCase())) || (duns?.includes(this.searchText));
        }).map(obj => parseInt(Object.keys(obj)[0]));
    }

    private flattenTree(entity: EntityTreeStructure): any {
        const flattenedArrayForSearch: Array<Record<number, { name: string, duns: string }>> = [];
        flattenedArrayForSearch.push({
            [entity.entityId]: {
                name: entity.entityName,
                duns: entity.dunsNumber
            }
        });
        if (entity?.child?.length) {
            for (const CHILD of entity.child) {
                const CHILD_ARRAY = this.flattenTree(CHILD);
                if (CHILD_ARRAY && Array.isArray(CHILD_ARRAY)) {
                    flattenedArrayForSearch.push(...CHILD_ARRAY);
                }
            }
        }
        return flattenedArrayForSearch;
    }

    private fetchFamilyTree(): void {
        this.$subscriptions.push(this._entityCorporateFamilyService.fetchFamilyTree(this.entityDetails.entityNumber).subscribe((data: EntityTreeStructure) => {
            if (data && !isEmptyObject(data)) {
                this._entityCorporateFamilyService.coporateFamilyTree = data;
                this.addVisibleProperty(this._entityCorporateFamilyService.coporateFamilyTree);
                this.flattenedArrayForSearch = this.flattenTree(this._entityCorporateFamilyService.coporateFamilyTree);
                this.isTreeEmpty = false;
            } else {
                this.isTreeEmpty = true;
            }
        }, error => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
        ));
    }

    private addVisibleProperty(tree: EntityTreeStructure): void {
        tree.visible = true;
        if (tree.child && tree.child.length > 0) {
            tree.child.forEach(childEntity => this.addVisibleProperty(childEntity));
        }
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        const IS_UNCONFIRMED_ENTITY = this.entityDetails?.entityStatusType?.entityStatusTypeCode.toString() === ENTITY_VERIFICATION_STATUS.UNVERIFIED.toString();
        const IS_FIRST_VERSION = this.entityDetails?.versionNumber.toString() === '1';
        this.infoText = (IS_UNCONFIRMED_ENTITY && IS_FIRST_VERSION) ? CORPORATE_TREE_UNCONFIRMED_INFO_TEXT : CORPORATE_TREE_CONFIRMED_INFO_TEXT;
        this.commentCount = ENTITY_DATA.commentCountList?.[CORPORATE_FAMILY.sectionTypeCode] || 0;
        this.activeEntityVersion = ENTITY_DATA.entityVersionList?.find((version: EntityVersion) => version?.versionStatus === ENTITY_VERSION_STATUS.ACTIVE) || null;
        this.checkUserHasRight();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            }));
    }

    private setSectionIdAndName(): void {
        this.corporateFamilyObj.sectionId = this._commonService.getSectionId(CorporateFamilyTab, 'CORPORATE_FAMILY');
        this.corporateFamilyObj.sectionName = this._commonService.getSectionName(CorporateFamilyTab, 'CORPORATE_FAMILY');
    }

    private checkUserHasRight(): void {
        const IS_ENTITY_VERSION_ACTIVE = this.entityDetails?.versionStatus === ENTITY_VERSION_STATUS.ACTIVE;
        const IS_ENTITY_CONFIRMED = this.entityDetails?.entityStatusTypeCode?.toString() === ENTITY_VERIFICATION_STATUS.VERIFIED?.toString();
        this.canManageCorporateFamily = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME');
        this.isEditMode = this.canManageCorporateFamily && IS_ENTITY_VERSION_ACTIVE && IS_ENTITY_CONFIRMED;
        this.isSmallScreen = window.innerWidth <= 1200;
    }

    private checkForMandatory(): boolean {
        this.mandatoryList.delete('entityName');
        this.mandatoryList.delete('relation');
        if (!this.relationsObj?.selectedEntity?.entityId) {
            this.mandatoryList.set('entityName', 'Please select an entity.');
        }
        if (!this.relationsObj?.selectedRelation?.code) {
            this.mandatoryList.set('relation', 'Please select a relation.');
        }
        return this.mandatoryList.size <= 0;
    }

    entitySelectedEvent(event: any): void {
        if (event) {
            this.entityClearField = new String('false');
            event = setEntityObjectFromElasticResult(event);
            this.relationsObj.selectedEntity = event;
            this.setEntityErrorMsg(event);
        } else {
            this.mandatoryList.delete('sameEntity');
            this.parentExistErrorMsg = null;
            this.entityAlreadyPresent = false;
            this.relationsObj.selectedEntity = null;
        }
    }

    private setEntityErrorMsg(event: any): void {
        this.mandatoryList.delete('sameEntity');
        this.parentExistErrorMsg = null;
        this.entityAlreadyPresent = false;
        const ERROR_MSG = this.getEntityErrorMsg(event);
        ERROR_MSG ? this.mandatoryList.set('sameEntity', ERROR_MSG) : this.checkEntityAlreadyPresent(event?.entityNumber);
    }

    private getEntityErrorMsg(event: any): string | null {
        const ENTITY_NUMBER_MATCH = this.modalAction ? this.currentEntity?.entityNumber === event?.entityNumber : this.entityDetails?.entityNumber === event?.entityNumber;
        const IS_ADDING_CHILD_AS_PARENT = this.modalAction === 'EDIT' && this.currentEntity?.child?.some(ele => ele?.entityNumber === event?.entityNumber);
        const IS_ADDING_TREE_NODE = this.modalAction === 'ADD' && this.currentEntity?.entityNumber && this.locateEntityInTree(this._entityCorporateFamilyService.coporateFamilyTree, event?.entityId);
        if (ENTITY_NUMBER_MATCH) {
            return 'An entity cannot form a relationship with itself.';
        } else if (IS_ADDING_CHILD_AS_PARENT) {
            return 'The selected entity is already assigned as a child of your entity. To proceed, please change the parent of the selected entity.';
        } else if (IS_ADDING_TREE_NODE) {
            return 'This entity is already part of the family tree and cannot be added again.';
        }
        return null;
    }

    private checkEntityAlreadyPresent(entityNumber: number | string): void {
        this.$subscriptions.push(this._entityCorporateFamilyService.checkEntityAlreadyPresent(entityNumber).subscribe((data: boolean) => {
            this.entityAlreadyPresent = data;
            this.resetErrorMsg();
        }, (error: any) => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private clearModalValue(modalId: string): void {
        closeCommonModal(modalId);
        setTimeout(() => {
            this.relationsObj = new RelationshipClass();
            this.currentEntity = new EntityTreeStructure();
            this.currentParentEntity = new EntityTreeStructure();
            this.entityClearField = new String('true');
            this.parentExistErrorMsg = '';
            this.entityAlreadyPresent = false;
            this.modalAction = null;
            this.mandatoryList.clear();
        }, 200);
    }

    private addNewTree(): void {
        this.$subscriptions.push(this._entityCorporateFamilyService.addNewTree(this.getReqObj()).subscribe((data: CorporateTreeServiceResponse) => {
            this.afterAPISuccess(this.ADD_RELATION_MODAL_ID, 'Tree added successfully.', data);
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
        ));
    }

    private getReqObj(): NewTreeClass {
        const NEW_TREE_RO = new NewTreeClass();
        if (this.relationsObj.selectedRelation?.code == RelationshipType.Child) {
            NEW_TREE_RO.entityId = this.relationsObj?.selectedEntity?.entityId;
            NEW_TREE_RO.parentEntityId = this.currentEntity?.entityId || this.entityDetails?.entityId;
            NEW_TREE_RO.entityNumber = this.relationsObj?.selectedEntity?.entityNumber;
            NEW_TREE_RO.parentEntityNumber = this.currentEntity?.entityNumber || this.entityDetails?.entityNumber;
        } else if (this.relationsObj.selectedRelation?.code == RelationshipType.Parent) {
            NEW_TREE_RO.entityId = this.currentEntity?.entityId || this.entityDetails?.entityId;
            NEW_TREE_RO.parentEntityId = this.relationsObj?.selectedEntity?.entityId;
            NEW_TREE_RO.entityNumber = this.currentEntity?.entityNumber || this.entityDetails?.entityNumber;
            NEW_TREE_RO.parentEntityNumber = this.relationsObj?.selectedEntity?.entityNumber;
        }
        //First time new entity tree creation.
        NEW_TREE_RO.roleTypeCodes = ['9159'];
        NEW_TREE_RO.currentEntityId = this.entityDetails?.entityId;
        NEW_TREE_RO.currentEntityNumber = this.entityDetails?.entityNumber;
        return NEW_TREE_RO;
    }

    private editExistingNode(): void {
        const EDIT_TREE_RO = new NewTreeClass();
        EDIT_TREE_RO.entityId = this.currentEntity?.entityId;
        EDIT_TREE_RO.parentEntityId = this.relationsObj?.selectedEntity?.entityId;
        EDIT_TREE_RO.entityNumber = this.currentEntity?.entityNumber;
        EDIT_TREE_RO.parentEntityNumber = this.relationsObj?.selectedEntity?.entityNumber;
        this.$subscriptions.push(this._entityCorporateFamilyService.editNode(EDIT_TREE_RO).subscribe((data: CorporateTreeServiceResponse) => {
            this.afterAPISuccess(this.ADD_RELATION_MODAL_ID, 'Tree updated successfully.', data);
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private locateEntityInTree(entity: EntityTreeStructure, entityId: string | number): EntityTreeStructure | null {
        if (entity?.entityId === entityId){
            return entity;
        }
        for (const child of entity.child) {
            const result = this.locateEntityInTree(child, entityId);
            if (result) {
                return result;
            }
        }
        return null;
    }

    private afterAPISuccess(modalId: string, toastMessage: string, response: CorporateTreeServiceResponse): void {
        this.fetchFamilyTree();
        this.clearModalValue(modalId);
        this.entityDetails.isForeign = response?.isForeign;
        this._dataStoreService.updateStore(['entityFamilyTreeRoles', 'entityDetails'], { entityFamilyTreeRoles: response?.entityFamilyTreeRoles, entityDetails: this.entityDetails } );
        this._commonService.showToast(HTTP_SUCCESS_STATUS, toastMessage);
    }

    private getCorporateTreeUnlinkRO(): CorporateTreeUnlinkRO {
        return {
            entityNumber: this.currentEntity?.entityNumber,
            currentEntityNumber: this.entityDetails?.entityNumber,
            currentEntityId: this.entityDetails?.entityId,
        };
    }

    openEntityAddModal(entity: any): void {
        this.currentEntity = entity;
        this.modalAction = 'ADD';
        if (this.currentEntity?.parentEntityId || this.currentEntity?.isSystemCreated) {
            this.relationsObj.selectedRelation = this.relationshipTypeList.find(relationship => relationship.code === RelationshipType.Child);
        }
        this.addRelationModalConfig.namings.primaryBtnName = 'Add Relation';
        openCommonModal(this.ADD_RELATION_MODAL_ID);
    }

    editEntityNode(entity: any): void {
        this.currentEntity = entity;
        this.modalAction = 'EDIT';
        this.currentParentEntity = this.locateEntityInTree(this._entityCorporateFamilyService.coporateFamilyTree, entity.parentEntityId);
        this.relationsObj.selectedRelation = this.relationshipTypeList.find(relationship => relationship.code === RelationshipType.Parent);
        this.entitySearchOptions.defaultValue = this.currentParentEntity?.entityName;
        this.entityClearField = new String('false');
        this.addRelationModalConfig.namings.primaryBtnName = 'Update Relation';
        openCommonModal(this.ADD_RELATION_MODAL_ID);
    }

    unLinkConfirmationModalAction(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            this.$subscriptions.push(this._entityCorporateFamilyService.unLinkNode(this.getCorporateTreeUnlinkRO()).subscribe((data: CorporateTreeServiceResponse) => {
                this.afterAPISuccess(this.UNLINK_CONFIRMATION_MODAL_ID, 'Node unlinked successfully.', data);
            }, err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            }));
        } else {
            this.clearModalValue(this.UNLINK_CONFIRMATION_MODAL_ID);
        }
    }

    addRelationModalActions(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            if (this.checkForMandatory() && !this.parentExistErrorMsg) {
                this.currentParentEntity?.entityId ? this.editExistingNode() : this.addNewTree();
            }
        } else {
            this.clearModalValue(this.ADD_RELATION_MODAL_ID);
        }
    }

    openAddRelationModal(): void {
        openCommonModal(this.ADD_RELATION_MODAL_ID);
    }

    openUnlinkModal(entity: any): void {
        this.currentEntity = entity;
        openCommonModal(this.UNLINK_CONFIRMATION_MODAL_ID);
    }

    searchForEntity() {
        this.searchText = this.searchText.trim();
        this.searchText ? this.$searchDebounceEvent.next('true') : this._entityCorporateFamilyService.foundEntitiesId = [];
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.isSmallScreen = window.innerWidth <= 1200;
    }

    resetErrorMsg() {
        if ((this.modalAction === 'EDIT') || ((this.modalAction === 'ADD' || !this.modalAction) && this.relationsObj.selectedRelation?.code === RelationshipType.Parent)) {
            this.parentExistErrorMsg = null;
        } else if(this.entityAlreadyPresent && this.relationsObj.selectedRelation?.code) {
            this.parentExistErrorMsg = 'The selected entity already has a parent. To change it, edit and update the parent from the selected entity.';
        }
    }

    openEntityInNewTab(entityId: string | number): void {
        openInNewTab('manage-entity/entity-corporate-family?', ['entityManageId'], [entityId]);
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: CORPORATE_FAMILY.commentTypeCode,
            sectionTypeCode: CORPORATE_FAMILY.sectionTypeCode
        });
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this._entityCorporateFamilyService.foundEntitiesId = [];
    }

    viewActiveEntity(): void {
        this.openEntityInNewTab(this.activeEntityVersion?.entityId);
    }

}
