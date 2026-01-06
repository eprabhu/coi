import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subscription, Subject, interval } from "rxjs";
import { GlobalEventNotifier } from "../../../common/services/coi-common.interface";
import { CommonService } from "../../../common/services/common.service";
import { heightAnimation } from "../../../common/utilities/animations";
import { subscriptionHandler } from "../../../common/utilities/subscription-handler";
import { ProjectSfiRelations, DefineRelationshipDataStore } from "../../coi-interface";
import { CoiService } from "../../services/coi.service";
import { ExtendedProjectRelationService } from "../services/extended-project-relation.service";
import { ExtendedProjRelDataStoreService } from "../services/extended-project-relation-data-store.service";
import { DefineRelationshipDataStoreService } from "../../define-relationship/services/define-relationship-data-store.service";
import { debounce } from "rxjs/operators";
import { DefineRelationshipService } from "../../define-relationship/services/define-relationship.service";
import { RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG } from "../../../no-info-message-constants";

@Component({
    selector: 'app-ext-proj-rel-navigation',
    templateUrl: './ext-proj-rel-navigation.component.html',
    styleUrls: ['./ext-proj-rel-navigation.component.scss'],
    animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class ExtendedProjRelNavigationComponent implements OnInit, OnDestroy {

    @Input() isCardExpanded = true;

    debounceTimer = 800;
    isShowFilter = false;
    extProjSfiRelationsList: ProjectSfiRelations[] = [];
    filteredDefineRelationsList: ProjectSfiRelations[] = [];
    filteredExtProjSfiRelationsList: ProjectSfiRelations[] = [];
    RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG = RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG;

    $subscriptions: Subscription[] = [];
    $debounceEventForSearch = new Subject();

    constructor(public coiService: CoiService,
                private _commonService: CommonService,
                public defineRelationshipService: DefineRelationshipService,
                public extendedProjRelService: ExtendedProjectRelationService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
                private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService) { }
    
    ngOnInit(): void {
        this.getSearchList();
        this.getDataFromRelationStore();
        this.getDataFromExtendedRelationStore();
        this.listenDataChangeFromRelationStore();
        this.listenDataChangeFromExtendedRelationStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromExtendedRelationStore(): void {
        this.$subscriptions.push(
            this._extendedProjRelDataStoreService.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.updatedKeys.includes('conflictCount') || changes.searchChanged) {
                    this.getDataFromExtendedRelationStore();
                }
            })
        );
    }

    private getDataFromExtendedRelationStore(): void {
        this.filteredExtProjSfiRelationsList = this._extendedProjRelDataStoreService.getFilteredStoreData();
        this.extProjSfiRelationsList = this._extendedProjRelDataStoreService.getActualStoreData();
        this.extendedProjRelService.isLoading = false;
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.updatedKeys.includes('conflictCount') || changes.searchChanged) {
                    this.getDataFromRelationStore();
                }
            })
        );
    }

    private getDataFromRelationStore(): void {
        this.filteredDefineRelationsList = this._defineRelationshipDataStore.getFilteredStoreData();
    }

    private getSearchList(): void {
        this.$subscriptions.push(this.$debounceEventForSearch.pipe(debounce(() => interval(this.debounceTimer))).subscribe((data: any) => {
            this._extendedProjRelDataStoreService.searchTextChanged();
        }));
    }

    searchProjectDetails(): void {
        this.extendedProjRelService.isLoading = true;
        this.$debounceEventForSearch.next();
    }

    resetList(): void {
        this.extendedProjRelService.searchText = '';
        this.extendedProjRelService.isLoading = true;
        const TIMEOUT_ID = setTimeout(() => {
            this._extendedProjRelDataStoreService.searchTextChanged();
            clearTimeout(TIMEOUT_ID);
        }, 200);
    }

    scrollIntoView(isExpand: boolean = true): void {
        setTimeout(() => {
            window.scroll(0, 0);
            this.coiService.setActiveSection('COI805', isExpand);
            const { leftOffsetTop } = this.defineRelationshipService.scrollSpyConfiguration;
            const SCROLL_SPY_LEFT_ITEM = document.getElementById(this.coiService.activeSectionId);
            const SCROLL_SPY_LEFT_CONTAINER = document.getElementById('SCROLL_SPY_LEFT_CONTAINER');

            if (SCROLL_SPY_LEFT_CONTAINER && SCROLL_SPY_LEFT_ITEM) {
                SCROLL_SPY_LEFT_CONTAINER.scrollTo({
                    top: SCROLL_SPY_LEFT_ITEM.offsetTop - SCROLL_SPY_LEFT_CONTAINER.offsetTop - leftOffsetTop,
                    behavior: 'auto'
                });
            }
        });
    }

    expandCollapseRelationship(): void {
        this.scrollIntoView(!this.coiService.isExpandSummaryBySection['COI805']);
    }

    openIfClose(): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'DISCLOSURE_SUMMARY_RIGHT_NAV_TOGGLE', content: { tabName: 'RELATIONSHIP' } });
        if (!this.coiService.isExpandSummaryBySection['COI805']) {
            this.coiService.isExpandSummaryBySection['COI805'] = true;
        }
    }

}
