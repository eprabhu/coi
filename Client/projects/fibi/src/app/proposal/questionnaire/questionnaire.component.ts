import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DataStoreService } from '../services/data-store.service';
import { CommonService } from '../../common/services/common.service';
import { ProposalService } from '../services/proposal.service';

@Component({
	selector: 'app-questionnaire-module',
	template: `<app-questionnaire [isViewMode]="isViewMode" [requestObject]="questionnaireObject"
	[dataVisibilityObj]="dataVisibilityObj"></app-questionnaire>`
})
export class QuestionnaireComponent implements OnInit, OnDestroy {

	$subscriptions: Subscription[] = [];
	dataDependencies = [ 'proposal', 'dataVisibilityObj', 'availableRights' ];
	dataVisibilityObj: any;
	proposal: any = {};
	isViewMode = false;
	questionnaireObject = {
		moduleSubitemCodes: [0],
		moduleItemKey: '',
		name: 'Questionnaire',
		questionnaireMode : ''
	};

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
		const DATA = this._dataStore.getData(this.dataDependencies);
		this.proposal = DATA.proposal;
		this.dataVisibilityObj = DATA.dataVisibilityObj;
		this.isViewMode = this.dataVisibilityObj.mode === 'view';
		this.questionnaireObject.moduleItemKey = this.proposal.proposalId;
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

}
