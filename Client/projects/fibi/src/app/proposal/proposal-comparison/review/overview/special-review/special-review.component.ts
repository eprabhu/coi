import { ProposalSpecialReviews } from './../../../comparison-constants';
import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';
import { DateParserService } from '../../../../../common/services/date-parser.service';
import { Subscription } from 'rxjs';
import { OverviewService } from '../overview.service';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-special-review',
  templateUrl: './special-review.component.html',
  styleUrls: ['./special-review.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SpecialReviewComponent implements OnChanges {
  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    proposalId: ''
  };
  @Input() currentMethod: string;
  @Input() helpText: any = {};
  proposalSpecialReviews: any = [];
  isWidgetOpen = true;
  specialReviewComment: string;
  $subscriptions: Subscription[] = [];
  isViewProtocolDetails = false;
  isShowReviewResultCard = false;
  viewSpecialReview: any = {};

  constructor(public dateFormatter: DateParserService, private _overviewService: OverviewService) { }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
    }
  }

  /**
   * @returns void
   * compares the data of two versions of award contacts. here data is from parent so we simply
   * compares the data Array type is used since contacts type is Array.
   */
  compare(): void {
    this.proposalSpecialReviews = compareArray(this.comparisonData.base[ProposalSpecialReviews.reviewSectionName],
      this.comparisonData.current[ProposalSpecialReviews.reviewSectionName],
      ProposalSpecialReviews.reviewSectionUniqueFields,
      ProposalSpecialReviews.reviewSectionSubFields);
  }

  setCurrentView() {
    this.proposalSpecialReviews = this.comparisonData.base[ProposalSpecialReviews.reviewSectionName];
  }

  viewProtocolDetails(specialReview): void {
    this.viewSpecialReview = specialReview;
    this.isViewProtocolDetails = true;
  }

  closeViewModal(event) {
    this.isViewProtocolDetails = event;
    this.viewSpecialReview = {};
  }
}
