import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { AwardResearchAreas, GeneralDetails } from '../../../comparison-constants';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service.
 */
@Component({
  selector: 'app-area-of-research',
  templateUrl: './area-of-research.component.html',
  styleUrls: ['./area-of-research.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaOfResearchComponent implements OnChanges {

  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    awardId: '',
    awardNumber: '',
    sequenceNumber: null,
    moduleVariableSections: [],
    currentSequenceNumber: null,
    isActiveComparison: false
  };
  @Input() currentMethod: string;
  @Input() helpText: any = {};

  isShowCollapse = true;
  isMoreInfoWdgtOpen = true;
  isResearchDescriptionReadMore = false;
  isMultiDisciplinaryDescriptionReadMore = false;
  award: any = {};
  awardResearchAreas: any = [];

  constructor(private _toolKitEvents: ToolkitEventInteractionService) { }
  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no award number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE'
        && (this._toolKitEvents.checkSectionTypeCode('125', this.comparisonData.moduleVariableSections)
          || this.comparisonData.isActiveComparison ) ? this.compare() : this.setCurrentView();
    }
  }

  /**
   * @returns void
   * compares the two versions of the data. Compares array here since the type of the data is
   * Array
   */
  compare(): void {
    this.awardResearchAreas = compareArray(this.comparisonData.base[AwardResearchAreas.reviewSectionName],
      this.comparisonData.current[AwardResearchAreas.reviewSectionName],
      AwardResearchAreas.reviewSectionUniqueFields,
      AwardResearchAreas.reviewSectionSubFields);
    this.award.multiDisciplinaryDescription = this.comparisonData.base.award.multiDisciplinaryDescription;
    this.award.researchDescription = this.comparisonData.base.award.researchDescription;

  }

  setCurrentView() {
    this.awardResearchAreas = this.comparisonData.base[AwardResearchAreas.reviewSectionName] || [];
    this.award = this.comparisonData.base[GeneralDetails.reviewSectionName];
  }
}
