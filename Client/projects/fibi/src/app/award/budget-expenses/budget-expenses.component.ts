import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { OverviewService } from '../overview/overview.service';
import { CommonService } from '../../common/services/common.service';
import { CommonDataService } from '../services/common-data.service';
import { BudgetDataService } from './budget-data.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { AwardService } from '../services/award.service';
import { setHelpTextForSubItems } from '../../common/utilities/custom-utilities';

@Component({
  selector: 'app-budget-expenses',
  templateUrl: './budget-expenses.component.html',
  styleUrls: ['./budget-expenses.component.css']
})
export class BudgetExpensesComponent implements OnInit, OnDestroy {
  awardId: any;
  awardCostDetails: any = [];
  isProjectCostActive = true;
  $subscriptions: Subscription[] = [];
  result: any = {};
  isExpenseTrackRight = false;
  isPurchaseRight = false;
  isRevenueRight = false;
  isClaimRight = false;
  helpText: any = {};
  anticipatedModalType: string = null;
  isViewAnticipatedDistribution = false;

  constructor(public _commonData: CommonDataService, private route: ActivatedRoute,
    private _overviewService: OverviewService, public _commonService: CommonService,
    public _budgetDataService: BudgetDataService, private _awardService: AwardService) { }

  ngOnInit() {
    this.awardId = this.route.snapshot.queryParams['awardId'];
    this.getAwardGeneralData();
    this.getPermission();
    this.fetchHelpText();
  }

  /**
   * Fetch help texts for Award Section Code 102 - Budget and stores the data on behaviour subject of Budget Data Service
   */
  fetchHelpText() {
    this.$subscriptions.push(this._awardService.fetchHelpText({
      'moduleCode': 1, 'sectionCodes': [102]
    }).subscribe((data: any) => {
      this.helpText = data;
      Object.keys(this.helpText).length ? (this.helpText.budget.parentHelpTexts.length ? this.setHelpTextForLineItems(this.helpText) :
      this._budgetDataService.$budgetHelpText.next(this.helpText)) : this._budgetDataService.$budgetHelpText.next(null);
    }));
  }

  /**
   *
   * @param helpTextObj
   * This function is used to remove array of the list of line items that comes on response. This is because to remove index and convert to objects
   * so that you can easily display the help text using [] notation as used in html.
   */
  setHelpTextForLineItems(helpTextObj: any = {}) {
    helpTextObj=setHelpTextForSubItems(helpTextObj, 'budget')
    this._budgetDataService.$budgetHelpText.next(helpTextObj);
  }

  getPermission() {
    this.isExpenseTrackRight =  this._commonData.checkDepartmentLevelRightsInArray('VIEW_EOM_EXPENDITURE_TO_DATE');
    this.isPurchaseRight = this._commonData.checkDepartmentLevelRightsInArray('VIEW_AWARD_PURCHASE_DETAILS');
    this.isRevenueRight = this._commonData.checkDepartmentLevelRightsInArray('VIEW_AWARD_REVENUE_DETAILS');
    this.isClaimRight = this._commonData.checkDepartmentLevelRightsInArray('VIEW_AWARD_CLAIM_TRACKING');
    this.isViewAnticipatedDistribution = this._commonData.awardSectionConfig['196'].isActive &&
            (this._commonData.checkDepartmentLevelRightsInArray('VIEW_ANTICIPATED_FUNDING_DISTRIBUTION') ||
            this._commonData.checkDepartmentLevelRightsInArray('MODIFY_ANTICIPATED_FUNDING_DISTRIBUTION'));
  }

  getAwardFunds() {
    this.$subscriptions.push(this._overviewService.getAwardFunds(
      {'awardId': this.awardId,'awardNumber': this.result.award.awardNumber }).subscribe((data: any) => {
      this.awardCostDetails = data;
      this._budgetDataService.setAwardFundData(this.awardCostDetails);
    }));
  }

  getAwardGeneralData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getAwardFunds();
      }
    }));
  }
  enableBudgetTabTrigger() {
    this._budgetDataService.isBudgetTabTrigger.next(true);
  }
  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    this._budgetDataService.$budgetHelpText.next(null);
  }

  updateAnticipatedDistributable(event?: string): void {
    this.anticipatedModalType = event;
  }

}
