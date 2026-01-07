import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../services/data-store.service';
import { ProposalService } from '../../services/proposal.service';

@Component({
    selector: 'app-proposal-overview-modal-card',
    templateUrl: './proposal-overview-modal-card.component.html',
    styleUrls: ['./proposal-overview-modal-card.component.css']
})
export class ProposalOverviewModalCardComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    proposal: any = {};
    concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

    constructor(private _dataStore: DataStoreService,
        public proposalService: ProposalService) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore() {
        this.proposal = this._dataStore.getData(['proposal']).proposal;
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.includes('proposal')) {
                    this.getDataFromStore();
                }
            })
        );
    }

}
