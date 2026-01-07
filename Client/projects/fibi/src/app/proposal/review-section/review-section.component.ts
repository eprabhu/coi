import { Component, Input, OnInit } from '@angular/core';
import { scrollIntoView } from '../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { ReviewSectionService } from './review.section.service';
import { CommonService } from '../../common/services/common.service';
import { BudgetDataService } from '../services/budget-data.service';
import { ProposalService } from '../services/proposal.service';
@Component({
  selector: 'app-review-section',
  templateUrl: './review-section.component.html',
  styleUrls: ['./review-section.component.css']
})
export class ReviewSectionComponent implements OnInit {
  @Input() result: any = {};
  @Input() proposalDataBindObj: any = {};
  dataVisibilityObj: any = {
    mode: 'view',
    isAttachmentEditable: false,
    isAttachmentListOpen: true,
    isKeyPersonWidgetOpen: true,
    isSpecialReviewWidgetOpen: true,
    isAreaOfResearchWidgetOpen: true,
    isProposalSummary: true,
  };
  isShowMiniToolkit = false;
  scrollIntoView = scrollIntoView;
  $subscriptions: Subscription[] = [];
  budgetData;
  configurationData: any = {};
  helpText: any = {};

  constructor(private _reviewSectionService: ReviewSectionService, public _commonService: CommonService,
    public _budgetDataService: BudgetDataService, public _proposalService: ProposalService) { }

  ngOnInit() {
    this.loadBudgetData();
    this.configurationData.moduleItemKey = this.result.proposal.proposalId;
    this.configurationData.actionUserId = this._commonService.getCurrentUserDetail('personID');
    this.configurationData.actionPersonName = this._commonService.getCurrentUserDetail('userName');
    this.configurationData.moduleItemCode = 3;
    this.configurationData.moduleSubitemCodes = [0];
    this.configurationData.moduleSubItemKey = '';
    this.configurationData.enableViewMode =  true;
    this.configurationData.isEnableVersion = false;
    this.configurationData = Object.assign({}, this.configurationData);
    this.fetchHelpText();
  }

  /* loads the look up value, the budget versions array, flags of budget tabs */
  loadBudgetData() {
      this.$subscriptions.push(this._reviewSectionService.loadBudgetByProposalId({
        'proposalId': this.result.proposal.proposalId,
        'userName': this._commonService.getCurrentUserDetail('userName'),
        'userFullName': this._commonService.getCurrentUserDetail('fullName')
      })
        .subscribe((data: any) => {
          this.budgetData = data;
          this.budgetData.budgetHeader = data.budgetHeader;
          this._budgetDataService.setProposalBudgetData(this.budgetData);
        }));
  }

  /**
   * Gets help texts for Proposal section codes 313 - Special Review, 325 - Area Of Reserch, 302 - Budget
   */
  fetchHelpText() {
    this.$subscriptions.push(this._proposalService.fetchHelpText({
      'moduleCode': 3, 'sectionCodes': [313, 325, 302]
    }).subscribe((data: any) => {
          this.helpText = data;
    }));
  }
}
