import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateParserService } from '../../../../../common/services/date-parser.service';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { OverviewService } from '../overview.service';
import { IPSpecialReviews } from '../../../comparison-constants';
import { ComparisonData } from '../../../interface';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';

@Component({
	selector: 'app-ip-special-review',
	templateUrl: './special-review.component.html',
	styleUrls: ['./special-review.component.css']
})
export class SpecialReviewComponent implements OnInit, OnDestroy {

	proposalSpecialReviews: any;
	viewSpecialReview: any;
	isViewProtocolDetails: boolean;
	isWidgetOpen = true;
	comparisonData: ComparisonData;
	$subscriptions: Subscription[] = [];
	specialReviewComment: any;
	currentMethod = 'VIEW';

	constructor(private _overviewService: OverviewService,
		public dateFormatter: DateParserService) { }

	ngOnInit() {
		this.comparisonData = new ComparisonData();
		this.getComparisonData();
		this.viewOrCompare();
	}

	/**
	 * On changes from parent the currentMethod will be updated here AT the first time on application load
	 * there will be no award number available to fetch data. to avoid empty service call
	 * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
	 * a string we use + operator.See the doc below for technical clarification
	 */

	private getComparisonData(): void {
		this.$subscriptions.push(this._overviewService.$childComparisonData.subscribe((data: any) => {
			this.comparisonData = data;
		}));
	}

	private viewOrCompare(): void {
		this.$subscriptions.push(this._overviewService.$childMethod.subscribe((data: any) => {
			if (data) {
				if (data + '' !== '') {
				this.currentMethod = data || '';
					data + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
				}
			}
		}));
	}

	/**
	* @returns void
	* compares the data of two versions of award contacts. here data is from parent so we simply
	* compares the data Array type is used since contacts type is Array.
	*/
	private compare(): void {
		this.proposalSpecialReviews = compareArray(this.comparisonData.base[IPSpecialReviews.reviewSectionName],
												   this.comparisonData.current[IPSpecialReviews.reviewSectionName],
												   IPSpecialReviews.reviewSectionUniqueFields,
												   IPSpecialReviews.reviewSectionSubFields);
	}

	private setCurrentView(): void {
		if (this.comparisonData.base) {
			this.proposalSpecialReviews = this.comparisonData.base[IPSpecialReviews.reviewSectionName];
		}
	}

	viewProtocolDetails(specialReview): void {
		this.viewSpecialReview = specialReview;
		this.isViewProtocolDetails = true;
	}

	closeViewModal(event) {
		this.isViewProtocolDetails = event;
		this.viewSpecialReview = {};
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
