/*
* isAwardDataChange , redirectionRoute --> variables
* isAwardDataChange used for restricting or allowing award tab switch while change occurs in a page using
* canDeactivateGuard.Can restrict tab switch by setting true and allow by setting false.
* redirectionRoute is for saving last selected route path for switching tab after user
* confirmation even if there is change in the page
* Refer award\services\award-route-guard.service.ts for CanDeactivate fuction
**/
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from '../../common/services/web-socket.service';
import { getParams } from '../../common/services/end-point.config';

@Injectable()
export class CommonDataService {

  endpointSearchOptions: any = {
    contextField: '',
    formatString: '',
    path: '',
    defaultValue: ''
  };
  isAwardDataChange = false;
  redirectionRoute = '';

  awardGeneralData: any = {};
  departmentLevelRights = [];
  isModifyAward: any;
  httpOptions: any = {
    contextField: '',
    formatString: '',
    path: '',
    defaultValue: '',
    params: '',
  };
  awardTitle = {
    title: ''
  };
  taskCount = null;
  isShowtaskNavBar = false;
  beginDate = null;
  finalExpirationDate = null;
  awardEffectiveDate = null;
  awardSectionConfig: any = {};
  isAlreadyLocked = false;

  constructor(public _websSocket: WebSocketService) { }

  public awardData = new BehaviorSubject<object>(null);

  setAwardData(awardData) {
    this.awardGeneralData = awardData;
    this.taskCount = awardData ? awardData.taskCount : null;
    this.awardData.next(awardData);
  }

  /**
   * @param  {} sectionId
   * returns true w.r.t sectiontypeCodes array available for edit permission and
   * returns false for sections that are not available in sectiontypeCodes array
   * workflowAwardStatusCode --> '1' = Draft
   * workflowAwardStatusCode --> '4' = Revision Requested
   * The section need not be editable if the sequence status is (ARCHIVE, CANCELLED or ACTIVE)
   */
  getSectionEditableFlag(sectionId) {
    let isEditable = this.getSectionWiseEditFlag(sectionId);
    isEditable = this.getLockWiseEditFlag(isEditable);
    return isEditable;
  }

  getSectionWiseEditFlag(sectionId): boolean {
    let isEditable = false;
    if ((this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '1' ||
      this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '4' ||
      this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '7') &&
      this.awardGeneralData.award.awardSequenceStatus === 'PENDING') {
      if (this.awardGeneralData.award.awardDocumentType.awardDocumentTypeCode === '1') {
        isEditable = (this.checkDepartmentLevelRightsInArray('MODIFY_AWARD') ||
          this.checkDepartmentLevelRightsInArray('CREATE_AWARD')) ? true :
          this.checkSectionTypeCode(sectionId);
      } else {
        isEditable = this.checkSectionTypeCode(sectionId);
      }
    }
    return isEditable;
  }

  getLockWiseEditFlag(currentSectionEditableStatus: boolean): boolean {
    if (currentSectionEditableStatus ) {
    const isKeyValue = 'Award' + '#' + this.awardGeneralData.award.awardId;
      if (!this.isAlreadyLocked) {
        if (this._websSocket.isLockAvailable(isKeyValue)) {
          this._websSocket.getLockForModule('Award', this.awardGeneralData.award.awardId, this.awardGeneralData.award.title);
          this.isAlreadyLocked = true;
        } else if (!this._websSocket.isLockAvailable(isKeyValue)) {
          this._websSocket.getLockForModule('Award', this.awardGeneralData.award.awardId, this.awardGeneralData.award.title);
          this._websSocket.showModal(isKeyValue);
          currentSectionEditableStatus = false;
          this.isAlreadyLocked = true;
        }
      } else if (this.isAlreadyLocked && !this._websSocket.isLockAvailable(isKeyValue)) {
        currentSectionEditableStatus = false;
      }
    }
     return currentSectionEditableStatus;
  }

  checkSectionTypeCode(sectionId) {
    if (this.awardGeneralData.sectionTypeCodes && this.awardGeneralData.sectionTypeCodes.length > 0) {
      return this.awardGeneralData.sectionTypeCodes.find(section => section.sectionCode === sectionId) ? true : false;
    } else {
      return false;
    }
  }
  /**
   * @param  {} sectionId
   * Returns true when sectionId satisfies following conditions for highlighting editable sections after submiting
   * workflowAwardStatusCode = '3' --> Active
   * awardDocumentTypeCode = '3'  --> Variation
   * No need to  highlight the section is the sequence status is (ARCHIVE, CANCELLED or ACTIVE)
   */
  checkSectionHightlightPermission(sectionId) {
    if ((this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode !== '3') &&
      this.checkSectionTypeCode(sectionId) && this.awardGeneralData.award.awardSequenceStatus === 'PENDING') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param  {} contextField
   * @param  {} formatString
   * @param  {} path
   *returns the endpoint search object with respect to the the inputs.
  * @param params will have fetchLimit as one of the values 
  * to specify limit of data to fetched,
  * it should be given inside params as {'fetchLimit' : requiredLimit}
  * requiredLimit can be either null or any valid number.
  * if no limit is specified default fetch limit 50 will be used.
  * if limit is null then full list will return, this may cause performance issue.
  */
  setSearchOptions(contextField, formatString, path, params = {}) {
    this.endpointSearchOptions.contextField = contextField;
    this.endpointSearchOptions.formatString = formatString;
    this.endpointSearchOptions.path = path;
    this.endpointSearchOptions.params = getParams(params); 
    return JSON.parse(JSON.stringify(this.endpointSearchOptions));
  }

  /** sets endpoint search options
 * @param contextField
 * @param formatString
 * @param path
 * @param defaultValue
 * @param params
 */
  setHttpOptions(contextField, formatString, path, defaultValue, params) {
    this.httpOptions.contextField = contextField;
    this.httpOptions.formatString = formatString;
    this.httpOptions.path = path;
    this.httpOptions.defaultValue = defaultValue;
    this.httpOptions.params = params;
    return JSON.parse(JSON.stringify(this.httpOptions));
  }

  /**checkDepartmentLevelRightsInArray - checks whether the right is present in departmentLevelRights
  * @param right
  */
  checkDepartmentLevelRightsInArray(right) {
    return (this.departmentLevelRights != null && this.departmentLevelRights.length) ? this.departmentLevelRights.includes(right) : false;
  }

  /**Method to check whether the budget section is editable or not for a logged in user
   * budgetStatusCode - 10 -> Active, 5 -> Submitted, 1 -> In Progress
   * budgetTypeCode - 2 -> Rebudget, 1-> New
   * awardDocumentTypeCode - 1 -> setup, 2 -> modification, 3 -> variation
   * workflowAwardStatusCode - 1 -> Pending, 4 -> Revision Requested
  */
  checkBudgetEditable(budgetStatusCode, budgetTypeCode) {
    let isBudgetEditable = true;
    const isAwardBudgetActive = budgetStatusCode === '10' ? true : false;
    const isRebudget = budgetTypeCode === '2' ? true : false;
    if (isAwardBudgetActive || ['ARCHIVE', 'CANCELLED'].includes(this.awardGeneralData.award.awardSequenceStatus)) {
      isBudgetEditable = false;
    } else if ((this.awardGeneralData.award.awardDocumentType.awardDocumentTypeCode === '1' ||
      this.awardGeneralData.award.awardDocumentType.awardDocumentTypeCode === '2') &&
      (budgetStatusCode === '1' ||
        this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '4' ||
        this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '7') &&
      this.checkDepartmentLevelRightsInArray('MODIFY_AWARD_BUDGET')) {
      isBudgetEditable = true;
    } else if (this.getSectionEditableFlag('102') &&
      (budgetStatusCode === '1' || this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '4'
        || this.awardGeneralData.award.awardWorkflowStatus.workflowAwardStatusCode === '7')) {
      isBudgetEditable = true;
    } else {
      isBudgetEditable = false;
    }
    return isBudgetEditable;
  }

}
