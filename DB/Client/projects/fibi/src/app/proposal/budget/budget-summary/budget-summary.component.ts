import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetService } from '../budget.service';
import { BudgetDataService } from '../../services/budget-data.service';
import { setHelpTextForSubItems } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-budget-summary',
    templateUrl: './budget-summary.component.html',
    styleUrls: ['./budget-summary.component.css']
})
export class BudgetSummaryComponent implements OnInit, OnDestroy {

    @Input() helpText: any = {};
    $subscriptions: Subscription[] = [];
    budgetData: any = {};
    budgetSummaryDetails: any = {};

    constructor(
        private _budgetService: BudgetService, private _commonService: CommonService,
        public _budgetDataService: BudgetDataService) { }

    ngOnInit() {
        this._budgetDataService.BudgetTab = 'BUDGETSUMMARY';
        this.subscribeBudgetData();
        if (!Object.keys(this.helpText).length) {
            this.fetchHelpText();
        }
    }

    ngOnChanges() {
        if (Object.keys(this.helpText).length && this.helpText.budget.parentHelpTexts.length) {
            this.helpText = setHelpTextForSubItems(this.helpText, 'budget');
        }
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? Object.assign({}, data) : {};
            if (data && data.budgetHeader) {
                this.loadBudgetSummary(data.budgetHeader.budgetId);
            }
        }));
    }

    fetchHelpText() {
        this.$subscriptions.push(this._budgetDataService.$budgetHelpText.subscribe((data: any) => {
            this.helpText = data;
        }));
    }
    /**
     * For getting budget summary details
     */
    loadBudgetSummary(budgetId) {
        const requestObj = { 'budgetTabName': 'BUDGET_SUMMARY', 'budgetId': budgetId };
        this.$subscriptions.push(this._budgetService.fetchBudgetSummaryTable(requestObj)
            .subscribe((data: any) => {
                this.budgetSummaryDetails = data;
                this.budgetSummaryDetails.budgetPeriodSummaries = this.sortBudgetData(this.budgetSummaryDetails.budgetPeriodSummaries);
            }));
    }

    /**
     * To sort the budget data
     */
    sortBudgetData(budgetData) {
        return budgetData.sort((a, b) => {
            return a.sortOrder - b.sortOrder;
        });
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }
}
