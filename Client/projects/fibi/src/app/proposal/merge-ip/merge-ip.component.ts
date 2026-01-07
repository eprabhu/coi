import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { MergeIpService } from './merge-ip.service';

declare var $: any;

@Component({
    selector: 'app-merge-ip',
    templateUrl: './merge-ip.component.html',
    styleUrls: ['./merge-ip.component.css'],
    providers: [MergeIpService]
})
export class MergeIpComponent implements OnChanges, OnDestroy {

    constructor(
        private _merge: MergeIpService,
        private _elasticConfig: ElasticConfigService,
        private _commonService: CommonService
    ) { }

    @Input() result: any = {};
    @Output() createNewIP: EventEmitter<boolean> = new EventEmitter();

    $subscriptions: Subscription[] = [];
    IPSearchOptions: any = {};

    mergeRequest = {
        isKeyPersonMerge: true,
        isSpecialReviewMerge: true,
        isBudgetMerge: true,
        devProposalId: null,
        proposalNumber: null
    };
    map = new Map();
    isSaving = false;

    ngOnChanges() {
        this.mergeRequest.devProposalId = this.result.proposal.proposalId;
        this.setIPElastic();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    validateMerge(): boolean {
        this.map.clear();
        if (!this.mergeRequest.proposalNumber) {
            this.map.set('proposalNumber', '* Please select a proposal to merge');
        }
        return this.map.size === 0;
    }

    mergeIP(): void {
        if (!this.isSaving && this.validateMerge()) {
            this.isSaving = true;
            this.$subscriptions.push(this._merge.mergeIP(this.mergeRequest)
                .subscribe((data: string) => {
                    this.successfullyMergedIP(data);
                    this.isSaving = false;
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Merging Institute Proposal failed. Please try again.');
                    this.isSaving = false;
                }
                ));
        }
    }

    successfullyMergedIP(data: any): void {
        if (data && data.proposal) {
            $('#mergeIPModal').modal('hide');
            this.result.proposal = data.proposal;
            this.resetValues();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Institute Proposal merged successfully.');
        } else {
            this.map.set('merge', data);
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Merging Institute Proposal failed. Please try again.');
        }
    }

    getIpSearchOptions(): void {
        this.IPSearchOptions = this._elasticConfig.getElasticForIP();
    }

    onIPSelect(IP: any): void {
        this.mergeRequest.proposalNumber = IP ? IP.proposal_number : null;
    }

    createIP(): void {
        this.createNewIP.emit(true);
    }

    setIPElastic() {
        this.getIpSearchOptions();
        this.IPSearchOptions.defaultValue = this.result.proposal.baseProposalTitle;
        this.mergeRequest.proposalNumber = this.result.proposal.baseProposalNumber;
    }

    resetValues(): void {
        this.isSaving = false;
        this.map.clear();
        this.mergeRequest.isKeyPersonMerge = true;
        this.mergeRequest.isSpecialReviewMerge = true;
        this.mergeRequest.isBudgetMerge = true;
        this.setIPElastic();
    }

}
