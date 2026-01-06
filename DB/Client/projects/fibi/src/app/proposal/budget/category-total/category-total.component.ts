// Last updated by Remya on 16 Oct 2019
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetDataService } from '../../services/budget-data.service';
import { BudgetService } from '../budget.service';
import { checkPeriodDatesOutside } from '../budget-validations';
import { ProposalService } from '../../services/proposal.service';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { AutoSaveService } from '../../../common/services/auto-save.service';

@Component({
    selector: 'app-category-total',
    templateUrl: './category-total.component.html',
    styleUrls: ['./category-total.component.css']
})
export class CategoryTotalComponent implements OnInit, OnDestroy {
    @Input() budgetData: any = {};
    @Input() simpleBudgetVo: any = {};

    index: number;
    currency;

    simpleBudgetData: any = {};
    isInvalidLineItem: any = {};
    completerOptions: any = {};
    budgetDetail: any = {};
    lineItem: any = {};
    clearField: any;
    $subscriptions: Subscription[] = [];
    hasUnsavedChanges = false;

    constructor(
        private _commonService: CommonService,
        private _budgetService: BudgetService,
        public _budgetDataService: BudgetDataService,
        private _proposalService: ProposalService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this.currency = this._commonService.currencyFormat;
        this._budgetDataService.BudgetTab = 'CATEGORYTOTAL';
        this.subscribeBudgetData();
        this.listenForGlobalSave();
    }

    listenForGlobalSave() {
        this.$subscriptions.push(this._autoSaveService.autoSaveTrigger$.subscribe(_saveClick => this.saveOrUpdateProposalBudget()));
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? Object.assign({}, data) : {};
            this.onInit();
        }));
    }

    onInit() {
        if (this._budgetDataService.isBudgetViewMode && (
            (this.budgetData.categoryCode === 2 && this.budgetData.isSimpleBudgetEnabled)
            || this.budgetData.isSinglePeriodBudgetEnabled)) {
            this.$subscriptions.push(this._budgetService.fetchCostElementByCategories().subscribe((data: any) => {
                this.completerOptions.arrayList = data;
                this.completerOptions.contextField = 'description';
                this.completerOptions.filterFields = 'description';
                this.completerOptions.formatString = 'description';
            }));
        }
    }
    ngOnDestroy() {
        this.setUnsavedChanges(false);
        subscriptionHandler(this.$subscriptions);
    }
    /* sets budget category object*/
    budgetCategoryChange(selectedResult) {
        if (selectedResult) {
            this.budgetDetail.costElement = selectedResult;
            this.budgetDetail.costElementCode = selectedResult.costElement;
            this.budgetDetail.budgetCategory = selectedResult.budgetCategory;
            this.budgetDetail.budgetCategoryCode = selectedResult.budgetCategoryCode;
        }
        this.setUnsavedChanges(true);
    }

    addSystemGeneratedCostElements() {
        if (this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails.length === 0) {
            let sysCostLineItemNumber = 0;
            for (const sysCost of this.budgetData.sysGeneratedCostElements) {
                const tempSysCost: any = {};
                tempSysCost.budgetCategory = sysCost.budgetCategory;
                tempSysCost.budgetCategoryCode = sysCost.budgetCategoryCode;
                tempSysCost.budgetPeriod = 1;
                tempSysCost.costElement = sysCost;
                tempSysCost.costElementCode = sysCost.costElement;
                tempSysCost.lineItemDescription = null;
                tempSysCost.isSystemGeneratedCostElement = true;
                tempSysCost.fullName = null;
                tempSysCost.rolodexId = null;
                tempSysCost.personId = null;
                tempSysCost.updateTimeStamp = new Date().getTime();
                tempSysCost.updateUser = this._commonService.getCurrentUserDetail('userName');
                tempSysCost.systemGeneratedCEType = sysCost.systemGeneratedCEType;
                tempSysCost.lineItemCost = 0;
                tempSysCost.lineItemDescription = null;
                tempSysCost.quantity = 0;
                tempSysCost.lineItemNumber = ++sysCostLineItemNumber;
                this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails.push(tempSysCost);
                this.budgetData.budgetHeader.budgetPeriods[0].updateUser = this._commonService.getCurrentUserDetail('userName');
                this.budgetData.budgetHeader.budgetPeriods[0].updateTimeStamp = new Date().getTime();
            }
        }

    }

    /**
     * Adds budget detail as line items to the first period.
       Each lineitem will be added as budget cost for first period
     */
    addBudgetDetail() {
        this.checkInvalidLineItem();
        if (!this.isInvalidLineItem.warningMsg) {
            if (this.budgetData.isSysGeneratedCostElementEnabled) {
                this.addSystemGeneratedCostElements();
            }
            const tempBudgetDetail: any = {};
            tempBudgetDetail.costElement = this.budgetDetail.costElement;
            tempBudgetDetail.costElementCode = this.budgetDetail.costElementCode;
            tempBudgetDetail.budgetCategory = this.budgetDetail.budgetCategory;
            tempBudgetDetail.budgetCategoryCode = this.budgetDetail.budgetCategoryCode;
            tempBudgetDetail.budgetPeriod = 1;
            tempBudgetDetail.lineItemDescription = this.budgetDetail.lineItemDescription;
            /**lineItemNumber -using it for SIMPLE BUDGET (for entering duplicate cost elements)
            *  if no lineItem exists in a period, lineItemNumber of firstly added lineItem is set to 1
            *  otherwise, lineItemNumber = lineItemNumber of latest entered lineItem(given as maxLineItemNumber)
            * + no. of sys generated cost elements
            */
            const lineItemNumberCount = this.budgetData.maxLineItemNumber ?
                this.budgetData.maxLineItemNumber : this.budgetData.sysGeneratedCostElements.length;
            tempBudgetDetail.lineItemNumber = lineItemNumberCount + 1;
            tempBudgetDetail.lineItemCost = this.budgetDetail.lineItemCost == null || this.budgetDetail.lineItemCost === '' ?
                0 : parseFloat(this.budgetDetail.lineItemCost);
            tempBudgetDetail.isSystemGeneratedCostElement = false;
            this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails.unshift(tempBudgetDetail);
            this.calculateTotalCost();
            this.saveOrUpdateProposalBudget();
            this.budgetDetail = {};
            this.clearFields();
        }
    }

    /* clears all fields */
    clearFields() {
        this.budgetDetail = {};
        this.isInvalidLineItem = {};
        this.clearField = new String('true');
    }

    /**
     * @param  {any} event
     * restricts inputs other than numbers
     */
    inputRestriction(event: any, type) {
        const pattern = /[0-9\+\-\/\.\ ]/;
        if (!pattern.test(String.fromCharCode(event.charCode))) {
            event.preventDefault();
        }
    }

    /* checks any invalid lineitem is entered or not */
    checkInvalidLineItem() {
        this.isInvalidLineItem = {};
        if (!this.budgetDetail.budgetCategoryCode) {
            this.isInvalidLineItem.budgetCategory = true;
            this.isInvalidLineItem.warningMsg = '* Please choose a budget category';
        }
    }

    /* calculates total,direct and indirect costs of the budget */
    calculateTotalCost() {
        let totalCost = 0;
        let totalDirect = 0;
        let totalIndirect = 0;
        for (let detailIndex = 0; detailIndex < this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails.length; detailIndex++) {
            if (this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails[detailIndex].systemGeneratedCEType == null ||
                this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails[detailIndex].systemGeneratedCEType === 'BUDGET_FRINGE_ON') {
                totalDirect = totalDirect + parseFloat(this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails[detailIndex].lineItemCost);
            } else if
                (this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails[detailIndex].systemGeneratedCEType === 'BUDGET_RESEARCH_OH_ON' ||
                this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails[detailIndex].systemGeneratedCEType === 'BUDGET_OH_ON') {
                totalIndirect = totalIndirect + parseFloat(this.budgetData.budgetHeader.budgetPeriods[0].budgetDetails[detailIndex].lineItemCost);
            }
        }
        totalCost = totalCost + totalDirect + totalIndirect;
        this.budgetData.budgetHeader.budgetPeriods[0].totalCost = totalCost;
        this.budgetData.budgetHeader.budgetPeriods[0].totalDirectCost = totalDirect;
        this.budgetData.budgetHeader.budgetPeriods[0].totalIndirectCost = totalIndirect;
        this.budgetData.budgetHeader.totalDirectCost = totalDirect;
        this.budgetData.budgetHeader.totalIndirectCost = totalIndirect;
        this.budgetData.budgetHeader.totalCost = totalCost;
    }

    /* temporary saves lineitem before deletion */
    tempSaveLineItem(i, lineitem) {
        this.index = i;
        this.lineItem = lineitem;
    }

    setBudgetHeaderDates() {
        if (!checkPeriodDatesOutside(this.budgetData.budgetHeader.budgetPeriods, this._proposalService.proposalStartDate,
            this._proposalService.proposalEndDate)) {
            this.budgetData.budgetHeader.startDate = parseDateWithoutTimestamp(this._proposalService.proposalStartDate);
            this.budgetData.budgetHeader.endDate = parseDateWithoutTimestamp(this._proposalService.proposalEndDate);
        }
    }

    saveOrUpdateProposalBudget() {
        if (this.hasUnsavedChanges) {
            this.setBudgetHeaderDates();
            const requestObject = {
                'budgetTabName': 'CATEGORY_TOTAL',
                'budgetHeader': this.budgetData.budgetHeader,
                'proposalId': this.budgetData.budgetHeader.proposalId,
                'budgetPeriod': this._budgetDataService.currentPeriodNumber,
                'updateUser': this._commonService.getCurrentUserDetail('userName'),
                'grantTypeCode': this._budgetDataService.grantTypeCode,
                'activityTypeCode': this._budgetDataService.activityTypeCode
            };
            this.$subscriptions.push(this._budgetService.saveOrUpdateProposalBudget(requestObject)
                .subscribe((data: any) => {
                    this.budgetData.budgetHeader = data.budgetHeader;
                    this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                    this.budgetData.grantTypeCode = data.grantTypeCode;
                    this.budgetData.categoryCode = data.categoryCode;
                    this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
                    this._budgetDataService.setProposalBudgetData(this.budgetData);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget saved successfully.');
                    this.setUnsavedChanges(false);
                },
                    err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Budget failed. Please try again.');
                    }));
            this._budgetDataService.budgetDataChanged = false;
        }
    }

    deleteLineItem() {
        if ((this.lineItem.budgetDetailId !== null || this.lineItem.budgetDetailId !== undefined)) {
            const requestObj = {
                budgetPeriodId: this.budgetData.budgetHeader.budgetPeriods[0].budgetPeriodId,
                budgetDetailId: this.lineItem.budgetDetailId, budgetHeader: this.budgetData.budgetHeader
            };
            this.$subscriptions.push(this._budgetService.deleteBudgetDetailLineItem(requestObj).subscribe((data: any) => {
                this.budgetData.budgetHeader = data.budgetHeader;
                this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                this.budgetData.grantTypeCode = data.grantTypeCode;
                this.budgetData.categoryCode = data.categoryCode;
                this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
            }));
        }
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.budgetDataChanged = flag;
        this.hasUnsavedChanges = flag;
        this._autoSaveService.setUnsavedChanges('Budget Category Total', 'proposal-budget-category-total', flag);
    }

}
