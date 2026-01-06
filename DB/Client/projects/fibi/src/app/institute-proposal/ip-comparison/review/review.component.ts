import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { InstituteProposalService } from '../../services/institute-proposal.service';
import { ComparisonDataStoreService } from '../comparison-data-store.service';
import { CompareDetails } from '../interface';
import { ToolKitService } from '../tool-kit/tool-kit.service';
import { ToolkitInteractionService } from '../toolkit-interaction.service';

@Component({
	selector: 'app-ip-review',
	templateUrl: './review.component.html',
	styleUrls: ['./review.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent implements OnInit, OnDestroy {

	$subscriptions: Array<Subscription> = [];
	leftValue: any = {};
	rightValue: any = {};
	isToolkitVisible: boolean;
	isCompare: boolean;

	constructor(
		private _toolKitEvents: ToolkitInteractionService,
		private _comparisonStoreData: ComparisonDataStoreService,
		private _CDRef: ChangeDetectorRef,
		private _toolKitService: ToolKitService,
		public ipService: InstituteProposalService
	) { }

	ngOnInit(): void {
		this.comparisonEvent();
		this.viewEvent();
		this.getCurrentHeader();
		this.getCompareValue();
		this.getToolkitVisibility();
		this.fetchHelpText();
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

	private comparisonEvent(): void {
		this.$subscriptions.push(
			this._toolKitEvents.$compareEvent.subscribe((data: CompareDetails) => {
					this._comparisonStoreData.setComparisonData(data);
					this.updateCustomElement(data);
					this._comparisonStoreData.setCurrentMethodData('COMPARE');
					this._CDRef.markForCheck();
			}));
	}

	private viewEvent(): void {
		this.$subscriptions.push(
			this._toolKitEvents.$viewEvent.subscribe((data: CompareDetails) => {
				if (data.baseProposalId) {
					this._comparisonStoreData.setComparisonData(data);
					this.updateCustomElement(data);
					this._comparisonStoreData.setCurrentMethodData('VIEW');
					this._CDRef.markForCheck();
				}
			}));
	}

	private getCurrentHeader(): void {
		this.$subscriptions.push(this._toolKitEvents.$currentHeader.subscribe(data => this.setHeaderValues(data)));
	}

	private setHeaderValues(data: any): void {
		this.leftValue = data.leftVersion;
		this.rightValue = data.rightVersion || {};
	}

	private getToolkitVisibility(): void {
		this.$subscriptions.push(this._toolKitEvents.$isToolkitVisible.subscribe(data => {
			this.isToolkitVisible = data;
			this._CDRef.markForCheck();
		}));
	}

	private updateCustomElement(data: CompareDetails): void {
		const customElementCompare: any = {};
		customElementCompare.baseModuleItemCode = 2;
		customElementCompare.currentModuleItemCode = 2;
		customElementCompare.currentModuleItemKey = parseInt(data.currentProposalId, 10) || null;
		customElementCompare.baseModuleItemKey = parseInt(data.baseProposalId, 10) || null;
		this._comparisonStoreData.setCustomElementCompareData(customElementCompare);
	}

	onShowChanges(isToggleComparison): void {
		this._toolKitEvents.$isCompareActive.next(isToggleComparison);
		this._toolKitEvents.$compareFromHeader.next(isToggleComparison);
	}

	private getCompareValue(): void {
		this.$subscriptions.push(this._toolKitEvents.$isCompareActive.subscribe(data => {
				this.isCompare = data;
				this._CDRef.markForCheck();
		}));
	}

	toggleToolkitVisibility(): void {
		this.isToolkitVisible = !this.isToolkitVisible;
		this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
	}

	/**
	* Get help texts for IP section codes 201 - General Proposal Information.
	*/
	private fetchHelpText(): void {
		this.$subscriptions.push(this._toolKitService.fetchHelpText({
			'moduleCode': 2, 'sectionCodes': [201]
		}).subscribe((data: any) => {
			this._comparisonStoreData.setHelpTextData(data);
		}));
	}


}
