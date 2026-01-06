/**
 * Created on 15-01-2020 by Saranya T Pillai
 */
import { Component, Input, OnChanges, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, AWARD_LABEL } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { compareDates, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { CommonDataService } from '../../../services/common-data.service';
import { BudgetService } from '../../budget.service';
import { BudgetDataService } from '../../budget-data.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';

declare var $: any;

@Component({
  selector: 'app-budget-overview',
  templateUrl: './budget-overview.component.html',
  styleUrls: ['./budget-overview.component.css']
})
export class BudgetOverviewComponent implements OnChanges, OnDestroy, OnInit {

  @Input() awardData: any = {};
  @Input() awardBudgetData: any = { awardBudgetHeader: {} };
  @Input() budgetVersionList: any = {};
  @Input() departmentLevelAwardBudgetRights: any = {};
  @Output() budgetVersionChangeEvent = new EventEmitter<boolean>();
  @Output() createBudgetForAwardEditEvent = new EventEmitter<String>();
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  startDateWarningText = null;
  endDateWarningText = null;
  isRebudgetAllowed = false;
  currency: string;
  isApplyRates = false;
  selectedRateClassType = '';
  fundType: any;
  fundTypeList: any = [];
  tempBudgetTemplateId = null;
  helpText: any = {};

  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(public _commonService: CommonService, public _commonDataService: CommonDataService,
    public _budgetService: BudgetService, public _budgetDataService: BudgetDataService) { }

  ngOnInit() {
    this.fetchHelpText();
  }

  ngOnChanges() {
    this.currency = this._commonService.currencyFormat;
    this.checkRebudgetAllowed();
    this.getFundTypeList();
    this.selectedRateClassType = (this.awardBudgetData.rateClassTypes !== null && this.awardBudgetData.rateClassTypes.length > 0) ?
      this.awardBudgetData.rateClassTypes[0] : '';
    this.tempBudgetTemplateId = this.awardBudgetData.awardBudgetHeader.budgetTemplateTypeId;
  }

  fetchHelpText() {
    this.$subscriptions.push(this._budgetDataService.$budgetHelpText.subscribe((data: any) => {
      this.helpText = data;
    }));
  }

  /**
   * @param rateClassCode
   * to set rate type and rate type code when F and A is selected from drop down
   */
  setFandAType(rateClassCode) {
    this.awardBudgetData.awardBudgetHeader.rateType = this.awardBudgetData.rateTypes.find(item => item.rateClassCode === rateClassCode);
    this.awardBudgetData.awardBudgetHeader.rateTypeCode = this.awardBudgetData.awardBudgetHeader.rateType != null ?
                                                          this.awardBudgetData.awardBudgetHeader.rateType.rateTypeCode : null;
  }

  /** Budget Dates validating method */
  startDateValidation() {
    this.startDateWarningText = null;
    const awardStartDate = getDateObjectFromTimeStamp(this._commonDataService.beginDate);
    if (!this.awardBudgetData.awardBudgetHeader.startDate) {
      this.startDateWarningText = 'Please select a start date';
    } else if (compareDates(this.awardBudgetData.awardBudgetHeader.startDate, awardStartDate) === -1) {
      this.startDateWarningText = 'Please select a start date on or after project start date';
    } else if (compareDates(this.awardBudgetData.awardBudgetHeader.startDate, this.awardBudgetData.awardBudgetHeader.endDate) === 1) {
      this.startDateWarningText = 'Please select a start date on or before end date';
    } else if (this.checkWithPeriodStartDates()) {
      this.startDateWarningText = 'Budget dates should include all budget periods';
    }
  }

  checkWithPeriodStartDates() {
    const INDEX = this.awardBudgetData.awardBudgetHeader.budgetPeriods.findIndex(period =>
      compareDates(period.startDate, this.awardBudgetData.awardBudgetHeader.startDate) === -1);
    return INDEX > -1 ? true : false;
  }

  endDateValidation() {
    this.endDateWarningText = null;
    const awardEndDate = getDateObjectFromTimeStamp(this._commonDataService.finalExpirationDate);
    if (!this.awardBudgetData.awardBudgetHeader.endDate) {
      this.endDateWarningText = 'Please select an end date';
    } else if (compareDates(this.awardBudgetData.awardBudgetHeader.endDate, awardEndDate) === 1) {
      this.endDateWarningText = 'Please select an end date on or before project end date';
    } else if (compareDates(this.awardBudgetData.awardBudgetHeader.endDate, this.awardBudgetData.awardBudgetHeader.startDate) === -1) {
      this.endDateWarningText = 'Please select an end date on or after start date';
    } else if (this.checkWithPeriodEndDates()) {
      this.endDateWarningText = 'Budget dates should include all budget periods';
    }
  }

  checkWithPeriodEndDates() {
    const INDEX = this.awardBudgetData.awardBudgetHeader.budgetPeriods.findIndex(period =>
      compareDates(period.endDate, this.awardBudgetData.awardBudgetHeader.endDate) === 1);
    return INDEX > -1 ? true : false;
  }
  onVersionChange() {
    const selectedBudgetId = this.budgetVersionList.find(version =>
      version.versionNumber === parseInt(this.awardBudgetData.awardBudgetHeader.versionNumber, 10)).budgetId;
    this.budgetVersionChangeEvent.emit(selectedBudgetId);
  }

  saveOrUpdateAwardBudgetOverView(from) {
    this.startDateValidation();
    this.endDateValidation();
    if (!this.startDateWarningText && !this.endDateWarningText && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._budgetService.saveOrUpdateAwardBudgetOverView
        (this.getRequesteData(from)).subscribe((data: any) => {
          this.awardBudgetData.rateClassTypes = data.rateClassTypes;
          this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
          this.selectedRateClassType = (this.awardBudgetData.rateClassTypes !== null && this.awardBudgetData.rateClassTypes.length > 0) ?
            this.awardBudgetData.rateClassTypes[0] : '';
          this._budgetDataService.budgetId = data.awardBudgetHeader.budgetId;
          this.awardData.award.accountNumber = data.awardBudgetHeader.fundCode;
          this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
          this._commonDataService.setAwardData(this.awardData);
          this._commonDataService.isAwardDataChange = false;
          if (this.awardBudgetData.awardBudgetHeader.availableFund < 0 &&
            this.awardBudgetData.awardBudgetHeader.isAutoCalc && from === 'AUTOCALCULATE') {
            document.getElementById('awardBudgetavailableFundModalBtn').click();
          }
          this._commonService.showToast(HTTP_SUCCESS_STATUS, `Your ${AWARD_LABEL} Budget saved successfully.`);
          this.isSaving = false;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Saving ${AWARD_LABEL} Budget failed. Please try again.`);
          this.isSaving = false;
        }));
    } else {
      if (from === 'AUTOCALCULATE') {
        document.getElementById('autoCalcToggleCancelBtn').click();
      }
    }
  }

  /**
    * @param  {} type
    * budgetTemplateTypeId is also added outside budhetHeader
    * :- it contains the budgetTemplateId of the confirmed template.
    *  Since we have only one API to update budget, based on the value of 'budgetTemplateTypeId'
    *  system decides whether to inserts canned cost elements
   */
  getRequesteData(type) {
    this.awardBudgetData.awardBudgetHeader.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.awardBudgetData.awardBudgetHeader.updateUserName = this._commonService.getCurrentUserDetail('fullName');
    this.awardBudgetData.awardBudgetHeader.updateTimeStamp = new Date().getTime();
    this.awardBudgetData.awardBudgetHeader.budgetPeriods = [];
    this.awardBudgetData.awardBudgetHeader.startDate = parseDateWithoutTimestamp(this.awardBudgetData.awardBudgetHeader.startDate);
    this.awardBudgetData.awardBudgetHeader.endDate = parseDateWithoutTimestamp(this.awardBudgetData.awardBudgetHeader.endDate);
    return {
      awardBudgetHeader: this.awardBudgetData.awardBudgetHeader,
      budgetTemplateTypeId: type === 'BUDGET_TEMPLATE' ? this.awardBudgetData.awardBudgetHeader.budgetTemplateTypeId : null
    };
  }

  /**
     * @param  {} statusCode
     * Sets budget status badge w.r.t status code
     */
  getBadgeByStatusCode(statusCode) {
    const statusBadge = statusCode === '10' ? 'success' : statusCode === '5' ? 'warning' : 'info';
    return (statusBadge);
  }

  /**Method to check whether Rebudget & Create New Budget button has to be shown or not on award edit option*/
  checkRebudgetAllowed() {
    this.isRebudgetAllowed = false;
    const isLatestBudgetActive = this.budgetVersionList ?
      this.budgetVersionList[this.budgetVersionList.length - 1].budgetStatus === 'Active' ?
        true : false : false;
    if (this.departmentLevelAwardBudgetRights.isModifyAwardBudget && isLatestBudgetActive) {
      this.isRebudgetAllowed = (this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode === '1' ||
        this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode === '4') &&
        this.awardData.award.awardDocumentType.awardDocumentTypeCode === '2' ? true : false;
    }
    return this.isRebudgetAllowed;
  }
  /**2 types of budget can be created on Award Edit -> 'Create New Budget Version' OR 'Rebudget'
   * @param budgetType - to determine whether which of the budget has to be created based on button click
   */
  createBudgetOnAwardEdit(budgetType) {
    this.createBudgetForAwardEditEvent.emit(budgetType);
  }

  /**
   * To on or off autocalc button
   */
  onAutoCalcChange() {
    this.awardBudgetData.awardBudgetHeader.isAutoCalc = !this.awardBudgetData.awardBudgetHeader.isAutoCalc;
  }

  /**
   * Apply new rates
   */
  applyRates() {
    this.$subscriptions.push(this._budgetService.applyAwardBudgetRates
      ({
        awardBudgetId: this.awardBudgetData.awardBudgetHeader.budgetId,
        awardRates: this.awardBudgetData.awardBudgetHeader.awardRates,
        userName: this._commonService.getCurrentUserDetail('userName')
      })
      .subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Rates applied successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Applying Budget Rates failed. Please try again.');
      }));
  }

  /**
   * To reset budget rates
   */
  resetAwardBudgetRates() {
    this.$subscriptions.push(this._budgetService.resetAwardBudgetRates({
      awardBudgetId: this.awardBudgetData.awardBudgetHeader.budgetId,
      userName: this._commonService.getCurrentUserDetail('userName')
    })
      .subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Rates reset successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Resetting Budget Rates failed. Please try again.');
      }));
  }

  /**
   * To synchronise budget rates
   */
  getSyncAwardBudgetRates() {
    this.$subscriptions.push(this._budgetService.getSyncAwardBudgetRates({
      awardBudgetId: this.awardBudgetData.awardBudgetHeader.budgetId,
      userName: this._commonService.getCurrentUserDetail('userName')
    })
      .subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Budget Rates synced properly.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Syncing Budget Rates failed. Please try again.');
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getFundTypeList() {
    this.$subscriptions.push(this._budgetService.fetchAllBudgetFundType().subscribe((data: any) => {
      this.fundTypeList = data;
    }));
  }

  checkCreateNewModal() {
    this.fundTypeList.length > 1 ? this.chooseBudgetFundType() : this.createNewAwardBudget();
  }

  /**
   * for creating the budget version when only 1 fund type is returned
   */
  createNewAwardBudget() {
    this._budgetDataService.setBudgetFundType(this.fundTypeList[0].fundTypeCode);
    this.createBudgetOnAwardEdit('NEW');
  }
  /**
   * for selecting the checked value by finding the value and selecting the fund type code and opening the modal
   */
  chooseBudgetFundType() {
    this.fundType = this.fundTypeList.find(element => element.isDefault).fundTypeCode;
    this._budgetDataService.setBudgetFundType(this.fundType);
    document.getElementById('choose-fundType-modal-overview-button').click();
  }

  triggerConfirmationPopup() {
    this._commonDataService.isAwardDataChange = true;
    if (this.awardBudgetData.awardBudgetHeader.budgetTemplateTypeId) {
      $('#confirmAwardBudgetTemplateModal').modal('show');
    }
  }


}
