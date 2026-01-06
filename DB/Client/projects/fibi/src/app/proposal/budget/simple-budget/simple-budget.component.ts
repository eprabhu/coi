import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ProposalService } from '../../services/proposal.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetDataService } from '../../services/budget-data.service';
import { BudgetService } from '../budget.service';
import { getEndPointOptionsForCostElements } from '../../../common/services/end-point.config';
import { convertToValidAmount, inputRestrictionForAmountField } from '../../../common/utilities/custom-utilities';
import {
    inputDigitRestriction, checkPeriodDatesOutside,
    checkObjectHasValues, inputRestrictionForQuantityField, validateLineItem
} from '../budget-validations';
import { AutoSaveService } from '../../../common/services/auto-save.service';


@Component({
    selector: 'app-simple-budget',
    templateUrl: './simple-budget.component.html',
    styleUrls: ['./simple-budget.component.css']
})
export class SimpleBudgetComponent implements OnInit, OnDestroy {

    budgetData: any = {};
    simpleBudgetVo: any = [];
    selectedRateYear = 1;
    isInvalidLineItem: any = {
        cost: []
    };
    actionsModalObj: any = {};
    lineItemObj: any = {
        yearCosts: []
    };
    rateObj: any = {};
    toggleCategoryList: any = {};
    costElementHttpOptions: any;
    costElementByParamHttpOptions: any;
    clearCostElementField: String;
    justificationToggleList: any = {};
    systemGeneratedCostCodes = [];
    periodRateList = [];
    $subscriptions: Subscription[] = [];
    isAnyPeriodFilled = false;
    inputDigitRestriction = inputDigitRestriction;
    inputRestrictionForAmountField = inputRestrictionForAmountField;
    inputRestrictionForQuantityField = inputRestrictionForQuantityField;
    validateLineItem = validateLineItem;
    helpText: any = {};
    isSaved = false;
    hasUnsavedChanges = false;

    constructor(
        public _commonService: CommonService,
        private _proposalService: ProposalService,
        private _budgetService: BudgetService,
        public _budgetDataService: BudgetDataService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this._budgetDataService.BudgetTab = 'SIMPLE';
        this.subscribeBudgetData();
        this.fetchHelpText();

    }

    onInit() {
        this.actionsModalObj.isWarning = false;
        this.actionsModalObj.selectedIndex = 0;
        this.actionsModalObj.selectedCategoryCode = null;
        this.lineItemObj.yearCosts = [];
        this.costElementHttpOptions = getEndPointOptionsForCostElements('findCostElement');
        /* HttpOptions of cost elements endpoint search if system generated costs are not enabled*/
        if (this.budgetData.isSysGeneratedCostElementEnabled) {
            this.systemGeneratedCostCodes.push(this.budgetData.sysGeneratedCostElements[0].budgetCategoryCode);
            this.systemGeneratedCostCodes.push(500); // for Budget Category Total - Cost element duplication issue
            this.costElementByParamHttpOptions =
                getEndPointOptionsForCostElements('findCostElementsByParams', { 'budgetCategoryCodes': this.systemGeneratedCostCodes });
        }
        this.isAnyPeriodFilled = this.checkAnyPeriodFilled();
        this.budgetData.simpleBudgetVo = this.sortBudgetData(this.budgetData.simpleBudgetVo);
        this.simpleBudgetVo = this.budgetData.simpleBudgetVo;
        this.loadSimpleBudgetData(this.budgetData.budgetHeader.budgetId);
        this.toggleCategoryExpansion();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
            this.budgetData = data ? Object.assign({}, data) : {};
            if (this.budgetData.budgetHeader) {
                this.onInit();
            }
        }));
    }

    fetchHelpText() {
        this.$subscriptions.push(this._budgetDataService.$budgetHelpText.subscribe((data: any) => {
            this.helpText = data;
        }));
    }

    loadSimpleBudgetData(budgetId) {
        if (!this.simpleBudgetVo.length) {
            this.$subscriptions.push(this._budgetService.loadSimpleBudgetByBudgetId({ 'budgetId': budgetId })
                .subscribe((data: any) => {
                    this.simpleBudgetVo = data.simpleBudgetVo;
                    this.budgetData.simpleBudgetVo = this.simpleBudgetVo;
                    this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
                    this.toggleCategoryExpansion();
                }));
        }
    }

    ngOnDestroy() {
        this.setUnsavedChanges(false);
        this.simpleBudgetVo = [];
        subscriptionHandler(this.$subscriptions);
    }

    toggleCategoryExpansion() {
        this.toggleCategoryList = {};
        if (this.budgetData.simpleBudgetVo.length > 0) {
            for (const detail of this.simpleBudgetVo) {
                this.toggleCategoryList[detail.categoryCode] = true;
                /* for (const lineItem of detail.lineItemList) {
                  this.justificationToggleList[lineItem.costElementCode] = false;
                } */
            }
        }
    }

    onCategoryToggle(categoryCode) {
        if (!this.toggleCategoryList[categoryCode]) {
            const lineItem = this.simpleBudgetVo.find(detail => detail.categoryCode === categoryCode);
            lineItem.lineItemList.forEach((item, key) => {
                this.justificationToggleList[item.lineItemNumber] = categoryCode === item.budgetCategoryCode ? false : true;
            });
        }
    }

    checkAnyPeriodFilled() {
        if (!this.budgetData.budgetHeader.budgetPeriods.find(period => period.budgetDetails.length > 0)) {
            return false;
        } else { return true; }
    }

    onCostElementSelect(event) {
        if (event) {
            this.lineItemObj.costElement = event;
            this.lineItemObj.costElementCode = event.costElement;
            this.lineItemObj.budgetCategory = event.budgetCategory;
            this.lineItemObj.budgetCategoryCode = event.budgetCategoryCode;
            this.isInvalidLineItem.message = null;
            this.setUnsavedChanges(true);
        } else {
            this.clearFields();
        }
    }

    onYearCostsChange() {
        this.lineItemObj.yearTotal = 0;
        for (let cost of this.lineItemObj.yearCosts) {
            if (cost !== '.') {/** if input contains only '.' then nocalculations needed. it will consider as  NaN*/
                cost = cost === null || cost === '' || cost === undefined ? 0 : convertToValidAmount(cost);
                this.lineItemObj.yearTotal = (parseFloat(this.lineItemObj.yearTotal) + cost).toFixed(2);
            }
        }
    }

    editQuantityOrDesc(type, quantity, desc, costElementCode, lineItemNumber) {
        for (const periods of this.budgetData.budgetHeader.budgetPeriods) {
            for (const detail of periods.budgetDetails) {
                if (detail.costElementCode === costElementCode && detail.lineItemNumber === lineItemNumber) {
                    type === 'QUANTITY' ? detail.quantity = parseFloat(quantity) : detail.lineItemDescription = desc;
                }
            }
        }
        this.setUnsavedChanges(true);
    }

    openActionModal(action, periodNo, categoryCode, lineItemNumber) {
        this.actionsModalObj.action = action;
        this.actionsModalObj.isWarning = false;
        this.actionsModalObj.selectedIndex = periodNo;
        this.actionsModalObj.selectedCategoryCode = categoryCode;
        this.actionsModalObj.selectedLineItemNumber = lineItemNumber;
        switch (action) {
            case 'COPY': this.validateCopyBudgetPeriod(periodNo); break;
            case 'DELETE_LINEITEM': this.actionsModalObj.modalHeading = 'Delete Cost Element';
                this.actionsModalObj.modalMessage = 'Are you sure you want to delete this cost Element?';
                break;
            default: break;
        }
    }

    performBudgetAction() {
        this.budgetData.budgetHeader.updateUser = this._commonService.getCurrentUserDetail('userName');
        this.budgetData.budgetHeader.updateTimeStamp = new Date().getTime();
        switch (this.actionsModalObj.action) {
            case 'COPY': this.copyBudgetPeriod(); break;
            case 'DELETE_LINEITEM': this.deleteLineItem(); break;
            default: break;
        }
    }


    validateCopyBudgetPeriod(currentPeriodNo) {
        const currentPeriod =
            this.budgetData.budgetHeader.budgetPeriods.find(period => period.budgetPeriod === currentPeriodNo);
        const previousPeriod =
            this.budgetData.budgetHeader.budgetPeriods.find(period => period.budgetPeriod === (currentPeriodNo - 1));
        if ((previousPeriod.totalCost !== 0 && previousPeriod.totalCost !== null) || previousPeriod.budgetDetails.length > 0) {
            if (currentPeriod.totalCost !== 0 && currentPeriod.totalCost !== null) {
                this.actionsModalObj.modalMessage = 'Line Item already exists. Please delete them to proceed with copy period.';
                this.actionsModalObj.isWarning = true;
            } else {
                this.actionsModalObj.modalMessage = 'Are you sure you want to copy line items from period ' +
                    JSON.stringify(currentPeriod.budgetPeriod - 1) + ' to period ' +
                    JSON.stringify(currentPeriod.budgetPeriod) + ' ?';
            }
        } else {
            this.actionsModalObj.modalMessage = 'No line items added.';
            this.actionsModalObj.isWarning = true;
        }
        this.actionsModalObj.modalHeading = 'Copy Period';
    }

    inputRestrictionForAmountFieldValidation(index) {
        const lineItemCostAmount = inputRestrictionForAmountField(this.lineItemObj.yearCosts[index]);
        if (this.isInvalidLineItem.cost) {
            this.isInvalidLineItem.cost[index] = lineItemCostAmount;
        } else {
            this.isInvalidLineItem.cost = [];
            this.isInvalidLineItem.cost[index] = lineItemCostAmount;
        }
    }

    addBudgetDetail() {
        this.isInvalidLineItem = this.validateLineItem(this.lineItemObj, this.isInvalidLineItem);
        if (checkObjectHasValues(this.isInvalidLineItem)) {
            this.lineItemObj.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.lineItemObj.updateTimeStamp = new Date().getTime();
            this.addCostElementsToList();
            this.calculatePeriodTotalCost();
            this.calculateBudgetTotalCost();
            this.saveOrUpdateProposalBudget();
        } else {
            this.clearCostElementField = new String('false');
        }
    }

    addCostElementsToList() {
        for (let periodIndex = 0; periodIndex < this.budgetData.budgetHeader.budgetPeriods.length; periodIndex++) {
            /**lineItemNumber -using it for SIMPLE BUDGET (for entering duplicate cost elements)
             * lineItemNumber for each lineItem should be same for that particular lineItem in all the periods
             * if no lineItem exists in a period, lineItemNumber of firstly added lineItem(sys generated costs) is set to 1 (0 + 1)
             * for other linitems, lineItemNumber = no. of system generated cost + 1
            */
            const lineItemNumberCount = this.budgetData.maxLineItemNumber ?
                this.budgetData.maxLineItemNumber : this.budgetData.sysGeneratedCostElements.length;
            if (this.budgetData.isSysGeneratedCostElementEnabled) {
                this.addSystemCostElements(periodIndex);
            }
            const tempBudgetDetail: any = {};
            tempBudgetDetail.quantity = !this.lineItemObj.quantity ? 0 : parseFloat(this.lineItemObj.quantity);
            tempBudgetDetail.costElement = this.lineItemObj.costElement;
            tempBudgetDetail.costElementCode = this.lineItemObj.costElementCode;
            tempBudgetDetail.budgetCategory = this.lineItemObj.budgetCategory;
            tempBudgetDetail.budgetCategoryCode = this.lineItemObj.budgetCategoryCode;
            tempBudgetDetail.budgetPeriod = periodIndex + 1;
            tempBudgetDetail.lineItemNumber = lineItemNumberCount + 1;
            tempBudgetDetail.updateTimeStamp = new Date().getTime();
            tempBudgetDetail.updateUser = this._commonService.getCurrentUserDetail('userName');
            tempBudgetDetail.sponsorRequestedAmount = this.lineItemObj.yearCosts[periodIndex] === null ||
                this.lineItemObj.yearCosts[periodIndex] === undefined || this.lineItemObj.yearCosts[periodIndex] === '' ?
                0 : convertToValidAmount(this.lineItemObj.yearCosts[periodIndex]);
            tempBudgetDetail.lineItemDescription = this.lineItemObj.lineItemDescription;
            tempBudgetDetail.isSystemGeneratedCostElement = false;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails.unshift(tempBudgetDetail);
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].updateUser = this._commonService.getCurrentUserDetail('userName');
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].updateTimeStamp = new Date().getTime();
            this.justificationToggleList[tempBudgetDetail.lineItemNumber] = true;
        }
    }

    addSystemCostElements(periodIndex) {
        let lineItemNumber = 0;
        if (this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails.length <= 0) {
            for (const sysCost of this.budgetData.sysGeneratedCostElements) {
                const tempSysCost: any = {};
                tempSysCost.budgetCategory = sysCost.budgetCategory;
                tempSysCost.budgetCategoryCode = sysCost.budgetCategoryCode;
                tempSysCost.budgetPeriod = periodIndex + 1;
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
                tempSysCost.sponsorRequestedAmount = 0;
                tempSysCost.lineItemDescription = null;
                tempSysCost.quantity = 0;
                tempSysCost.lineItemNumber = ++lineItemNumber;
                this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails.push(tempSysCost);
            }
        }
    }

    calculateLineItemCost(categoryCode, lineItemNumber) {
        const editedCategory = this.simpleBudgetVo.find(detail => detail.categoryCode == categoryCode);
        const editedLineItem = editedCategory.lineItemList.find(lineItem => lineItem.lineItemNumber === lineItemNumber);
        let totalLineItemCost = 0;
        for (const periodCost of editedLineItem.periodCostsList) {
            periodCost.cost = periodCost.cost === null || periodCost.cost === '' ? 0 : periodCost.cost;
            totalLineItemCost += parseFloat(periodCost.cost);
        }
        editedLineItem.totalLineItemCost = totalLineItemCost;
    }

    calculateCategoryCost(categoryCode) {
        const editedCategory = this.budgetData.simpleBudgetVo.find(detail => detail.categoryCode === categoryCode);
        let totalCategoryCost = 0;
        for (const lineItem of editedCategory.lineItemList) {
            totalCategoryCost += parseFloat(lineItem.totalLineItemCost);
        }
        editedCategory.totalCategoryCost = totalCategoryCost;
    }

    calculatePeriodTotalCost() {
        for (let periodIndex = 0; periodIndex < this.budgetData.budgetHeader.budgetPeriods.length; periodIndex++) {
            let periodTotalCost = 0;
            let periodTotalDirect = 0;
            let periodTotalIndirect = 0;
            for (let detailIndex = 0; detailIndex < this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails.length; detailIndex++) {
                if (!this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].isDeleted) {
                    if (this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].systemGeneratedCEType == null ||
                        this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].systemGeneratedCEType === 'BUDGET_FRINGE_ON') {
                        periodTotalDirect =
                            periodTotalDirect + parseFloat(this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].sponsorRequestedAmount);
                    } else if (this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].systemGeneratedCEType === 'BUDGET_RESEARCH_OH_ON' ||
                        this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].systemGeneratedCEType === 'BUDGET_OH_ON') {
                        periodTotalIndirect =
                            periodTotalIndirect + parseFloat(this.budgetData.budgetHeader.budgetPeriods[periodIndex].budgetDetails[detailIndex].sponsorRequestedAmount);
                    }
                }
            }
            periodTotalCost = periodTotalCost + periodTotalDirect + periodTotalIndirect;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].totalCost = periodTotalCost;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].totalDirectCost = periodTotalDirect;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].totalIndirectCost = periodTotalIndirect;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].costSharingAmount = 0;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].totalModifiedDirectCost = 0;
            this.budgetData.budgetHeader.budgetPeriods[periodIndex].underrecoveryAmount = 0;
        }
    }

    calculateBudgetTotalCost() {
        let finalTotalCost = 0;
        let finalTotalDirect = 0;
        let finalTotalIndirect = 0;
        if (this.budgetData.budgetHeader.budgetPeriods.length > 0) {
            for (const period of this.budgetData.budgetHeader.budgetPeriods) {
                finalTotalCost += parseFloat(period.totalCost);
                finalTotalDirect += parseFloat(period.totalDirectCost);
                finalTotalIndirect += parseFloat(period.totalIndirectCost);
            }
            this.budgetData.budgetHeader.totalDirectCost = finalTotalDirect;
            this.budgetData.budgetHeader.totalIndirectCost = finalTotalIndirect;
            this.budgetData.budgetHeader.totalCost = finalTotalCost;
        }
    }

    updateBudgetHeaderCosts(cost, budgetPeriodId, budgetDetailId) {
        const editedPeriod = this.budgetData.budgetHeader.budgetPeriods.find(period => period.budgetPeriodId === budgetPeriodId);
        const editedDetail = editedPeriod.budgetDetails.find(detail => detail.budgetDetailId === budgetDetailId);
        editedDetail.sponsorRequestedAmount = cost;
    }

    editYearCost(cost, lineItemNumber, categoryCode, budgetPeriodId, budgetDetailId) {
        if (cost !== '.') {/** if input contains only '.' then nocalculations needed. it will consider as  NaN*/
            cost = cost === null || cost === '' ? 0 : convertToValidAmount(cost);
            /** update & calculate costs in simpleBudgetVo object */
            this.calculateLineItemCost(categoryCode, lineItemNumber);
            this.calculateCategoryCost(categoryCode);
            /** update & calculate costs in budgetHeader object */
            this.updateBudgetHeaderCosts(cost, budgetPeriodId, budgetDetailId);
            this.calculatePeriodTotalCost();
            this.calculateBudgetTotalCost();
        }
        this.setUnsavedChanges(true);
    }

    setBudgetHeaderDates() {
        if (!checkPeriodDatesOutside(this.budgetData.budgetHeader.budgetPeriods, this._proposalService.proposalStartDate,
            this._proposalService.proposalEndDate)) {
            this.budgetData.budgetHeader.startDate = this._proposalService.proposalStartDate;
            this.budgetData.budgetHeader.endDate = this._proposalService.proposalEndDate;
        }
    }


    setBudgetHeaderDetails() {
        this.setBudgetHeaderDates();
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        this.budgetData.budgetHeader.isFinalBudget = this.budgetData.budgetHeader.isFinalBudget;
        this.budgetData.budgetHeader.budgetStatusCode = this.budgetData.budgetHeader.budgetStatusCode;
        this.budgetData.budgetHeader.budgetStatus = this.budgetData.budgetHeader.budgetStatus;
        this.budgetData.budgetHeader.campusFlag = this.budgetData.budgetHeader.campusFlag;
        this.budgetData.budgetHeader.comments = this.budgetData.budgetHeader.comments;
        this.budgetData.budgetHeader.rateClassCode = this.budgetData.budgetHeader.rateClassCode;
        this.budgetData.budgetHeader.rateType = this.budgetData.budgetHeader.rateType;
        this.budgetData.budgetHeader.underrecoveryRateClassCode = this.budgetData.budgetHeader.underrecoveryRateClassCode;
        this.budgetData.budgetHeader.underrecoveryRateType = this.budgetData.budgetHeader.underrecoveryRateType;
    }

    saveOrUpdateProposalBudget() {
        if (this._budgetDataService.checkBudgetDatesFilled() && !this.isSaved) {
            this.isSaved = true;
            this.setBudgetHeaderDetails();
            const requestObject = {
                'budgetTabName': 'SIMPLE',
                'budgetHeader': this.budgetData.budgetHeader,
                'proposalId': this.budgetData.proposalId,
                'budgetPeriod': this._budgetDataService.currentPeriodNumber,
                'updateUser': this._commonService.getCurrentUserDetail('userName'),
                'grantTypeCode': this._budgetDataService.grantTypeCode,
                'activityTypeCode': this._budgetDataService.activityTypeCode
            };
            this.$subscriptions.push(this._budgetService.saveOrUpdateProposalBudget(requestObject)
                .subscribe((data: any) => {
                    this.budgetData.budgetHeader = data.budgetHeader;
                    this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                    this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
                    this.budgetData.grantTypeCode = data.grantTypeCode;
                    this.budgetData.categoryCode = data.categoryCode;
                    this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
                    this._budgetDataService.setProposalBudgetData(this.budgetData);
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget saved successfully.');
                    this.isSaved = false;
                },
                    err => {
                        this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Budget failed. Please try again.');
                        this.isSaved = false;
                    }));
            this.setUnsavedChanges(false);
            this.clearFields();
        }
    }

    onAutoCalcChange() {
        if (this.budgetData.budgetHeader.isAutoCalc === false) {
            let tempTotalDirectCost = 0;
            for (let periods = 0; periods < this.budgetData.budgetHeader.budgetPeriods.length; periods++) {
                for (let lineItem = 0; lineItem < this.budgetData.budgetHeader.budgetPeriods[periods].budgetDetails.length; lineItem++) {
                    if (this.budgetData.budgetHeader.budgetPeriods[periods].budgetDetails[lineItem].isSystemGeneratedCostElement === true) {
                        this.budgetData.budgetHeader.budgetPeriods[periods].budgetDetails[lineItem].sponsorRequestedAmount = 0;
                        this.budgetData.budgetHeader.budgetPeriods[periods].totalIndirectCost = 0;
                    } else {
                        tempTotalDirectCost = tempTotalDirectCost +
                            this.budgetData.budgetHeader.budgetPeriods[periods].budgetDetails[lineItem].sponsorRequestedAmount;
                    }
                    this.budgetData.budgetHeader.budgetPeriods[periods].totalDirectCost = tempTotalDirectCost;
                    this.budgetData.budgetHeader.budgetPeriods[periods].totalCost =
                        this.budgetData.budgetHeader.budgetPeriods[periods].totalIndirectCost +
                        this.budgetData.budgetHeader.budgetPeriods[periods].totalDirectCost;
                    this.budgetData.budgetHeader.budgetPeriods[periods].totalIndirectCost = 0;
                    this.budgetData.budgetHeader.budgetPeriods[periods].totalIndirectCost = 0;
                    this.budgetData.budgetHeader.budgetPeriods[periods].totalCost =
                        this.budgetData.budgetHeader.budgetPeriods[periods].totalCost;
                }
            }
        }
    }

    copyBudgetPeriod() {
        this.setBudgetHeaderDetails();
        const requestObject: any = {};
        requestObject.proposalId = this.budgetData.proposalId;
        requestObject.budgetHeader = this.budgetData.budgetHeader;
        requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
        requestObject.copyPeriodId = this.budgetData.budgetHeader.budgetPeriods.find(period =>
            period.budgetPeriod === this.actionsModalObj.selectedIndex - 1).budgetPeriodId;
        requestObject.currentPeriodId = this.budgetData.budgetHeader.budgetPeriods.find(period =>
            period.budgetPeriod === this.actionsModalObj.selectedIndex).budgetPeriodId;
        this.$subscriptions.push(this._budgetService.copyBudgetPeriod(requestObject).subscribe((data: any) => {
            this.budgetData.budgetHeader = data.budgetHeader;
            this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
            this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
            this.budgetData.grantTypeCode = data.grantTypeCode;
            this.budgetData.categoryCode = data.categoryCode;
            this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
            this._budgetDataService.setProposalBudgetData(this.budgetData);
            this.toggleCategoryExpansion();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget details copied successfully.');
        },
            err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Copying Budget Period failed. Please try again.');
            }));
    }

    deleteLineItem() {
        this.budgetData.budgetHeader.budgetPeriods.forEach(period => {
            period.budgetDetails.forEach((detail, key) => {
                if (detail.lineItemNumber === this.actionsModalObj.selectedLineItemNumber) {
                    detail.isDeleted = true;
                }
            });
        });
        this.calculatePeriodTotalCost();
        this.calculateBudgetTotalCost();
        this.setBudgetHeaderDetails();
        const requestObject = {
            'budgetHeader': this.budgetData.budgetHeader,
            'activityTypeCode': this._budgetDataService.activityTypeCode,
            'proposalId': this.budgetData.budgetHeader.proposalId
        };
        this.$subscriptions.push(this._budgetService.deleteSimpleBudgetLineItem(requestObject).subscribe((data: any) => {
            this.budgetData.budgetHeader = data.budgetHeader;
            this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
            this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
            this.budgetData.grantTypeCode = data.grantTypeCode;
            this.budgetData.categoryCode = data.categoryCode;
            this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
            this._budgetDataService.budgetDataChanged = false;
            this._budgetDataService.setProposalBudgetData(this.budgetData);
            this.toggleCategoryExpansion();
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost Element deleted successfully.');
        },
            err => {
                this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Cost Element failed. Please try again.');
            }));
    }

    showRatesCalcAmount(costElementCode) {
        this.actionsModalObj.showlineItemRate = true;
        this.selectedRateYear = 1;
        this.rateObj = {};
        this.rateObj.costElementCode = costElementCode;
        this.rateObj.rateList = [];
        for (const period of this.budgetData.budgetHeader.budgetPeriods) {
            for (const detail of period.budgetDetails) {
                if (detail.costElementCode === costElementCode && detail.budgetDetailCalcAmounts.length !== 0) {
                    for (const calcAmount of detail.budgetDetailCalcAmounts) {
                        this.rateObj.rateList.push(calcAmount);
                    }
                }
            }
        }
    }

    clearFields() {
        this.lineItemObj.costElement = null;
        this.isInvalidLineItem.message = null;
        this.isInvalidLineItem.cost = false;
        this.isInvalidLineItem.quantityMsg = false;
        this.lineItemObj.quantity = null;
        this.lineItemObj.yearCosts = [];
        this.lineItemObj.yearTotal = null;
        this.lineItemObj.budgetCategory = null;
        this.lineItemObj.budgetCategoryCode = null;
        this.lineItemObj.costElementCode = null;
        this.lineItemObj.lineItemDescription = null;
        this.clearCostElementField = new String('true');
    }

    clearModalActions() {
        this.actionsModalObj.action = null;
        this.actionsModalObj.modalHeading = this.actionsModalObj.modalMessage = null;
        this.actionsModalObj.selectedIndex = 0;
        this.actionsModalObj.selectedCategoryCode = null;
    }

    sortBudgetData(budgetData) {
        return budgetData.sort((a, b) => {
            return a.sortOrder - b.sortOrder;
        });
    }
    getPeriodRateList(list, period) {
        this.periodRateList = list.filter(item => item.budgetPeriod === period);
        return this.periodRateList;
    }

    setUnsavedChanges(flag: boolean) {
        this._budgetDataService.budgetDataChanged = flag;
        this.hasUnsavedChanges = flag;
        this._autoSaveService.setUnsavedChanges('Simple Budget', 'proposal-simple-budget', flag);
    }

}
