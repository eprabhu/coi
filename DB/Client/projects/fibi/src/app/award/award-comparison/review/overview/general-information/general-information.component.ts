import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareObject } from '../../../../../common/utilities/object-compare';
import { GeneralDetails, AwardKeyWords } from '../../../comparison-constants';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { DateParserService } from '../../../../../common/services/date-parser.service';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';
import { CommonDataService } from '../../../../services/common-data.service';

/**
 * Developed by Mahesh Sreenath V M / Aravind P S
 * Acts as a independent component that fetches the data for a given awardId.
 * The required details is fetched as input from parent.
 * The comparisonData holds the data for the component. This is written because We fetches dat for
 * all these components in one service call.
 */
@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralInformationComponent implements OnChanges {

  constructor(public dateFormatter: DateParserService, private _toolKitEvents: ToolkitEventInteractionService,
    public _commonData: CommonDataService) { }
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
  award: any = {};
  keywords: any = [];
  isGeneralInfoOpen = false;

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
        && (this._toolKitEvents.checkSectionTypeCode('101', this.comparisonData.moduleVariableSections)
          || this.comparisonData.isActiveComparison) ? this.compare() : this.setCurrentView();
    }
  }

  /**
   * @returns void
   * Compare the two versions of award. We have two different types here keyword is array and
   * general details is object.
   */
  compare() {
    this.award = compareObject(this.comparisonData.base[GeneralDetails.reviewSectionName],
      this.comparisonData.current[GeneralDetails.reviewSectionName],
      GeneralDetails.reviewSectionSubFields);
    this.award.awardKeywords = compareArray(this.comparisonData.base[AwardKeyWords.reviewSectionName].awardKeywords,
      this.comparisonData.current[AwardKeyWords.reviewSectionName].awardKeywords,
      AwardKeyWords.reviewSectionUniqueFields,
      AwardKeyWords.reviewSectionSubFields);
  }

  setCurrentView() {
    this.award = this.comparisonData.base[GeneralDetails.reviewSectionName];
  }

}
