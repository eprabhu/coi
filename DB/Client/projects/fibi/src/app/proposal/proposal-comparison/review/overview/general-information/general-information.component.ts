import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { compareObject } from '../../../../../common/utilities/object-compare';
import { GeneralDetails, ProposalKeyWords } from '../../../comparison-constants';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { DateParserService } from '../../../../../common/services/date-parser.service';
import { compareString } from '../../../../../common/utilities/string-compare';
import { setHelpTextForSubItems } from '../../../../../common/utilities/custom-utilities';
import { CommonService } from '../../../../../common/services/common.service';
import { ProposalService } from '../../../../services/proposal.service';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given proposalId.
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
  grantCallName: string;

  constructor(public dateFormatter: DateParserService, public _commonService: CommonService, public _proposalService: ProposalService) { }
  @Input() comparisonData: CompareData = {
    base: {},
    current: {},
    proposalId: '',
  };
  @Input() currentMethod: string;
  @Input() helpText: any = {};
  proposal: any = {};
  keywords: any = [];
  isGeneralInfoOpen = false;

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no proposal id available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
    }
    if (Object.keys(this.helpText).length && this.helpText.proposalInformation &&
      this.helpText.proposalInformation.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'proposalInformation');
    }
  }

  /**
   * @returns void
   * Compare the two versions of proposal. We have two different types here keyword is array and
   * general details is object.
   */
  compare() {
    this.proposal = compareObject(this.comparisonData.base[GeneralDetails.reviewSectionName],
      this.comparisonData.current[GeneralDetails.reviewSectionName],
      GeneralDetails.reviewSectionSubFields);
    this.proposal.proposalKeywords = compareArray(this.comparisonData.base[ProposalKeyWords.reviewSectionName].proposalKeywords,
      this.comparisonData.current[ProposalKeyWords.reviewSectionName].proposalKeywords,
      ProposalKeyWords.reviewSectionUniqueFields,
      ProposalKeyWords.reviewSectionSubFields);
      this.grantCallName = compareString(this.comparisonData.current['grantCall'] ? this.comparisonData.current['grantCall'].grantCallName: null,
      this.comparisonData.base['grantCall'] ? this.comparisonData.base['grantCall'].grantCallName: null)
  }

  addSpace(data) {
    return data = data ? data.replace(/&nbsp;/g, ' ') : null;
  }

  setCurrentView() {
    this.grantCallName = this.comparisonData.base['grantCall'] ? this.comparisonData.base['grantCall'].grantCallName: null;
    this.proposal = this.comparisonData.base[GeneralDetails.reviewSectionName];
  }

}
