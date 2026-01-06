import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { ProposalMilestones } from '../../../comparison-constants';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.css'],
})
export class MilestoneComponent implements OnChanges {
  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    proposalId: ''
  };
  @Input() currentMethod: string;
  proposalMileStones: any = [];
  isShowMilestone = true;

  constructor() { }

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
    this.proposalMileStones = compareArray(this.comparisonData.base[ProposalMilestones.reviewSectionName],
      this.comparisonData.current[ProposalMilestones.reviewSectionName],
      ProposalMilestones.reviewSectionUniqueFields,
      ProposalMilestones.reviewSectionSubFields);
  }

  setCurrentView() {
    this.proposalMileStones = this.comparisonData.base[ProposalMilestones.reviewSectionName];
  }
}
