import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

import { ModularBudgetService } from './modular-budget.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetDataService } from '../../services/budget-data.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';

@Component({
    selector: 'app-modular-budget',
    templateUrl: './modular-budget.component.html',
    styleUrls: ['./modular-budget.component.css']
})
export class ModularBudgetComponent implements OnInit, OnDestroy {

    budgetData: any = {};
    modularBudgetObj: any = {};
    showIndirectOptions: any = [];
    tempIdcList: any = [];
    currency;
    $subscriptions: Subscription[] = [];
    hasUnsavedChanges = false;

    constructor(
        private _modularBudgetService: ModularBudgetService,
        private _commonService: CommonService,
        public _budgetDataService: BudgetDataService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this._budgetDataService.BudgetTab = 'MODULARBUDGET';
        this.currency = this._commonService.currencyFormat;
        this.subscribeBudgetData();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? Object.assign({}, data) : {};
            if (this.budgetData.budgetHeader) {
                this.loadModularBudgetData(this.budgetData.budgetHeader.budgetId);
            }
        }));
    }

    ngOnDestroy() {
        this.setUnsavedChanges(false);
        subscriptionHandler(this.$subscriptions);
    }
    loadModularBudgetData(budgetId) {
        this.$subscriptions.push(this._modularBudgetService.getProposalModularBudget({ 'budgetId': budgetId })
            .subscribe((data: any) => {
                this.modularBudgetObj = data;
                this.viewIndirectCosts();
            }));
    }

    addIndirectCost(index) {
        const tempIdcObj: any = {};
        tempIdcObj.budgetModularIDCId = null;
        tempIdcObj.description = null;
        tempIdcObj.idcRate = 0;
        tempIdcObj.idcBase = 0;
        tempIdcObj.fundsRequested = 0;
        tempIdcObj.updateTimeStamp = new Date().getTime();
        tempIdcObj.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.modularBudgetObj.modularBudget[index].idc.push(tempIdcObj);
    }

    removeIndirectCost(index, idc_index) {
        if (this.modularBudgetObj.modularBudget[index].idc[idc_index].budgetModularIDCId) {
            const requestObj = { 'budgetModularIDCId': this.modularBudgetObj.modularBudget[index].idc[idc_index].budgetModularIDCId };
            this.$subscriptions.push(this._modularBudgetService.deleteIndirectLine(requestObj)
                .subscribe((data: any) => {
                    this.modularBudgetObj = data;
                }));
        } else {
            this.modularBudgetObj.modularBudget[index].idc.splice(idc_index, 1);
            this.onRequestedFundsChange(index, idc_index);
        }
    }

    viewIndirectCosts() {
        this.modularBudgetObj.modularBudget.forEach((item, key) => {
            item.idc.forEach((idcItem, idcKey) => {
                if (idcItem.budgetModularIDCId != null) {
                    this.showIndirectOptions[key] = true;
                }
            });
        });
    }

    onRequestedFundsChange(index, idc_index) {
        this.setUnsavedChanges(true);
        this.modularBudgetObj.modularBudget[index].totalIndirectCost = 0;
        for (const idcItem of this.modularBudgetObj.modularBudget[index].idc) {
            this.modularBudgetObj.modularBudget[index].totalIndirectCost += idcItem.fundsRequested;
        }
        this.calculateTotalFundsRequested(index);
    }

    calculateTotalDirectCost(index) {
        this.setUnsavedChanges(true);
        this.modularBudgetObj.modularBudget[index].totalDirectCost = this.modularBudgetObj.modularBudget[index].directCostLessConsorFna +
            this.modularBudgetObj.modularBudget[index].consortiumFna;
        this.calculateTotalFundsRequested(index);
    }

    calculateTotalFundsRequested(index) {
        this.modularBudgetObj.modularBudget[index].totalDirectAndInDirectCost = this.modularBudgetObj.modularBudget[index].totalDirectCost +
            this.modularBudgetObj.modularBudget[index].totalIndirectCost;
        this.calculateCumulativeTotals();
    }

    calculateCumulativeTotals() {
        this.modularBudgetObj.totalDirectCostLessConsorFnaforAllPeriod = 0;
        this.modularBudgetObj.totalConsortiumFnaforAllPeriod = 0;
        this.modularBudgetObj.totalDirectCostforAllPeriod = 0;
        this.modularBudgetObj.totalIndirectDirectCostforAllPeriod = 0;
        this.modularBudgetObj.totalDirectAndInDirectCostforAllPeriod = 0;
        for (const budgetPeriod of this.modularBudgetObj.modularBudget) {
            this.modularBudgetObj.totalDirectCostLessConsorFnaforAllPeriod += budgetPeriod.directCostLessConsorFna;
            this.modularBudgetObj.totalConsortiumFnaforAllPeriod += budgetPeriod.consortiumFna;
            this.modularBudgetObj.totalDirectCostforAllPeriod += budgetPeriod.totalDirectCost;
            this.modularBudgetObj.totalIndirectDirectCostforAllPeriod += budgetPeriod.totalIndirectCost;
            this.modularBudgetObj.totalDirectAndInDirectCostforAllPeriod += budgetPeriod.totalDirectAndInDirectCost;
        }
    }

    validateModularBudget() {
        this.modularBudgetObj.modularBudget.forEach(budgetPeriod => {
            if (budgetPeriod.idc !== null) {
                budgetPeriod.idc.forEach((idcItem, key) => {
                    if (!idcItem.idcRate && !idcItem.idcBase && !idcItem.fundsRequested) {
                        budgetPeriod.idc.splice(key, 1);
                    }
                });
            }
        });
    }

    saveModularBudget() {
        this.validateModularBudget();
        this.modularBudgetObj.budgetId = this.budgetData.budgetHeader.budgetId;
        this.$subscriptions.push(this._modularBudgetService.saveModularBudget(this.modularBudgetObj).subscribe((data: any) => {
            this.modularBudgetObj = data;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Modular Budget saved successfully.');
            this.setUnsavedChanges(false);
        }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Modular Budget failed. Please try again.');
        }));
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.budgetDataChanged = flag;
        this.hasUnsavedChanges = flag;
        this._autoSaveService.setUnsavedChanges('Modular Budget', 'proposal-modular-budget', flag);
    }

}
