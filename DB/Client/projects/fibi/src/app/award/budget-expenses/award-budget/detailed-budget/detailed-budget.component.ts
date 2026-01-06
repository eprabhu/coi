/**
 * Created on 15-01-2020 by Saranya T Pillai
 */
import { Component, OnInit } from '@angular/core';
import { SubscriptionLike as ISubscription, Subscription } from 'rxjs';

import { CommonDataService } from '../../../services/common-data.service';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, DEFAULT_DATE_FORMAT, AWARD_LABEL } from '../../../../app-constants';
import { BudgetService } from '../../budget.service';
import { compareDates, parseDateWithoutTimestamp, getDateObjectFromTimeStamp } from '../../../../common/utilities/date-utilities';
import { BudgetDataService } from '../../budget-data.service';
import { validatePercentage, inputRestrictionForAmountField } from '../../../../common/utilities/custom-utilities';
import { getDuration } from '../../../../common/utilities/date-utilities';
import { PersonnelService } from '../personnel/personnel.service';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-detailed-budget',
  templateUrl: './detailed-budget.component.html',
  styleUrls: ['./detailed-budget.component.css']
})
export class DetailedBudgetComponent implements OnInit {

  private $awardData: ISubscription;
  private $awardBudgetData: ISubscription;
  private $awardBudgetPersonList: ISubscription;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  awardData: any = {};
  awardBudgetData: any = {};
  currency: string;
  currentPeriodData: any = {};
  currentPeriodId = null;
  tempObject: any = {};
  endpointSearchOptions: any;
  newLineItemObject: any = {
    personsDetails: [],
    nonPersonsDetails: []
  };
  systemGeneratedCostCodes = [];
  subItemValidationArray: any = [];
  isInvalidLineItem: any = {};
  lineItemValidations: any = [];
  clearField: String;
  clearFieldIteration;
  pattern = /^(?:[0-9][0-9]{0,3}(?:\.\d{0,2})?|9999|9999.00|9999.99)$/;
  $subscriptions: Subscription[] = [];
  endpointSearchOptionsEdit: any = {};
  isLineItemEditable = [];
  selectedBudgetCategory = null;
  justificationToggleList: any = [];
  personTotalSalary: any;
  availableFundAfterEdit: any = 0;
  isInvalidCostOnAdd = false;
  isInvalidCostOnEdit = false;
  prevLineItemCost: any = 0;
  isInvalidRevisedBudget = false;
  isManpowerLineItemCostValidation = false;
  helpText: any = {};
  isSaving = false;
  personResultData: any = {};
  isSubSectionOpen: any = [];
  isSubItemCostValidOnAdd = true;
  subItemCostValidationList = [];
  deleteLineItemIndex: number;
  currentLineItemCode: any;
  isManpowerResourceExistInManpower = false;
  isIOCodeExistInManpower = false;
  setFocusToElement = setFocusToElement;

  constructor(public _commonDataService: CommonDataService, public _commonService: CommonService,
    private _budgetService: BudgetService, public _budgetDataService: BudgetDataService,
    private _personnelService: PersonnelService) { }

  ngOnInit() {
    this.currency = this._commonService.currencyFormat;
    this.subscribeAwardData();
    this.subscribeBudgetData();
    this.subscribeAwardPersonData();
    this.fetchHelpText();
  }

  subscribeAwardData() {
    this.$awardData = this._commonDataService.awardData.subscribe((data: any) => {
      this.awardData = data ? Object.assign({}, data) : null;
    });
  }
  subscribeBudgetData() {
    this.$awardBudgetData = this._budgetDataService.awardBudgetData.subscribe((data: any) => {
      this.awardBudgetData = data ? JSON.parse(JSON.stringify(data)) : {};
      if (Object.keys(this.awardBudgetData).length > 0) {
        const PERIOD = this.awardBudgetData.awardBudgetHeader.budgetPeriods.find(item => item.budgetPeriodId === this.currentPeriodId);
        this.currentPeriodData = PERIOD ? PERIOD : this.awardBudgetData.awardBudgetHeader.budgetPeriods[0];
        this.setSystemGeneratedCodes();
        this.currentPeriodId = this.currentPeriodData.budgetPeriodId;
        this.endpointSearchOptions = this.searchOptions();
        this.endpointSearchOptionsEdit = this.searchOptions();
        this.sortBudgetLineItems();
        this.setDatesAndEditOptions();
        this.convertPersonDates();
        this.checkSubsection();
      }
    });
  }

  checkSubsection() {
    if (this._budgetDataService.isBudgetPartiallyEditable && this.awardBudgetData.awardBudgetHeader.budgetPeriods[0].budgetDetails &&
      this.awardBudgetData.awardBudgetHeader.budgetPeriods[0].budgetDetails.length) {
      this.isSubSectionOpen[this.awardBudgetData.awardBudgetHeader.budgetPeriods[0].budgetDetails[0].budgetDetailId] = true;
    }
  }

  subscribeAwardPersonData() {
    this.$awardBudgetPersonList = this._budgetDataService.awardBudgetPersonData.subscribe((data: any) => {
      this.personResultData = data;
    });
  }

  fetchHelpText() {
    this.$subscriptions.push(this._budgetDataService.$budgetHelpText.subscribe((data: any) => {
      this.helpText = data;
    }));
  }

  /**
   * returns end point search options
   */
  searchOptions() {
    return this._budgetService.setHttpOptions('description', 'costElement - description', 'findCostElementsByParams', '',
      { 'budgetCategoryCodes': this.systemGeneratedCostCodes });
  }

  setSystemGeneratedCodes() {
    if (this.systemGeneratedCostCodes.length === 0) {
      if (this.awardBudgetData.sysGeneratedCostElements.length) {
        this.systemGeneratedCostCodes.push(this.awardBudgetData.sysGeneratedCostElements[0].budgetCategoryCode);
      }
      this.systemGeneratedCostCodes.push(500);
    }
  }

  /**
   * to convert dates in timestamp of line item persons to date object
   * to set options to make line item editable
   */
  setDatesAndEditOptions() {
    this.currentPeriodData.budgetDetails.forEach((element, index) => {
      this.setLineItemEditMode(index);
      this.toggleJustification(index);
    });
  }

  /** @param  {} index
   * disables edit mode of a particular line item in the given index
   */
  setLineItemEditMode(index) {
    this.isLineItemEditable[index] = false;
  }

  /** @param  {} element
   * converts persons start and end date in time stamp to date object
   */
  convertPersonDates() {
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.forEach(period => {
      period.budgetDetails.forEach(lineItem => {
        lineItem.personsDetails.map(person => {
          person.startDate = getDateObjectFromTimeStamp(person.startDate);
          person.endDate = getDateObjectFromTimeStamp(person.endDate);
        });
      });
    });
  }

  toggleJustification(index) {
    // this.justificationToggleList[index] = false;
    for (const detail of this.awardBudgetData.awardBudgetHeader.budgetPeriods[0].budgetDetails) {
      this.justificationToggleList[detail.budgetDetailId] = false;
      this.isSubSectionOpen[detail.budgetDetailId] = this.isSubSectionOpen[detail.budgetDetailId] ? true : false;
    }
  }

  /** @param  {} period
   * sets current period data in 'currentPeriodData' for further uses(to access current period data easily).
   */
  setCurrentPeriod(period) {
    this.resetEditLineItem();
    this.currentPeriodData = period;
    this.currentPeriodId = this.currentPeriodData.budgetPeriodId;
    this.setDatesAndEditOptions();
    this.clearNewLineItemObject();
  }

  /** @param  {} index
   * to add a period in more periods option to main period tabs
   */
  shiftPeriods(index) {
    const ITEM = this.awardBudgetData.awardBudgetHeader.budgetPeriods.splice(index, 1)[0];
    this.awardBudgetData.awardBudgetHeader.budgetPeriods.splice(4, 0, ITEM);
  }

  /**
   * @param  {} selectedResult
   * sets required cost element values when selecting a cost element from cost element search box
   */
  costElementChange(selectedResult) {
    if (selectedResult !== null) {
      this.selectedBudgetCategory = selectedResult.budgetCategory.description;
      this.newLineItemObject.costElement = selectedResult;
      this.newLineItemObject.costElementCode = selectedResult.costElement;
      this.newLineItemObject.budgetCategory = selectedResult.budgetCategory;
      this.newLineItemObject.budgetCategoryCode = selectedResult.budgetCategoryCode;
      this.newLineItemObject.versionNumber = this.awardBudgetData.awardBudgetHeader.versionNumber;
      this.newLineItemObject.budgetPeriod = this.currentPeriodData.budgetPeriod;
      this.newLineItemObject.personsDetails = [];
      this.setInitialPersonDate(this.newLineItemObject);
      this.resetEditLineItem();
      this._commonDataService.isAwardDataChange = true;
    } else {
      this.clearNewLineItemObject();
      this._commonDataService.isAwardDataChange = false;
    }
  }

  /**  @param  {} lineitem
   * for a new person under line item sets period start and end date as person start and end date
   */
  setInitialPersonDate(lineitem) {
    const isPersonLineItemActive = !this.awardBudgetData.awardBudgetHeader.manpowerEnabled || !this.awardBudgetData.awardBudgetHeader.budgetAssociatedWithManpower;
    if (lineitem.budgetCategory.budgetCategoryTypeCode === 'P' && isPersonLineItemActive &&
      ((lineitem.personsDetails.length && lineitem.personsDetails[0].budgetPersonId) || !lineitem.personsDetails.length)) {
      lineitem.personsDetails.push({
        startDate: this.currentPeriodData.startDate ? new Date(this.currentPeriodData.startDate) : null,
        endDate: this.currentPeriodData.endDate ? new Date(this.currentPeriodData.endDate) : null,
        budgetPersonId: null
      });
      if (isPersonLineItemActive) { this.setTbnPerson(lineitem) }
    }
  }

  setNonPerson(lineitem) {
    if (lineitem.budgetCategory.budgetCategoryTypeCode !== 'P') {
      const updateTimeStamp = new Date().getTime();
      const updateUser = this._commonService.getCurrentUserDetail('userName');
      lineitem.nonPersonsDetails.push(
        { description: '', internalOrderCode: '', lineItemCost: '', updateTimestamp: updateTimeStamp, updateUser: updateUser });
    }
  }

  /** Method to add line item */
  addNewBudgetLineItem() {
    this.onLineItemCostChange(this.newLineItemObject.lineItemCost);
    if (this.newLineItemObject.budgetCategory && this.newLineItemObject.budgetCategory.budgetCategoryTypeCode) {
      this.isSubItemCostValidOnAdd = this.validateSubItemsCost(this.newLineItemObject, this.newLineItemObject.budgetCategory.budgetCategoryTypeCode);
      this.trimSubLineItem(this.newLineItemObject);
    }
    this.saveAwardBudgetLineItem(this.newLineItemObject);
  }

  /** Method to clear details of imported dev proposal budget in these cases:
   * 1. If imported period has no lineitems & then adding a lineitem manually.
   * 2. Deleting all the line items imported from proposal budget.
  */
  clearDevProposalBudgetDetails() {
    this.currentPeriodData.devProposalBudgetId = null;
    this.currentPeriodData.devProposalBudgetPeriod = null;
    this.currentPeriodData.devProposalId = null;
  }

  saveAwardBudgetLineItem(lineItem) {
    if (!this.isSaving && this.validateNewLineItem(lineItem) && !this.checkInvalidLineItemCost(lineItem.lineItemCost)
          && this.isSubItemCostValidOnAdd) {
      this.saveOrUpdateServiceCall(lineItem);
    }
  }

  saveOrUpdateServiceCall(lineItemObject) {
    this.isSaving = true;
    if (!this._budgetDataService.isInvalidCost && this._budgetDataService.checkBudgetDatesFilled([this.currentPeriodData])) {
      this._budgetService.saveOrUpdateAwardBudgetLineItem(this.setSaveOrUpdateRequestData(lineItemObject))
        .subscribe((data: any) => {
          this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
          this._budgetDataService.budgetId = data.awardBudgetHeader.budgetId;
          this.updateCurrentPeriodData(data);
          this._commonDataService.setAwardData(this.awardData);
          this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
          const details = lineItemObject.budgetCategory.budgetCategoryTypeCode === 'P' ?
            lineItemObject.personsDetails : lineItemObject.nonPersonsDetails;
          this.isSubSectionOpen[lineItemObject.budgetDetailId] = this.isSubSectionOpen[lineItemObject.budgetDetailId] &&
            details.length > 0 ? true : false;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, `Your ${AWARD_LABEL} Budget saved successfully.`);
          this._commonDataService.isAwardDataChange = false;
          this.clearNewLineItemObject();
          this.tempObject = {};
          this.personTotalSalary = 0;
          if (this.awardBudgetData.awardBudgetHeader.availableFund < 0) {
            document.getElementById('awardBudgetavailableFundModalBtn').click();
          }
          this.isSaving = false;
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Saving ${AWARD_LABEL} Budget failed. Please try again.`);
          this.isSaving = false;
        });
    }
  }

  /**removes invalid sub item object
   * sets save or update request object
  */
  setSaveOrUpdateRequestData(lineItemObject) {
    lineItemObject.quantity = lineItemObject.quantity ? parseFloat(lineItemObject.quantity) : null;
    if (lineItemObject.budgetCategory.budgetCategoryTypeCode === 'P' && lineItemObject.personsDetails.length === 1) {
      lineItemObject.personsDetails = ((Object.keys(lineItemObject.personsDetails[0]).length <= 2) ||
        !lineItemObject.personsDetails[0].budgetPersonId) ? [] : lineItemObject.personsDetails;
    } else if (lineItemObject.budgetCategory.budgetCategoryTypeCode !== 'P' && lineItemObject.nonPersonsDetails.length === 1) {
      lineItemObject.nonPersonsDetails =
        (!this.validatenonPersonsDetails(lineItemObject.nonPersonsDetails)) ? [] : lineItemObject.nonPersonsDetails;
    }
    lineItemObject.budgetId = this.awardBudgetData.awardBudgetHeader.budgetId;
    lineItemObject.budgetPeriodId = this.currentPeriodData.budgetPeriodId;
    if (lineItemObject.internalOrderCode) {
      lineItemObject.internalOrderCode = lineItemObject.internalOrderCode.trim();
    }
    lineItemObject.personsDetails.map(person => {
      person.startDate = parseDateWithoutTimestamp(person.startDate);
      person.endDate = parseDateWithoutTimestamp(person.endDate);
    });
    const REQUESTOBJECT = {
      awardBudgetDetail: lineItemObject,
      awardId: this.awardData.award.awardId,
      budgetPeriodId: this.currentPeriodData.budgetPeriodId,
      lineItemCount: this.currentPeriodData.budgetDetails.length,
      costElementChanged: this.currentLineItemCode && (this.currentLineItemCode != lineItemObject.costElementCode) ? true : false,
      updateUser: this._commonService.getCurrentUserDetail('userName')
    };
    return REQUESTOBJECT;
  }

  updateCurrentPeriodData(data) {
    this.currentPeriodData = data.awardBudgetHeader.budgetPeriods.find(
      item => item.budgetPeriodId === this.currentPeriodId);
    this.currentPeriodId = this.currentPeriodData.budgetPeriodId;
  }
  /**
  * Have to improve the readability- By Mahesh
  * Need to revisit the logic of checking the count of key s in object of 
  * person details - Aravind
  */
  validateNewLineItem(lineitem) {
    this.isInvalidCostOnAdd = false;
    if (!lineitem.budgetCategory || lineitem.budgetCategory.budgetCategoryTypeCode !== 'P') {
      if (lineitem.nonPersonsDetails.length === 1 && !lineitem.nonPersonsDetails[0].lineItemCost &&
        !lineitem.nonPersonsDetails[0].description && !lineitem.nonPersonsDetails[0].internalOrderCode) {
        return (this.validateBudgetDetail(lineitem) ? true : false);
      } else {
        if (this.validatenonPersonsDetails(lineitem.nonPersonsDetails)) {
          return (this.validateBudgetDetail(lineitem) ? true : false);
        }
      }
    } else {
      if (lineitem.personsDetails.length && Object.keys(lineitem.personsDetails[0]).length > 2
      && lineitem.personsDetails[0].budgetPersonId !== 'null'&& lineitem.personsDetails[0].budgetPersonId !== null) {
        if (this.validatePersonDetails(lineitem.personsDetails, this.currentPeriodData)) {
          return (this.validateBudgetDetail(lineitem) ? true : false);
        }
      } else {
        return (this.validateBudgetDetail(lineitem) ? true : false);
      }
    }
  }

/**
   * @param  {} budgetDetail
   *  if ENABLE_AB_PERSON_APPL_SAL_CALC === 'Y' - set line itemcost as sum of all non person sub item(s) cost
   *  if ENABLE_AB_PERSON_APPL_SAL_CALC === 'N' - keep sum of sub item(s) cost as it is
   *  and its total cost doesn't override the main line item cost
   */
 setNonPersonLineItemCost(budgetDetail) {
  if (this.awardBudgetData.enableAbPersonAppliedSalary) {
    budgetDetail.lineItemCost = this.roleUpNonPersonCost(budgetDetail);
  }
}

  /**
   * @param  {} budgetDetail
   * to sum up non person sub line item cost
   */
  roleUpNonPersonCost(budgetDetail) {
    let sum = 0;
    budgetDetail.nonPersonsDetails.forEach(element => {
      if (element.lineItemCost) {
        sum += parseFloat(element.lineItemCost);
      }
    });
    return sum;
  }

  clearNewLineItemObject() {
    this.selectedBudgetCategory = null;
    this.newLineItemObject = {};
    this.newLineItemObject.personsDetails = [];
    this.newLineItemObject.nonPersonsDetails = [];
    this.subItemValidationArray = [];
    this.isInvalidLineItem = {};
    this.lineItemValidations = [];
    this.isInvalidCostOnAdd = this.isInvalidCostOnEdit = false;
    this.endpointSearchOptions.defaultValue = '';
    this.isInvalidCostOnAdd = false;
    this.isSubItemCostValidOnAdd = true;
    this.deleteLineItemIndex = null;
    this.currentLineItemCode = null;
    // this.isSubItemVisible = false;
  }

  deletePersonSubItemOnAddition(index, lineitem) {
    lineitem.personsDetails.splice(index, 1);
    this.subItemValidationArray[index] = {};
    this.isSubItemCostValidOnAdd = this.validateSubItemsCost(lineitem, lineitem.budgetCategory.budgetCategoryTypeCode);
    if (this.awardBudgetData.enableAbPersonAppliedSalary) {
      lineitem.lineItemCost = this.roleUpPersonSalary(lineitem.personsDetails);
    }
    if (lineitem.personsDetails.length === 0) {
      if (lineitem.budgetCategory.budgetCategoryTypeCode === 'P' &&
        ((lineitem.personsDetails.length && lineitem.personsDetails[0].budgetPersonId) || !lineitem.personsDetails.length)) {
        lineitem.personsDetails.push({
          startDate: this.currentPeriodData.startDate ? new Date(this.currentPeriodData.startDate) : null,
          endDate: this.currentPeriodData.endDate ? new Date(this.currentPeriodData.endDate) : null,
          budgetPersonId: null
        });
      }
      this.isInvalidCostOnAdd = false;
    }
  }

  deleteNonPersonSubItemOnAddition(index, lineitem) {
    lineitem.nonPersonsDetails.splice(index, 1);
    this.subItemValidationArray[index] = {};
    this.isSubItemCostValidOnAdd = this.validateSubItemsCost(lineitem, lineitem.budgetCategory.budgetCategoryTypeCode);
    this.setNonPersonLineItemCost(lineitem);
  }

  /**
   * @param  {} lineitem
   * @param  {} type
   * @param lineItemIndex
   * current row of person data is filled correctly, then allows to add next row for inserting another person
   */
  addPersonSubItem(lineitem, type, lineItemIndex) {
    const VALID = type === 'ADD' ? this.validatePersonDetails(lineitem.personsDetails, this.currentPeriodData) && !this.isInvalidCostOnAdd :
      this.validateLineItemOnEdit(lineitem) && !this.isInvalidCostOnEdit;
      const isSubItemCostValid = this.validateSubItemsCost(lineitem, lineitem.budgetCategory.budgetCategoryTypeCode);
      type === 'ADD' ? this.isSubItemCostValidOnAdd = isSubItemCostValid :
                  this.subItemCostValidationList[lineItemIndex] = isSubItemCostValid;
    if (VALID && isSubItemCostValid) {
      this.setInitialPersonDate(lineitem);
      /* this if condition is for opening up the person section after adding first person to LI by GA/FA in routing */
      if (this._budgetDataService.isBudgetPartiallyEditable && lineitem.personsDetails.length === 1) {
        this.isSubSectionOpen[lineitem.budgetDetailId] = true;
      }
    }
  }


  /**
  * @param  {} object
  * @param  {} person
  * If tbn is attached with cost element while selecting then saves the tbn person to person list and sets the person to the tbn
  */
  setTbnPerson(lineitem) {
    const PERSON = this.getPerson(lineitem);
    if (PERSON) {
      lineitem.personsDetails[lineitem.personsDetails.length - 1].budgetPersonId = PERSON.budgetPersonId;
      lineitem.personsDetails[lineitem.personsDetails.length - 1].budgetPerson = PERSON;
    } else {
      if (lineitem.costElement.tbnId !== null &&
        lineitem.budgetCategory.budgetCategoryTypeCode === 'P' && !lineitem.personsDetails[0].budgetPersonId) {
        this.$subscriptions.push(this._personnelService.saveOrUpdateAwardBudgetPerson(
          {
            'awardBudgetPerson': this.setPersonRequestObject(lineitem),
            'awardId': this.awardBudgetData.awardId
          }
        ).subscribe((data: any) => {
          if (data.budgetPersonId) {
            lineitem.personsDetails[lineitem.personsDetails.length - 1].budgetPersonId = data.budgetPersonId;
            lineitem.personsDetails[lineitem.personsDetails.length - 1].budgetPerson = data;
            this.awardBudgetCalculations(lineitem, lineitem.personsDetails[0]);
            this.personResultData.awardBudgetPersonList.push(data);
            this._budgetDataService.setAwardBudgetPersonList(this.personResultData);
          }
        }));
      }
    }
  }

  getPerson(lineitem) {
    return this.personResultData.awardBudgetPersonList.find(budgetPerson =>
      budgetPerson.personType === 'T' &&
      budgetPerson.tbnId == lineitem.costElement.tbnId &&
      budgetPerson.jobCode == lineitem.costElement.tbnPerson.jobCode &&
      budgetPerson.appointmentTypeCode === '6');
  }

  setPersonRequestObject(lineitem) {
    const PERSONDETAILS: any = {};
    PERSONDETAILS.tbnPerson = lineitem.costElement.tbnPerson;
    PERSONDETAILS.appointmentTypeCode = '6';
    PERSONDETAILS.personType = 'T';
    PERSONDETAILS.jobCode = lineitem.costElement.tbnPerson.jobCode;
    PERSONDETAILS.tbnId = lineitem.costElement.tbnId;
    PERSONDETAILS.appointmentType = this.personResultData.appointmentType.
      find(item => item.code === PERSONDETAILS.appointmentTypeCode);
    if (!PERSONDETAILS.jobCodes) {
      PERSONDETAILS.jobCodes = this.personResultData.jobCode.find(item => item.jobCode === PERSONDETAILS.jobCode);
    }
    PERSONDETAILS.updateUser = this._commonService.getCurrentUserDetail('userName');
    PERSONDETAILS.updateTimeStamp = new Date().getTime();
    PERSONDETAILS.budgetHeaderId = this.awardBudgetData.awardBudgetHeader.budgetId;
    return PERSONDETAILS;
  }

  /** @param lineitem - added/edited lineitem
   * subItemType - type of line item category, whether its Personnel ('P') or Non-Personnel line item
   * Method to check whether the total sub items cost exceeds the main line item, if the param is disabled
  */
   validateSubItemsCost(lineitem, subItemtype) {
    let isSubItemCostValid = true;
    if (!this.awardBudgetData.enableAbPersonAppliedSalary) {
    isSubItemCostValid = subItemtype === 'P' ? this.roleUpPersonSalary(lineitem.personsDetails) <= lineitem.lineItemCost :
                          this.roleUpNonPersonCost(lineitem) <= lineitem.lineItemCost;
    }
    return isSubItemCostValid;
  }

  addNonPersonSubItem(lineitem, type, lineitemIndex) {
    const VALID = type === 'ADD' ?
                          this.validatenonPersonsDetails(lineitem.nonPersonsDetails) && !this.isInvalidCostOnAdd :
                          this.validateLineItemOnEdit(lineitem) && !this.isInvalidCostOnEdit;
    const isSubItemCostValid = this.validateSubItemsCost(lineitem, lineitem.budgetCategory.budgetCategoryTypeCode);
    type === 'ADD' ? this.isSubItemCostValidOnAdd = isSubItemCostValid :
                      this.subItemCostValidationList[lineitemIndex] = isSubItemCostValid;
    if (VALID && isSubItemCostValid) {
      this.setNonPerson(lineitem);
      /* this if condition is for opening up the non person section after adding first person to LI by GA/FA in routing */
      if (this._budgetDataService.isBudgetPartiallyEditable && lineitem.nonPersonsDetails.length === 1) {
        this.isSubSectionOpen[lineitem.budgetDetailId] = true;
      }
    }
  }

  deletePersonSubItem() {
    if (!this.tempObject.subItem.budgetPersonDetailId) {
      this.spliceDeletedPerson(this.tempObject.lineItem.personsDetails);
      this.subItemCostValidationList[this.tempObject.detailIndex] =
          this.validateSubItemsCost(this.tempObject.lineItem, this.tempObject.lineItem.budgetCategory.budgetCategoryTypeCode);
      if (this.awardBudgetData.enableAbPersonAppliedSalary) {
        this.tempObject.lineItem.lineItemCost = this.roleUpPersonSalary(this.tempObject.lineItem.personsDetails);
      }
    } else {
      const REQUESTOBJECT = {
        'awardId': this.awardData.award.awardId,
        'budgetHeaderId': this.awardBudgetData.awardBudgetHeader.budgetId,
        'budgetPersonDetailId': this.tempObject.subItem.budgetPersonDetailId,
        'userName': this._commonService.getCurrentUserDetail('userName')
      };
      this.$subscriptions.push(this._budgetService.deletePersonLineItem(REQUESTOBJECT).subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this.subItemCostValidationList[this.tempObject.detailIndex] =
            this.validateSubItemsCost(this.tempObject.lineItem, this.tempObject.lineItem.budgetCategory.budgetCategoryTypeCode);
        this.clearNewLineItemObject();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person deleted successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Person from budget failed. Please try again.');
      }));
    }
    this.isInvalidCostOnEdit = false;
    this.updateCurrentPeriodData(this.awardBudgetData);
  }

  deleteNonPersonSubLineItem() {
    if (!this.tempObject.subItem.budgetNonPersonDtlId) {
      this.spliceDeletedPerson(this.tempObject.lineItem.nonPersonsDetails);
      this.setNonPersonLineItemCost(this.tempObject.lineItem);
      this.subItemCostValidationList[this.tempObject.detailIndex] =
          this.validateSubItemsCost(this.tempObject.lineItem, this.tempObject.lineItem.budgetCategory.budgetCategoryTypeCode);
    } else {
      const REQUESTOBJECT = {
        'awardId': this.awardData.award.awardId,
        'budgetHeaderId': this.awardBudgetData.awardBudgetHeader.budgetId,
        'budgetNonPersonDtlId': this.tempObject.subItem.budgetNonPersonDtlId
      };
      this.$subscriptions.push(this._budgetService.deleteAwardBudgetNonPersonnelSubItem(REQUESTOBJECT).subscribe((data: any) => {
        this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
        this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
        this.clearNewLineItemObject();
        this.subItemCostValidationList[this.tempObject.detailIndex] =
            this.validateSubItemsCost(this.tempObject.lineItem, this.tempObject.lineItem.budgetCategory.budgetCategoryTypeCode);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Person deleted successfully.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting person from budget failed. Please try again.');
      }));
    }
    this.isInvalidCostOnEdit = false;
    this.updateCurrentPeriodData(this.awardBudgetData);
  }

  spliceDeletedPerson(subItem) {
    subItem.splice(this.tempObject.subItemIndex, 1);
  }

  deleteLineItem() {
    const REQUESTOBJECT = {
      'awardId': this.awardData.award.awardId,
      'awardBudgetId': this.awardBudgetData.awardBudgetHeader.budgetId,
      'budgetPeriodId': this.currentPeriodData.budgetPeriodId,
      'budgetDetailId': this.currentPeriodData.budgetDetails[this.deleteLineItemIndex].budgetDetailId,
      'internalOrderCode': this.currentPeriodData.budgetDetails[this.deleteLineItemIndex].internalOrderCode,
      'userName': this._commonService.getCurrentUserDetail('userName')
    };
    this.$subscriptions.push(this._budgetService.deleteLineItem(REQUESTOBJECT).subscribe((data: any) => {
      this.awardBudgetData.awardBudgetHeader = data.awardBudgetHeader;
      this._budgetDataService.setAwardBudgetData(this.awardBudgetData);
      this.updateCurrentPeriodData(this.awardBudgetData);
      this._budgetDataService.checkTotalCostValidation();
      this.isInvalidCostOnEdit = false;
      this.isManpowerResourceExistInManpower = false;
      this.isIOCodeExistInManpower = false;
      this.clearNewLineItemObject();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Line Item deleted successfully.');
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting Line item failed. Please try again.');
    }));
  }

  triggerPersonsModal(event, person, lineItem) {
    this.tempObject.subItem = person;
    this.tempObject.lineItem = this.tempObject.lineItem && this.tempObject.lineItem.budgetDetailId ? this.tempObject.lineItem : lineItem;
    if (event.target.value === 'otherPersons') {
      document.getElementById('awardAddOtherPersonModalBtn').click();
      event.target.value = person.budgetPersonId = null;
    }
  }

  setSubItemDeleteObject(lineitem, subItem, subItemIndex, detailIndex) {
    this.tempObject.lineItem = lineitem;
    this.tempObject.subItem = subItem;
    this.tempObject.subItemIndex = subItemIndex;
    this.tempObject.detailIndex = detailIndex;
  }

  /** @param  {any} event
   * restricts inputs other than numbers
   */
  inputRestriction(event: any) {
    const PATTERN = /^\d{0,10}(\.\d{0,2})?$/;
    if (!PATTERN.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  validatePersonDetails(personArray, period) {
    this.subItemValidationArray = [];
    personArray.forEach((person, index) => {
      this.subItemValidationArray[index] = {};
      this.limitKeypress(person.percentageEffort, index);
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      if (person.budgetPersonId === undefined || person.budgetPersonId === null || person.budgetPersonId === 'null') {
        this.subItemValidationArray[index].personMsg = 'Select a person.';
      }
      if (!person.startDate || person.startDate === null) {
        this.subItemValidationArray[index].stDateMsg = 'Select a start date.';
      } else if (person.startDate < startDate) {
        this.subItemValidationArray[index].stDateMsg = 'Select a start date equal to or after period start date.';
      } else if (person.startDate > endDate) {
        this.subItemValidationArray[index].endDateMsg = 'Select a start date equal to or before period end date.';
      }
      if (!person.endDate || person.endDate === null) {
        this.subItemValidationArray[index].endDateMsg = 'Select an end date.';
      } else if (person.endDate > endDate) {
        this.subItemValidationArray[index].endDateMsg = 'Select an end date equal to or before period end date.';
      } else if (person.endDate < startDate) {
        this.subItemValidationArray[index].endDateMsg = 'Select an end date equal to or after period start date.';
      } else if (person.endDate < startDate) {
        this.subItemValidationArray[index].endDateMsg = 'Select an end date after starting date.';
      }
      if (this.awardBudgetData.enableAbPersonAppliedSalary && (person.percentageEffort === undefined || person.percentageEffort === null)) {
        this.subItemValidationArray[index].effortMsg = 'Enter effort %.';
      }
    });
    return this.subItemValidationArray.every(item => this.checkObjectHasValues(item));
  }

  checkObjectHasValues(item) {
    return Object.values(item).filter(Boolean).length === 0 ? true : false;
  }

  validatenonPersonsDetails(nonPersonsDetails) {
    this.subItemValidationArray = [];
    nonPersonsDetails.forEach((element, index) => {
      this.subItemValidationArray[index] = {};
      if (!element.lineItemCost) {
        this.subItemValidationArray[index].cost = 'Enter line item cost.';
      }
      if (!element.description) {
        this.subItemValidationArray[index].subItem = 'Enter sub item.';
      }
    });
    return this.subItemValidationArray.every(item => this.checkObjectHasValues(item));
  }

  limitKeypress(value, index, lineItemIndex = null) {
    this.subItemValidationArray[index] = { effortMsg: '' };
    if (validatePercentage(value)) {
      this.subItemValidationArray[index].effortMsg = validatePercentage(value);
      if (lineItemIndex !== null) {
        this.lineItemValidations[lineItemIndex] = { subItemValidationArray: [] };
        this.lineItemValidations[lineItemIndex].subItemValidationArray = this.subItemValidationArray;
      }
    } else {
      this.subItemValidationArray[index].effortMsg = null;
    }
  }

  validateBudgetDetail(budgetDetail) {
    this.isInvalidLineItem = {};
    budgetDetail.lineItemCost = (budgetDetail.lineItemCost !== null && budgetDetail.lineItemCost >= 0 && budgetDetail.lineItemCost !== '') ?
      parseFloat(budgetDetail.lineItemCost) : null;
    if (!budgetDetail.costElement || Object.keys(budgetDetail.costElement).length === 0) {
      this.isInvalidLineItem.costElement = 'Please select a cost element.';
    }
    if ((!budgetDetail.lineItemCost && budgetDetail.lineItemCost !== 0) || budgetDetail.lineItemCost === 'NaN') {
      this.isInvalidLineItem.cost = 'Please fill line item cost.';
    }
    if (budgetDetail.lineItemCost) {
      this.inputDigitRestriction(budgetDetail.lineItemCost);
    }
    if (parseFloat(budgetDetail.quantity) > 0 && !this.pattern.test(budgetDetail.quantity)) {
      this.isInvalidLineItem.quantityMsg = 'Enter quantity value as 4 digits up to 2 decimal places.';
    }
    return Object.keys(this.isInvalidLineItem).length > 0 ? false : true;
  }

  inputDigitRestriction(field: any, index: number = null, key: string = '') {
    const AMOUNT_PATTERN_VALIDATION = inputRestrictionForAmountField(field);
    this.lineItemValidations[index] && this.lineItemValidations[index].cost ? delete this.lineItemValidations[index].cost : '';
    this.isInvalidLineItem && this.isInvalidLineItem.cost ? delete this.isInvalidLineItem.cost : '';
    if (AMOUNT_PATTERN_VALIDATION) {
      key && index !== null ? this.lineItemValidations[index] = {} : '';
      index !== null ? this.lineItemValidations[index].cost = AMOUNT_PATTERN_VALIDATION :
        this.isInvalidLineItem.cost = AMOUNT_PATTERN_VALIDATION;
    }
  }

  validateLineItemOnEdit(lineItem) {
    this.lineItemValidations = [];
    this.isInvalidLineItem = {};
    this.validateBudgetDetail(lineItem);
    if (lineItem.personsDetails.length > 0) {
      !this.validatePersonDetails(lineItem.personsDetails, this.currentPeriodData) ?
        this.isInvalidLineItem.subItemValidationArray = this.subItemValidationArray : '';
    } else if (lineItem.nonPersonsDetails.length > 0) {
      !this.validatenonPersonsDetails(lineItem.nonPersonsDetails) ?
        this.isInvalidLineItem.subItemValidationArray = this.subItemValidationArray : '';
    }
    Object.keys(this.isInvalidLineItem).length > 0 ?
      this.lineItemValidations[this.tempObject.lineItemIndex] = this.isInvalidLineItem : '';
    this.isInvalidLineItem = {};
    return (this.lineItemValidations.filter(item => Object.keys(item).length !== 0).length > 0) ? false : true;
  }

  awardBudgetCalculations(lineItem, person) {
    this.personSalaryCalculation(lineItem, person);
    this.personTotalSalary = this.roleUpPersonSalary(lineItem.personsDetails);
    lineItem.lineItemCost = (this.personTotalSalary > 0 && lineItem.personsDetails[0].budgetPersonId) ?
      this.personTotalSalary : lineItem.lineItemCost;
    this.personTotalSalary = lineItem.lineItemCost = this.roleUpPersonSalary(lineItem.personsDetails).toFixed(2);
    this._budgetDataService.checkTotalCostValidation();
    this._commonDataService.isAwardDataChange = true;
  }

  personSalaryCalculation(lineItem, person) {
    let monthlySalary = 0;
    if (lineItem.budgetCategory.budgetCategoryTypeCode === 'P') {
      person.budgetPerson = this.personResultData.awardBudgetPersonList.find(item => item.budgetPersonId == person.budgetPersonId);
      monthlySalary = (person.budgetPerson) ? person.budgetPerson.durationCost : monthlySalary;
      if (person.startDate && person.budgetPerson && person.endDate) {
        const DURATION = getDuration(person.startDate, person.endDate);
        person.endDate = new Date(person.endDate);
        const noOfDays = new Date((person.endDate).getFullYear(), (person.endDate).getMonth() + 1, 0).getDate();
        person.totalSalary = (((DURATION.durInYears * 12 + DURATION.durInMonths) * monthlySalary) +
          (DURATION.durInDays * (monthlySalary / noOfDays)));
        person.totalSalary = parseFloat(person.totalSalary).toFixed(2);
        if (person.percentageEffort > 0) {
          person.salaryRequested = (person.totalSalary * (person.percentageEffort / 100));
          person.salaryRequested = parseFloat(person.salaryRequested).toFixed(2);
        } else {
          // person.salaryRequested = (person.budgetPersonDetailId) ? person.salaryRequested : 0;
          person.salaryRequested = 0;
          person.percentageEffort = person.percentageEffort === 0 ? 0 : null;
        }
      } else {
        person.salaryRequested = 0;
      }
    }
  }

  roleUpPersonSalary(personArray) {
    let personTotalSalary = 0;
    if (personArray.length > 0 && Object.getOwnPropertyNames(personArray[0]).length > 2) {
      personArray.forEach(element => {
        const personSalary = element.salaryRequested ? element.salaryRequested : 0;
        personTotalSalary = personTotalSalary + parseFloat(personSalary);
      });
    }
    return personTotalSalary;
  }

  setAddedPerson(event) {
    this.tempObject.subItem.budgetPersonId = event.budgetPersonId;
    this.tempObject.subItem.budgetPerson = event;
    document.getElementById('addPersonCloseId').click();
    this.awardBudgetCalculations(this.tempObject.lineItem, this.tempObject.subItem);
  }

  costElementChangeOnEdit(selectedResult, lineItem) {
    if (selectedResult != null && this.canEditCostElement(lineItem)) {
      lineItem.costElement.costElementDetail = selectedResult.costElementDetail;
      lineItem.costElement = selectedResult;
      lineItem.costElementCode = selectedResult.costElement;
      lineItem.budgetCategory = selectedResult.budgetCategory;
      lineItem.budgetCategoryCode = selectedResult.budgetCategoryCode;
    } else {
      this.clearSearchBoxEdit(lineItem);
    }
    this._commonDataService.isAwardDataChange = true;
  }

  canEditCostElement(value) {
    return value.budgetCategory.budgetCategoryTypeCode === 'P' ?
      (value.personsDetails.length === 0 || value.personsDetails === null ||
        (this.awardBudgetData.awardBudgetHeader.manpowerEnabled && this.awardBudgetData.awardBudgetHeader.budgetAssociatedWithManpower)) :
      (value.nonPersonsDetails.length === 0 || value.nonPersonsDetails === null || !this.awardBudgetData.isNonPersonalLineItemEnabled);
  }

  clearSearchBoxEdit(value) {
    if (this.canEditCostElement(value)) {
      value.costElement = {};
      value.budgetCategory.description = null;
      delete value.budgetCategory.budgetCategoryTypeCode;
      value.personsDetails = [];
      value.nonPersonsDetails = [];
    } else {
      document.getElementById('awardBudgetCostelementChangewarningModalBtn').click();
      this.endpointSearchOptionsEdit.defaultValue = value.costElement.costElementDetail;
      this.clearFieldIteration = new String('false');
    }
  }

  /**
   * @param  {} lineItem
   * @param  {} detailIndex
   * stores a copy of current line item before edit
   * if any other line item is in edit mode then calls cancelEditLineItem()
   */
  editLineItem(lineItem, detailIndex) {
    this.currentLineItemCode = lineItem.costElement.costElement;
    this.isSubSectionOpen[lineItem.budgetDetailId] = true;
    this.personTotalSalary = 0;
    // making isInvalidCostOnAdd flag to false so that editing a line item while adding line item with invalid cost will still works
    this.isInvalidCostOnAdd = this.isInvalidCostOnAdd ? !this.isInvalidCostOnAdd : this.isInvalidCostOnAdd;
    this.resetEditLineItem();
    this.tempObject.lineItem = JSON.parse(JSON.stringify(lineItem));
    this.prevLineItemCost = parseFloat(lineItem.lineItemCost);
    this.personTotalSalary = this.roleUpPersonSalary(this.tempObject.lineItem.personsDetails);
    this.tempObject.lineItemIndex = detailIndex;
    this.isLineItemEditable[detailIndex] = true;
    this.justificationToggleList[detailIndex] = true;
    this.endpointSearchOptionsEdit.defaultValue = lineItem.costElement.costElementDetail;
  }

  /**
   * Checks is any line item is in editable mode, then returns that index
   * if index has value then calls cancelEditLineItem()
   */
  resetEditLineItem() {
    const INDEX = this.isLineItemEditable.findIndex(item => item === true);
    if (INDEX >= 0) {
      this.cancelEditLineItem(INDEX);
    }
  }

  /**
   * @param  {} detailIndex
   * to remove changes done in edit line item and restores the original line item
   */
  cancelEditLineItem(detailIndex) {
    if (this.tempObject.lineItem.budgetCategory.budgetCategoryTypeCode === 'P' && this.tempObject.lineItem.personsDetails.length === 1) {
      this.tempObject.lineItem.personsDetails = ((Object.keys(this.tempObject.lineItem.personsDetails[0]).length <= 2) ||
        !this.tempObject.lineItem.personsDetails[0].budgetPersonId) ? [] : this.tempObject.lineItem.personsDetails;
    }
    this.tempObject.lineItem.lineItemCost = this.prevLineItemCost;
    this.currentPeriodData.budgetDetails[detailIndex] = this.tempObject.lineItem;
    this.tempObject.lineItem = {};
    this.isLineItemEditable[detailIndex] = false;
    this.justificationToggleList[detailIndex] = false;
    this.isInvalidCostOnEdit = false;
    this.isInvalidRevisedBudget = false;
    this.isManpowerLineItemCostValidation = false;
    this.tempObject = {};
    this.subItemValidationArray = [];
    this.lineItemValidations = [];
    this._commonDataService.isAwardDataChange = false;
    this.subItemCostValidationList[detailIndex] = true;
  }

  /**@param  {} lineItem
   * if the line item edited is validated calls save or update service.
   */
  updateAwardBudgetLineItem(lineItem, detailIndex, subItemType) {
    if (!this.tempObject.lineItem) {
      this.tempObject.lineItem = JSON.parse(JSON.stringify(lineItem));
      this.prevLineItemCost = parseFloat(lineItem.lineItemCost);
    }
    this.trimSubLineItem(lineItem);
    this.onLineItemCostChange(lineItem.lineItemCost);
    this.isInvalidCostOnEdit = false;
    this.isInvalidRevisedBudget = false;
    this.isManpowerLineItemCostValidation = this._commonService.isManpowerEnabled &&
      lineItem.awardManpowerCommittedCost > lineItem.lineItemCost;
    this.subItemCostValidationList[detailIndex] = this.validateSubItemsCost(lineItem, subItemType);
    if (this.validateLineItemOnEdit(lineItem) && !this.checkInvalidLineItemCost(lineItem.lineItemCost)
      && !this.revisedBudgetValidation(lineItem) && !this.isManpowerLineItemCostValidation && this.subItemCostValidationList[detailIndex]) {
      this.saveOrUpdateServiceCall(lineItem);
    }
  }

  /**
   * @param  {} lineItem
   * To Validate Revised Budget is greater than (Latest Approved Budget - Balance To Date)
   * There are chances to have zero values in  balance to date and approved budget. ie why checked !== condition.
   */
  revisedBudgetValidation(lineItem) {
    if (this.awardBudgetData.awardBudgetHeader.budgetTypeCode == 2 &&
      lineItem.prevLineItemCost != null && lineItem.balanceToDate != null) {
      const MINCOST = (parseFloat(lineItem.prevLineItemCost) - parseFloat(lineItem.balanceToDate)).toFixed(2);
      return this.isInvalidRevisedBudget = (lineItem.lineItemCost >= MINCOST) ? false : true;
    } else {
      return false;
    }
  }

  sortBudgetLineItems() {
    for (const budgetPeriod of this.awardBudgetData.awardBudgetHeader.budgetPeriods) {
      if (budgetPeriod.budgetDetails.length > 0) {
        budgetPeriod.budgetDetails = this.sortItems(budgetPeriod.budgetDetails);
      }
    }
  }

  /**Method to sort added budget lineitems w.r.t the sort order returned along with budget category */
  sortItems(budgetPeriodDetailData) {
    return budgetPeriodDetailData.sort((a, b) => {
      return a.budgetCategory.sortOrder - b.budgetCategory.sortOrder;
    });
  }

  onLineItemCostChange(cost) {
    cost = cost && cost >= 0 ? parseFloat(cost) : 0;
    this.prevLineItemCost = this.tempObject.lineItem && this.tempObject.lineItem.budgetDetailId ? this.prevLineItemCost : 0;
    const costDiff: any = (parseFloat(this.awardBudgetData.awardBudgetHeader.totalCost) - this.prevLineItemCost);
    const initialAmount = parseFloat(this.awardBudgetData.awardBudgetHeader.initialAvailableFund);
    this.availableFundAfterEdit = ((initialAmount - costDiff) - cost).toFixed(2);
  }

  /**Method to validate whether entered line item cost exceeds allowed available fund
   * i.e., total cost of all line items <= available fund */
  checkInvalidLineItemCost(cost) {
    cost = cost && cost >= 0 ? parseFloat(cost) : 0;
    if (this.tempObject.lineItem) {
      this.tempObject.lineItem.budgetDetailId ? this.isInvalidCostOnEdit = this.availableFundAfterEdit < 0 ? true : false :
        this.isInvalidCostOnAdd = this.availableFundAfterEdit < 0 ? true : false;
    } else {
      this.isInvalidCostOnAdd =
        cost > this.awardBudgetData.awardBudgetHeader.availableFund || this.awardBudgetData.awardBudgetHeader.availableFund < 0 ?
          true : false;
    }
    this.isInvalidCostOnEdit =
      (this.availableFundAfterEdit < 0 && this.awardBudgetData.awardBudgetHeader.isAutoCalc &&
        (cost < this.prevLineItemCost || cost === 0)) ?
        false : this.isInvalidCostOnEdit;
    this._budgetDataService.isInvalidCost = ((this.isInvalidCostOnEdit) || this.isInvalidCostOnAdd);
    return this._budgetDataService.isInvalidCost;
  }

  checkIOCodeEditable(lineItem, detailIndex) {
    let isIOCodeEditable = true;
    if (this.awardData.isGenerateWBSNumber || lineItem.isSystemGeneratedCostElement
      || (this._budgetDataService.isBudgetEditable && !this.isLineItemEditable[detailIndex]) ||
      (this.awardBudgetData.awardBudgetHeader.budgetTypeCode === '2' &&
        this.awardBudgetData.awardBudgetHeader.budgetStatusCode !== '5') ||
      (!this._budgetDataService.isBudgetEditable && !this._budgetDataService.isBudgetPartiallyEditable)) {
      isIOCodeEditable = false;
    }
    return isIOCodeEditable;
  }
  trimSubLineItem(lineItem) {
    lineItem.personsDetails.forEach(element => {
      if (element.internalOrderCode) {
        element.internalOrderCode = element.internalOrderCode.trim();
      }
    });

    lineItem.nonPersonsDetails.forEach(element => {
      if (element.internalOrderCode) {
        element.internalOrderCode = element.internalOrderCode.trim();
      }
    });
  }
}
