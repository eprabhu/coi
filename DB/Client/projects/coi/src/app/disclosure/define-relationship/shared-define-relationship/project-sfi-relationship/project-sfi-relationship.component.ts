import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../../../common/services/common.service';
import { DefineRelationshipService } from '../../services/define-relationship.service';
import { AddConflictSlider, COI, CoiDisclEntProjDetail, CoiProjConflictStatusType, DefineRelationshipDataStore, ProjectSfiRelationConflictRO, ProjectSfiRelationLoadRO, ProjectSfiRelations, SaveProjectSfiConflict } from '../../../coi-interface';
import { interval, Observable, Subscription } from 'rxjs';
import { DefineRelationshipDataStoreService } from '../../services/define-relationship-data-store.service';
import { DataStoreService } from '../../../services/data-store.service';
import { CoiService } from '../../../services/coi.service';
import { ADMIN_DASHBOARD_RIGHTS, AUTO_SAVE_DEBOUNCE_TIME, COI_DISCLOSURE_SUPER_ADMIN_RIGHTS, COMMON_ERROR_TOAST_MSG, DISCLOSURE_TYPE, ENTITY_RIGHTS, HTTP_ERROR_STATUS, OPA_DISCLOSURE_ADMIN_RIGHTS, OPA_DISCLOSURE_RIGHTS } from '../../../../app-constants';
import { AutoSaveEvent, AutoSaveService } from '../../../../common/services/auto-save.service';
import { debounce } from 'rxjs/operators';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { deepCloneObject, isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { DataStoreEvent, GlobalEventNotifier } from '../../../../common/services/coi-common.interface';
import { RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG } from '../../../../no-info-message-constants';

@Component({
    selector: 'app-project-sfi-relationship',
    templateUrl: './project-sfi-relationship.component.html',
    styleUrls: ['./project-sfi-relationship.component.scss'],
})
export class ProjectSfiRelationshipComponent implements OnInit, OnDestroy {

    height: any;
    isStart = false;
    loginPersonId = '';
    coiData = new COI();
    isExpandInfo = false;
    canManageDisclosure = false;
    isShowEngagementRisk = false;
    $subscriptions: Subscription[] = [];
    mandatoryList: Map<string, string> = new Map();
    projectSfiRelationsList: ProjectSfiRelations[] = [];
    intersectionObserverOptions: IntersectionObserverInit;
    filteredProjectSfiRelationsList: ProjectSfiRelations[] = [];
    RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG = RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG;

    constructor(public coiService: CoiService,
                private _dataStore: DataStoreService,
                private _commonService: CommonService,
                private _autoSaveService: AutoSaveService,
                public defineRelationshipService: DefineRelationshipService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService) {
        // should be first always for height calculation
        this.defineRelationshipService.isShowProjectSfiConflict[0] = true;
    }

    ngOnInit(): void {
        this.getDataFromStore();
        this.getDataFromRelationStore();
        this.listenDataChangeFromStore();
        this.listenGlobalEventNotifier();
        this.listenDataChangeFromRelationStore();
        this.triggerSingleSave();
        this.listenAutoSave();
        this.loginPersonId = this._commonService.getCurrentUserDetail('personID');
        if (this.defineRelationshipService.isShowErrorToast) {
            this.defineRelationshipService.isShowErrorToast = false;
            this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'TRIGGER_DISCLOSURE_PARAM_CHANGE' && event.content.disclosureType === 'FCOI') {
                    if (event?.content?.coiData) {
                        this.getProjectRelations(event?.content?.coiData);
                    }
                }
            })
        );
    }

    private getProjectRelations(coiData: COI): void {
        this.$subscriptions.push(
            this.updateRelationshipDataStore(coiData).subscribe(
                (response) => {
                    this._defineRelationshipDataStore.setStoreData(response);
                },
                (error) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            ));
    }

    private updateRelationshipDataStore(coiData: COI): Observable<any> {
        const COI_DATA: COI = coiData;
        const PROJECT_SFI_RELATION: ProjectSfiRelationLoadRO = {
            personId: COI_DATA.coiDisclosure.person.personId,
            disclosureId: COI_DATA.coiDisclosure.disclosureId,
            disclosureNumber: COI_DATA.coiDisclosure.disclosureNumber,
            dispositionStatusCode: COI_DATA.coiDisclosure.dispositionStatusCode
        };
        return this._commonService.getProjectRelations(PROJECT_SFI_RELATION);
    }

    // AUTO SAVE FEATURE STARTS

    private triggerSingleSave(): void {
        this.$subscriptions.push(this.defineRelationshipService.$autoSaveDebounce.pipe(debounce(() => interval(AUTO_SAVE_DEBOUNCE_TIME))).subscribe((data: any) => {
            this._autoSaveService.commonSaveTrigger$.next({ action: 'SAVE' });
        }));
    }

    private listenAutoSave(): void {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe((event: AutoSaveEvent) => {
            switch(event.action) {
                case 'SAVE': return this.handleAutoSave();
                case 'RETRY': return this.handleFailedApis();
                default: return;
            }
        }));
    }

    private handleFailedApis(): void {
        if (this.defineRelationshipService.apiFailedKeysList?.length) {
            this.defineRelationshipService.apiFailedKeysList?.forEach(key => this.saveProjectSfiConflict(key));
            this.defineRelationshipService.apiFailedKeysList = [];
        }
    }

    private handleAutoSave(): void {
        if (this.defineRelationshipService.autoSaveKeysList?.length) {
            this.defineRelationshipService.autoSaveKeysList?.forEach((sfiDetails: CoiDisclEntProjDetail) => {
                // emitted data is saved due to filtering project feature.
                this.manageRequestObject(sfiDetails.coiDisclProjectEntityRelId, sfiDetails, 'NEW_CHANGE');
            });
            this.defineRelationshipService.autoSaveKeysList = [];
        }
    }

    private validateProjectSfiConflict(sfiDetails: CoiDisclEntProjDetail): boolean {
        const IS_VALID_CONFLICT_STATUS = !!sfiDetails?.projectConflictStatusCode;
        const IS_VALID_CONFLICT_COMMENT = !!sfiDetails?.personEngagementDetails.trim();
        return IS_VALID_CONFLICT_STATUS && IS_VALID_CONFLICT_COMMENT;
    }

    /**
     * Manages the auto-save queue for project conflicts based on the provided key, value, and change type.
     *
     * @param key - A unique identifier for the request, which can be a number or a string.
     * @param value - The object representing the project conflict details to be managed.
     * @param changeType - The type of change being managed, either:
     *                     - 'NEW_CHANGE': Indicates a new change to be added to the queue.
     *                     - 'SAVED_CHANGE': Indicates a change that has been saved and needs comparison.
     *
     * Functionality:
     * - For 'NEW_CHANGE':
     *    - Adds the new value to the auto-save queue.
     *    - If the queue for the key is empty or the key is in the list of failed keys, it initiates the save process.
     *
     * - For 'SAVED_CHANGE':
     *    - Retrieves and compares the saved and queued representations of the conflict.
     *    - If both are equal, removes the key from the queue.
     *    - Otherwise, re-initiates the save process.
     */
    private manageRequestObject(key: number | string, value: CoiDisclEntProjDetail, changeType: 'NEW_CHANGE' | 'SAVED_CHANGE'): void {
        if (!key)  { return; }
        const IS_EMPTY_QUEUE = !this.defineRelationshipService.autoSaveRelationQueue?.[key];
        if (changeType === 'NEW_CHANGE') {
            this.defineRelationshipService.autoSaveRelationQueue[key] = deepCloneObject(value);
            if (IS_EMPTY_QUEUE) {
                this.saveProjectSfiConflict(key);
            }
        }

        if (changeType === 'SAVED_CHANGE') {
            if (this.hasSameCommentAndStatus(value, this.defineRelationshipService.autoSaveRelationQueue[key])) {
                delete this.defineRelationshipService.autoSaveRelationQueue[key];
                delete this._defineRelationshipDataStore.relationshipMap[key];
            } else {
                this.saveProjectSfiConflict(key);
            }
        }
        this.handleFailedApis();
    }

    /**
     * Compares two `CoiDisclEntProjDetail` objects to determine if they have the same comment, status code,
     * and project entity relationship ID.
     *
     * @param obj1 - The first object of type `CoiDisclEntProjDetail` to compare.
     * @param obj2 - The second object of type `CoiDisclEntProjDetail` to compare.
     * @returns `true` if the `personEngagementDetails`, `projectConflictStatusCode`, and `coiDisclProjectEntityRelId`
     *          properties are identical in both objects; otherwise, `false`.
     */
    private hasSameCommentAndStatus(obj1: CoiDisclEntProjDetail, obj2: CoiDisclEntProjDetail): boolean {
        return obj1?.personEngagementDetails === obj2?.personEngagementDetails
               && obj1?.projectConflictStatusCode === obj2?.projectConflictStatusCode
               && obj1?.coiDisclProjectEntityRelId === obj2?.coiDisclProjectEntityRelId;
    }

    private saveProjectSfiConflict(key: number | string): void {
        const CURRENT_CHANGE: CoiDisclEntProjDetail = deepCloneObject(this.defineRelationshipService.autoSaveRelationQueue[key]);
        if (CURRENT_CHANGE?.coiDisclProjectEntityRelId && this.validateProjectSfiConflict(CURRENT_CHANGE)) {
            this._commonService.setLoaderRestriction();
            this._commonService.showAutoSaveSpinner();
            this.$subscriptions.push(
                this.defineRelationshipService.saveProjectSfiConflict(this.getProjectSfiRelationConflictRO(CURRENT_CHANGE))
                    .subscribe((res: SaveProjectSfiConflict) => {
                        this.updateSfiDetails(CURRENT_CHANGE, res.conflictDetails[0]);
                        this.manageRequestObject(key, CURRENT_CHANGE, 'SAVED_CHANGE');
                        if (isEmptyObject(this.defineRelationshipService.autoSaveRelationQueue)) {
                            this.checkAndSetAvailableChanges();
                            this._commonService.hideAutoSaveSpinner('SUCCESS');
                            this.defineRelationshipService.updateDisclosureConflictStatus(res);
                        }
                    }, (error: any) => {
                        if (error.status === 405) {
                            this._commonService.concurrentUpdateAction = 'Modify Conflict';
                        } else {
                            if (!this.defineRelationshipService.apiFailedKeysList.includes(key)) {
                                this.defineRelationshipService.apiFailedKeysList.push(key);
                            }
                        }
                        this._commonService.isShowLoader.next(false);
                        this._commonService.hideAutoSaveSpinner('ERROR');
                    }));
            this._commonService.removeLoaderRestriction();
        } else {
            this.manageRequestObject(key, CURRENT_CHANGE, 'SAVED_CHANGE');
        }
    }

    private checkAndSetAvailableChanges(): void {
        setTimeout(() => {
            const HAS_ANY_CHANGES = !!this._commonService.loaderRestrictedUrls.length && !!this.defineRelationshipService.apiFailedKeysList.length;
            this._commonService.setChangesAvailable(HAS_ANY_CHANGES);
        });
    }

    // for updating corresponding sfi details
    private updateSfiDetails(sfiDetails: CoiDisclEntProjDetail, res?: ProjectSfiRelationConflictRO): void {
        const PROJECT_SFI_RELATIONS_LIST: ProjectSfiRelations[] = this._defineRelationshipDataStore.getBaseStoreData();
        const PROJECT_SFI_RELATION = PROJECT_SFI_RELATIONS_LIST?.find(type => type.coiDisclProjectId === sfiDetails.coiDisclProjectId);
        sfiDetails.prePersonEntityId = sfiDetails.personEntityId;
        const STATUS_TYPE = this.defineRelationshipService.coiStatusList.find((type: CoiProjConflictStatusType) =>
            type.projectConflictStatusCode === sfiDetails.projectConflictStatusCode
        );
        sfiDetails.coiProjConflictStatusType = deepCloneObject(STATUS_TYPE);
        this._defineRelationshipDataStore.updateCoiDisclEntProjDetails(PROJECT_SFI_RELATION.projectId, sfiDetails, ['coiProjConflictStatusType', 'prePersonEntityId', 'personEngagementDetails', 'projectConflictStatusCode']);
        this.updateConflictCount(sfiDetails);
    }

    // for updating corresponding project count
    private updateConflictCount(sfiDetails: CoiDisclEntProjDetail): void {
        const PROJECT_SFI_RELATIONS_LIST: ProjectSfiRelations[] = this._defineRelationshipDataStore.getBaseStoreData();
        const PROJECT_SFI_RELATION = PROJECT_SFI_RELATIONS_LIST?.find(type => type.coiDisclProjectId === sfiDetails.coiDisclProjectId);
        const { conflictCount, conflictCompleted, conflictStatusCode, conflictStatus } = this.defineRelationshipService.getFormattedConflictData(PROJECT_SFI_RELATION.coiDisclEntProjDetails);
        PROJECT_SFI_RELATION.conflictCount = conflictCount;
        PROJECT_SFI_RELATION.conflictStatus = conflictStatus;
        PROJECT_SFI_RELATION.conflictCompleted = conflictCompleted;
        PROJECT_SFI_RELATION.conflictStatusCode = conflictStatusCode;
        this._defineRelationshipDataStore.updateOrReplaceProject(PROJECT_SFI_RELATION, ['conflictCount', 'conflictCompleted', 'conflictStatus', 'conflictStatusCode']);
    }

    private getProjectSfiRelationConflictRO(sfiDetails: CoiDisclEntProjDetail): ProjectSfiRelationConflictRO {
        const COI_DATA: COI = this._dataStore.getData();
        return new ProjectSfiRelationConflictRO({
            applyAll: false,
            relationshipSFIMode: false,
            projectEngagementDetails: sfiDetails?.personEngagementDetails,
            personEntityId: sfiDetails?.personEntityId,
            coiDisclProjectId: sfiDetails?.coiDisclProjectId,
            personId: COI_DATA.coiDisclosure.person.personId,
            disclosureId: COI_DATA.coiDisclosure.disclosureId,
            disclosureNumber: COI_DATA.coiDisclosure.disclosureNumber,
            projectConflictStatusCode: sfiDetails?.projectConflictStatusCode,
            coiDisclProjectEntityRelId: sfiDetails?.coiDisclProjectEntityRelId,
        });
    }

    // AUTO SAVE FEATURE ENDS

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((data: DataStoreEvent) => {
                this.getDataFromStore();
            })
        );
    }

    private getDataFromStore(): void {
        const COI_DATA = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
        this.coiData = COI_DATA;
        this.canManageDisclosure = this.getManageDisclosureRight() && this._dataStore.getIsAdminOrCanManageAffiliatedDiscl();
        const FCOI_ADMIN_RIGHTS = this._commonService.getAvailableRight(COI_DISCLOSURE_SUPER_ADMIN_RIGHTS) || this._commonService.getAvailableRight(ADMIN_DASHBOARD_RIGHTS);
        const OPA_ADMIN_RIGHTS = this._commonService.getAvailableRight(OPA_DISCLOSURE_ADMIN_RIGHTS) || this._commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
        const ENTITY_ADMIN_RIGHTS = this._commonService.getAvailableRight(ENTITY_RIGHTS);
        const IS_SHOW_ENGAGEMENT_RISK = FCOI_ADMIN_RIGHTS || OPA_ADMIN_RIGHTS || ENTITY_ADMIN_RIGHTS || this._dataStore.isShowEngagementRisk;
        if (this.isShowEngagementRisk !== IS_SHOW_ENGAGEMENT_RISK) {
            this.isShowEngagementRisk = IS_SHOW_ENGAGEMENT_RISK;
        }
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.projectId === 'ALL' || changes.searchChanged || changes.updatedKeys.includes('coiDisclEntProjDetails')) {
                    this.getDataFromRelationStore();
                }
            })
        );
    }

    private getDataFromRelationStore(): void {
        this.defineRelationshipService.isShowProjectSfiConflict = [];
        this.defineRelationshipService.isShowProjectSfiConflict[0] = true;
        this.filteredProjectSfiRelationsList = this._defineRelationshipDataStore.getFilteredStoreData();
        this.projectSfiRelationsList = this._defineRelationshipDataStore.getActualStoreData();
        this.defineRelationshipService.mandatoryList = new Map();
        if (isEmptyObject(this.defineRelationshipService.autoSaveRelationQueue)) {
            this.checkAndSetAvailableChanges();
        }
        this.defineRelationshipService.isLoading = false;
        this.setIntersectionObserver();
    }

    private setIntersectionObserver(): void {
        if (!this.isStart) {
            this.intersectionObserverOptions = {
                root: document.getElementById('SCROLL_SPY_LEFT_CONTAINER'),
                rootMargin: '100px 0px 100px 0px',
                threshold: Array.from({ length: 100 }, (_, i) => i / 100)
            };
        }
        this.defineRelationshipService.updateObserverActivationStatus(this.filteredProjectSfiRelationsList.length, 0, true);
        setTimeout(() => {
            this.height = document.getElementById('COI_PROJECT_SFI_RELATION_0')?.getBoundingClientRect().height + 'px';
            this.isStart = true;
        }, 200);
    }

    private getManageDisclosureRight(): boolean {
        const IS_FCOI_ADMINISTRATOR = this._commonService.getAvailableRight('MANAGE_FCOI_DISCLOSURE');
        const IS_PROJECT_ADMINISTRATOR = this._commonService.getAvailableRight('MANAGE_PROJECT_DISCLOSURE');
        switch (this.coiData.coiDisclosure.coiDisclosureFcoiType?.fcoiTypeCode?.toString()) {
            case DISCLOSURE_TYPE.INITIAL:
            case DISCLOSURE_TYPE.REVISION:
                return IS_FCOI_ADMINISTRATOR;
            case DISCLOSURE_TYPE.PROJECT:
                return IS_PROJECT_ADMINISTRATOR;
        }
    }

    visibleInViewport(event: { isVisible: boolean; observerEntry: IntersectionObserverEntry }, projectIndex: number): void {
        const SCROLL_SPY_INDEX = this.defineRelationshipService.isEditMode ? projectIndex : (projectIndex + 2);
        if (event.isVisible && !this.defineRelationshipService.isShowProjectSfiConflict[projectIndex]) {
            const RELATIONSHIP_DATA: ProjectSfiRelations = this.filteredProjectSfiRelationsList[projectIndex];
            const UNIQUE_ID = RELATIONSHIP_DATA.projectId || RELATIONSHIP_DATA.personEntityId;
            const UPDATED_RELATION = this._defineRelationshipDataStore.getFilteredStoreData(UNIQUE_ID);
            Object.assign(this.filteredProjectSfiRelationsList[projectIndex], UPDATED_RELATION);
        }
        this.defineRelationshipService.isShowProjectSfiConflict[projectIndex] = event.isVisible;
        this.defineRelationshipService.updateScrollSpyConfig(event, SCROLL_SPY_INDEX);
    }

    closeAddConflictSlider(event: string): void {
        this.defineRelationshipService.addConflictSlider = new AddConflictSlider();
    }

}
