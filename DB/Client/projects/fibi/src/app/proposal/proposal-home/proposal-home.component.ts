import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProposalService } from '../services/proposal.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';

@Component({
    selector: 'app-proposal-home',
    templateUrl: './proposal-home.component.html',
    styleUrls: ['./proposal-home.component.css']
})
export class ProposalHomeComponent implements OnInit, OnDestroy {

    proposalDataBindObj: any = this._proposalService.proposalDataBindObj;
    departmentLevelRightsForProposal: any = {};
    dataVisibilityObj: any = {};

    helpText: any = {};
    $subscriptions: Subscription[] = [];

    constructor(
        private _proposalService: ProposalService,
        private _dataStore: DataStoreService
    ) { }

    ngOnInit() {
        this.fetchHelpText();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore() {
        this.dataVisibilityObj = this._dataStore.getData(['dataVisibilityObj']).dataVisibilityObj;
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                if (dependencies.includes('dataVisibilityObj')) {
                    this.getDataFromStore();
                }
            })
        );
    }

    /**
     * Get help texts for Proposal section codes 301 - Proposal General Information, 313 - Special Review,
     * 306 - Declaration Of Funding Support, 325 - Area Of Reserch
     */
    fetchHelpText() {
        this.$subscriptions.push(this._proposalService.fetchHelpText({
            'moduleCode': 3, 'sectionCodes': [301, 313, 306, 325, 304]
        }).subscribe((data: any) => {
            this.helpText = data;
        }));
    }
}
