import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { ProposalService } from '../services/proposal.service';
import { AutoSaveService } from '../../common/services/auto-save.service';

@Component({
    selector: 'app-other-information',
    template: `
        <app-custom-element
                [moduleItemKey]="result?.proposal?.proposalId"
                [moduleCode]="3" [isShowSave]="false"
                [viewMode]="result.dataVisibilityObj?.mode"
                [externalSaveEvent]="autoSaveService.autoSaveTrigger$"
                (dataChangeEvent)="dataChangeEvent($event)">
        </app-custom-element>
    `
})
export class OtherInformationComponent implements OnInit, OnDestroy {

    result: any;
    $subscriptions: Subscription[] = [];
    dataDependencies = ['proposal', 'dataVisibilityObj'];

    constructor(
        private _dataStore: DataStoreService,
        private _proposalService: ProposalService,
        public autoSaveService: AutoSaveService
    ) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.dataChangeEvent(false);
    }

    dataChangeEvent(event) {
        this.result.dataVisibilityObj.dataChangeFlag = event;
        this.autoSaveService.setUnsavedChanges('Other Information', 'other-information', event, true);
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
    }

    private getDataFromStore() {
        this.result = this._dataStore.getData(this.dataDependencies);
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
                    this.getDataFromStore();
                }
            })
        );
    }

}
