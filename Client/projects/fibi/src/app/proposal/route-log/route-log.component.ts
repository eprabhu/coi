import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { CommonService } from '../../common/services/common.service';
import { ProposalService } from '../services/proposal.service';
import { HTTP_SUCCESS_STATUS } from '../../app-constants';
declare var $: any;

@Component({
  selector: 'app-route-log',
  template: `<workflow-engine [workFlowResult]="result" (workFlowResponse)='workFlowResponse($event)' (errorEvent)='errorEvent()'
  	[workFlowDetailKey]="'proposal'"></workflow-engine>`
})
export class RouteLogComponent implements OnInit, OnDestroy {

  	$subscriptions: Subscription[] = [];
	dataDependencies = [ 'proposal', 'availableRights', 'workflow', 'workflowList', 'approverStopNumber',
		'canApproveRouting', 'isPersonCanScore', 'grantCall' ];
	result: any = {};

	constructor(
		public _commonService: CommonService,
		public _proposalService: ProposalService,
		private _dataStore: DataStoreService
	) {}

	ngOnInit() {
		this.getDataFromStore();
		this.listenDataChangeFromStore();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	private getDataFromStore() {
		this.result = this._dataStore.getData(this.dataDependencies);
	}

	private listenDataChangeFromStore() {
		this.$subscriptions.push(
			this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
				if (dependencies.some((dep) => this.dataDependencies.includes(dep))) {
					this.getDataFromStore();
				}
			})
		);
	}

  workFlowResponse(data): void {
    this.updateStore(data);
  }

  private updateStore(data) {
    this._dataStore.manualDataUpdate({
        proposal: data.proposal,
        workflow: data.workflow,
        workflowList: data.workflowList,
        canApproveRouting: data.canApproveRouting,
        finalApprover: data.finalApprover,
        isApproved: data.isApproved,
        isFinalApprover: data.isFinalApprover,
        approverStopNumber: data.approverStopNumber,
        isPersonCanScore: data.isPersonCanScore
    });
  }

  errorEvent() {
	$('#invalidActionModal').modal('show');
  }
}
