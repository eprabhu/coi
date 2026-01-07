import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DefineRelationshipService } from './services/define-relationship.service';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { DefineRelationshipDataStoreService } from './services/define-relationship-data-store.service';
import { DefineRelationshipDataStore, ProjectSfiRelations } from '../coi-interface';
import { RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG } from '../../no-info-message-constants';

@Component({
    selector: 'app-define-relationship',
    templateUrl: './define-relationship.component.html',
    styleUrls: ['./define-relationship.component.scss'],
})
export class DefineRelationshipComponent implements OnInit, OnDestroy {

    isExpandRightNav = false;
    $subscriptions: Subscription[] = [];
    projectSfiRelationsList: ProjectSfiRelations[] = [];
    RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG = RELATIONSHIP_TAB_NO_PROJECT_INFO_MSG;
    
    private timeoutRef: ReturnType<typeof setTimeout>;

    constructor(private _commonService: CommonService,
                private _autoSaveService: AutoSaveService,
                public defineRelationshipService: DefineRelationshipService,
                private _defineRelationshipDataStore: DefineRelationshipDataStoreService) { }

    ngOnInit(): void {
        this.timeoutRef = setTimeout(() => {
            this.defineRelationshipService.configureScrollSpy();
        }, 200);
        this.listenGlobalEventNotifier();
        this._autoSaveService.initiateAutoSave();
        this.getDataFromRelationStore();
        this.listenDataChangeFromRelationStore();
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeoutRef);
        subscriptionHandler(this.$subscriptions);
        this._autoSaveService.stopAutoSaveEvent();
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'COI_DISCLOSURE_HEADER_RESIZE') {
                    this.defineRelationshipService.setHeight();
                    if (event.content.isResize) {
                        this.isExpandRightNav = true;
                    }
                }
            })
        );
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
        this.projectSfiRelationsList = this._defineRelationshipDataStore.getBaseStoreData();
    }

}
