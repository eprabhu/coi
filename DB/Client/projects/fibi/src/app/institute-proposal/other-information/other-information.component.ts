import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { InstituteProposal, InstProposal } from '../institute-proposal-interfaces';
import { DataStoreService } from '../services/data-store.service';
import { WebSocketService } from '../../common/services/web-socket.service';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { InstituteProposalService } from '../services/institute-proposal.service';

@Component({
    selector: 'app-other-information',
    template: `<div id ="ip-other-information-section">
                <app-custom-element *ngIf="instProposalId"
				[moduleItemKey]="instProposalId" [moduleCode]='2'
                [viewMode]="viewMode" [isShowSave]="false"
				[externalSaveEvent]="autoSaveService.autoSaveTrigger$"
				(dataChangeEvent)="dataChangeEvent($event)"></app-custom-element></div>`,
})
export class OtherInformationComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    instProposalId = '';
    viewMode: string;
    generalDetails: InstProposal;

    constructor(private _dataStore: DataStoreService,
                private _route: ActivatedRoute,
                public webSocket: WebSocketService,
                public instituteService: InstituteProposalService,
                public autoSaveService: AutoSaveService) { }

    ngOnInit() {
        this.getAvailableRights();
        this.getDataStoreEvent();
    }

    getDataStoreEvent() {
        this.$subscriptions.push(this._dataStore.dataEvent
            .subscribe((data: string[]) => {
                if (data.includes('availableRights') || data.includes('instProposal')) {
                    this.getAvailableRights();
                }
            }));
    }

    getAvailableRights() {
        const data: InstituteProposal = this._dataStore.getData(['availableRights', 'instProposal']);
        this.generalDetails = data.instProposal;
        this.instProposalId = this._route.snapshot.queryParamMap.get('instituteProposalId');
        this.viewMode = data.availableRights.includes('MODIFY_INST_PROPOSAL') && data.instProposal.proposalSequenceStatus === 'PENDING' ? 'edit' : 'view';
        const isKey = 'IP' + '#' + this.instProposalId;
        if (this.viewMode && !this.webSocket.isLockAvailable(isKey)) {
            this.viewMode = 'view';
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.autoSaveService.clearUnsavedChanges();
    }

    dataChangeEvent(event) {
        this.instituteService.isInstituteProposalDataChange = event;
        this.autoSaveService.setUnsavedChanges('Other Information', 'other-information', event, true);
    }
}
