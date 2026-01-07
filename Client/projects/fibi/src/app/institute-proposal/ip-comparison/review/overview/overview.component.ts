import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { deepCloneObject } from '../../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { InstituteProposalService } from '../../../services/institute-proposal.service';
import { ComparisonDataStoreService } from '../../comparison-data-store.service';
import { ComparisonData } from '../../interface';
import { OverviewService } from './overview.service';

@Component({
	selector: 'app-ip-overview',
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.css'],
	providers: [OverviewService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit, OnDestroy {

	currentMethodChild: String;
	overViewDataCache = {};
	comparisonData: ComparisonData;
	$subscriptions: Subscription[] = [];

	constructor(
		private _comparisonStoreData: ComparisonDataStoreService,
		private _CDRef: ChangeDetectorRef,
		private _overviewService: OverviewService,
		public ipService: InstituteProposalService
	) { }

	ngOnInit() {
		this.comparisonData = new ComparisonData();
		this.getComparisonData();
		this.viewOrCompare();
	}

	private getComparisonData(): void {
		this.$subscriptions.push(this._comparisonStoreData.$comparisonData.subscribe((data: any) => {
			this.comparisonData = data;
		}));
	}

	private viewOrCompare(): void {
		this.$subscriptions.push(this._comparisonStoreData.$currentMethod.subscribe((data) => {
			if (data) {
				if (this.comparisonData.baseProposalId) {
					data + '' === 'COMPARE' ? this.compareOverView() : this.setCurrentView();
				}
			}
		}));
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/**
	 * @returns void
	 * compare the data actually it fetches the data for comparison.
	 * Since wee need two different ip version data to compare. forkJoin is used so that
	 * we trigger the compare function once both version data has been loaded.
	 * This also updates the data to the cache so that the next time we can
	 * reuse the same data instead of making a DB call. improves performance
	 */
	private compareOverView(): void {
		this.$subscriptions.push(forkJoin(this.getIPDetails('base'), this.getIPDetails('current')).subscribe(
			data => {
				this.updateCache(data[0], 'base');
				this.updateCache(data[1], 'current');
				this.updateChildComponents(data[0], data[1]);
				this._overviewService.setCurrentMethodDataForChild('COMPARE');
				this._CDRef.markForCheck();
			}));
	}
	/**
	 * @returns void
	 * sets the value to view baseProposalId is used since base is always compared to current.
	 * This also updates the data to the cache so that the next time we can
	 * reuse the same data instead of making a DB call. improves performance
	 */
	private setCurrentView(): void {
		this.$subscriptions.push(this.getIPDetails('base').subscribe(data => {
			this.updateCache(data, 'current');
			this.comparisonData.base = data;
			this.updateChildComponents(data, {});
			this._overviewService.setCurrentMethodDataForChild('VIEW');
			this._CDRef.markForCheck();
		}));
	}

	/**
	 * @param  {string} type
	 * @returns Observable
	 * fetches the data from server if its not available in cache. only return the Observable.
	 * Subscription will be done at the function which invokes this method.
	 */
	private getIPDetails(type: string): Observable<any> {
		const IP_ID = this.getProposalId(type);
		if (this.checkInCache(IP_ID)) {
			return of(deepCloneObject(this.overViewDataCache[IP_ID]));
		} else {
			const request = this.getRequestDetails(IP_ID);
			return this._overviewService.loadProposalById(request);
		}
	}
	/**
	 * @param  {string} type
	 * @returns string
	 * return the ip id from the input Comparison details according to the Type.
	 * if base is the type reruns baseProposalId other wise currentProposalId.
	 */
	private getProposalId(type: string): string {
		return type === 'base' ? this.comparisonData.baseProposalId
			: this.comparisonData.currentProposalId;
	}

	private getRequestDetails(proposalId: string): Object {
		const REQUEST: any = {};
		REQUEST.proposalId = proposalId;
		return REQUEST;
	}

	private updateChildComponents(base: object, current: object): void {
		this.comparisonData.base = base;
		this.comparisonData.current = current;
		this.comparisonData.proposalId = this.comparisonData.baseProposalId;
		this._overviewService.$childComparisonData.next(this.comparisonData);
	}

	private updateCache(data: any, type: string): void {
		const proposalId = this.getProposalId(type);
		if (!this.checkInCache(proposalId)) {
			this.overViewDataCache[proposalId] = deepCloneObject(data);
		}
	}

	private checkInCache(cacheName: string): boolean {
		return !!Object.keys(this.overViewDataCache).find(key => key === cacheName);
	}

}
