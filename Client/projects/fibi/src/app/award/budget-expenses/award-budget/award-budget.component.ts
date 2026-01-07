/**
 * Created on 15-01-2020 by Saranya T Pillai
 */
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription, SubscriptionLike as ISubscription } from 'rxjs';
import { Router } from '@angular/router';

import { BudgetService } from '../budget.service';
import { BudgetDataService } from '../budget-data.service';
import { CommonDataService } from '../../services/common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { PersonnelService } from './personnel/personnel.service';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { AWARD_LABEL} from '../../../app-constants';
import { fileDownloader } from '../../../common/utilities/custom-utilities';
import { WebSocketService } from '../../../common/services/web-socket.service';

@Component({
  selector: 'app-award-budget',
  templateUrl: './award-budget.component.html',
  styleUrls: ['./award-budget.component.css']
})

export class AwardBudgetComponent implements OnInit, OnDestroy {

  currency: string;
  awardData: any = {};
  awardBudgetData: any = {};
  departmentLevelAwardBudgetRights: any = {};
  budgetVersionList: any = null;
  fundType: any;
  devProposalBudgetDetails: any;
  isPeriodSelected: any = [];
  availableFund = 0;
  currentUrl;
  isAllPeriod = false;
  importRequestObject: any = {};
  currentTab = 'Detailed Budget';
  isBudgetEditable = true;
  isInvalidCostImport = false;
  fundTypeList: any = [];

  $subscriptions: Subscription[] = [];
  private $budgetPrintTrigger: ISubscription;
  isSaving = false;

  constructor(public _commonDataService: CommonDataService, public _commonService: CommonService,
    public _budgetService: BudgetService, public _budgetDataService: BudgetDataService,
    private _router: Router, private _personnelService: PersonnelService,public webSocket:WebSocketService) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
    this.getDepartmentLevelAwardBudgetRights();
    this.subscribeAwardData();
    this.subscribeBudgetData();
    this.loadBudgetVersionList();
    this.currentUrl = this._router.url;
    this.currentTab = this.currentUrl.includes('periods-total') ? 'Periods & Total' : this.currentTab;
    this.budgetPrintTriggered();
    this._budgetDataService.isBudgetTabTrigger.next(true);
  }

  /** Check department level rights for award budget */
  async getDepartmentLevelAwardBudgetRights() {
    this.departmentLevelAwardBudgetRights['canCreateAwardBudget'] = await this._commonDataService
      .checkDepartmentLevelRightsInArray('CREATE_AWARD_BUDGET');
    this.departmentLevelAwardBudgetRights['isModifyAwardBudget'] = await this._commonDataService
      .checkDepartmentLevelRightsInArray('MODIFY_AWARD_BUDGET');
    this.departmentLevelAwardBudgetRights['isViewAwardBudget'] = await this._commonDataService
      .checkDepartmentLevelRightsInArray('VIEW_AWARD_BUDGET');
  }

  subscribeAwardData() {
    this.$subscriptions.push(this._commonDataService.awardData.subscribe((data: any) => {
      this.awardData = data ? Object.assign({}, data) : null;
    }));
  }

  subscribeBudgetData() {
    this.$subscriptions.push(this._budgetDataService.awardBudgetData.subscribe((data: any) => {
      this.awardBudgetData = data ? Object.assign({}, data) : {};
      if (this.awardBudgetData && this.awardBudgetData.awardBudgetHeader) {
        const isBudgetEditable = this._commonDataService.checkBudgetEditable(
          this.awardBudgetData.awardBudgetHeader.budgetStatusCode, this.awardBudgetData.awardBudgetHeader.budgetTypeCode
        );
        this._budgetDataService.setBudgetEditMode(isBudgetEditable);
        this.checkBudgetPartiallyEditable(isBudgetEditable);
        this._budgetDataService.setBudgetFundType(this.awardBudgetData.awardBudgetHeader.availableFundType ?
          this.awardBudgetData.awardBudgetHeader.availableFundType : this.fundType);
        this._budgetDataService.checkBudgetDatesFilled();
      }
    }));
  }

  /**
   * this function loads the budget version list.
   * if there is at least one version then loads budget data of latest version.
   */
  loadBudgetVersionList() {
    this.$subscriptions.push(
      this._budgetService.loadAwardBudgetVersionsByAwardId({ 'awardId': this.awardData.award.awardId }).subscribe((data: any) => {
        this.budgetVersionList = data.awardBudgetList === null ? [] : data.awardBudgetList;
        if (this.budgetVersionList.length > 0) {
          this.loadBudget(this.awardData.award.awardId, this.checkForLatestPostedBudget());
          this.getAwardBudgetPerson(this.budgetVersionList[this.budgetVersionList.length - 1].budgetId, this.awardData.award.awardId);
        } else {
          this.awardBudgetData = {};
          this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        }
      }));
  }

  getAwardBudgetPerson(budgetId, awardId) {
    this.$subscriptions.push(this._personnelService.getAwardBudgetPerson(
      { 'budgetHeaderId': budgetId, 'awardId': awardId }).subscribe((data: any) => {
        this._budgetDataService.setAwardBudgetPersonList(data);
      }));
  }

  checkForLatestPostedBudget() {
    if (this.awardData.award.awardSequenceStatus === 'ACTIVE') {
      for (let index = this.budgetVersionList.length; index > 0; index--) {
        if (this.budgetVersionList[index - 1].budgetStatusCode === '9') {
          return this.budgetVersionList[index - 1].budgetId;
        }
      }
      for (let index = this.budgetVersionList.length; index > 0; index--) {
        if (this.budgetVersionList[index - 1].budgetStatusCode !== '11') {
          return this.budgetVersionList[index - 1].budgetId;
        }
      }
      return this.budgetVersionList[this.budgetVersionList.length - 1].budgetId;
    } else {
      return this.budgetVersionList[this.budgetVersionList.length - 1].budgetId;
    }
  }

  /**
   * @param  {} awardId
   * @param  {} budgetId
   * loads budget data based on given award id and budget id
   */
  loadBudget(awardId, budgetId) {
    this._budgetDataService.setBudgetId(budgetId);
    this.$subscriptions.push(
      this._budgetService.loadBudgetByAwardId({ 'awardId': awardId, 'awardBudgetId': budgetId }).subscribe((data: any) => {
        this.awardBudgetData = data;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this.checkTotalCostValidation();
        const isBudgetEditable = this._commonDataService.checkBudgetEditable(
          this.awardBudgetData.awardBudgetHeader.budgetStatusCode, this.awardBudgetData.awardBudgetHeader.budgetTypeCode
        );
        this._budgetDataService.setBudgetEditMode(isBudgetEditable);
        this.checkBudgetPartiallyEditable(isBudgetEditable);
      }));
  }

  /** Method to check whether whole budget is editable to the user or
 * only partial editing is allowable (for the fields such as IO Code, Fund Center and Fund Code)
 * Partial editing will be enabled if 'isBudgetEditable' is true and if the parameter 'modifyABInRouting' is enabled.
 @param isBudgetEditable - whether budget is editable or not for the logged in user*/
  checkBudgetPartiallyEditable(isBudgetEditable) {
    this._budgetDataService.isBudgetPartiallyEditable = false;
    const isRebudget = this.awardBudgetData.awardBudgetHeader.budgetTypeCode === '2' ? true : false;
    if (this.awardBudgetData.modifyABInRouting && !isBudgetEditable &&
      this.awardBudgetData.awardBudgetHeader.budgetStatusCode === '5' &&
      this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode !== '4' &&
      (this.awardData.award.awardDocumentType.awardDocumentTypeCode === '1' || isRebudget) &&
      this._commonDataService.checkDepartmentLevelRightsInArray('MODIFY_AWARD_BUDGET_IN_ROUTING')
      && this.awardData.canApproveRouting === '1') {
      this._budgetDataService.isBudgetPartiallyEditable = true;
    }
  }


  checkTotalCostValidation() {
    this._budgetDataService.checkTotalCostValidation();
  }
  /**
   * checks whether value in dates and amounts exists and if it exists then checks call the service call
   * to fetch all the budget fund types.
   */
  validateCreateBudget() {
    if (this._budgetDataService.awardFunds.totalCost === 0) {
      this._commonService.showToast(HTTP_ERROR_STATUS, `Creating ${AWARD_LABEL} Budget failed,since there are no values in Dates & Amounts`);
    } else {
      this.$subscriptions.push(this._budgetService.fetchAllBudgetFundType().subscribe((data: any) => {
        this.fundTypeList = data;
        this.fundTypeList.length > 1 ? this.chooseBudgetFundType() : this.createNewAwardBudget();
      }));
    }
  }
  /**
   * for creating the budget version when only 1 fund type is returned
   */
  createNewAwardBudget() {
    this._budgetDataService.setBudgetFundType(this.fundTypeList[0].fundTypeCode);
    this.createAwardBudget('NEW');
  }
  /**
   * for selecting the checked value by finding the value and selecting the fund type code and opening the modal
   */
  chooseBudgetFundType() {
    this.fundType = this.fundTypeList.find(element => element.isDefault).fundTypeCode;
    this._budgetDataService.setBudgetFundType(this.fundType);
    document.getElementById('choose-fundType-modal-button').click();
  }

  createAwardBudget(budgetType) {
    const REQUESTOBJ = {
      'awardId': this.awardData.award.awardId,
      'awardNumber': this.awardData.award.awardNumber,
      'awardBudgetId': budgetType === 'NEW' ? null : this.awardBudgetData.awardBudgetHeader.budgetId,
      'activityTypeCode': this.awardData.award.activityTypeCode,
      'acType': budgetType === 'REBUDGET' ? 'CREATE_NEW_REBUDGET' : 'CREATE_NEW_BUDGET',
      'userName': this._commonService.getCurrentUserDetail('userName'),
      'userFullName': this._commonService.getCurrentUserDetail('fullName'),
      'availableFundType': budgetType === 'REBUDGET' ? this.awardBudgetData.awardBudgetHeader.availableFundType :
        this._budgetDataService.awardBudgetFundType
    };
    this.$subscriptions.push(this._budgetService.createAwardBudget(REQUESTOBJ).subscribe((data: any) => {
      if(data.message) {
        this._commonService.showToast(HTTP_ERROR_STATUS, data.message);
      } else {
        this.awardBudgetData = JSON.parse(JSON.stringify(data));
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this.awardData.isBudgetCreated = true;
        this.awardData.award.budgetStatus = this.awardBudgetData.awardBudgetHeader.budgetStatus;
        this._commonDataService.setAwardData(this.awardData);
        this.budgetVersionList = data.awardBudgetList;
        this.getAwardBudgetPerson(this.budgetVersionList[this.budgetVersionList.length - 1].budgetId, this.awardData.award.awardId);
        this.checkTotalCostValidation();
        this._budgetDataService.setBudgetFundType(this.awardBudgetData.awardBudgetHeader.availableFundType);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, `You have successfully created ${AWARD_LABEL} Budget.`);
      }
      }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, `Creating ${AWARD_LABEL} Budget failed. Please try again.`);

    }));
  }

  onBudgetVersionChangeEvent(event) {
    this.loadBudget(this.awardData.awardId, event);
    this.getAwardBudgetPerson(event, this.awardData.awardId);
  }

  /**Method to fetch Proposal Budget details for Import Proposal */
  fetchProposalBudgetDetails() {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._budgetService.getDevProposalBudgetByAwardId({ 'awardId': this.awardData.award.awardId }).subscribe(
        (data: any) => {
          this.devProposalBudgetDetails = this.mapDevProposalBudget(data);
          this.isSaving = false;
        }, err => { this.isSaving = false; }));
    }
  }

  private mapDevProposalBudget(data) {
      data.awardBudgetImportInfos.forEach( e => { e.devPropBudgetPeriodId = null; });
      return data;
  }

  checkTotalCost(periodList, periodId) {
    let totalCost = 0;
    this.isInvalidCostImport = false;
    if (periodId === '0') {
      periodList.forEach(element => {
        totalCost += parseFloat(element.totalCost);
      });
    } else {
      totalCost = parseFloat(periodList.find(item => item.budgetPeriodId == periodId).totalCost);
    }
    if (this.awardBudgetData.awardBudgetHeader.initialAvailableFund < totalCost) {
      this.isInvalidCostImport = true;
    }
  }
  /** Method for Importing selected proposal budget to award budget*/
  importProposalBudget(selectedImportInfo, index) {
    this.isPeriodSelected = [];
    this.isPeriodSelected[index] = selectedImportInfo.devPropBudgetPeriodId === 'null' ||
      selectedImportInfo.devPropBudgetPeriodId === undefined ? false : true;
    this.isAllPeriod = selectedImportInfo.devPropBudgetPeriodId === '0' ? true : false;
    if (this.isPeriodSelected[index] && !this.isAllPeriod) {
      this.importRequestObject = {
        awardNumber: selectedImportInfo.awardNumber,
        awardId: this.awardBudgetData.awardBudgetHeader.awardId,
        devPropBudgetHeaderId: selectedImportInfo.pdBudgetId,
        devPropBudgetPeriodId: selectedImportInfo.devPropBudgetPeriodId,
        devPropBudgetPeriodNumber: selectedImportInfo.budgetImportPeriods
          .find(period => period.budgetPeriodId == selectedImportInfo.devPropBudgetPeriodId).periodNumber,
        awardBudgetHeader: this.awardBudgetData.awardBudgetHeader,
        pdNumber: selectedImportInfo.pdNumber,
        awardBudgetId: this.awardBudgetData.awardBudgetId,
        isAllPeriod: false,
        userFullName: this._commonService.getCurrentUserDetail('fullName'),
        userName: this._commonService.getCurrentUserDetail('userName')
      };
    } else if (this.isAllPeriod) {
      this.importRequestObject = {
        awardId: this.awardBudgetData.awardBudgetHeader.awardId,
        devPropBudgetHeaderId: selectedImportInfo.pdBudgetId,
        devPropBudgetPeriodId: selectedImportInfo.devPropBudgetPeriodId,
        devPropBudgetPeriodNumber: null,
        awardBudgetHeader: this.awardBudgetData.awardBudgetHeader,
        awardNumber: selectedImportInfo.awardNumber,
        pdNumber: selectedImportInfo.pdNumber,
        awardBudgetId: this.awardBudgetData.awardBudgetId,
        isAllPeriod: true,
        userFullName: this._commonService.getCurrentUserDetail('fullName'),
        userName: this._commonService.getCurrentUserDetail('userName')
      };
    }
    if ((this.isPeriodSelected[index] || this.isAllPeriod) && !this.isSaving) {
      this.isSaving = true;
      this.setDateFormatFromWithoutTimeStamp();
      this._budgetService.importProposalBudget(this.importRequestObject).subscribe((data: any) => {
        this.isSaving = false;
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this._budgetDataService.checkTotalCostValidation();
        this.getAwardBudgetPerson(this.awardBudgetData.awardBudgetHeader.budgetId, this.awardData.award.awardId);
        document.getElementById('import-proposal-close-btn').click();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal Budget imported successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Importing Proposal Budget to award failed. Please try again.');
        this.isSaving = false;
      });
    }
  }

  setDateFormatFromWithoutTimeStamp(awardBudgetData = this.awardBudgetData) {
    awardBudgetData.awardBudgetHeader.startDate = parseDateWithoutTimestamp(awardBudgetData.awardBudgetHeader.startDate);
    awardBudgetData.awardBudgetHeader.endDate = parseDateWithoutTimestamp(awardBudgetData.awardBudgetHeader.endDate);
    awardBudgetData.awardBudgetHeader.budgetPeriods.forEach(element => {
      element.startDate = parseDateWithoutTimestamp(element.startDate);
      element.endDate = parseDateWithoutTimestamp(element.endDate);
    });
  }

  checkCreateBudgetAllowed() {
    let isCreateBudget = false;
    if ((this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode === '1' ||
      this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode === '4' ||
      this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode === '7')) {
      if (this._commonDataService.getSectionEditableFlag('102')) {
        isCreateBudget = true;
      }
      if ((this.awardData.award.awardDocumentTypeCode === '1' || this.awardData.award.awardDocumentTypeCode === '2') &&
        this.departmentLevelAwardBudgetRights['canCreateAwardBudget']) {
        isCreateBudget = true;
        const isKeyValue = 'Award' + '#' + this.awardData.award.awardId;
        if (isCreateBudget && !this.webSocket.isLockAvailable(isKeyValue)) {
          isCreateBudget = false;
        }
      }
    }
    return isCreateBudget;
  }

  budgetPrintTriggered() {
    this.$budgetPrintTrigger = this._budgetDataService.isBudgetPrintTrigger.subscribe((data: any) => {
      if (data) { this.generateAwardBudgetReport(true, 'Y', 'Y'); }
    });
  }

  generateAwardBudgetReport(isBudgetSummary, isBudgetSummaryPrint, isDetailedBudgetPrint) {
    this.$subscriptions.push(this._budgetService.generateAwardBudgetReport
      (this.awardBudgetData.awardBudgetHeader.budgetId, this.awardData.awardId,
        isBudgetSummaryPrint, isDetailedBudgetPrint).subscribe((data: any) => {
          const tempData: any = data || {};
          fileDownloader(data, this.getPdfFileName(isBudgetSummary), 'pdf');
        }));
  }

  getPdfFileName(isBudgetSummary: boolean): string {
    if (!isBudgetSummary) {
      return `Detailed_Budget_${AWARD_LABEL}_${this.awardData.award.awardNumber}_${this.awardBudgetData.awardBudgetHeader.versionNumber}`;
    } else {
      return `${AWARD_LABEL}_Budget_Summary_${this.awardData.award.awardNumber}_${this.awardBudgetData.awardBudgetHeader.versionNumber}`;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const HEIGHT = document.getElementById('fibiStickyMainHeader').offsetHeight + document.getElementById('stickyAwardHeader').offsetHeight;
    const HEADER = document.getElementById('award-budget-tabs');
    if (HEADER) {
      const STICKY = HEADER.offsetTop - HEIGHT;
      if (window.pageYOffset > STICKY) {
        HEADER.classList.add('tab-sticky');
        HEADER.style.top = HEIGHT - 10 + 'px';
        document.getElementById('awardBudgetRemainingFund').classList.remove('d-none');
      } else {
        HEADER.classList.remove('tab-sticky');
        document.getElementById('awardBudgetRemainingFund').classList.add('d-none');
      }
    }
  }
  /** TO Export Detailed Budget as excel */
  generateAwardDetailedBudgetReport() {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._budgetService.generateAwardDetailedBudget
        (this.awardBudgetData.awardBudgetHeader.budgetId).subscribe((data: any) => {
          const tempData: any = data || {};
          const fileName = `Detailed_Budget_${AWARD_LABEL}_${this.awardData.award.awardNumber}_${this.awardBudgetData.awardBudgetHeader.versionNumber}`;
          fileDownloader(data, fileName, 'xlsx');
          this.isSaving = false;
        }, err => { this.isSaving = false; }));
    }
  }

  /** TO Export Budget Smmary as excel */
  generateAwardBudgetSummaryReport() {
    this.$subscriptions.push(this._budgetService.generateAwardBudgetSummaryReport(
      this.awardBudgetData.awardBudgetHeader.budgetId, this.awardData.award.awardId).subscribe((data: any) => {
        const tempData: any = data || {};
        const FILENAME = `${AWARD_LABEL}_Budget_Summary_${this.awardData.award.awardNumber}_${this.awardBudgetData.awardBudgetHeader.versionNumber}`;
        fileDownloader(data, FILENAME, 'xlsx');
      }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    this._budgetDataService.isBudgetTabTrigger.next(false);
    this._budgetDataService.setAwardBudgetData(null);
    if (this.$budgetPrintTrigger) {
      this.$budgetPrintTrigger.unsubscribe();
    }
  }
}
