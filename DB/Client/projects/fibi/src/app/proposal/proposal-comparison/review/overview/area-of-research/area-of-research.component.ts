import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { CompareData } from '../../../interfaces';
import { ProposalResearchAreas, GeneralDetails } from '../../../comparison-constants';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { ToolkitEventInteractionService } from '../../../toolkit-event-interaction.service';
import { setHelpTextForSubItems } from '../../../../../common/utilities/custom-utilities';

/**
 * Developed by Aravind P S
 * Acts as a independent component that fetches the data for a given proposalId.
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
    proposalId: ''
  };
  @Input() currentMethod: string;
  @Input() helpText: any = {};

  isShowCollapse = true;
  isMoreInfoWdgtOpen = true;
  isResearchDescriptionReadMore = false;
  isMultiDisciplinaryDescriptionReadMore = false;
  proposal: any = {};
  proposalResearchAreas: any = [];

  constructor(private _toolKitEvents: ToolkitEventInteractionService) { }
  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no proposal number available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   * https://docs.google.com/document/d/1vAACL0gDF2_tMW46ilpEsbZ0qRAFECEnPT4x4QoW2Mg/edit?usp=sharing
   */
  ngOnChanges() {
    if (this.currentMethod + '' !== '') {
      this.currentMethod + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
    }
  }

  /**
   * @returns void
   * compares the two versions of the data. Compares array here since the type of the data is
   * Array
   */
  compare(): void {
    this.proposalResearchAreas = compareArray(this.comparisonData.base[ProposalResearchAreas.reviewSectionName] || [],
      this.comparisonData.current[ProposalResearchAreas.reviewSectionName] || [],
      ProposalResearchAreas.reviewSectionUniqueFields,
      ProposalResearchAreas.reviewSectionSubFields);
    this.proposal.multiDisciplinaryDescription = this.comparisonData.base.proposal.multiDisciplinaryDescription;
    this.proposal.researchDescription = this.comparisonData.base.proposal.researchDescription;

  }

  setCurrentView() {
    this.proposalResearchAreas = this.comparisonData.base[ProposalResearchAreas.reviewSectionName] || [];
    this.proposal = this.comparisonData.base[GeneralDetails.reviewSectionName];
  }
}
