import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoiSummaryEventsAndStoreService } from '../services/coi-summary-events-and-store.service';
import { Subscription } from 'rxjs';
import { DataStoreService } from '../../services/data-store.service';
import { CommonService } from '../../../common/services/common.service';
import { CoiService } from '../../services/coi.service';
import { CoiSummaryService } from '../services/coi-summary.service';
import { COI, DefineRelationshipDataStore, ProjectSfiRelations } from '../../coi-interface';
import { DefineRelationshipService } from '../../define-relationship/services/define-relationship.service';
import { heightAnimation } from '../../../common/utilities/animations';
import { DefineRelationshipDataStoreService } from '../../define-relationship/services/define-relationship-data-store.service';
import { subscriptionHandler } from '../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { ExtendedProjRelDataStoreService } from '../../extended-project-relation-summary/services/extended-project-relation-data-store.service';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-coi-review',
    templateUrl: './review.component.html',
    styleUrls: ['./review.component.scss'],
    animations: [heightAnimation('0', '*', 400, 'heightAnimation')]
})
export class ReviewComponent implements OnInit, OnDestroy {

    isRelationCollapsed = true;
    $subscriptions: Subscription[] = [];
    intersectionObserverOptions: IntersectionObserverInit;
    isActivateObserverOption = false;
    extProjSfiRelationsList: ProjectSfiRelations[] = [];
    filteredProjectSfiRelationsList: ProjectSfiRelations[] = [];
    filteredExtProjSfiRelationsList: ProjectSfiRelations[] = [];

    constructor(public coiService: CoiService,
                public commonService: CommonService,
                private _dataStore: DataStoreService,
                public coiSummaryService: CoiSummaryService,
                public defineRelationshipService: DefineRelationshipService,
                public _dataStoreAndEventsService: CoiSummaryEventsAndStoreService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService,
                private _extendedProjRelDataStoreService: ExtendedProjRelDataStoreService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.getDataFromRelationStore();
        this.getDataFromExtendedRelationStore();
        this.listenDataChangeFromRelationStore();
        this.listenDataChangeFromExtendedRelationStore();
        this.intersectionObserverOptions = {
            root: document.getElementById('SCROLL_SPY_LEFT_CONTAINER'),
            rootMargin: '0px 0px 0px 0px',
            threshold: Array.from({ length: 100 }, (_, i) => i / 100)
        };
        this.isActivateObserverOption = true;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        const COI_DATA: COI = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
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
        this.extProjSfiRelationsList = this._extendedProjRelDataStoreService.getFilteredStoreData();
        this.filteredExtProjSfiRelationsList = this._extendedProjRelDataStoreService.getActualStoreData();
    } 

    updateScrollSpyConfig(event: any): void {
        const IS_RELATIONSHIP_TAP_LENGTH = this.coiService.isExpandSummaryBySection['COI803'] ? this.filteredProjectSfiRelationsList.length : 0;
        const IS_NEW_AWARDS_TAP_LENGTH = this.coiService.isExpandSummaryBySection['COI805'] ? this.filteredExtProjSfiRelationsList.length : 0;
        this.defineRelationshipService.updateScrollSpyConfig(event, IS_RELATIONSHIP_TAP_LENGTH + IS_NEW_AWARDS_TAP_LENGTH + 2)
    }

}
