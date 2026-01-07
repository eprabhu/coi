import { BudgetDataService } from './../../budget-data.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { BudgetService } from '../../budget.service';
import { CommonDataService } from '../../../services/common-data.service';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-revenue-details',
  templateUrl: './revenue-details.component.html',
  styleUrls: ['./revenue-details.component.css']
})
export class RevenueDetailsComponent implements OnInit, OnDestroy {
  $subscriptions: Subscription[] = [];
  award: any;
  lastRefreshedDate: any;
  awardBudgetRevenueData: any = [];
  awardRevenueVO: any;
  lastRevenueData: any = {};
  isViewExpenseTransactions = false;
  awardBudgetTransactionDetails: any = {};
  awardExpenseTab: any;
  currency: any;
  awardId: any;
  expensePurchase: any = {
    index: null,
  };

  constructor(private _budgetService: BudgetService, public _commonDataService: CommonDataService,
    public _budgetDataService: BudgetDataService,
    public _commonService: CommonService, private _activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
    this.awardId = this._activatedRoute.snapshot.queryParamMap.get('awardId');
    this.isViewExpenseTransactions = this._commonDataService.checkDepartmentLevelRightsInArray('VIEW_EXPENSE_TRANSACTION');
    this.$subscriptions.push(this._commonDataService.awardData.subscribe((data: any) => {
      if (data) {
        this.award = Object.assign({}, data.award);
        this.loadAwardBudgetRevenueData();
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * @param  {} index
   * Here the data(revenue details and index) is set to an expensePurchase
   */
  setContent(index) {
    this._budgetDataService.expensePurchase.index = index;
  }

  /*  This function will load all data that is need to be shown on table of Award Revenue page */

  loadAwardBudgetRevenueData() {
    this.$subscriptions.push(this._budgetService.getBudgetRevenueData({
      'awardNumber': this.award.awardNumber,
      'accountNumber': this.award.accountNumber
    }).subscribe((data: any) => {
      if (data) {
        this.awardBudgetRevenueData = this.mapAwardRevenueVo(data);
        this._budgetDataService.expensePurchase.budgetData = this.awardBudgetRevenueData;
        this.lastRevenueData = data && data.length && data[data.length - 1];
      }
    }));
  }

  mapAwardRevenueVo(data) {
    let AwardRevenueVos = [];
    data.map(E => {
      AwardRevenueVos = AwardRevenueVos.concat(E.awardRevenueVOs)
    });
    return AwardRevenueVos;
  }
}
