import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { InstituteProposalService } from '../services/institute-proposal.service';


@Component({
    selector: 'app-comments',
    template: `<div id='ip-comments'><app-shared-comment
                [requestId]="instProposalId"
                [isEditMode]="true"
                [requestModuleCode]="2"
                [ipNumber] = "ipNumber"
                [sequenceNumber] = "sequenceNumber"
                (commentEditEvent)="setUnsavedChanges(true)" 
                (commentSaveEvent)="setUnsavedChanges(false)"></app-shared-comment></div>`
})
export class CommentsComponent implements OnInit , OnDestroy {

    instProposalId: string;
    ipNumber: any;
    sequenceNumber: any;
    isShowCollapse = true;
    $subscriptions: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _dataStore: DataStoreService,
        public _instituteService: InstituteProposalService,
        public _autoSaveService: AutoSaveService) { }

    ngOnInit() {
        this.instProposalId = this._route.snapshot.queryParamMap.get('instituteProposalId');
        this.getGeneralDetails();
        this.getInstituteProposalCommentDetails();
    }

    private getGeneralDetails(): void {
        const data: any = this._dataStore.getData(['instProposal']);
        this.sequenceNumber = data.instProposal.sequenceNumber;
        this.ipNumber = data.instProposal.proposalNumber;
    }

    private getInstituteProposalCommentDetails(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((data: any) => {
                if (data.includes('instProposal')) {
                    this.getGeneralDetails();
                }
            })
        );
    }

    setUnsavedChanges(flag: boolean): void {
        this._instituteService.isInstituteProposalDataChange = flag;
        this._autoSaveService.setUnsavedChanges('Institute Proposal Comments', 'ip-comments', flag, true);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
