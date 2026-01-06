import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { IPGeneralDetails, IPResearchAreas } from '../../../comparison-constants';
import { ComparisonData } from '../../../interface';
import { OverviewService } from '../overview.service';

@Component({
  selector: 'app-ip-area-of-research',
  templateUrl: './area-of-research.component.html',
  styleUrls: ['./area-of-research.component.css']
})
export class AreaOfResearchComponent implements OnInit, OnDestroy {

  researchArea: any;
  proposal: any;
  proposalResearchAreas: any;
  isShowCollapse = true;
  comparisonData: ComparisonData;
  $subscriptions: Array<Subscription> = [];
  currentMethod = 'VIEW';

  constructor(private _overviewService: OverviewService) { }

  ngOnInit() {
    this.comparisonData = new ComparisonData();
    this.getComparisonData();
    this.viewOrCompare();
  }

  private getComparisonData(): void {
    this.$subscriptions.push(this._overviewService.$childComparisonData.subscribe((data: any) => {
      this.comparisonData = data;
    }));
  }

  private viewOrCompare(): void {
    this.$subscriptions.push(this._overviewService.$childMethod.subscribe((data: any) => {
      if (data) {
				this.currentMethod = data || '';
        if (data + '' !== '') {
          data + '' === 'COMPARE' ? this.compare() : this.setCurrentView();
        }
      }
    }));
  }

  /**
   * @returns void
   * compares the two versions of the data. Compares array here since the type of the data is
   * Array
   */
  private compare(): void {
    this.proposalResearchAreas = compareArray(this.comparisonData.base[IPResearchAreas.reviewSectionName] || [],
                                              this.comparisonData.current[IPResearchAreas.reviewSectionName] || [],
                                              IPResearchAreas.reviewSectionUniqueFields,
                                              IPResearchAreas.reviewSectionSubFields);
    this.proposal.multiDisciplinaryDescription = this.comparisonData.base.instProposal.multiDisciplinaryDescription;
    this.proposal.researchDescription = this.comparisonData.base.instProposal.researchDescription;

  }

  private setCurrentView(): void {
    if (this.comparisonData.base) {
      this.proposalResearchAreas = this.comparisonData.base[IPResearchAreas.reviewSectionName] || [];
      this.proposal = this.comparisonData.base[IPGeneralDetails.reviewSectionName];
    }
  }

  ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
