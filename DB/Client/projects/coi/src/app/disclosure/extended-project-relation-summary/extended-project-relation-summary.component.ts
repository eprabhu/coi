import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExtendedProjectRelationService } from './services/extended-project-relation.service';
import { ADMIN_DASHBOARD_RIGHTS, COI_DISCLOSURE_SUPER_ADMIN_RIGHTS, COMMON_ERROR_TOAST_MSG, ENTITY_RIGHTS, HTTP_ERROR_STATUS, OPA_DISCLOSURE_ADMIN_RIGHTS, OPA_DISCLOSURE_RIGHTS, PROJECT_DETAILS_ORDER } from '../../app-constants';
import { AddConflictSlider, COI, DefineRelationshipDataStore, DisclosureRelationshipProjectCard, ProjectSfiRelationLoadRO, ProjectSfiRelations } from '../coi-interface';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { CoiService } from '../services/coi.service';
import { DataStoreService } from '../services/data-store.service';
import { DataStoreEvent, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { isEmptyObject } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExtendedProjRelDataStoreService } from './services/extended-project-relation-data-store.service';
import { DefineRelationshipDataStoreService } from '../define-relationship/services/define-relationship-data-store.service';
import { DefineRelationshipService } from '../define-relationship/services/define-relationship.service';
import { RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG } from '../../no-info-message-constants';

@Component({
    selector: 'app-extended-project-relation-summary',
    templateUrl: './extended-project-relation-summary.component.html',
    styleUrls: ['./extended-project-relation-summary.component.scss']
})
export class ExtendedProjectRelationSummaryComponent implements OnInit, OnDestroy {

    private $subscriptions: Subscription[] = [];

    loginPersonId = '';
    coiData = new COI();
    isExpandInfo = false;
    helpTexts: string[] = [];
    isShowEngagementRisk = false;
    mandatoryList: Map<string, string> = new Map();
    filteredProjRelList: ProjectSfiRelations[] = [];
    filteredExtProjRelList: ProjectSfiRelations[] = [];
    extProjSfiRelationsList: ProjectSfiRelations[] = [];
    intersectionObserverOptions: IntersectionObserverInit;
    RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG = RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG;

    constructor(public coiService: CoiService,
                private _dataStore: DataStoreService,
                private _commonService: CommonService,
                public defineRelationshipService: DefineRelationshipService,
                public extendedProjRelService: ExtendedProjectRelationService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
                private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService) {}

    ngOnInit() {
        this.getDataFromStore();
        this.getDataFromRelationStore();
        this.listenDataChangeFromStore();
        this.listenGlobalEventNotifier();
        this.listenDataChangeFromRelationStore();
        this.getDataFromRelationStore();
        this.listenDefineRelationDataStore();
        this.loginPersonId = this._commonService.getCurrentUserDetail('personID');
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getExtendedProjectRelations(coiData: COI): Observable<any> {
        const PROJECT_SFI_RELATION: ProjectSfiRelationLoadRO = {
            personId: coiData?.coiDisclosure?.person?.personId,
            disclosureId: coiData?.coiDisclosure?.disclosureId,
            disclosureNumber: coiData?.coiDisclosure?.disclosureNumber,
            dispositionStatusCode: coiData?.coiDisclosure?.dispositionStatusCode
        };
        return this.extendedProjRelService.getExtendedProjectRelations(PROJECT_SFI_RELATION);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'TRIGGER_DISCLOSURE_PARAM_CHANGE' && event.content.disclosureType === 'FCOI') {
                    if (event?.content?.coiData) {
                        this.getProjectRelations(event?.content?.coiData);
                    }
                }
                if (event?.uniqueId === 'DISCLOSURE_SUMMARY_RIGHT_NAV_TOGGLE' && event.content.tabName === 'RELATIONSHIP') {
                    this.getDefineRelationData();
                }
            })
        );
    }

    private getProjectRelations(coiData: COI): void {
        this.$subscriptions.push(
            this.getExtendedProjectRelations(coiData).subscribe(
                (response) => {
                    this._extendedProjRelDataStoreService.setStoreData(response);
                },
                (error) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }
            ));
    }

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
            this._extendedProjRelDataStoreService.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.projectId === 'ALL' || changes.searchChanged || changes.updatedKeys.includes('coiDisclEntProjDetails')) {
                    this.getDataFromRelationStore();
                }
            })
        );
    }

    private listenDefineRelationDataStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.projectId === 'ALL' || changes.searchChanged || changes.updatedKeys.includes('coiDisclEntProjDetails')) {
                    this.getDefineRelationData();
                }
            })
        );
    }

    private getDefineRelationData(): void {
        this.filteredProjRelList = this._defineRelationshipDataStore.getFilteredStoreData();
    }

    private getDataFromRelationStore(): void {
        this.filteredExtProjRelList = this._extendedProjRelDataStoreService.getFilteredStoreData();
        this.extProjSfiRelationsList = this._extendedProjRelDataStoreService.getActualStoreData();
        this.extendedProjRelService.isLoading = false;
        this.setIntersectionObserver();
    }

    private setIntersectionObserver(): void {
        this.intersectionObserverOptions = {
            root: document.getElementById('SCROLL_SPY_LEFT_CONTAINER'),
            rootMargin: '100px 0px 100px 0px',
            threshold: Array.from({ length: 100 }, (_, i) => i / 100)
        };
    }

    visibleInViewport(event: { isVisible: boolean; observerEntry: IntersectionObserverEntry }, projectIndex: number): void {
        const IS_RELATIONSHIP_TAP_LENGTH = this.coiService.isExpandSummaryBySection['COI803'] ? this.filteredProjRelList?.length : 0;
        const SCROLL_SPY_INDEX = this.extendedProjRelService.isEditMode ? projectIndex : (projectIndex + 2 + IS_RELATIONSHIP_TAP_LENGTH);
        this.defineRelationshipService.updateScrollSpyConfig(event, SCROLL_SPY_INDEX);
    }

    closeAddConflictSlider(event: string): void {
        this.extendedProjRelService.addConflictSlider = new AddConflictSlider();
    }

    emitProjectCardActions(event: DisclosureRelationshipProjectCard): void {
        if (event?.uniqueId === 'OPEN_REVIEW_COMMENTS') {
            this.extendedProjRelService.openReviewerComment(event?.content?.projectSfiRelation, 'RELATIONSHIP');
        }
    }

}
