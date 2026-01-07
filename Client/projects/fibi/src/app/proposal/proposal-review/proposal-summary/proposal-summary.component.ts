import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../services/data-store.service';
import { ProposalService } from '../../services/proposal.service';

@Component({
    selector: 'app-proposal-summary',
    template: `<app-review *ngIf="_proposalService.proposalSectionConfig['318']?.isActive && result"
    [moduleDetails]="moduleDetails" [showRequestModal]="showRequestModal"
    [dataStoreService]="_dataStore" [preReviewReq]="preReviewReq"></app-review>`,
})
export class ProposalSummaryComponent implements OnInit, OnDestroy {

    result: any = {};
    moduleDetails: any = {};
    showRequestModal: any = this._proposalService.showRequestModal;
    preReviewReq: any = this._proposalService.preReviewReq;
    storeDependencies = ['proposal', 'availableRights', 'dataVisibilityObj'];
    $subscriptions: Subscription[] = [];

    constructor(public _proposalService: ProposalService, public _dataStore: DataStoreService) { }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    getDataFromStore(sections = this.storeDependencies) {
        sections.forEach(section => {
            Object.assign(this.result, this._dataStore.getData([section]));
        });
        this.preReviewReq.moduleItemKey = this.result.proposal.proposalId;
        this.setModuleDetails();
    }

    listenDataChangeFromStore() {
        this.$subscriptions.push(this._dataStore.dataEvent.subscribe(
            (dependencies: string[]) => {
                if (dependencies.some(dep => this.storeDependencies.includes(dep))) {
                    this.getDataFromStore(dependencies);
                }
            }));
    }


    setModuleDetails() {
        this.moduleDetails.title = this.result.proposal.title;
        this.moduleDetails.name = 'Proposal';
        this.moduleDetails.availableRights = this.result.availableRights;
        this.moduleDetails.isShowAssignBtn = (this.result.dataVisibilityObj.mode !== 'view' &&
            [1, 3, 9, 12].includes(this.result.proposal.statusCode)) ? true : false;
        this.moduleDetails.isShowActionBtns = (this.result.proposal.statusCode !== 11) ? true : false;
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

}
