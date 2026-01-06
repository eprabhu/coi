import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { AwardSpecialReviews } from '../../../comparison-constants';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { DateParserService } from '../../../../../common/services/date-parser.service';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
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
    awardId: '',
    awardNumber: '',
    sequenceNumber : null,
    moduleVariableSections: [],
    currentSequenceNumber: null,
    isActiveComparison: false
   };
  @Input() currentMethod: string;
  @Input() helpText: any = {};

  constructor(public dateFormatter: DateParserService, private _toolKitEvents: ToolkitEventInteractionService) { }
  awardSpecialReviews: any = [];
  isSpecialReviewWidgetOpen = true;
  savedSpecialReviewObject: any = {};

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges () {
    if ( this.currentMethod + '' !== '') {
       this.currentMethod + '' === 'COMPARE'
       && (this._toolKitEvents.checkSectionTypeCode('113', this.comparisonData.moduleVariableSections)
       || this.comparisonData.isActiveComparison) ? this.compare() : this.setCurrentView();
    }
  }

  compare() {
    this.awardSpecialReviews = compareArray(this.comparisonData.base[AwardSpecialReviews.reviewSectionName],
      this.comparisonData.current[AwardSpecialReviews.reviewSectionName],
      AwardSpecialReviews.reviewSectionUniqueFields,
      AwardSpecialReviews.reviewSectionSubFields);
  }

  setCurrentView() {
    this.awardSpecialReviews = this.comparisonData.base[AwardSpecialReviews.reviewSectionName];
  }

  /**
 * @param savedSpecialReviewObject
 * set type and comment of selected special review. To display in comment modal.
 */
showSpecialReviewComment(savedSpecialReviewObject) {
  this.savedSpecialReviewObject.comment = savedSpecialReviewObject.comments;
  this.savedSpecialReviewObject.title = savedSpecialReviewObject.specialReview.description;
}

}
