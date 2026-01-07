import { Component, OnDestroy, OnInit } from '@angular/core';
import { DefineRelationshipService } from '../../define-relationship/services/define-relationship.service';
import { Subscription } from 'rxjs';
import { COI, DefineRelationshipDataStore, ProjectSfiRelations } from '../../coi-interface';
import { DefineRelationshipDataStoreService } from '../../define-relationship/services/define-relationship-data-store.service';
import { CoiService } from '../../services/coi.service';
import { ExtendedProjRelDataStoreService } from '../../extended-project-relation-summary/services/extended-project-relation-data-store.service';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';
import { DataStoreService } from '../../services/data-store.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-summary-navigation',
    templateUrl: './summary-navigation.component.html',
    styleUrls: ['./summary-navigation.component.scss']
})
export class SummaryNavigationComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    projectSfiRelationsList: ProjectSfiRelations[] = [];
    extProjSfiRelationsList: ProjectSfiRelations[] = [];
    filteredProjectSfiRelationsList: ProjectSfiRelations[] = [];
    filteredExtProjSfiRelationsList: ProjectSfiRelations[] = [];
    engagementCount = 0;

    constructor(public coiService: CoiService,
                private _dataStore: DataStoreService,
                public defineRelationshipService: DefineRelationshipService,
                private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.getDataFromRelationStore();
        this.getDataFromExtendedRelationStore();
        this.listenDataChangeFromRelationStore();
        this.listenDataChangeFromExtendedRelationStore();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        const COI_DATA: COI = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
        this.engagementCount = COI_DATA?.coiFinancialEntityDetails?.length || 0; 
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe(() => {
                this.getDataFromStore();
            })
        );
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
        this.projectSfiRelationsList = this._defineRelationshipDataStore.getActualStoreData();
        this.filteredProjectSfiRelationsList = this._defineRelationshipDataStore.getFilteredStoreData();
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
        this.extProjSfiRelationsList = this._extendedProjRelDataStoreService.getActualStoreData();
        this.filteredExtProjSfiRelationsList = this._extendedProjRelDataStoreService.getFilteredStoreData();
    }

    scrollIntoView(activeSectionId: 'COI801' | 'COI802' | 'COI803' | 'COI804' | 'COI805'): void {
        if (!this.coiService.isExpandSummaryBySection[activeSectionId]) {
            setTimeout(() => {
                this.coiService.setActiveSection(activeSectionId);
                window.scroll(0, 0);
                const { leftOffsetTop } = this.defineRelationshipService.scrollSpyConfiguration;
                const SCROLL_SPY_LEFT_ITEM = document.getElementById(activeSectionId);
                const SCROLL_SPY_LEFT_CONTAINER = document.getElementById('SCROLL_SPY_LEFT_CONTAINER');
    
                if (SCROLL_SPY_LEFT_CONTAINER && SCROLL_SPY_LEFT_ITEM) {
                    SCROLL_SPY_LEFT_CONTAINER.scrollTo({
                        top: SCROLL_SPY_LEFT_ITEM.offsetTop - SCROLL_SPY_LEFT_CONTAINER.offsetTop - leftOffsetTop,
                        behavior: 'auto'
                    });
                }
            });
        }
    }

}
