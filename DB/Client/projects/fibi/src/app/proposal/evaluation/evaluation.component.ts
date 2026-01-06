import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ProposalService } from '../services/proposal.service';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { EvaluationService } from './evaluation.service';

@Component({
    selector: 'app-evaluation',
    templateUrl: './evaluation.component.html',
    styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    dataVisibilityObj: any = {};

    constructor(
        public _proposalService: ProposalService,
        private _dataStore: DataStoreService,
        private _router: Router,
        public autoSaveService: AutoSaveService,
        public evaluationService: EvaluationService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.evaluationService.navigationUrl = '';
    }

    getDataFromStore() {
        this.dataVisibilityObj = this._dataStore.getData(['dataVisibilityObj']).dataVisibilityObj;
    }

    listenDataChangeFromStore() {
        this.$subscriptions.push(this._dataStore.dataEvent.subscribe(
            (dependencies: string[]) => {
                if (dependencies.includes('dataVisibilityObj')) {
                    this.getDataFromStore();
                }
            }));
    }

    setNavigationTab(link: string) {
        if (this.dataVisibilityObj.dataChangeFlag) {
            this.evaluationService.navigationUrl = link;
        }
    }

    discardChanges() {
        this.dataVisibilityObj.dataChangeFlag = false;
        this._dataStore.updateStore(['dataVisibilityObj'], this);
        this._router.navigate([this.evaluationService.navigationUrl], { queryParamsHandling: 'merge' });
        this.evaluationService.navigationUrl = '';
    }
}
