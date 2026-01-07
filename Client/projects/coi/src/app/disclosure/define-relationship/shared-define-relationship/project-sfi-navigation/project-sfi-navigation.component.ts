import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { DefineRelationshipService } from '../../services/define-relationship.service';
import { DefineRelationshipDataStoreService } from '../../services/define-relationship-data-store.service';
import { DefineRelationshipDataStore, ProjectSfiRelations } from '../../../coi-interface';
import { debounce } from 'rxjs/operators';
import { CommonService } from '../../../../common/services/common.service';
import { GlobalEventNotifier } from '../../../../common/services/coi-common.interface';
import { CoiService } from '../../../services/coi.service';
import { heightAnimation } from '../../../../common/utilities/animations';
import { RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG } from '../../../../no-info-message-constants';

@Component({
    selector: 'app-project-sfi-navigation',
    templateUrl: './project-sfi-navigation.component.html',
    styleUrls: ['./project-sfi-navigation.component.scss'],
    animations: [heightAnimation('0', '*', 300, 'heightAnimation')]
})
export class ProjectSfiNavigationComponent implements OnInit, OnDestroy {

    @Input() isCardExpanded = true;

    debounceTimer = 800;
    isShowFilter = false;
    isEnableProjEngSwitch = false;
    countObj = { projectCount: 0, engagementCount: 0 };
    projectSfiRelationsList: ProjectSfiRelations[] = [];
    filteredProjectSfiRelationsList: ProjectSfiRelations[] = [];
    RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG = RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG;
    searchPlaceholder = {
        PROJECTS: `Search by Title, PI, Reporter's Role, Lead Unit, Sponsor, Prime Sponsor.`,
        ENGAGEMENTS: `Search by Engagement Name, Country.`,
    };

    private $subscriptions: Subscription[] = [];
    private $debounceEventForSearch = new Subject();

    constructor(public coiService: CoiService,
                private _commonService: CommonService,
                public defineRelationshipService: DefineRelationshipService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService) { }
    
    ngOnInit(): void {
        this.getSearchList();
        this.listenScrollSpyChanges();
        this.getDataFromRelationStore();
        this.listenDataChangeFromRelationStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromRelationStore(): void {
        this.$subscriptions.push(
            this._defineRelationshipDataStore.$relationsChanged.subscribe((changes: DefineRelationshipDataStore) => {
                if (changes.updatedKeys.includes('conflictCount') || changes.searchChanged) {
                    this.getDataFromRelationStore();
                    if (changes.searchChanged) {
                        this.scrollIntoView();
                    }
                }
            })
        );
    }

    private getDataFromRelationStore(): void {
        this.filteredProjectSfiRelationsList = this._defineRelationshipDataStore.getFilteredStoreData();
        this.projectSfiRelationsList = this._defineRelationshipDataStore.getActualStoreData();
        this.countObj = this._defineRelationshipDataStore.getProjEngCounts();
        this.defineRelationshipService.isLoading = false;
    }

    private getSearchList(): void {
        this.$subscriptions.push(this.$debounceEventForSearch.pipe(debounce(() => interval(this.debounceTimer))).subscribe((data: any) => {
            this._defineRelationshipDataStore.searchTextChanged();
        }));
    }

    private listenScrollSpyChanges(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'SCROLL_SPY' || event.uniqueId === 'COI_DISCLOSURE_HEADER_RESIZE') {
                    // may be need In Future
                }
            }));
    }

    searchProjectDetails(): void {
        this.defineRelationshipService.isLoading = true;
        this.defineRelationshipService.resetElementVisiblePercentageList();
        this.$debounceEventForSearch.next();
    }

    resetList(): void {
        this.defineRelationshipService.searchText = '';
        this.defineRelationshipService.isLoading = true;
        this.defineRelationshipService.resetElementVisiblePercentageList();
        setTimeout(() => {
            this._defineRelationshipDataStore.searchTextChanged();
        }, 200);
    }

    switchTab(tab: 'PROJECTS' | 'ENGAGEMENTS'): void {
        this.defineRelationshipService.currentRelationSwitch = tab;
        this.resetList();
    }

    scrollIntoView(isExpand: boolean = true): void {
        setTimeout(() => {
            window.scroll(0, 0);
            this.coiService.setActiveSection('COI803', isExpand);
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
        this.scrollIntoView(!this.coiService.isExpandSummaryBySection['COI803']);
        if (!this.coiService.isExpandSummaryBySection['COI803']) {
            this.defineRelationshipService.resetElementVisiblePercentageList();
        }
    }

    openIfClose(): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'DISCLOSURE_SUMMARY_RIGHT_NAV_TOGGLE', content: { tabName: 'RELATIONSHIP' } });
        if (!this.coiService.isExpandSummaryBySection['COI803']) {
            this.coiService.isExpandSummaryBySection['COI803'] = true;
        }
    }

}
