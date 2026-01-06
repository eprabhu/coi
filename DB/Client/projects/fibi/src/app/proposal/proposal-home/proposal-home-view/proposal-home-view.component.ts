/** last updated by Krishnadas M on 26-03-2020 **/
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from './../../../common/services/common.service';
import { ProposalService } from '../../services/proposal.service';
import { DataStoreService } from '../../services/data-store.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-proposal-home-view',
    templateUrl: './proposal-home-view.component.html',
    styleUrls: ['./proposal-home-view.component.css']
})
export class ProposalHomeViewComponent implements OnInit, OnDestroy {

    @Input() proposalDataBindObj: any = {};
    @Input() helpText: any = {};

    result: any = {};
    dataVisibilityObj: any = {};

    $subscriptions: Subscription[] = [];

    constructor(
        public _commonService: CommonService,
        public _proposalService: ProposalService,
        private _dataStore: DataStoreService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore() {
        const DATA = this._dataStore.getData();
        this.result = DATA;
        this.dataVisibilityObj = DATA.dataVisibilityObj;
    }

    private getUpdatedKeyDataFromStore(dependencies) {
        const DATA = this._dataStore.getData(dependencies);
        this.setResultObject(DATA, dependencies)
    }

    private setResultObject(data, keyLists) {
        keyLists.forEach(key => {
            this.result[key] = data[key];
        });
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                this.getUpdatedKeyDataFromStore(dependencies);
            })
        );
    }
}
