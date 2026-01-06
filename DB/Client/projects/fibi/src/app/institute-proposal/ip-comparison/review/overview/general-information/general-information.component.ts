import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DateParserService } from '../../../../../common/services/date-parser.service';
import { compareArray } from '../../../../../common/utilities/array-compare';
import { setHelpTextForSubItems } from '../../../../../common/utilities/custom-utilities';
import { compareObject } from '../../../../../common/utilities/object-compare';
import { compareString } from '../../../../../common/utilities/string-compare';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import { IPGeneralDetails, IPProposalKeyWords } from '../../../comparison-constants';
import { ComparisonDataStoreService } from '../../../comparison-data-store.service';
import { ComparisonData } from '../../../interface';
import { OverviewService } from '../overview.service';

@Component({
  selector: 'app-ip-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.css']
})
export class GeneralInformationComponent implements OnInit, OnDestroy {

  grantCallName: string;
  comparisonData: ComparisonData;
  helpText: any;
  $subscriptions: Array<Subscription> = [];

  constructor(
    private _comparisonStoreData: ComparisonDataStoreService,
    private _overviewService: OverviewService,
    public dateFormatter: DateParserService
  ) { }

  proposal: any = {};
  keywords: any = [];
  isGeneralInfoOpen = false;
  currentMethod = 'VIEW';

  ngOnInit() {
    this.comparisonData = new ComparisonData();
    this.getComparisonData();
    this.viewOrCompare();
    this.fetchHelpText();
  }

  private getComparisonData(): void {
    this.$subscriptions.push(this._overviewService.$childComparisonData.subscribe((data: any) => {
      this.comparisonData = data;
    }));
  }

  /**
   * On changes from parent the currentMethod will be updated here AT the first time on application load
   * there will be no proposal id available to fetch data. to avoid empty service call
   * currentMethod empty check is added the currentMethod will be a String constructor to convert it into
   * a string we use + operator.See the doc below for technical clarification
   */
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

  private fetchHelpText(): void {
    this.$subscriptions.push(this._comparisonStoreData.$helpText.subscribe((data: any) => {
      if (data) {
        this.helpText = data;
        if (Object.keys(data).length && data.proposalInformation &&
            data.proposalInformation.parentHelpTexts.length) {
            data = setHelpTextForSubItems(data, 'proposalInformation');
        }
      }
    }));
  }

  /**
   * @returns void
   * Compare the two versions of proposal. We have two different types here keyword is array and
   * general details is object.
   */
  private compare(): void {
    this.proposal = compareObject(this.comparisonData.base[IPGeneralDetails.reviewSectionName],
                                  this.comparisonData.current[IPGeneralDetails.reviewSectionName],
                                  IPGeneralDetails.reviewSectionSubFields);
    this.proposal.instProposalKeywords = compareArray(this.comparisonData.base[IPProposalKeyWords.reviewSectionName],
                                                      this.comparisonData.current[IPProposalKeyWords.reviewSectionName],
                                                      IPProposalKeyWords.reviewSectionUniqueFields,
                                                      IPProposalKeyWords.reviewSectionSubFields);
    this.grantCallName = compareString(this.comparisonData.current['grantCall'] ?
                                       this.comparisonData.current['grantCall'].grantCallName : null,
                                       this.comparisonData.base['grantCall'] ? this.comparisonData.base['grantCall'].grantCallName : null);
  }

  private setCurrentView(): void {
    if (this.comparisonData.base) {
      this.grantCallName = this.comparisonData.base['grantCall'] ?
      this.comparisonData.base['grantCall'].grantCallName : null;
      this.proposal = this.comparisonData.base[IPGeneralDetails.reviewSectionName];
    }
  }

  ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}

}
