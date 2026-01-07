import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { CommonService } from '../../common/services/common.service';
import { ProposalService } from '../services/proposal.service';
import { DataStoreService } from '../services/data-store.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { Router } from '@angular/router';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { RouteGuardService } from './route-guard.service';

@Component({
    selector: 'app-proposal-review',
    templateUrl: './proposal-review.component.html',
    styleUrls: ['./proposal-review.component.css']
})
export class ProposalReviewComponent implements OnInit, OnDestroy {

    result: any = {};
    showRequestModal: any = this._proposalService.showRequestModal;
    preReviewReq: any = this._proposalService.preReviewReq;
    availableRights: any = [];
    isShowExternalReview = false;

    storeDependencies = ['proposal', 'dataVisibilityObj', 'availableRights'];

    moduleDetails: any = {};
    $subscriptions: Subscription[] = [];

    constructor(
        public _commonService: CommonService,
        public _proposalService: ProposalService,
        private _dataStore: DataStoreService,
        private _router: Router,
        public autoSaveService: AutoSaveService,
        public routeGuard: RouteGuardService
    ) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        if ((this.result.proposal.statusCode !== 1 && this.result.proposal.statusCode !== 2 && this.result.proposal.statusCode !== 3
            && this.result.proposal.statusCode !== 9 && this.result.proposal.statusCode !== 11)
            && (this._commonService.isEvaluation || this._commonService.isEvaluationAndMapRouting)) {
            this._router.navigate(['fibi/proposal/review/evaluation'], { queryParamsHandling: 'merge' });
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
        this.routeGuard.navigationUrl = '';
    }

    getDataFromStore(sections = this.storeDependencies) {
        sections.forEach(section => {
            Object.assign(this.result, this._dataStore.getData([section]));
        });
        this.availableRights = this.result.availableRights;
        this.isShowExternalReview = this.availableRights.includes('VIEW_EXT_REVIEW') ||
            this.availableRights.includes('CREATE_EXT_REVIEW') ||
            this.availableRights.includes('MODIFY_EXT_REVIEW');
    }

    listenDataChangeFromStore() {
        this.$subscriptions.push(this._dataStore.dataEvent.subscribe(
            (dependencies: string[]) => {
                if (dependencies.some(dep => this.storeDependencies.includes(dep))) {
                    this.getDataFromStore(dependencies);
                }
            }));
    }

    setNavigationTab(link: string) {
        if (this.result.dataVisibilityObj.dataChangeFlag) {
            this.routeGuard.navigationUrl = link;
        }
    }

    discardChanges() {
        this.result.dataVisibilityObj.dataChangeFlag = false;
        this._dataStore.updateStore(['dataVisibilityObj'], this.result);
        this._router.navigate([this.routeGuard.navigationUrl], { queryParamsHandling: 'merge' });
        this.routeGuard.navigationUrl = '';
    }

}
