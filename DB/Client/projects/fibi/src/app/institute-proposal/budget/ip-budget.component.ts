import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../common/services/web-socket.service';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { InstituteProposal } from '../institute-proposal-interfaces';
import { DataStoreService } from '../services/data-store.service';
import { BudgetData, BudgetStatus, RateType } from './ip-budget';
import { BudgetDataService } from './services/budget-data.service';
import { BudgetService } from './services/budget.service';

@Component({
	selector: 'app-ip-budget',
	templateUrl: './ip-budget.component.html',
	styleUrls: ['./ip-budget.component.css']
})
export class IpBudgetComponent implements OnInit, OnDestroy {

	isViewMode: any = false;
	isCreateBudgetVersion = true;
	budgetData: BudgetData;
	$subscriptions: Subscription[] = [];
	budgetStatus: Array<BudgetStatus>;
	rateTypes: Array<RateType> = [];

	constructor(public _commonService: CommonService,
		private _budgetDataService: BudgetDataService,
		private _budgetService: BudgetService,
		private _route: ActivatedRoute,
		private _dataStore: DataStoreService,
		public _webSocket:WebSocketService) { }

	ngOnInit() {
		this.loadBudgetData();
		this.getAvailableRights();
        this.getDataStoreEvent();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	loadBudgetData() {
		const instProposalId = this._route.snapshot.queryParamMap.get('instituteProposalId');
		this._budgetService.getBudgetData(instProposalId).subscribe(data => {
            this.budgetData = data;
            this._budgetDataService.setInstituteProposalBudget(data);
			this.rateTypes = data.rateTypes;
			this.budgetStatus = data.budgetStatus;
		});
	}

	getDataStoreEvent() {
		this.$subscriptions.push(this._dataStore.dataEvent
			.subscribe((data: any) => {
				if (data.includes('availableRights') || data.includes('instProposal')) {
					this.getAvailableRights();
				}
			}));
	}

	getAvailableRights() {
		const data: InstituteProposal = this._dataStore.getData(['availableRights', 'instProposal']);
		const IS_ADMIN = data.availableRights.includes('MODIFY_INST_PROPOSAL');
		/**
		 * not admin ad pending -> true
		 *  false && false || true -> true - success;
		 * admin and pending -> false
		 *  true && false || false -> false - success;
		 * not admin not pending -> true
		 *  false & true || true -> true - success;
		 * admin not pending -> true
		 *  true && true || false -> true
		 */
		this.isViewMode = (IS_ADMIN && data.instProposal.proposalSequenceStatus !== 'PENDING') || !IS_ADMIN;
		const isKey = 'IP' + '#' + this._route.snapshot.queryParamMap.get('instituteProposalId');
		if (!this.isViewMode && !this._webSocket.isLockAvailable(isKey)) {
			this.isViewMode = true;
		}
	}


}
