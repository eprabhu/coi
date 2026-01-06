import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';
import { DataStoreService } from '../services/data-store.service';
import { HistoryService } from './history.service';

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit, OnDestroy {

	actionsLogs = {};
	$subscriptions: Subscription[] = [];
	instProposalId: string;
	constructor(private _history: HistoryService, private _route: ActivatedRoute,
		public _dataFormatPipe: DateFormatPipeWithTimeZone,
		private _dataStore: DataStoreService) { }

	ngOnInit() {
		this.instProposalId = this._route.snapshot.queryParamMap.get('instituteProposalId');
		this.getProposalHistory();
		this.getDataStoreEvent();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	getProposalHistory() {
		this.$subscriptions.push(this._history.getProposalHistory(this.instProposalId)
			.subscribe((data: any) => {
				this.updateHistoryLogs(data);
			}));
	}

	updateHistoryLogs(data: any) {
		if (data.instituteProposalActionLogs) {
			this.actionsLogs = {};
			data.instituteProposalActionLogs.forEach((historyObj) => {
				const date = this._dataFormatPipe.transform(historyObj.updateTimeStamp);
				this.actionsLogs[date] = this.actionsLogs[date] ? this.actionsLogs[date] : [];
				this.actionsLogs[date].push(historyObj);
			});
		}
	}

	getDataStoreEvent() {
		this.$subscriptions.push(this._dataStore.dataEvent
			.subscribe((data: any) => {
				if (data.includes('instProposal')) {
					this.getProposalHistory();
				}
			}));
	}

	sortNull() { return 0; }

}
