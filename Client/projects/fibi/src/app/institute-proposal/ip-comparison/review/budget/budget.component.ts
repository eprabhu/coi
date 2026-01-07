import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { CurrencyParserService } from '../../../../common/services/currency-parser.service';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { compareArray } from '../../../../common/utilities/array-compare';
import { deepCloneObject, setHelpTextForSubItems } from '../../../../common/utilities/custom-utilities';
import { compareObject } from '../../../../common/utilities/object-compare';
import { compareString } from '../../../../common/utilities/string-compare';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { InstituteProposalService } from '../../../services/institute-proposal.service';
import { IPBudgetOverview, IPBudgetPeriods } from '../../comparison-constants';
import { ComparisonDataStoreService } from '../../comparison-data-store.service';
import { ComparisonData } from '../../interface';
import { BudgetService } from './budget.service';

@Component({
	selector: 'app-ip-budget-compare',
	templateUrl: './budget.component.html',
	styleUrls: ['./budget.component.css'],
	providers: [BudgetService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetComponent implements OnInit, OnDestroy {

	$subscriptions: Subscription[] = [];
	budgetData: any;
	proposalBudgetHeader: any;
	budgetModularVO: any;
	budgetPeriods: any;
	budgetCache: any = [];
	currentPeriod: any;
	isPeriodsWidgetOpen = true;
	isOverviewWidgetOpen = true;
	comparisonData: ComparisonData;
	currentMethod: String;

	constructor(
		private _comparisonStoreData: ComparisonDataStoreService,
		public currencyFormatter: CurrencyParserService,
		public dateFormatter: DateParserService,
		private _CDRef: ChangeDetectorRef, private _budgetHeader: BudgetService,
		public ipService: InstituteProposalService
	) { }

	ngOnInit() {
		this.comparisonData = new ComparisonData();
		this.viewOrCompare();
		this.getComparisonData();
	}

	private getComparisonData(): void {
		this.$subscriptions.push(this._comparisonStoreData.$comparisonData.subscribe((data: any) => {
			this.comparisonData = data;
		}));
	}

	private viewOrCompare(): void {
		this.$subscriptions.push(this._comparisonStoreData.$currentMethod.subscribe((data: any) => {
			if (data) {
				this.currentMethod = data || '';
				if (this.comparisonData.baseProposalId) {
					data + '' === 'COMPARE' ? this.compareBudget() : this.setCurrentView();
				}
			}
		}));
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	/**
	 * @returns void
	 * compare the data
	 * actually it fetches the data for comparison.
	 * Since wee need two different proposal version data to compare,
	 * forkJoin is used so that
	 * we trigger the compare function once both version data has been loaded.
	 * This also updates the data to the cache so that the next time we can
	 * reuse the same data instead of making a DB call. improves performance.
	 */

	 private compareBudget(): void {
		this.$subscriptions.push(forkJoin(this.getBudgetData('base'), this.getBudgetData('current')).subscribe(
			data => {
				this.updateCache(data[0], 'base');
				this.updateCache(data[1], 'current');
				this.updateProposalHeader(data[0]);
				this.updateProposalHeader(data[1]);
				this.compare(data[0], data[1]);
				this._CDRef.markForCheck();
			}));
	}

	private updateProposalHeader(data): void {
		this.budgetData = data;
		if (data.instituteProposalBudgetHeader) {
			data.instituteProposalBudgetHeader.campusFlag = data.instituteProposalBudgetHeader.campusFlag === 'N' ? 'ON' 
                                                            : (data.instituteProposalBudgetHeader.campusFlag === 'F' ? 'OFF' : 'BOTH');
			data.instituteProposalBudgetHeader.isAutoCalc = data.instituteProposalBudgetHeader.isAutoCalc ? 'ON' : 'OFF';
			this.setBudgetTemplate(data);
			this.proposalBudgetHeader = data.instituteProposalBudgetHeader;
			this.budgetPeriods = data.instituteProposalBudgetHeader.budgetPeriods;
		}
	}

	private setBudgetTemplate(data): void {
		if (data.budgetTemplateTypes && data.budgetTemplateTypes.length) {
			const SELECTED_VALUE =
				data.budgetTemplateTypes.find(e => e.budgetTemplateTypeId === data.instituteProposalBudgetHeader.budgetTemplateTypeId);
			data.instituteProposalBudgetHeader.budgetTemplate = SELECTED_VALUE ? SELECTED_VALUE : {};
		}
	}

	/**
	 * @returns void
	 * sets the value to view baseProposalId is used since base is always compared to current.
	 * This also updates the data to the cache so that the next time we can
	 * reuse the same data instead of making a DB call. improves performance
	 */
	private setCurrentView(): void {
		this.$subscriptions.push(this.getBudgetData('base').subscribe((data: any) => {
			this.updateCache(data, 'current');
			this.updateProposalHeader(data);
			this._CDRef.markForCheck();
		}));
	}

	/**
	 * @param  {any} base
	 * @param  {any} current
	 * @returns void
	 * Compare the versions of the data. Compare method is used according to the type of the
	 * data that need to be compared. Here since Array is the data type it is used.
	 */
	private compare(base: any, current: any): void {
		this.budgetHeaderComparison(base, current);
		this.budgetPeriodsAndTotalComparison(base, current);
	}

	private budgetHeaderComparison(base, current): void {
		this.proposalBudgetHeader = compareObject(base[IPBudgetOverview.reviewSectionName],
												current[IPBudgetOverview.reviewSectionName],
												IPBudgetOverview.reviewSectionSubFields);
	}

	private budgetPeriodsAndTotalComparison(base, current): void {
		this.currentPeriod = JSON.parse(JSON.stringify(current.instituteProposalBudgetHeader ?
													   current.instituteProposalBudgetHeader[IPBudgetPeriods.reviewSectionName] :
													   []));
		this.budgetPeriods = compareArray(base.instituteProposalBudgetHeader ?
										  base.instituteProposalBudgetHeader[IPBudgetPeriods.reviewSectionName] :
										  [],
										  current.instituteProposalBudgetHeader ?
										  current.instituteProposalBudgetHeader[IPBudgetPeriods.reviewSectionName] :
										  [],
										  IPBudgetPeriods.reviewSectionUniqueFields,
										  IPBudgetPeriods.reviewSectionSubFields);
	}

	/**
	 * @param  {string} type
	 * @returns Observable
	 * fetches the data from server if its not available in cache. only return the Observable.
	 * Subscription will be done at the function which invokes this method.
	 */
	private getBudgetData(type: string): Observable<any> {
		const PROPOSAL_ID = this.getProposalId(type);
		if (this.checkInCache(PROPOSAL_ID)) {
			return of(deepCloneObject(this.budgetCache[PROPOSAL_ID]));
		} else {
			return this._budgetHeader.proposalBudgetHeader(PROPOSAL_ID);
		}
	}

	/**
	 * @param  {string} type
	 * @returns string
	 * return the proposal id from the input Comparison details according to the Type.
	 * if base is the type reruns baseProposalId other wise currentProposalId.
	 */
	private getProposalId(type: string): string {
		return type === 'base' ? this.comparisonData.baseProposalId
			: this.comparisonData.currentProposalId;
	}

	private checkInCache(cacheName: string): boolean {
		return !!Object.keys(this.budgetCache).find(key => key === cacheName);
	}

	/**
	 * @param  {any} data
	 * @param  {string} type
	 * @returns void
	 * save the value to the cache. Cache name is set same as proposal id since each version will
	 * have a unique proposal id.
	 */
	private updateCache(data: any, type: string): void {
		const proposalId = this.getProposalId(type);
		if (!this.checkInCache(proposalId)) {
			this.budgetCache[proposalId] = deepCloneObject(data);
		}
	}

}
