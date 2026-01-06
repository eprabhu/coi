import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { BudgetDataService } from '../../services/budget-data.service';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { BudgetService } from '../budget.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { validateBudgetDetail, validatePersonDetails, checkObjectHasValues, periodDataValidation } from '../budget-validations';
import { PersonnelLineItemsComponent } from '../personnel-line-items/personnel-line-items.component';
import { checkPeriodDatesOutside } from '../budget-validations';
import { ProposalService } from '../../services/proposal.service';
import { AutoSaveService } from '../../../common/services/auto-save.service';

declare var $: any;

@Component({
    selector: 'app-detailed-budget',
    templateUrl: './detailed-budget.component.html',
    styleUrls: ['./detailed-budget.component.css'],
})

export class DetailedBudgetComponent implements OnInit, OnDestroy {

    budgetData: any = {};
    $subscriptions: Subscription[] = [];
    currentPeriodData: any = {};
    lineItemData: any = {};
    isInvalidLineItem: any = {};
    tempLineItemData: any = {};
    personValidation: any = [];
    lineItemValidations: any = [{}];
    tempPerson: any = {};
    helpText: any = {};
    isSaving = false;
    hasUnsavedChangesIn: 'NONE' | 'NEW_ENTRY' | 'LIST' | 'BOTH' = 'NONE';
    @ViewChild(PersonnelLineItemsComponent, { static: false }) personnelLineItem: PersonnelLineItemsComponent;

    constructor(
        public _budgetDataService: BudgetDataService,
        public _commonService: CommonService,
        private _budgetService: BudgetService,
        private _proposalService: ProposalService,
        private _autoSaveService: AutoSaveService
    ) { }

    ngOnInit() {
        this._budgetDataService.BudgetTab = 'DETAILED';
        this.subscribeBudgetData();
        this.fetchHelpText();
    }

    subscribeBudgetData() {
        this.$subscriptions.push(
            this._budgetDataService.proposalBudgetData.subscribe((data: any) => {
                this.budgetData = data ? JSON.parse(JSON.stringify(data)) : {};
                this.setCurrentPeriodData();
            })
        );
    }

    fetchHelpText() {
        this.$subscriptions.push(this._budgetDataService.$budgetHelpText.subscribe((data: any) => {
            this.helpText = data;
        }));
    }

    setCurrentPeriodData() {
        if (this.budgetData.budgetHeader) {
            const PERIOD = this.budgetData.budgetHeader.budgetPeriods.find(item => item.budgetPeriodId === this.currentPeriodData.budgetPeriodId);
            this.currentPeriodData = PERIOD ? PERIOD : this.budgetData.budgetHeader.budgetPeriods[0];
            this.setValidationArray();
            this.clearLineItemObjectsOnAddition();
        }
    }

    changePeriod(period) {
        this.currentPeriodData = period;
        this._budgetDataService.currentPeriodNumber = this.currentPeriodData.budgetPeriod;
        this.setValidationArray();
        this.clearLineItemObjectsOnAddition();
    }

    setValidationArray() {
        this.currentPeriodData.budgetDetails.forEach(el => this.lineItemValidations.push({}));
    }

    shiftPeriods(index) {
        const ITEM = this.budgetData.budgetHeader.budgetPeriods.splice(index, 1)[0];
        this.budgetData.budgetHeader.budgetPeriods.splice(4, 0, ITEM);
    }

    addBudgetDetail(period, type) {
        if (this.validateLineItem(period)) {
            this.lineItemData.personsDetails = JSON.parse(JSON.stringify(this.lineItemData.personsDetails));
            this.lineItemData.updateUser = this._commonService.getCurrentUserDetail('userName');
            this.lineItemData.updateTimeStamp = new Date().getTime();
            this.lineItemData.budgetPeriod = period.budgetPeriod;
            this.setUnsavedChanges(false, 'NEW_ENTRY');
            /**lineItemNumber - using it for SIMPLE BUDGET (for entering duplicate cost elements - refer comments in simple budget) */
            const lineItemNumberCount = this.budgetData.maxLineItemNumber ? this.budgetData.maxLineItemNumber : 2;
            if (this.budgetData.isSysGeneratedCostElementEnabled) {
                this.addSystemCostElements(period);
            }
            this.lineItemData.lineItemNumber = lineItemNumberCount + 1;
            period.budgetDetails.unshift(this.lineItemData);
            this.saveOrUpdateProposalBudget(type);
        }
    }

    validateLineItem(period) {
        this.personValidation = this.checkPersonHasData() ?
            validatePersonDetails(this.lineItemData.personsDetails, period, this.personValidation) : [];
        const ISPERSONVALIDATE = this.personValidation.every(item => checkObjectHasValues(item));
        if (ISPERSONVALIDATE) {
            this.isInvalidLineItem = validateBudgetDetail(this.lineItemData, this.isInvalidLineItem);
            const ISLINEITEMVALID = checkObjectHasValues(this.isInvalidLineItem);
            if (ISLINEITEMVALID && !this.checkPersonHasData()) {
                this.lineItemData.personsDetails = [];
                return true;
            } else if (ISLINEITEMVALID && this.checkPersonHasData()) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    checkPersonHasData() {
        return (
            this.lineItemData.personsDetails && this.lineItemData.personsDetails.length > 0 &&
            (this.lineItemData.personsDetails[0].budgetPersonId ||
                this.lineItemData.personsDetails[0].percentageCharged > 0 ||
                this.lineItemData.personsDetails[0].percentageEffort > 0)
        );
    }

    /**
     * @param  {} period
     * To add system generated cost elements an empty period, while adding first cost element
     */
    addSystemCostElements(period) {
        let lineItemNumber = 0;
        if (period.budgetDetails.length <= 0) {
            for (const sysCost of this.budgetData.sysGeneratedCostElements) {
                const tempSysCost: any = {};
                tempSysCost.budgetCategory = sysCost.budgetCategory;
                tempSysCost.budgetCategoryCode = sysCost.budgetCategoryCode;
                tempSysCost.budgetPeriod = this.lineItemData.budgetPeriod;
                tempSysCost.costElement = sysCost;
                tempSysCost.costElementCode = sysCost.costElement;
                tempSysCost.lineItemDescription = null;
                tempSysCost.personsDetails = [];
                tempSysCost.isSystemGeneratedCostElement = true;
                tempSysCost.updateTimeStamp = new Date().getTime();
                tempSysCost.updateUser = this._commonService.getCurrentUserDetail('userName');
                tempSysCost.systemGeneratedCEType = sysCost.systemGeneratedCEType;
                tempSysCost.lineItemCost = 0;
                tempSysCost.lineItemDescription = null;
                tempSysCost.lineItemNumber = ++lineItemNumber;
                period.budgetDetails.push(tempSysCost);
                period.updateUser = this._commonService.getCurrentUserDetail('userName');
                period.updateTimeStamp = new Date().getTime();
            }
        }
    }

    /**
     * @param  {} saveType=null
     * SaveType = 'SAVE'-> To add a new Item.
     */
    saveOrUpdateProposalBudget(saveType = null) {
        const ISVALIDATED = saveType !== 'SAVE' ? this.validatePeriod() : true;
        if (this._budgetDataService.checkBudgetDatesFilled() && ISVALIDATED && !this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(this._budgetService.saveOrUpdateProposalBudget(this.saveOrUpdateRequestData())
                .subscribe((data: any) => {
                    this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                    this.budgetData.budgetHeader = data.budgetHeader;
                    this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
                    this.budgetData.maxLineItemNumber = data.maxLineItemNumber;
                    this.setUnsavedChanges(false);
                    this._budgetDataService.previousFinalBudgetId = null;
                    this._budgetDataService.setProposalBudgetData(this.budgetData);
                    saveType !== 'SAVE' ? this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget saved successfully.') : 'Budget updated successfully.';
                    this.clearLineItemObjectsOnAddition();
                    this._budgetDataService.checkBudgetDatesFilled();
                    this.isSaving = false;
                }, (err) => {
                    this.isSaving = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Saving Budget failed. Please try again.');
                }));
        }
    }

    validatePeriod() {
        this.lineItemValidations =
            periodDataValidation(this.currentPeriodData, this.lineItemValidations, this.budgetData.budgetHeader.isAutoCalc);
        return this.lineItemValidations.filter((item) => Object.keys(item).length !== 0).length > 0 ? false : true;
    }

    setBudgetHeaderDates() {
        if (!checkPeriodDatesOutside(this.budgetData.budgetHeader.budgetPeriods, this._proposalService.proposalStartDate,
            this._proposalService.proposalEndDate)) {
            this.budgetData.budgetHeader.startDate = this._proposalService.proposalStartDate;
            this.budgetData.budgetHeader.endDate = this._proposalService.proposalEndDate;
        }
    }

    saveOrUpdateRequestData() {
        this.setBudgetHeaderDates();
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        return {
            budgetTabName: 'DETAILED',
            budgetHeader: this.budgetData.budgetHeader,
            proposalId: this.budgetData.proposalId,
            budgetPeriod: this._budgetDataService.currentPeriodNumber,
            previousFinalBudgetId: this._budgetDataService.previousFinalBudgetId,
            grantTypeCode: this._budgetDataService.grantTypeCode,
            activityTypeCode: this._budgetDataService.activityTypeCode
        };
    }

    clearLineItemObjectsOnAddition() {
        this.isInvalidLineItem = {};
        this.personValidation = [];
        this.lineItemData = {};
        this.lineItemData.personsDetails = [];
    }

    clearLineItemObjectsOnUpdation(lineItemData) {
        delete lineItemData.costElement;
        delete lineItemData.costElementCode;
        delete lineItemData.budgetCategory;
        delete lineItemData.budgetCategoryCode;
        this.isInvalidLineItem = {};
        this.personValidation = [];
    }

    lineItemActions(popUpData) {
        this.tempLineItemData = popUpData.lineItemData;
        switch (popUpData.popUpType) {
            case 'RATE': $('#showRatesCalcProposal').modal('show'); break;
            case 'DELETE': $('#deleteLineItemModal').modal('show'); break;
            case 'SAVE': this.addBudgetDetail(this.currentPeriodData, 'SAVE'); break;
            case 'CLEAR_ADD': this.clearLineItemObjectsOnAddition(); break;
            case 'CLEAR_EDIT': this.clearLineItemObjectsOnUpdation(popUpData.lineItemData); break;
            case 'PERSON_DELETE': this.triggerPersonModal(popUpData.person); break;
            default: break;
        }
    }

    triggerPersonModal(person) {
        this.tempPerson = person;
        $('#deletePersonLineItem').modal('show');
    }

    deleteLineItem() {
        this._budgetDataService.setDateFormatFromWithoutTimeStamp(this.budgetData);
        const REQUESTOBJ = {
            budgetPeriodId: this.currentPeriodData.budgetPeriodId,
            budgetDetailId: this.tempLineItemData.budgetDetailId,
            budgetHeader: this.budgetData.budgetHeader,
            activityTypeCode: this._budgetDataService.activityTypeCode
        };
        this.$subscriptions.push(
            this._budgetService.deleteBudgetDetailLineItem(REQUESTOBJ).subscribe(
                (data: any) => {
                    this.budgetData.budgetHeader = data.budgetHeader;
                    this.budgetData.budgetHeaderDetails = data.budgetHeaderDetails;
                    this.budgetData.simpleBudgetVo = data.simpleBudgetVo;
                    this._budgetDataService.setProposalBudgetData(this.budgetData);
                    this.lineItemValidations = [];
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Line Item deleted successfully.');
                },
                (err) => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Line Item failed. Please try again.');
                }));
    }

    /** To sort the budget periods */
    sortBudgetPeriods() {
        return this.budgetData.budgetHeader.budgetPeriods.sort((a, b) => {
            return a.budgetPeriod - b.budgetPeriod;
        });
    }

    ngOnDestroy() {
        this.setUnsavedChanges(false);
        subscriptionHandler(this.$subscriptions);
        if (this.budgetData.budgetHeader && this.budgetData.budgetHeader.budgetPeriods &&
            this.budgetData.budgetHeader.budgetPeriods.length > 4) {
            this.sortBudgetPeriods();
        }
    }

    setUnsavedChanges(flag: boolean, changeArea?: any) {
        flag ? this.setChanges(changeArea) : this.saveChanges(changeArea);
        this._budgetDataService.budgetDataChanged = this.hasUnsavedChangesIn !== 'NONE';
        this._autoSaveService.setUnsavedChanges('Detailed Budget', 'proposal-detailed-budget', this.hasUnsavedChangesIn !== 'NONE');
    }

    setChanges(changeArea) {
        if (changeArea && changeArea !== 'NONE' && this.hasUnsavedChangesIn !== changeArea) {
            this.hasUnsavedChangesIn = this.hasUnsavedChangesIn === 'NONE' ? changeArea : 'BOTH';
        }
    }

    saveChanges(changeArea) {
        if (this.hasUnsavedChangesIn === 'BOTH') {
            this.hasUnsavedChangesIn = changeArea === 'LIST' ? 'NEW_ENTRY' : 'LIST';
        }
        if (!changeArea) {
            this.hasUnsavedChangesIn = 'NONE';
        }
    }

}
