import { Component, OnInit } from '@angular/core';
import { DataStoreService } from '../services/data-store.service';
import { CoiSummaryEventsAndStoreService } from './services/coi-summary-events-and-store.service';
import { Subscription } from 'rxjs';
import { DefineRelationshipService } from '../define-relationship/services/define-relationship.service';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';
import { DataStoreEvent, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { DefineRelationsRouterGuard } from '../services/define-relation-router-guard.service';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
   
    isExpandRightNav = false;
    $subscriptions: Subscription[] = [];

    constructor(
        private _commonService: CommonService,
        public defineRelationshipService: DefineRelationshipService,
        public _dataStoreAndEventsService: CoiSummaryEventsAndStoreService,
        private _dataStore: DataStoreService,
        private _defineRelationsRouterGuard: DefineRelationsRouterGuard
    ) { }

    async ngOnInit() {
        this.getCOIDetails();
        this.listenDataChangeFromStore();
        this.listenDisclosureHeaderChange();
        window.scrollTo(0,0);
        this._defineRelationsRouterGuard.initializeDefineRelationshipAsync('VIEW');
        setTimeout(() => {
            this.defineRelationshipService.configureScrollSpy();
        }, 200);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }
    
    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((data: DataStoreEvent) => {
                this.getCOIDetails();
                this._dataStoreAndEventsService.dataEvent.next(['coiDisclosure']);
            })
        );
    }
    
    private listenDisclosureHeaderChange(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'COI_DISCLOSURE_HEADER_RESIZE') {
                    this.defineRelationshipService.setHeight();
                    if (event.content.isResize) {
                        this.isExpandRightNav = true;
                    }
                }
            }));
    }

    getCOIDetails(): void {
        const DATA = this._dataStore.getData();
        this._dataStoreAndEventsService.coiSummaryConfig.currentDisclosureId = DATA.coiDisclosure.disclosureId;
        this._dataStoreAndEventsService.setStoreData(DATA, DATA.coiDisclosure.disclosureId);
    }

}
