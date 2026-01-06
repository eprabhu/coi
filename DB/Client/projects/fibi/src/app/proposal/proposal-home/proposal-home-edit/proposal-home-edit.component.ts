import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from './../../../common/services/common.service';
import { ProposalService } from '../../services/proposal.service';
import { DataStoreService } from '../../services/data-store.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getDateObjectFromTimeStamp } from '../../../common/utilities/date-utilities';

@Component({
    selector: 'app-proposal-home-edit',
    templateUrl: './proposal-home-edit.component.html',
    styleUrls: ['./proposal-home-edit.component.css']
})
export class ProposalHomeEditComponent implements OnInit, OnDestroy {

    @Input() proposalDataBindObj: any = {};
    @Input() departmentLevelRightsForProposal: any = {};
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
        this.convertProposalDates(this.result.proposal);
    }

    private convertProposalDates(proposalObject) {
        proposalObject.startDate = getDateObjectFromTimeStamp(this._proposalService.proposalStartDate);
        proposalObject.sponsorDeadlineDate = getDateObjectFromTimeStamp(this._proposalService.sponsorDeadlineDate);
        proposalObject.internalDeadLineDate = getDateObjectFromTimeStamp(this._proposalService.internalDeadLineDate);
        proposalObject.endDate = getDateObjectFromTimeStamp(this._proposalService.proposalEndDate);
    }

    private getUpdatedKeyDataFromStore(dependencies) {
        const DATA = this._dataStore.getData(dependencies);
        this.setResultObject(DATA, dependencies);
        this.departmentLevelRightsForProposal = this._proposalService.checkDepartmentLevelPermission(this.result.availableRights);
        if (dependencies.includes('availableRights')) {
            this._commonService.externalReviewRights = this.getExternalReviewerRights(DATA);
        }
        if (dependencies.includes('dataVisibilityObj')) {
            this.dataVisibilityObj = DATA.dataVisibilityObj;
        }
        if (dependencies.includes('proposal')) {
            this.convertProposalDates(this.result.proposal);
        }
    }

    private getExternalReviewerRights(data) {
        return data.availableRights.filter(e => e === 'MODIFY_EXT_REVIEW' || e === 'CREATE_EXT_REVIEW');
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

